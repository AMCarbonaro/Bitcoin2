const rpcUrlEl = document.getElementById('rpcUrl');
const addressEl = document.getElementById('address');
const btnTest = document.getElementById('btnTest');
const btnGetAddress = document.getElementById('btnGetAddress');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const statusEl = document.getElementById('status');
const nodeSection = document.getElementById('nodeSection');
const btnStartNode = document.getElementById('btnStartNode');
const btnStopNode = document.getElementById('btnStopNode');
const nodeStatus = document.getElementById('nodeStatus');
const nodeNoBundled = document.getElementById('nodeNoBundled');

let nodeRunning = false;

(async () => {
  nodeSection.style.display = 'block';
  const { has } = await window.bitcoin2Miner.nodeHasBundled();
  if (!has) {
    nodeNoBundled.style.display = 'block';
    nodeNoBundled.textContent = "This build doesn't include the node. Use the green button below after downloading the full installer from the Releases page.";
    btnStartNode.disabled = true;
    btnStartNode.title = 'Only available in the release build (download from GitHub Releases)';
    return;
  }
  const url = await window.bitcoin2Miner.nodeGetRpcUrl();
  if (url) {
    nodeStatus.textContent = 'Node config found. Start the node to run it from this app.';
    nodeStatus.style.display = 'block';
  }
})();

window.bitcoin2Miner.onNodeLog((msg) => {
  if (nodeStatus && nodeRunning) nodeStatus.textContent = 'Node running. ' + (msg.slice(0, 80) + (msg.length > 80 ? '…' : ''));
});
window.bitcoin2Miner.onNodeStopped(() => {
  nodeRunning = false;
  if (btnStartNode) btnStartNode.style.display = 'inline-block';
  if (btnStopNode) btnStopNode.style.display = 'none';
  if (nodeStatus) { nodeStatus.textContent = 'Node stopped.'; nodeStatus.style.display = 'block'; }
});
window.bitcoin2Miner.onNodeError((msg) => {
  nodeRunning = false;
  if (btnStartNode) btnStartNode.style.display = 'inline-block';
  if (btnStopNode) btnStopNode.style.display = 'none';
  if (nodeStatus) { nodeStatus.textContent = 'Error: ' + msg; nodeStatus.style.color = '#f85149'; nodeStatus.style.display = 'block'; }
});

if (btnStartNode) {
  btnStartNode.addEventListener('click', async () => {
    const r = await window.bitcoin2Miner.nodeStart();
    if (!r.ok) {
      if (nodeStatus) { nodeStatus.textContent = r.error || 'Failed to start'; nodeStatus.style.color = '#f85149'; nodeStatus.style.display = 'block'; }
      if (r.error && r.error.includes('not bundled')) nodeNoBundled.style.display = 'block';
      return;
    }
    nodeRunning = true;
    nodeNoBundled.style.display = 'none';
    if (r.rpcUrl) rpcUrlEl.value = r.rpcUrl;
    btnStartNode.style.display = 'none';
    btnStopNode.style.display = 'inline-block';
    nodeStatus.style.color = '#3fb950';
    nodeStatus.textContent = 'Node starting. Wait for sync, then Test connection → Get new address → Start mining.';
    nodeStatus.style.display = 'block';
  });
}
if (btnStopNode) {
  btnStopNode.addEventListener('click', async () => {
    await window.bitcoin2Miner.nodeStop();
  });
}

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + (isError ? 'error' : 'success');
}

function getRpcUrl() {
  let u = rpcUrlEl.value.trim();
  if (!u) return '';
  if (!u.startsWith('http://') && !u.startsWith('https://')) u = 'http://' + u;
  return u;
}

btnTest.addEventListener('click', async () => {
  const url = getRpcUrl();
  if (!url) { setStatus('Enter RPC URL', true); return; }
  btnTest.disabled = true;
  setStatus('Connecting…');
  const r = await window.bitcoin2Miner.rpcTest(url);
  btnTest.disabled = false;
  if (r.ok) setStatus('Connected. Chain: ' + r.chain + ', blocks: ' + r.blocks);
  else setStatus('Error: ' + r.error, true);
});

btnGetAddress.addEventListener('click', async () => {
  const url = getRpcUrl();
  if (!url) { setStatus('Enter RPC URL', true); return; }
  btnGetAddress.disabled = true;
  setStatus('Getting address…');
  const r = await window.bitcoin2Miner.rpcGetNewAddress(url);
  btnGetAddress.disabled = false;
  if (r.ok) { addressEl.value = r.address; setStatus('Address: ' + r.address); }
  else setStatus('Error: ' + r.error, true);
});

btnStart.addEventListener('click', async () => {
  const url = getRpcUrl();
  const address = addressEl.value.trim();
  if (!url) { setStatus('Enter RPC URL', true); return; }
  if (!address || !address.startsWith('b2')) { setStatus('Enter a valid b2 address', true); return; }
  const r = await window.bitcoin2Miner.miningStart({ url, address });
  if (!r.ok) { setStatus(r.error || 'Failed to start', true); return; }
  btnStart.style.display = 'none';
  btnStop.style.display = 'block';
  setStatus('Mining… Trying blocks (this may take several minutes per block).');
});

btnStop.addEventListener('click', async () => {
  await window.bitcoin2Miner.miningStop();
  btnStop.style.display = 'none';
  btnStart.style.display = 'block';
  setStatus('Stopped.');
});

window.bitcoin2Miner.onMiningBlockFound((data) => {
  setStatus('Block found! Hash: ' + data.hash);
});

window.bitcoin2Miner.onMiningError((msg) => {
  setStatus('Error: ' + msg, true);
});

window.bitcoin2Miner.onMiningStopped(() => {
  btnStop.style.display = 'none';
  btnStart.style.display = 'block';
});
