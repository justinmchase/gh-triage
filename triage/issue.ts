import type { GitHubNotification } from "@justinmchase/github-api";

export async function issue(notification: GitHubNotification) {
  const { subject, repository } = notification;
  const { full_name } = repository;
  const { title } = subject;
  await console.log(
    `issue triage not yet implemented ${title} ${full_name}, skipping.`,
  );
}
