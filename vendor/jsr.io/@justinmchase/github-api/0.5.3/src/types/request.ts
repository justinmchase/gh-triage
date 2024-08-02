import type { Serializable } from "jsr:@justinmchase/serializable@^0.3.7";

export type GitHubRequest = {
  api: string;
  parameters?: URLSearchParams;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  accept?: string;
  userAgent?: string;
  body?: Serializable;
  fetch?: typeof fetch;
};

export type GitHubRequestAll<T> = GitHubRequest & {
  max?: number;
  // deno-lint-ignore no-explicit-any
  map?: (result: any) => T[];
};
