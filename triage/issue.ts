import type { GitHubNotification } from "@justinmchase/github-api";

export async function issue(notification: GitHubNotification) {
  const { subject, repository } = notification;
  const { full_name } = repository;
  const { title } = subject;
  await undefined;
  throw new Error(`Issue triage not yet implemented ${title} ${full_name}`);
}
