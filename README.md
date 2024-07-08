# Preview Cookie Chrome Extension

This is a tiny Chrome browser extension, that allows you to quickly set or unset a preview cookie for a website,
so you can conveniently switch between a "preview" or "development" mode and standard mode.

# Installation

You need node and pnpm installed.

1. Clone repo
2. Run 'pnpm install' to install dependencies
3. Run 'pnpm build' to build extension
4. Open "chrome://extensions/" in your Chrome browser
5. Switch to "Developer Mode" in the top right corner
6. Click "Load unpacked" and select the 'dist' folder in your cloned repo
7. Select the extension in the Extensions popup (The jigsaw icon) and optionally pin it to your extension toolbar
8. Browse to the site your want a preview cookie for
9. Click the Preview Cookie extension icon and click "Settings"
10. Enter the name of the cookie you want to set and "Add config"

Now you can switch the preview cookie on and off, when visiting the site. 
