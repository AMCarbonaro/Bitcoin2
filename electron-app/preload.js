const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bitcoin2Miner', {
  miningStart: (opts) => ipcRenderer.invoke('mining-start', opts),
  miningStop: () => ipcRenderer.invoke('mining-stop'),
  onMiningBlockFound: (cb) => ipcRenderer.on('mining-block-found', (_, data) => cb(data)),
  onMiningError: (cb) => ipcRenderer.on('mining-error', (_, msg) => cb(msg)),
  onMiningStopped: (cb) => ipcRenderer.on('mining-stopped', () => cb()),
  rpcTest: (url) => ipcRenderer.invoke('rpc-test', url),
  rpcGetNewAddress: (url) => ipcRenderer.invoke('rpc-getnewaddress', url),
  nodeHasBundled: () => ipcRenderer.invoke('node-has-bundled'),
  nodeStart: () => ipcRenderer.invoke('node-start'),
  nodeStop: () => ipcRenderer.invoke('node-stop'),
  nodeGetRpcUrl: () => ipcRenderer.invoke('node-get-rpc-url'),
  onNodeLog: (cb) => ipcRenderer.on('node-log', (_, msg) => cb(msg)),
  onNodeStopped: (cb) => ipcRenderer.on('node-stopped', (_, data) => cb(data)),
  onNodeError: (cb) => ipcRenderer.on('node-error', (_, msg) => cb(msg)),
});
