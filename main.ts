import { api, GitHubClient } from "@justinmchase/github-api";
import { prompt, Select } from "@cliffy/prompt";
import { yellow } from "@std/fmt/colors";
import {
  issue,
  pullRequest,
  type PullRequestDismissClosed,
  release,
} from "./triage/mod.ts";

const cmd = new Deno.Command("gh", { args: ["auth", "token"] });
const out = await cmd.output();
const accessToken = new TextDecoder().decode(out.stdout);
const client = new GitHubClient({ accessToken });

const notifications = await api.notifications.list({
  client,
  progress: (total) => {
    console.clear();
    if (total > 50) {
      console.log(`fetching notifications (${yellow(`${total}`)})...`);
    }
  },
});

if (notifications.length === 0) {
  console.log("No notifications to triage.");
  Deno.exit(0);
}

console.log(`\rYou have ${notifications.length} notifications to triage.`);
const { dismissClosed } = await prompt([
  {
    name: "dismissClosed",
    message: "Triage closed issues?",
    options: [
      { name: "Dismiss all", value: "dismiss" },
      { name: "Skip all", value: "skip" },
      { name: "Yes", value: "include" },
    ],
    type: Select,
  },
]) as { dismissClosed: PullRequestDismissClosed };

for (const notification of notifications) {
  const { subject: { type } } = notification;
  switch (type) {
    case "Issue":
      await issue(notification);
      break;
    case "PullRequest":
      await pullRequest(client, notification, dismissClosed);
      break;
    case "Release":
      await release(client, notification);
      break;
    default:
      console.log(`Unknown notification type: ${type}`);
      Deno.exit(0);
  }
}
