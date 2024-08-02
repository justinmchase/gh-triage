import { Command, EnumType } from "@cliffy/command";
import { triage } from "./src/mod.ts";

const dismissCLosedType = new EnumType(["dismiss", "skip", "include"]);

await new Command()
  .name("triage")
  .version("0.1.2")
  .description("Triage your GitHub notifications.")
  .type("dismiss-closed", dismissCLosedType)
  .option(
    "-d, --dismiss-closed <dismissClosed:dismiss-closed>",
    "How to handle closed issues (none for prompt).",
  )
  .option("-w, --watch", "Watch for new notifications.", { default: false })
  .action(async (options, ..._args) => {
    await triage(options);
  })
  .parse(Deno.args);
