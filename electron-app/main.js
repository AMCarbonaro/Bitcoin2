const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

let mainWindow;
let miningActive = false;
let miningAbort = false;

// Bundled node: run bitcoind from the app so the user doesn't need the terminal
const BOOTSTRAP_NODE_IP = '3.144.7.181';
let nodeProcess = null;

function getBundledBinDir() {
  const base = app.isPackaged ? process.resourcesPath : __dirname;
  return path.join(base, 'bin', process.platform, process.arch);
}

function getBundledBitcoindPath() {
  const binDir = getBundledBinDir();
  const name = process.platform === 'win32' ? 'bitcoind.exe' : 'bitcoind';
  return path.join(binDir, name);
}

function hasBundledNode() {
  try {
    const p = getBundledBitcoindPath();
    return fs.existsSync(p);
  } catch (_) {
    return false;
  }
}

function getNodeDataDir() {
  return path.join(app.getPath('userData'), 'bitcoin2');
}

function ensureNodeConfig(dataDir) {
  const configPath = path.join(dataDir, 'bitcoin2.conf');
  let rpcUser = 'bitcoin2_node';
  let rpcPassword = '';
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    const m = content.match(/rpcpassword=(.+)/);
    if (m) rpcPassword = m[1].trim();
    const u = content.match(/rpcuser=(.+)/);
    if (u) rpcUser = u[1].trim();
  }
  if (!rpcPassword) {
    rpcPassword = crypto.randomBytes(24).toString('hex');
    const lines = [
      'server=1',
      'rpcuser=' + rpcUser,
      'rpcpassword=' + rpcPassword,
      'rpcallowip=127.0.0.1',
      'rpcport=8332',
      'addnode=' + BOOTSTRAP_NODE_IP,
      'port=8334',
      'listen=1',
      'bind=0.0.0.0:8334',
      'txindex=1',
    ].join('\n');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(configPath, lines, 'utf8');
  }
  return { configPath, rpcUser, rpcPassword };
}

function startBundledNode() {
  if (nodeProcess) return { ok: false, error: 'Node already running' };
  if (!hasBundledNode()) return { ok: false, error: 'Bitcoin2 node binary not bundled with this build. Use the manual instructions on the website.' };
  const dataDir = getNodeDataDir();
  const { configPath, rpcUser, rpcPassword } = ensureNodeConfig(dataDir);
  const bitcoindPath = getBundledBitcoindPath();
  try {
    nodeProcess = spawn(bitcoindPath, ['-datadir', dataDir, '-conf', configPath], {
      cwd: path.dirname(bitcoindPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    nodeProcess.on('error', (err) => {
      nodeProcess = null;
      if (mainWindow) mainWindow.webContents.send('node-error', err.message);
    });
    nodeProcess.on('exit', (code, signal) => {
      nodeProcess = null;
      if (mainWindow) mainWindow.webContents.send('node-stopped', { code, signal });
    });
    if (nodeProcess.stdout) nodeProcess.stdout.on('data', (chunk) => {
      if (mainWindow) mainWindow.webContents.send('node-log', chunk.toString());
    });
    if (nodeProcess.stderr) nodeProcess.stderr.on('data', (chunk) => {
      if (mainWindow) mainWindow.webContents.send('node-log', chunk.toString());
    });
    const rpcUrl = 'http://' + encodeURIComponent(rpcUser) + ':' + encodeURIComponent(rpcPassword) + '@127.0.0.1:8332';
    return { ok: true, rpcUrl };
  } catch (e) {
    nodeProcess = null;
    return { ok: false, error: e.message };
  }
}

function stopBundledNode() {
  if (!nodeProcess) return { ok: true };
  try {
    nodeProcess.kill('SIGTERM');
  } catch (_) {}
  nodeProcess = null;
  return { ok: true };
}

function getBundledNodeRpcUrl() {
  const dataDir = getNodeDataDir();
  const configPath = path.join(dataDir, 'bitcoin2.conf');
  if (!fs.existsSync(configPath)) return null;
  const content = fs.readFileSync(configPath, 'utf8');
  const user = (content.match(/rpcuser=(.+)/) || [])[1];
  const pass = (content.match(/rpcpassword=(.+)/) || [])[1];
  if (!user || !pass) return null;
  return 'http://' + encodeURIComponent(user.trim()) + ':' + encodeURIComponent(pass.trim()) + '@127.0.0.1:8332';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 560,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function rpcCall(url, method, params, timeoutMs) {
  const timeout = timeoutMs ?? (method === 'generatetoaddress' ? 600000 : 20000); // 10 min for mining, 20s for rest
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify({
      jsonrpc: '1.0',
      id: 'bitcoin2-miner',
      method,
      params: params || [],
    });
    const auth = u.username && u.password
      ? Buffer.from(`${u.username}:${u.password}`).toString('base64')
      : null;
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 8332),
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(auth ? { Authorization: `Basic ${auth}` } : {}),
      },
    };
    const req = (u.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.error) reject(new Error(j.error.message || JSON.stringify(j.error)));
          else resolve(j.result);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(body);
    req.end();
  });
}

async function runMiningLoop(url, address) {
  miningAbort = false;
  let attempt = 0;
  while (miningActive && !miningAbort) {
    attempt++;
    try {
      const hashes = await rpcCall(url, 'generatetoaddress', [1, address, 100000000]);
      if (hashes && hashes.length > 0 && mainWindow) {
        mainWindow.webContents.send('mining-block-found', { hash: hashes[0], attempt });
      }
    } catch (e) {
      if (mainWindow) mainWindow.webContents.send('mining-error', e.message);
    }
    if (!miningActive || miningAbort) break;
  }
  if (mainWindow) mainWindow.webContents.send('mining-stopped');
}

ipcMain.handle('mining-start', async (_, { url, address }) => {
  if (miningActive) return { ok: false, error: 'Already mining' };
  miningActive = true;
  runMiningLoop(url, address);
  return { ok: true };
});

ipcMain.handle('mining-stop', async () => {
  miningAbort = true;
  miningActive = false;
  return { ok: true };
});

ipcMain.handle('rpc-test', async (_, url) => {
  try {
    const info = await rpcCall(url, 'getblockchaininfo');
    return { ok: true, blocks: info.blocks, chain: info.chain };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('rpc-getnewaddress', async (_, url) => {
  try {
    const addr = await rpcCall(url, 'getnewaddress');
    return { ok: true, address: addr };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('node-has-bundled', () => ({ has: hasBundledNode() }));
ipcMain.handle('node-start', () => startBundledNode());
ipcMain.handle('node-stop', () => stopBundledNode());
ipcMain.handle('node-get-rpc-url', () => getBundledNodeRpcUrl());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  stopBundledNode();
  app.quit();
});
