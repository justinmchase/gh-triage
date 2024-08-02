import type {
  GitHubClient,
  GitHubNotification,
} from "@justinmchase/github-api";
import { read } from "../actions/mod.ts";
import { Column, Table } from "@cliffy/table";
import { Select } from "@cliffy/prompt";
import { black, magenta } from "@std/fmt/colors";

export async function checkSuite(
  client: GitHubClient,
  notification: GitHubNotification,
) {
  const { subject, repository, updated_at } = notification;
  const { title } = subject;
  const repo = `${black(repository.owner.login)}/${magenta(repository.name)}`;
  const table: Table = new Table()
    .border(true)
    .columns([
      new Column().align("right"),
      new Column().align("left"),
    ])
    .header(["", "Check Suite"])
    .body([
      ["title", title],
      ["where", repo],
      ["when", new Date(updated_at).toLocaleString()],
    ]);
  console.clear();
  console.log(table.toString());

  const action: string = await Select.prompt({
    message: "Select an action",
    options: [
      ...[
        { name: "Mark as read", value: "read" },
        { name: "Skip", value: "skip" },
      ],
    ],
  });

  switch (action) {
    case "skip":
      break;
    case "read":
      await read(client, notification);
      break;
    default:
      throw new Error(`Not implemented ${action}`);
  }
}
