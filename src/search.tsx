import { useEffect, useState } from "react";
import { Action, ActionPanel, Alert, confirmAlert, Icon, List } from "@raycast/api";
import storage from "./utils/storage.ts";
import BadgeForm from "./components/form.tsx";

export default function Search() {
  const [badges, setBadges] = useState<BadgeList | null>(null);

  useEffect(() => {
    (async () => setBadges(await storage.getBadges()))();
  }, []);

  const onAction = async (callback?: Function, badge?: Badge) => {
    if (badge && callback) await callback(badge);
    setBadges(await storage.getBadges());
  };

  let sortedBadges: Badge[] = [];
  if (badges !== null) sortedBadges = storage.sortBadges(badges);

  const AddBadge = () => (
    <Action.Push
      title="Add Badge"
      icon={Icon.PlusCircle}
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<BadgeForm />}
      onPop={onAction}
    />
  );

  return (
    <List isLoading={badges === null}>
      {sortedBadges.map((badge) => (
        <List.Item
          key={badge.bundleId}
          title={badge.app.name}
          icon={{ fileIcon: badge.app.path }}
          accessories={[{ text: badge.showInactive ? "Always shown" : "Shown while open" }]}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.Push
                  title="Edit Badge"
                  icon={Icon.Pencil}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                  target={<BadgeForm badge={badge} />}
                  onPop={onAction}
                />
                <AddBadge />
                <Action
                  title="Delete Badge"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() =>
                    confirmAlert({
                      title: badge.app.name,
                      message: "Are you sure you want to delete this badge?",
                      primaryAction: {
                        title: "Delete",
                        style: Alert.ActionStyle.Destructive,
                        onAction: () => onAction(storage.deleteBadge, badge),
                      },
                    })
                  }
                />
                <Action
                  title="Delete All Badges"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
                  onAction={() =>
                    confirmAlert({
                      title: "Delete All",
                      message: "Are you sure you want to delete all badges?",
                      primaryAction: {
                        title: "Delete",
                        style: Alert.ActionStyle.Destructive,
                        onAction: () => onAction(storage.deleteAllBadges, badge),
                      },
                    })
                  }
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}

      <List.EmptyView
        icon={Icon.BellDisabled}
        actions={
          <ActionPanel>
            <AddBadge />
          </ActionPanel>
        }
      />
    </List>
  );
}
