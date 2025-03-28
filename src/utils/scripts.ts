import { promises as fs } from "node:fs";
import path from "node:path";
import { runAppleScript } from "@raycast/utils";
import { environment } from "@raycast/api";

const assets = path.join(environment.assetsPath, "scripts");

export default function scripts() {}

scripts.isOpen = async (bundleId: string) => {
  const script = await fs.readFile(path.join(assets, "app-status.applescript"));
  return (await runAppleScript(script.toString(), [bundleId])) === "true";
};

scripts.getCount = async (appName: string): Promise<true | number> => {
  const script = await fs.readFile(path.join(assets, "badge-count.applescript"));
  const result = await runAppleScript(script.toString(), [appName]);
  if (result === "•") return true;
  const count = parseInt(result, 10);
  return Number.isNaN(count) ? 0 : count;
};
