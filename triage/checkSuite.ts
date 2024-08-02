import type { GitHubNotification } from "@justinmchase/github-api";

export async function checkSuite(notification: GitHubNotification) {
  const { subject, repository } = notification;
  const { full_name } = repository;
  const { title } = subject;
  await console.log(`checkSuite triage not yet implemented ${title} ${full_name}, skipping.`);
}
