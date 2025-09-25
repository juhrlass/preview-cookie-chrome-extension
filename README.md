# Preview Cookie Chrome Extension

This is a tiny Chrome browser extension, that allows you to quickly set or unset a preview or other purpose cookies for a website,
so you can conveniently switch between a "preview" or "development" mode and standard mode or force other site behaviour.

# Screenshot

Preview Cookie "On"

![Switch is on - xyz_preview cookie is set](screenshot_1.png)

Preview Cookie "Off"

![Switch is off - xyz_preview is removed](screenshot_2.png)

# Build and Installation

## Build

You need node and pnpm installed.

1. Clone repo
2. Run 'pnpm install' to install dependencies
3. Run 'pnpm build' to build extension

## Installation
   
1. Open "chrome://extensions/" in your Chrome browser
2. Switch to "Developer Mode" in the top right corner
3. Click "Load unpacked" and select the 'dist' folder in your cloned repo
4. Select the extension in the Extensions popup (The jigsaw icon) and optionally pin it to your extension toolbar
5. Browse to the site your want a preview cookie for
6. Click the Preview Cookie extension icon and click "Settings"
7. Enter the name of the cookie you want to set and "Add config"

# Usage

Now you can switch the configured cookies on and off when visiting a site.
- If the switch is ON the cookie with the given name is set. You can choose the ON value per config: either "1" or "true".
- If the switch is OFF you can choose what happens per config:
  - remove cookie (default)
  - set the cookie value to "0"
  - set the cookie value to "false"
- You can configure multiple cookies per host/origin. Each config appears as its own switch.
- You can add multiple site configurations for different domains/origins.
