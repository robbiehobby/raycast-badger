import { useEffect, useState } from "react";
import { Keyboard, launchCommand, LaunchType, MenuBarExtra, open, openExtensionPreferences } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import storage from "./utils/storage.ts";
import scripts from "./utils/scripts.ts";
import catchError from "./utils/error.ts";
import KeyEquivalent = Keyboard.KeyEquivalent;

export default function Badges() {
  const [isLoading, setIsLoading] = useState(true);
  const [cache, setCache] = useCachedState<BadgeCache | null>("badges", null);

  useEffect(() => {
    (async () => {
      const badges = await storage.getBadges();

      await Promise.all(
        Object.entries(badges).map(async ([bundleId, badge]) => {
          try {
            if (!badge.showInactive && !(await scripts.isOpen(bundleId))) delete badges[bundleId];
            const count = await scripts.getCount(badge.app.name);
            if (count === true) badge.status = { count: 1, indeterminate: true };
            else badge.status.count = count;
          } catch (error) {
            await catchError(error as Error);
          }
        }),
      );

      setCache({ badges, preferences: await storage.getPreferences() });
      setIsLoading(false);
    })();
  }, []);

  let sortedBadges: Badge[] = [];
  if (cache?.badges) sortedBadges = storage.sortBadges(cache.badges);
  const total = sortedBadges.reduce((total, badge) => total + badge.status.count, 0);

  return (
    <MenuBarExtra
      isLoading={isLoading}
      title={cache?.preferences.showTotal && total ? `${total}` : ""}
      icon={{
        source: !total ? "bell.svg" : "bell-fill.svg",
        tintColor: !total ? cache?.preferences.defaultColor : cache?.preferences.activeColor,
      }}
    >
      <MenuBarExtra.Section title="Applications">
        {sortedBadges.map((badge, key) => (
          <MenuBarExtra.Item
            key={badge.bundleId}
            title={badge.app.name}
            subtitle={badge.status.count ? `(${badge.status.count})` : ""}
            shortcut={{ modifiers: [], key: `${key + 1}` as KeyEquivalent }}
            icon={{ fileIcon: badge.app.path }}
            onAction={() => open(badge.app.path)}
          />
        ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Configure Badges"
          shortcut={{ modifiers: ["cmd"], key: "1" }}
          onAction={() => launchCommand({ name: "search", type: LaunchType.UserInitiated })}
        />
        <MenuBarExtra.Item
          title="Configure Extension"
          shortcut={{ modifiers: ["cmd"], key: "2" }}
          onAction={() => openExtensionPreferences()}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
