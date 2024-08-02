import { api, GitHubClient } from "@justinmchase/github-api";
import { prompt, Select } from "@cliffy/prompt";
import { yellow } from "@std/fmt/colors";
import { delay } from "@std/async/delay";
import { checkSuite, issue, pullRequest, release } from "./triage/mod.ts";

type TriageOpts = {
  dismissClosed: "dismiss" | "skip" | "include";
  watch: boolean;
};

export async function triage(opts: Partial<TriageOpts>) {
  const cmd = new Deno.Command("gh", { args: ["auth", "token"] });
  const out = await cmd.output();
  const accessToken = new TextDecoder().decode(out.stdout);
  const client = new GitHubClient({ accessToken });
  const { dismissClosed, watch } = await promptOptions(opts);

  let since: Date | undefined = undefined;
  do {
    const notifications = await api.notifications.list({
      client,
      since,
      progress: (total) => {
        console.clear();
        if (total > 50) {
          console.log(
            `Fetching notifications (${yellow(`${total}`)})...`,
          );
        }
      },
    });
    since = new Date();

    console.clear();
    if (notifications.length === 0) {
      if (watch) {
        const next = since.getTime() + (30000);
        const i = setInterval(
          () => {
            const now = new Date().getTime();
            const seconds = Math.floor(
              (next - now) / 1000,
            );
            console.clear();
            console.log(
              `No notifications to triage. (retrying in ${seconds}s)`,
            );
          },
          1000, // 1s
        );
        await delay(30000); // 30s

        clearInterval(i);
        continue;
      } else {
        break;
      }
    }

    for (const notification of notifications) {
      const { subject: { type } } = notification;
      switch (type) {
        case "Issue":
          await issue(client, notification);
          break;
        case "PullRequest":
          await pullRequest(client, notification, dismissClosed);
          break;
        case "Release":
          await release(client, notification);
          break;
        case "CheckSuite":
          await checkSuite(client, notification);
          break;
        default:
          console.log(`Unknown notification type: ${type}`);
          Deno.exit(0);
      }
    }
  } while (watch);
}

async function promptOptions(opts: Partial<TriageOpts>) {
  if (!opts.dismissClosed) {
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
    ]) as TriageOpts;

    // Set the option selected by the user
    opts.dismissClosed = dismissClosed;
  }

  if (opts.watch === undefined) {
    opts.watch = false;
  }

  return opts as TriageOpts;
}
