import { runAppleScript } from "@raycast/utils";
import { promises as fs } from "node:fs";
import { environment } from "@raycast/api";
import path from "node:path";
import { BadgerApplication } from "./badger.ts";

function useScripts() {
  const assets = path.join(environment.assetsPath, "scripts");

  async function appIsOpen(badge: BadgerApplication) {
    const script = await fs.readFile(path.join(assets, "appIsOpen.applescript"));
    const result = await runAppleScript(script.toString(), [badge.bundleId]);
    return result === "true";
  }

  async function getBadgeCount(badge: BadgerApplication) {
    const script = await fs.readFile(path.join(assets, "getBadgeCount.applescript"));
    const result = await runAppleScript(script.toString(), [badge.name]);
    return result;
  }

  return { appIsOpen, getBadgeCount };
}

export default useScripts;
