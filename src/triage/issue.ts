import {
  api,
  type GitHubClient,
  type GitHubNotification,
} from "@justinmchase/github-api";
import { done, open, read } from "../actions/mod.ts";
import { Column, Table } from "@cliffy/table";
import { Select } from "@cliffy/prompt";
import { black, gray, magenta } from "@std/fmt/colors";
import ellipsize from "npm:ellipsize@0.5.1";

export async function issue(
  client: GitHubClient,
  notification: GitHubNotification,
) {
  const { subject, repository, reason } = notification;
  const { title, url, latest_comment_url } = subject;
  const { name, full_name, owner: { login } } = repository;
  const repo = `${black(login)}/${magenta(name)}`;
  const number = parseInt(url.split("/").pop()!);

  // todo: fetch issue comment
  const [comment, commentNumber] = reason !== "comment"
    ? [undefined, undefined]
    : await (async () => {
      const number = parseInt(latest_comment_url.split("/").pop()!);
      const comment = await api.repos.issues.comments.get({
        client,
        repository,
        number,
      });
      return [ellipsize(comment.body, 32) as string, number];
    })();

  const table: Table = new Table()
    .border(true)
    .columns([
      new Column().align("right"),
      new Column().align("left"),
    ])
    .header(["", "Issue"])
    .body([
      ["title", title],
      ["reason", gray(reason)],
      ["repository", repo],
      ...comment
        ? [
          ["comment", comment],
        ]
        : [],
    ]);
  console.clear();
  console.log(table.toString());

  const action: string = await Select.prompt({
    message: "Select an action",
    options: [
      ...[
        { name: "Skip", value: "skip" },
        { name: "Mark as read", value: "read" },
        { name: "Mark as done", value: "done" },
        { name: "Open in browser", value: "open" },
      ],
    ],
  });

  const issueUrl = reason === "comment"
    ? `https://github.com/${full_name}/issues/${number}#issuecomment-${commentNumber}`
    : `https://github.com/${full_name}/issues/${number}`;

  switch (action) {
    case "skip":
      break;
    case "read":
      await read(client, notification);
      break;
    case "done":
      await done(client, notification);
      break;
    case "open":
      await open(issueUrl);
      await read(client, notification);
      break;
    default:
      throw new Error(`Not implemented ${action}`);
  }
}
