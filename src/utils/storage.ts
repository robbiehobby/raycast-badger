import { Alert, confirmAlert, Icon, LocalStorage } from "@raycast/api";
import useScripts from "./scripts.ts";
import { BadgerApplication, getPreferences, sortBadges } from "./badger.ts";

const storageKey = "badges";

function useStorage() {
  const preferences = getPreferences();

  async function getBadges(enabled: boolean = false): Promise<BadgerApplication[]> {
    const storage = await LocalStorage.allItems();
    let badges: BadgerApplication[] = storage[storageKey] ? JSON.parse(storage[storageKey]) : [];

    if (enabled) badges = badges.filter((badge) => badge.enabled);
    if (preferences.disableInactive) {
      const { appIsOpen } = useScripts();
      await Promise.all(
        badges.map(async (badge) => {
          badge.active = await appIsOpen(badge);
        }),
      );
      if (enabled) badges = badges.filter((badge) => badge.active);
    }

    return sortBadges(badges);
  }

  async function saveBadge(badge: BadgerApplication) {
    let badges = await getBadges();
    const badgeExists = badges.filter((_badge) => _badge.bundleId === badge.bundleId);

    if (badgeExists.length > 0)
      badges = badges.map((_badge) => {
        return _badge.bundleId === badge.bundleId ? badge : _badge;
      });
    else badges.push(badge);

    await LocalStorage.setItem(storageKey, JSON.stringify(badges));
  }

  async function removeBadge(badge?: BadgerApplication) {
    let badges = await getBadges();

    if (badge) badges = badges.filter((_badge) => badge.bundleId !== _badge.bundleId);
    else if (
      await confirmAlert({
        title: "Do you want to remove all badges?",
        icon: Icon.ExclamationMark,
        primaryAction: {
          title: "Remove",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      await LocalStorage.removeItem(storageKey);
      badges = [];
    }

    await LocalStorage.setItem(storageKey, JSON.stringify(badges));
  }

  return { getBadges, saveBadge, removeBadge };
}

export default useStorage;
