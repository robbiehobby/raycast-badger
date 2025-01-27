import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import React, { useEffect, useState } from "react";
import { BadgerApplication } from "./utils/badger.ts";
import useStorage from "./utils/storage.ts";
import Create from "./create.tsx";

function Command() {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgerApplication[]>([]);
  const { getBadges, saveBadge, removeBadge } = useStorage();

  useEffect(() => {
    async function getStorage() {
      setBadges(await getBadges());
      setLoading(false);
    }
    getStorage();
  }, [loading]);

  async function handleToggle(badge: BadgerApplication) {
    await saveBadge({ ...badge, enabled: !badge.enabled });
    setLoading(true);
  }
  async function handleRemove(badge?: BadgerApplication) {
    await removeBadge(badge);
    setLoading(true);
  }

  const CreateNewBadge = () => (
    <Action.Push
      title="Create New Badge"
      icon={Icon.PlusCircle}
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<Create onPop={() => setLoading(true)} />}
    />
  );

  return (
    <List isLoading={loading}>
      {badges.map((badge, index) => (
        <List.Item
          key={index}
          title={badge.name}
          icon={{ fileIcon: badge.path }}
          accessories={[
            {
              tag: {
                value: badge.enabled ? "Enabled" : "",
                color: badge.enabled ? Color.Green : Color.SecondaryText,
              },
              icon: badge.enabled ? Icon.Checkmark : Icon.CircleDisabled,
            },
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action
                  title={!badge.enabled ? "Enable Badge" : "Disable Badge"}
                  icon={!badge.enabled ? Icon.CheckCircle : Icon.CircleDisabled}
                  onAction={() => handleToggle(badge)}
                />
                <CreateNewBadge />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <Action
                  title={`Remove Badge`}
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() => handleRemove(badge)}
                />
                <Action
                  title="Remove All Badges"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
                  onAction={() => handleRemove()}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
      {!badges.length && (
        <List.EmptyView
          title={"No Badges"}
          icon={Icon.Bell}
          actions={
            <ActionPanel>
              <CreateNewBadge />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}

export default Command;
