# Bitcoin2 Miner (Electron app)

Desktop app so you can **mine Bitcoin2 with one click** by connecting to **your own** Bitcoin2 node. You must run your own node; there is no shared mining node.

## How it works

- The app talks to **your** Bitcoin2 node over RPC. You must run your own node (or use the app’s built-in node if bundled).
- **Option A – App runs the node:** If you bundle the Bitcoin2 daemon with the app (see **Bundled node** below), users see **“Start Bitcoin2 node”** in the app. They click it and the app creates the config, starts `bitcoind`, and fills the RPC URL—no terminal.
- **Option B – Manual node:** User runs the node themselves (see [../docs/RUN_A_NODE.md](../docs/RUN_A_NODE.md)), then in the app sets **Node RPC URL**, gets a **b2 address**, and clicks **Start mining**.

## Run from source

```bash
cd electron-app
npm install
npm start
```

## Build installers

```bash
npm run dist
```

Creates installers in `dist/` for your platform (macOS .app / dmg, Windows .exe, Linux AppImage).

## Flow for users

1. **They run their own node** (see RUN_A_NODE.md). There is no option to mine on someone else’s node.
2. **They get** the RPC URL and a b2 address from their node (see MINER_APP_CONNECTION.md or GETTING_STARTED.md).
3. **They download** the miner app, paste their node’s RPC URL and b2 address, and click **Start mining**.

No shared nodes—every miner runs their own node, then uses the app to mine against it.

## Bundled node (optional)

To let the app **run the node for the user** (no terminal), bundle `bitcoind` with the app:

1. Build Bitcoin2 for each target (e.g. `ninja` on Linux/Mac; Visual Studio or cross-compile for Windows). You need the `bitcoind` binary (and on Windows, `bitcoind.exe`).
2. Put it where the app expects:
   - **Development:** `electron-app/bin/<platform>/<arch>/bitcoind` (or `bitcoind.exe` on Windows).  
     Example: `bin/darwin/x64/bitcoind`, `bin/win32/x64/bitcoind.exe`, `bin/linux/x64/bitcoind`.
   - **Packaged:** Configure `extraResources` in `package.json` so the same layout is copied into the app’s resources folder.
3. Rebuild the app (`npm run dist`). When the binary is present, the UI shows **“Start Bitcoin2 node”**. The app creates `bitcoin2.conf` in its user data dir, starts the daemon, and fills the RPC URL so the user can mine without using the terminal.

If the binary is not present, the app shows “This build doesn’t include the node” and the user follows the manual steps on the website.

## Other app types

The same flow (RPC URL + address + generatetoaddress loop) can be wrapped in:

- **Tauri** (Rust + web view) for a smaller binary.
- **Capacitor** or **React Native** for mobile (connecting to their own node).
- **CLI** or **system tray** app using the same `main.js` RPC logic.

This Electron app is the reference; the mining logic is in `main.js` and can be reused in any stack.
