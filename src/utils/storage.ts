import { getApplications, getPreferenceValues, LocalStorage } from "@raycast/api";

export default function storage() {}

storage.getPreferences = async (): Promise<Preferences> => {
  return getPreferenceValues();
};

storage.getBadges = async () => {
  const apps = await getApplications();
  const badges = JSON.parse((await LocalStorage.getItem("badges")) || "{}") as BadgeList;

  Object.entries(badges).forEach(([bundleId, badge]) => {
    const app = apps.filter((app) => app.bundleId === bundleId).pop();
    if (!app) {
      // Raycast is not aware of the application.
      delete badges[bundleId];
      return;
    }
    badge.app = app;
    badge.status = { count: 0, indeterminate: false };
  });

  return badges;
};

storage.sortBadges = (badges: BadgeList) => {
  return Object.values(badges).sort((a, b) =>
    a.app.name.localeCompare(b.app.name, Intl.DateTimeFormat().resolvedOptions().locale, {
      sensitivity: "base",
    }),
  );
};

storage.saveBadge = async (badge: Badge) => {
  const badges = await storage.getBadges();
  badges[badge.bundleId] = badge;
  await LocalStorage.setItem("badges", JSON.stringify(badges));
};

storage.deleteBadge = async (badge: Badge) => {
  const badges = await storage.getBadges();
  if (!badges[badge.bundleId]) return;
  delete badges[badge.bundleId];
  await LocalStorage.setItem("badges", JSON.stringify(badges));
};

storage.deleteAllBadges = async () => LocalStorage.removeItem("badges");
