import { defineConfig } from "@playwright/test";

// PORT lets the suite run on whichever build host has a free port; 4413 is this project's Mac2 port.
const port = process.env.PORT ?? "4413";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true, channel: "chrome" },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
