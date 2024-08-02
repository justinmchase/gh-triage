import {
  api,
  type GitHubClient,
  type GitHubNotification,
} from "@justinmchase/github-api";

export async function done(
  client: GitHubClient,
  notification: GitHubNotification,
) {
  const { id: threadId } = notification;
  await api.notifications.thread.done({
    client,
    threadId,
  });
}
