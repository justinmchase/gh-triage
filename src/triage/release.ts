import {
  api,
  type GitHubClient,
  type GitHubNotification,
} from "@justinmchase/github-api";
import { Select } from "@cliffy/prompt";
import { Column, Table } from "@cliffy/table";
import { brightBlack, magenta, yellow } from "@std/fmt/colors";

export async function release(
  client: GitHubClient,
  notification: GitHubNotification,
) {
  const { id: threadId, subject, repository } = notification;
  const { title } = subject;
  const { full_name } = repository;
  const repo = `${brightBlack(repository.owner.login)}/${
    magenta(repository.name)
  }`;
  const table: Table = new Table()
    .border(true)
    .columns([
      new Column().align("right"),
      new Column().align("left"),
    ])
    .header(["", "Release"])
    .body([
      ["title", yellow(title)],
      ["repo", repo],
    ]);
  console.clear();
  console.log(table.toString());
  const action: string = await Select.prompt({
    message: "Select an action",
    options: [
      { name: "Skip", value: "skip" },
      { name: "Mark as read", value: "read" },
      { name: "Mark as done", value: "done" },
      { name: "Review", value: "review" },
    ],
  });

  switch (action) {
    case "skip":
      break;
    case "read":
      await api.notifications.thread.read({
        client,
        threadId,
      });
      break;
    case "done":
      await api.notifications.thread.done({
        client,
        threadId,
      });
      break;
    case "review": {
      const cmd = new Deno.Command("open", {
        args: [`https://github.com/${full_name}/releases/tag/${title}`],
      });
      await cmd.spawn();
      break;
    }
    default:
      throw new Error(`Not implemented ${action}`);
  }
}
