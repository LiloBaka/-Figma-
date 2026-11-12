# Development plugin

1. Run `npm install` once, then `npm run build` from the repository root.
2. In the Figma desktop app, open **Plugins → Development → Import plugin from manifest…**.
3. Select this repository's `manifest.json`.
4. Run **Plugins → Development → Illustration Builder**. Re-run `npm run build` after source changes.

The plugin currently opens the shell UI only. It sends a `ping` to main code and shows the connected status after receiving `pong`.
