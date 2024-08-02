import { api } from "@justinmchase/github-api";
import type {
  GitHubClient,
  GitHubNotification,
  GitHubPullRequest,
  GitHubRepository,
} from "@justinmchase/github-api";
import { Select } from "@cliffy/prompt";
import { Column, Table } from "@cliffy/table";
import {
  blue,
  brightBlack,
  brightRed,
  cyan,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "@std/fmt/colors";
import { approve } from "../actions/approve.ts";
import { read } from "../actions/read.ts";
import { done } from "../actions/done.ts";
import { open } from "../actions/open.ts";

export type PullRequestDismissClosed = "dismiss" | "skip" | "include";
export async function pullRequest(
  client: GitHubClient,
  notification: GitHubNotification,
  dismissClosed: PullRequestDismissClosed,
) {
  const { id: threadId, subject, repository, reason } = notification;
  const { title, url } = subject;
  const { full_name } = repository;
  const number = parseInt(url.split("/").pop()!);
  const pr = await api.repos.pulls.get({
    client,
    number,
    repository,
  });

  const { state, merged } = pr;
  const mergeState = state === "open"
    ? blue("open")
    : merged
    ? green("merged")
    : red("closed");
  const repo = `${brightBlack(repository.owner.login)}/${
    magenta(repository.name)
  }`;
  if (dismissClosed === "dismiss" && pr.state === "closed") {
    await api.notifications.thread.done({
      client,
      threadId,
    });
  } else if (dismissClosed === "skip" && pr.state === "closed") {
    return;
  } else {
    const status = await getCombinedSuccess(client, repository, pr);
    const table: Table = new Table()
      .border(true)
      .columns([
        new Column().align("right"),
        new Column().align("left"),
      ])
      .header(["", "Pull Request"])
      .body([
        ["pr", number],
        ["state", mergeState],
        ["draft", pr.draft ? gray("yes") : green("no")],
        ["title", yellow(title)],
        ["reason", gray(reason)],
        ["repo", repo],
        ["owner", cyan(pr.user.login)],
        ["comments", pr.comments],
        [
          "check status",
          status === "success"
            ? green("success")
            : (status === "pending" ? yellow(status) : red(status)),
        ],
        ["mergable", `${pr.mergeable}`],
        ["auto merge", `${pr.auto_merge ?? false}`],
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
          { name: "Review", value: "review" },
          Select.separator("--------"),
          { name: "Approve", value: "approve" },
        ],
        ...pr.mergeable && status === "success"
          ? [
            { name: "Merge", value: "merge" },
          ]
          : [],
      ],
    });

    switch (action) {
      case "skip":
        break;
      case "read":
        await read(client, notification);
        break;
      case "done":
        await done(client, notification);
        break;
      case "approve":
        await approve(client, notification, pr);
        await read(client, notification);
        break;
      case "review": {
        await open(`https://github.com/${full_name}/pull/${number}/files`);
        await read(client, notification);
        break;
      }
      default:
        throw new Error(`Not implemented ${action}`);
    }
  }
}

async function getCombinedSuccess(
  client: GitHubClient,
  repository: GitHubRepository,
  pr: GitHubPullRequest,
): Promise<string> {
  const checkRuns = await api.repos.commits.checkRuns.list({
    client,
    repository,
    ref: pr.head.sha,
  });

  for (const { conclusion } of checkRuns) {
    switch (conclusion) {
      case "action_required":
      case "cancelled":
      case "failure":
        return brightRed(conclusion);
      case "neutral":
      case "timed_out":
        return brightBlack(conclusion);
      case "skipped":
      case "success":
      default:
        break;
    }
  }

  const { state } = await api.repos.commits.status({
    client,
    repository,
    ref: pr.head.sha,
  });

  switch (state) {
    case "success":
      return green(state);
    case "pending":
      return yellow(state);
    case "error":
    case "failure":
      return brightRed(state);
  }
}
