import { Action, ActionPanel, Form, Icon, showToast, useNavigation } from "@raycast/api";
import React, { useEffect, useState } from "react";
import getApps, { BadgerApplication } from "./utils/badger.ts";
import useStorage from "./utils/storage.ts";

function Command(props: { onPop: () => void }) {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgerApplication[]>([]);
  const [apps, setApps] = useState<BadgerApplication[]>([]);
  const { getBadges, saveBadge } = useStorage();
  const { pop } = useNavigation();
  const { onPop } = props;

  useEffect(() => {
    async function getStorage() {
      setBadges(await getBadges());
      setApps(await getApps());
      setLoading(false);
    }
    getStorage();
  }, []);

  async function handleSubmit(values: { app: string }) {
    const badge = apps
      .filter((app) => {
        return app.bundleId === values.app;
      })
      .pop();

    if (!badge) return;
    badge.enabled = true;

    await saveBadge(badge);
    await showToast({ title: `Added ${badge.name}` });

    pop();
    onPop();
  }

  return (
    <Form
      isLoading={loading}
      actions={
        !loading && (
          <ActionPanel>
            <Action.SubmitForm title="Create Badge" icon={Icon.PlusCircle} onSubmit={handleSubmit} />
          </ActionPanel>
        )
      }
    >
      <Form.Description text="Applications must be running or kept in the Dock for badge counts to appear in the menu bar." />
      <Form.Dropdown id="app" title="Application">
        {apps.map((app, index) => {
          if (badges.filter((badge) => badge.bundleId === app.bundleId).length !== 0) return;
          return <Form.Dropdown.Item key={index} value={app.bundleId} title={app.name} icon={{ fileIcon: app.path }} />;
        })}
      </Form.Dropdown>
    </Form>
  );
}

export default Command;
