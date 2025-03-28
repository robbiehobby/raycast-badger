import { Application } from "@raycast/api";

declare global {
  interface BadgeStatus {
    count: number;
    indeterminate: boolean;
  }

  interface Badge {
    bundleId: string;
    app: Application;
    showInactive: boolean;
    showIndeterminate: boolean;
    status: BadgeStatus;
  }

  interface BadgeList {
    [id: string]: Badge;
  }

  interface BadgeCache {
    badges: BadgeList;
    preferences: Preferences;
  }
}
