import {
  Cache,
  Icon,
  Keyboard,
  launchCommand,
  LaunchType,
  MenuBarExtra,
  open,
  openExtensionPreferences,
} from "@raycast/api";

import React, { useEffect, useState } from "react";
import { promises as fs } from "node:fs";
import useStorage from "./utils/storage.ts";
import { BadgerApplication, getPreferences } from "./utils/badger.ts";
import useScripts from "./utils/scripts.ts";
import showMenuBarError from "./utils/error.ts";
import KeyEquivalent = Keyboard.KeyEquivalent;

const cache = new Cache();

function Command() {
  const cachedResults = cache.get("badges");
  let cachedBadges = [];
  if (cachedResults)
    cachedBadges = JSON.parse(cachedResults).filter((badge: BadgerApplication | null) => {
      return badge;
    });

  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgerApplication[]>(cachedBadges);
  const { getBadges } = useStorage();
  const { getBadgeCount } = useScripts();
  const preferences = getPreferences();

  useEffect(() => {
    async function getBadgeCounts() {
      const enabledBadges = await getBadges(true);
      const results: { [key: string]: BadgerApplication } = {};

      await Promise.all(
        enabledBadges.map(async (badge) => {
          try {
            await fs.access(badge.path);
            const output = await getBadgeCount(badge);
            const count = output.length ? parseInt(output, 10) : 0;
            results[badge.name] = {
              ...badge,
              count: Number.isNaN(count) ? 0 : count,
              attn: output === "•",
            };
          } catch (error) {
            await showMenuBarError(error);
          }
        }),
      );

      let sortedBadges: BadgerApplication[] = [];
      if (Object.keys(results).length) {
        sortedBadges = enabledBadges.map((badge) => results[badge.name]);
      }
      cache.set("badges", JSON.stringify(sortedBadges));
      setBadges(sortedBadges);
      setLoading(false);
    }
    getBadgeCounts();
  }, []);

  let total = 0;
  let attn = false;
  badges.forEach((badge) => {
    if (badge.attn) attn = preferences.attn;
    else total += badge.count;
  });

  let title;
  if (preferences.total) {
    if (preferences.attn && attn && total) title = `${total} ${preferences.attnDot}`;
    else if (total) title = `${total}`;
    else if (preferences.attn && attn) title = `${preferences.attnDot}`;
  }

  return (
    <MenuBarExtra
      isLoading={loading}
      title={title}
      icon={{
        source: Icon.Bell,
        tintColor: total || (preferences.attn && attn) ? preferences.activeColor : preferences.color,
      }}
    >
      <MenuBarExtra.Section>
        {badges.map((badge, index) => {
          const count = badge.count ? `(${badge.count})` : "";
          return (
            <MenuBarExtra.Item
              key={index}
              title={badge.name}
              subtitle={preferences.attn && badge.attn ? `(${preferences.attnDot})` : count}
              icon={{ fileIcon: badge.path }}
              shortcut={index + 1 < 10 ? { modifiers: ["cmd"], key: `${index + 1}` as KeyEquivalent } : undefined}
              onAction={() => open(badge.path)}
            />
          );
        })}
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Configure Badges"
          shortcut={{ modifiers: ["cmd"], key: "b" }}
          onAction={() => launchCommand({ name: "badges", type: LaunchType.UserInitiated })}
        />
        <MenuBarExtra.Item
          title="Configure Extension"
          shortcut={{ modifiers: ["cmd"], key: "," }}
          onAction={() => openExtensionPreferences()}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

export default Command;
