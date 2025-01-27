import { getPreferenceValues, Application, getApplications } from "@raycast/api";

export interface BadgerPreferences {
  disableInactive: boolean;
  total: boolean;
  attn: boolean;
  attnDot: string;
  color: string;
  activeColor: string;
}

export interface BadgerApplication extends Application {
  bundleId: string;
  active: boolean;
  attn: boolean;
  count: number;
  enabled: boolean;
}

export function getPreferences() {
  return getPreferenceValues<BadgerPreferences>();
}

export function sortBadges(badges: BadgerApplication[]) {
  return badges.sort((a, b) =>
    a.name.localeCompare(b.name, Intl.DateTimeFormat().resolvedOptions().locale, {
      sensitivity: "base",
    }),
  );
}

async function getApps() {
  return sortBadges(
    (await getApplications()).filter((app) => {
      return app.bundleId;
    }) as BadgerApplication[],
  );
}

export default getApps;
