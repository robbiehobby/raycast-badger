export default async function catchError(error: Error) {
  if (error.message.includes("-1743") || error.message.includes("-1719")) {
    throw new Error(
      "To access the Dock badges, Raycast must have Accessibility and Automation permissions.\n\n" +
        "System Settings > Privacy & Security",
    );
  }
  throw new Error(error.message);
}
