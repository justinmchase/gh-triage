export async function open(
  url: string,
) {
  const cmd = new Deno.Command("open", {
    args: [url],
  });
  await cmd.spawn();
}
