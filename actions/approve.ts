import {
  api,
  type GitHubClient,
  type GitHubNotification,
  type GitHubPullRequest,
} from "@justinmchase/github-api";
import { Input } from "@cliffy/prompt";

export async function approve(
  client: GitHubClient,
  notification: GitHubNotification,
  pr: GitHubPullRequest,
) {
  const { id: threadId, repository } = notification;
  const body = await Input.prompt({
    message: "Review message",
    default: "Looks good to me!",
  });
  await api.repos.pulls.reviews.create({
    client,
    repository,
    pr,
    event: "APPROVE",
    body,
  });
  await api.notifications.thread.read({
    client,
    threadId,
  });
}
