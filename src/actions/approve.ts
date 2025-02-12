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
  const { repository } = notification;
  const body = await Input.prompt({
    message: "Review message",
    default: pr.user.login === "dependabot[bot]"
      ? "@dependabot merge"
      : "Looks good to me!",
  });
  await api.repos.pulls.reviews.create({
    client,
    repository,
    pr,
    event: "APPROVE",
    body,
  });
}
