(function () {
  const root = document.getElementById('root');
  if (!root) return;

  function parseHash() {
    const h = (location.hash || '#/').slice(1);
    const parts = h.split('/').filter(Boolean);
    const path = parts[0] || 'home';
    const rest = parts.slice(1);
    return { path: path, parts: rest };
  }

  // Miner app download URL (e.g. GitHub Releases or your CDN)
  const MINER_DOWNLOAD_URL = 'https://github.com/AMCarbonaro/Bitcoin2/releases';
  const BOOTSTRAP_NODE_IP = '3.144.7.181';

  function landingPage() {
    render(
      '<div class="landing">' +
        '<section class="hero">' +
          '<h1 class="hero-title">Bitcoin2</h1>' +
          '<p class="hero-tagline">Your chain. Your node. Mine it.</p>' +
          '<a href="#/onboard/1" class="cta-primary">Mine Bitcoin2</a>' +
          '<p class="hero-sub">Run your own node and earn BTC2. No pools—just you and the chain.</p>' +
        '</section>' +
        '<section class="landing-cards">' +
          '<a href="#/explorer" class="landing-card">' +
            '<span class="landing-card-title">Explorer</span>' +
            '<span class="landing-card-desc">Browse blocks and transactions</span>' +
          '</a>' +
          '<a href="#/wallet" class="landing-card">' +
            '<span class="landing-card-title">Wallet</span>' +
            '<span class="landing-card-desc">Create a wallet, receive, send</span>' +
          '</a>' +
          '<a href="#/onboard/1" class="landing-card">' +
            '<span class="landing-card-title">Mine</span>' +
            '<span class="landing-card-desc">Download miner, run a node, start mining</span>' +
          '</a>' +
        '</section>' +
      '</div>'
    );
  }

  var ONBOARD_STEPS = [
    {
      title: 'Download the miner',
      body: 'Get the Bitcoin2 Miner app so you can mine with one click. You’ll connect it to your own node in a later step.',
      cta: 'Download Bitcoin2 Miner',
      ctaHref: MINER_DOWNLOAD_URL,
      ctaExternal: true
    },
    {
      title: 'Run your own node',
      bodyHtml: true,
      body: '<p>To mine Bitcoin2 you must run your own node. Choose one:</p>' +
        '<h3>Suggested: Use the app (no terminal)</h3>' +
        '<p>Open the <strong>Bitcoin2 Miner app</strong> you downloaded in Step 1. If your build includes the node, you’ll see <strong>“Start Bitcoin2 node”</strong>. Click it—the app will create the config and start the node for you. Wait until it’s synced (use <strong>Test connection</strong> in the app to check), then go to Step 3.</p>' +
        '<p>If you don’t see that option, your build doesn’t include the node—use the terminal instructions below.</p>' +
        '<h3>Or: Run the node yourself via terminal</h3>' +
        '<p>Build and run Bitcoin2 on your machine. Commands below are for <strong>Linux (Ubuntu/Debian)</strong>. On <strong>Mac</strong> install dependencies with Homebrew (<code>brew install cmake ninja</code> etc.) then follow the same build/config steps. On <strong>Windows</strong> use a pre-built binary or build in Visual Studio (see the repo).</p>' +
        '<p><strong>1. Install dependencies (Ubuntu/Debian)</strong></p>' +
        '<pre class="onboard-pre">sudo apt-get update\nsudo apt-get install -y build-essential libtool autotools-dev automake pkg-config \\\n  libssl-dev libevent-dev bsdmainutils python3 cmake ninja-build</pre>' +
        '<p><strong>2. Clone and build</strong></p>' +
        '<pre class="onboard-pre">git clone https://github.com/AMCarbonaro/Bitcoin2.git\ncd bitcoin2\nmkdir build && cd build\ncmake -GNinja .. -DCMAKE_BUILD_TYPE=Release -DBUILD_BITCOIN_QT=OFF -DBUILD_BITCOIN_CLI=ON -DBUILD_BITCOIN_UTILS=ON\nninja</pre>' +
        '<p><strong>3. Create config</strong> — Create <code>~/.bitcoin2/bitcoin2.conf</code> with a <strong>strong</strong> <code>rpcpassword</code>.</p>' +
        '<pre class="onboard-pre">server=1\nrpcuser=bitcoin2_node\nrpcpassword=YOUR_STRONG_PASSWORD\nrpcallowip=127.0.0.1\nrpcport=8332\n\naddnode=' + BOOTSTRAP_NODE_IP + '\nport=8334\nlisten=1\nbind=0.0.0.0:8334\n\ntxindex=1</pre>' +
        '<p><strong>4. Start the node</strong></p>' +
        '<pre class="onboard-pre">./bitcoind -datadir=~/.bitcoin2 -conf=~/.bitcoin2/bitcoin2.conf -daemon</pre>' +
        '<p>Check sync: <code>bitcoin-cli -datadir=~/.bitcoin2 getblockchaininfo</code>. Then create a wallet and get a b2 address:</p>' +
        '<pre class="onboard-pre">bitcoin-cli -datadir=~/.bitcoin2 createwallet "mywallet"\nbitcoin-cli -datadir=~/.bitcoin2 getnewaddress</pre>' +
        '<p>Use that <strong>b2…</strong> address and your RPC URL (<code>http://bitcoin2_node:YOUR_STRONG_PASSWORD@127.0.0.1:8332</code>) in the miner app.</p>',
      cta: null,
      ctaHref: null,
      ctaExternal: false
    },
    {
      title: 'Get your RPC URL and address',
      bodyHtml: true,
      body: '<p><strong>If you used the app to run the node:</strong> The miner app already filled in the RPC URL when you started the node. In the app, click <strong>“Get new address from node”</strong> to get your b2 address. You’re set—go to Step 4.</p>' +
        '<hr class="onboard-divider">' +
        '<p><strong>If you ran the node yourself via terminal:</strong> You need two things in the miner app:</p>' +
        '<p><strong>1. RPC URL</strong> — From the config you created: <code>http://rpcuser:rpcpassword@127.0.0.1:8332</code>. Use the same <code>rpcuser</code> and <code>rpcpassword</code> from your <code>bitcoin2.conf</code>. If the miner runs on the same machine as the node, use <code>127.0.0.1</code>; if the miner is on another computer, use your node’s IP and add <code>rpcallowip=MINER_IP</code> to the node config and restart the node.</p>' +
        '<p><strong>2. Mining address (b2…)</strong> — On the node, run: <code>bitcoin-cli -datadir=~/.bitcoin2 getnewaddress</code> (create a wallet first with <code>createwallet "mywallet"</code> if you haven’t). Paste that b2 address into the miner app.</p>',
      cta: null,
      ctaHref: null,
      ctaExternal: false
    },
    {
      title: 'Connect and start mining',
      bodyHtml: true,
      body: '<p>Open the <strong>Bitcoin2 Miner app</strong>. Then:</p>' +
        '<p><strong>1.</strong> In <strong>Node RPC URL</strong>, use the URL from Step 3 (or the one the app filled in if you used "Start Bitcoin2 node"). Click <strong>Test connection</strong> to confirm the node is reachable.</p>' +
        '<p><strong>2.</strong> In <strong>Mining address</strong>, paste your b2 address—or click <strong>Get new address from node</strong> to create one from your node.</p>' +
        '<p><strong>3.</strong> Click <strong>Start mining</strong>. The app will try to find blocks. When it finds one, the reward is sent to your address and will show in your balance right away. It cannot be spent until after <strong>100 confirmations</strong> (so don’t worry if you see the reward but can’t send it yet—that’s normal).</p>' +
        '<p>Use <strong>Stop</strong> when you want to stop mining. You can start again anytime with the same RPC URL and address.</p>',
      cta: null,
      ctaHref: null,
      ctaExternal: false
    }
  ];

  function onboardingStep(stepId) {
    var stepNum = Math.max(1, Math.min(ONBOARD_STEPS.length, parseInt(stepId, 10) || 1));
    var step = ONBOARD_STEPS[stepNum - 1];
    var prevStep = stepNum > 1 ? stepNum - 1 : null;
    var nextStep = stepNum < ONBOARD_STEPS.length ? stepNum + 1 : null;
    var stepsHtml = ONBOARD_STEPS.map(function (s, i) {
      var n = i + 1;
      var active = n === stepNum;
      return '<a href="#/onboard/' + n + '" class="onboard-dot' + (active ? ' active' : '') + '" title="Step ' + n + '">' + n + '</a>';
    }).join('');
    var navBtns = '';
    if (prevStep) navBtns += '<a href="#/onboard/' + prevStep + '" class="btn btn-secondary">Back</a>';
    navBtns += ' ';
    if (nextStep) navBtns += '<a href="#/onboard/' + nextStep + '" class="btn btn-primary">Next</a>';
    else navBtns += '<a href="#/explorer" class="btn btn-primary">Go to Explorer</a>';
    var ctaAttrs = step.ctaExternal ? ' target="_blank" rel="noopener"' : '';
    var bodyTag = step.bodyHtml ? 'div' : 'p';
    render(
      '<div class="onboarding">' +
        '<div class="onboard-progress">' + stepsHtml + '</div>' +
        '<div class="onboard-step">' +
          '<span class="onboard-step-badge">Step ' + stepNum + ' of ' + ONBOARD_STEPS.length + '</span>' +
          '<h1 class="onboard-title">' + step.title + '</h1>' +
          '<' + bodyTag + ' class="onboard-body">' + step.body + '</' + bodyTag + '>' +
          (step.cta && step.ctaHref ? '<a href="' + step.ctaHref + '" class="btn btn-cta"' + ctaAttrs + '>' + step.cta + '</a>' : '') +
          '<div class="onboard-nav">' + navBtns + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function render(html) {
    root.innerHTML = nav() + html;
  }

  function renderErr(msg) {
    render('<div class="card error">' + (msg || 'Error') + '</div>');
  }

  async function explorerHome() {
    render(
      '<h1>Bitcoin2 Explorer</h1>' +
      '<div class="card" id="explorer-stats">Loading…</div>' +
      '<div class="card"><table><thead><tr><th>Height</th><th>Hash</th><th>Time</th><th>Tx</th></tr></thead><tbody id="explorer-blocks"><tr><td colspan="4">Loading…</td></tr></tbody></table></div>'
    );
    try {
      const [stats, data] = await Promise.all([api('/stats'), api('/blocks')]);
      var statsEl = document.getElementById('explorer-stats');
      var blocksEl = document.getElementById('explorer-blocks');
      if (statsEl) statsEl.innerHTML = 'Chain: ' + (stats.chain || '') + ' &nbsp; Blocks: ' + (stats.blocks ?? '-');
      if (blocksEl) {
        var rows = (data.blocks || []).map(function (b) {
          return '<tr><td><a href="#/block/' + b.hash + '">' + b.height + '</a></td><td class="mono"><a href="#/block/' + b.hash + '">' + b.hash + '</a></td><td>' + formatTime(b.time) + '</td><td>' + (b.nTx || 0) + '</td></tr>';
        }).join('');
        blocksEl.innerHTML = rows || '<tr><td colspan="4">No blocks</td></tr>';
      }
    } catch (e) {
      var statsEl = document.getElementById('explorer-stats');
      var blocksEl = document.getElementById('explorer-blocks');
      if (statsEl) statsEl.innerHTML = '<span class="error">' + (e.message || 'Error') + '</span>. Set BITCOIN2_RPC_URL in web/.env and ensure the node is running.';
      if (blocksEl) blocksEl.innerHTML = '<tr><td colspan="4">—</td></tr>';
    }
  }

  async function blockPage(hash) {
    if (!hash) return explorerHome();
    try {
      const block = await api('/block/' + encodeURIComponent(hash));
      let txRows = (block.tx || []).map(function (t) {
        return '<tr><td class="mono"><a href="#/tx/' + t.txid + '">' + t.txid + '</a></td></tr>';
      }).join('');
      render(
        '<h1>Block</h1>' +
        '<div class="card"><table><tr><td>Hash</td><td class="mono">' + (block.hash || '') + '</td></tr><tr><td>Height</td><td>' + (block.height ?? '') + '</td></tr><tr><td>Time</td><td>' + formatTime(block.time) + '</td></tr><tr><td>Transactions</td><td>' + (block.tx ? block.tx.length : 0) + '</td></tr></table></div>' +
        '<div class="card"><h2>Transactions</h2><table><tbody>' + (txRows || '<tr><td>None</td></tr>') + '</tbody></table></div>'
      );
    } catch (e) {
      renderErr(e.message);
    }
  }

  async function txPage(txid) {
    if (!txid) return explorerHome();
    try {
      const tx = await api('/tx/' + encodeURIComponent(txid));
      let vin = (tx.vin || []).map(function (i) {
        return '<tr><td class="mono">' + (i.txid || 'coinbase') + '</td><td>' + (i.vout ?? '') + '</td><td>' + (i.scriptSig ? i.scriptSig.hex : '-') + '</td></tr>';
      }).join('');
      let vout = (tx.vout || []).map(function (o) {
        return '<tr><td>' + (o.n || '') + '</td><td>' + formatAmount(o.value) + '</td><td class="mono">' + (o.scriptPubKey && o.scriptPubKey.address ? '<a href="#/address/' + encodeURIComponent(o.scriptPubKey.address) + '">' + o.scriptPubKey.address + '</a>' : (o.scriptPubKey && o.scriptPubKey.hex) || '-') + '</td></tr>';
      }).join('');
      render(
        '<h1>Transaction</h1>' +
        '<div class="card"><table><tr><td>Txid</td><td class="mono">' + (tx.txid || '') + '</td></tr></table></div>' +
        '<div class="card"><h2>Inputs</h2><table><thead><tr><th>Txid</th><th>Vout</th><th>Script</th></tr></thead><tbody>' + (vin || '<tr><td colspan="3">None</td></tr>') + '</tbody></table></div>' +
        '<div class="card"><h2>Outputs</h2><table><thead><tr><th>N</th><th>Value</th><th>Address</th></tr></thead><tbody>' + (vout || '<tr><td colspan="3">None</td></tr>') + '</tbody></table></div>'
      );
    } catch (e) {
      renderErr(e.message);
    }
  }

  async function addressPage(addr) {
    if (!addr) return explorerHome();
    addr = decodeURIComponent(addr);
    try {
      const [bal, txs] = await Promise.all([api('/address/' + encodeURIComponent(addr) + '/balance'), api('/address/' + encodeURIComponent(addr) + '/txs')]);
      let txRows = (txs.txids || []).map(function (x) {
        return '<tr><td class="mono"><a href="#/tx/' + x.txid + '">' + x.txid + '</a></td><td>' + x.height + '</td><td>' + formatTime(x.time) + '</td></tr>';
      }).join('');
      render(
        '<h1>Address</h1>' +
        '<div class="card"><table><tr><td>Address</td><td class="mono">' + addr + '</td></tr><tr><td>Balance</td><td>' + formatAmount(bal.balance) + '</td></tr></table></div>' +
        '<div class="card"><h2>Transactions</h2><table><thead><tr><th>Txid</th><th>Height</th><th>Time</th></tr></thead><tbody>' + (txRows || '<tr><td colspan="3">None</td></tr>') + '</tbody></table></div>'
      );
    } catch (e) {
      renderErr(e.message);
    }
  }

  function getStoredWallet() {
    try {
      var s = sessionStorage.getItem('b2wallet');
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  }
  function setStoredWallet(obj) {
    sessionStorage.setItem('b2wallet', JSON.stringify({ address: obj.address, wif: obj.wif }));
  }
  function clearStoredWallet() {
    sessionStorage.removeItem('b2wallet');
  }

  function walletPage() {
    var stored = getStoredWallet();
    if (stored) {
      renderWalletDashboard(stored.address, stored.wif);
      return;
    }
    render(
      '<h1>Wallet</h1>' +
      '<div class="card">' +
      '<p><strong>Create a new wallet</strong> (keys stay in your browser)</p>' +
      '<button id="btn-create">Generate new wallet</button>' +
      '<div id="wallet-result"></div>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Import wallet</strong> (paste your WIF private key)</p>' +
      '<label>WIF <input type="password" id="import-wif" placeholder="5H..."></label>' +
      '<button id="btn-import">Open wallet</button>' +
      '<div id="import-result"></div>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>View balance only</strong> (any b2 address)</p>' +
      '<label>Address <input type="text" id="addr-balance" placeholder="b21q..."></label>' +
      '<button id="btn-balance">Get balance</button>' +
      '<div id="balance-result"></div>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Verify address</strong> – see which block rewards were sent to an address (checks coinbase outputs)</p>' +
      '<label>Address <input type="text" id="addr-verify" placeholder="b21q..."></label>' +
      '<button id="btn-verify">Verify</button>' +
      '<div id="verify-result"></div>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Block 1 coinbase</strong> – who received the first mined reward</p>' +
      '<button id="btn-coinbase1">Show block 1 reward</button>' +
      '<div id="coinbase1-result"></div>' +
      '</div>'
    );
    document.getElementById('btn-create').onclick = function () {
      if (!window.Bitcoin2Wallet) { document.getElementById('wallet-result').innerHTML = '<p class="error">Wallet script not loaded.</p>'; return; }
      try {
        var pair = window.Bitcoin2Wallet.create();
        document.getElementById('wallet-result').innerHTML =
          '<p class="success">Back up your key. This page does not store it until you open the wallet.</p>' +
          '<p>Address: <span class="mono">' + pair.address + '</span> <button type="button" id="btn-save-wallet">Save &amp; open wallet</button></p>' +
          '<p class="mono" style="word-break:break-all;font-size:0.85rem;">WIF: ' + pair.wif + '</p>';
        document.getElementById('btn-save-wallet').onclick = function () {
          setStoredWallet(pair);
          walletPage();
        };
      } catch (e) {
        document.getElementById('wallet-result').innerHTML = '<p class="error">' + e.message + '</p>';
      }
    };
    document.getElementById('btn-import').onclick = function () {
      if (!window.Bitcoin2Wallet) { document.getElementById('import-result').innerHTML = '<p class="error">Wallet script not loaded.</p>'; return; }
      var wif = document.getElementById('import-wif').value.trim();
      if (!wif) { document.getElementById('import-result').innerHTML = '<p class="error">Enter WIF</p>'; return; }
      try {
        var pair = window.Bitcoin2Wallet.fromWIF(wif);
        setStoredWallet({ address: pair.address, wif: pair.wif });
        walletPage();
      } catch (e) {
        document.getElementById('import-result').innerHTML = '<p class="error">' + e.message + '</p>';
      }
    };
    document.getElementById('btn-balance').onclick = function () {
      var addr = document.getElementById('addr-balance').value.trim();
      if (!addr) { document.getElementById('balance-result').innerHTML = '<p class="error">Enter address</p>'; return; }
      document.getElementById('balance-result').innerHTML = '<p>Loading…</p>';
      api('/address/' + encodeURIComponent(addr) + '/balance').then(function (b) {
        document.getElementById('balance-result').innerHTML = '<p class="success">Balance: ' + formatAmount(b.balance) + '</p>';
      }).catch(function (e) {
        document.getElementById('balance-result').innerHTML = '<p class="error">' + e.message + '</p>';
      });
    };
    document.getElementById('btn-verify').onclick = function () {
      var addr = document.getElementById('addr-verify').value.trim();
      if (!addr) { document.getElementById('verify-result').innerHTML = '<p class="error">Enter address</p>'; return; }
      document.getElementById('verify-result').innerHTML = '<p>Scanning blocks…</p>';
      api('/address/' + encodeURIComponent(addr) + '/verify').then(function (v) {
        if (v.rewards && v.rewards.length > 0) {
          var list = v.rewards.map(function (r) { return 'Block ' + r.block + ': ' + r.valueBtc2 + ' BTC2'; }).join(', ');
          document.getElementById('verify-result').innerHTML = '<p class="success">This address received block rewards: ' + list + '</p><p>Total: ' + v.totalBtc2 + ' BTC2 (from ' + v.blocksScanned + ' blocks scanned)</p>';
        } else {
          document.getElementById('verify-result').innerHTML = '<p>No block rewards found for this address in the first ' + v.blocksScanned + ' blocks.</p>';
        }
      }).catch(function (e) {
        document.getElementById('verify-result').innerHTML = '<p class="error">' + e.message + '</p>';
      });
    };
    document.getElementById('btn-coinbase1').onclick = function () {
      document.getElementById('coinbase1-result').innerHTML = '<p>Loading…</p>';
      api('/block/1/coinbase').then(function (c) {
        if (!c.outputs || c.outputs.length === 0) {
          document.getElementById('coinbase1-result').innerHTML = '<p>No coinbase data</p>';
          return;
        }
        var first = c.outputs[0];
        var addr = first.address || '(no address)';
        document.getElementById('coinbase1-result').innerHTML =
          '<p>Block 1 reward went to: <span class="mono">' + addr + '</span></p>' +
          '<p>Amount: ' + (first.valueBtc2 || (first.valueSat / 1e8).toFixed(8)) + ' BTC2</p>';
      }).catch(function (e) {
        document.getElementById('coinbase1-result').innerHTML = '<p class="error">' + e.message + '</p>';
      });
    };
  }

  function renderWalletDashboard(addr, wif) {
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(addr);
    render(
      '<h1>My Wallet</h1>' +
      '<div class="card">' +
      '<p><button type="button" id="btn-logout" style="float:right;">Log out</button></p>' +
      '<p><strong>Balance</strong></p>' +
      '<p id="wallet-balance" style="font-size:1.5rem;">Loading…</p>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Receive (your address)</strong></p>' +
      '<p class="mono" id="wallet-addr">' + addr + '</p>' +
      '<button type="button" id="btn-copy-addr">Copy address</button>' +
      '<p style="margin-top:8px;"><img src="' + qrUrl + '" alt="QR" width="150" height="150"></p>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Recent transactions</strong></p>' +
      '<div id="wallet-txs">Loading…</div>' +
      '</div>' +
      '<div class="card">' +
      '<p><strong>Send</strong></p>' +
      '<label>To address <input type="text" id="send-to" placeholder="b21q..."></label>' +
      '<label>Amount (BTC2) <input type="text" id="send-amount" placeholder="0.01"></label>' +
      '<button type="button" id="btn-send">Send</button>' +
      '<div id="send-result"></div>' +
      '<p style="margin-top:8px;font-size:0.85rem;color:#8b949e;">Or broadcast raw signed hex: <input type="text" id="raw-hex" placeholder="02000000..." style="width:100%;"> <button type="button" id="btn-broadcast">Broadcast</button></p>' +
      '<div id="broadcast-result"></div>' +
      '</div>'
    );
    document.getElementById('btn-logout').onclick = function () { clearStoredWallet(); walletPage(); };
    document.getElementById('btn-copy-addr').onclick = function () {
      navigator.clipboard.writeText(addr).then(function () { document.getElementById('btn-copy-addr').textContent = 'Copied!'; });
    };
    api('/address/' + encodeURIComponent(addr) + '/balance').then(function (b) {
      document.getElementById('wallet-balance').textContent = formatAmount(b.balance) + ' BTC2';
    }).catch(function (e) {
      document.getElementById('wallet-balance').textContent = 'Error: ' + e.message;
    });
    api('/address/' + encodeURIComponent(addr) + '/txs').then(function (r) {
      var txids = r.txids || [];
      var html = txids.length ? txids.slice(0, 15).map(function (x) {
        return '<p><a href="#/tx/' + x.txid + '">' + x.txid.slice(0, 16) + '…</a> (block ' + x.height + ')</p>';
      }).join('') : '<p>No transactions yet.</p>';
      document.getElementById('wallet-txs').innerHTML = html;
    }).catch(function () {
      document.getElementById('wallet-txs').innerHTML = '<p>Could not load transactions.</p>';
    });
    document.getElementById('btn-send').onclick = function () {
      var toAddr = document.getElementById('send-to').value.trim();
      var amountStr = document.getElementById('send-amount').value.trim();
      var resEl = document.getElementById('send-result');
      if (!toAddr || !amountStr) { resEl.innerHTML = '<p class="error">Enter to address and amount</p>'; return; }
      var amountSat = Math.round(parseFloat(amountStr) * 1e8);
      if (amountSat <= 0) { resEl.innerHTML = '<p class="error">Invalid amount</p>'; return; }
      api('/address/' + encodeURIComponent(addr) + '/utxos').then(function (r) {
        var utxos = r.utxos || [];
        if (utxos.length === 0) { resEl.innerHTML = '<p class="error">No spendable outputs</p>'; return; }
        var total = utxos.reduce(function (s, u) { return s + Math.round((u.amount || 0) * 1e8); }, 0);
        var fee = 500;
        if (total < amountSat + fee) { resEl.innerHTML = '<p class="error">Insufficient balance</p>'; return; }
        if (!window.bitcoin || !window.bitcoin.TransactionBuilder) {
          resEl.innerHTML = '<p class="error">Send not available. Use a full node or paste signed hex below.</p>';
          return;
        }
        try {
          var b2 = { bech32: 'b2' };
          var txb = new window.bitcoin.TransactionBuilder();
          var inSum = 0;
          for (var i = 0; i < utxos.length; i++) {
            txb.addInput(utxos[i].txid, utxos[i].vout);
            inSum += Math.round((utxos[i].amount || 0) * 1e8);
            if (inSum >= amountSat + fee) break;
          }
          txb.addOutput(toAddr, amountSat);
          var change = inSum - amountSat - fee;
          if (change > 0) txb.addOutput(addr, change);
          var keyPair = window.Bitcoin2Wallet.fromWIF(wif).keyPair;
          for (var j = 0; j < txb.inputs.length; j++) txb.sign(j, keyPair);
          var hex = txb.build().toHex();
          fetch('/api/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hex: hex }) })
            .then(function (resp) { return resp.text().then(function (t) { try { return t ? JSON.parse(t) : {}; } catch (e) { return {}; } }); })
            .then(function (d) {
              resEl.innerHTML = d.txid ? '<p class="success">Sent. <a href="#/tx/' + d.txid + '">View tx</a></p>' : '<p class="error">' + (d.error || 'Failed') + '</p>';
            })
            .catch(function (e) { resEl.innerHTML = '<p class="error">' + e.message + '</p>'; });
        } catch (err) {
          resEl.innerHTML = '<p class="error">' + err.message + '</p>';
        }
      }).catch(function (e) { document.getElementById('send-result').innerHTML = '<p class="error">' + e.message + '</p>'; });
    };
    document.getElementById('btn-broadcast').onclick = function () {
      var hex = document.getElementById('raw-hex').value.trim();
      if (!hex) { document.getElementById('broadcast-result').innerHTML = '<p class="error">Enter raw tx hex</p>'; return; }
      fetch('/api/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hex: hex }) })
        .then(function (r) { return r.text().then(function (t) { try { return t ? JSON.parse(t) : {}; } catch (e) { return {}; } }); })
        .then(function (d) {
          document.getElementById('broadcast-result').innerHTML = d.txid ? '<p class="success">Txid: <a href="#/tx/' + d.txid + '">' + d.txid + '</a></p>' : '<p class="error">' + (d.error || 'Failed') + '</p>';
        })
        .catch(function (e) { document.getElementById('broadcast-result').innerHTML = '<p class="error">' + e.message + '</p>'; });
    };
  }

  function minePage() {
    var nodeIp = '3.144.7.181';
    render(
      '<h1>Mine Bitcoin2</h1>' +
      '<div class="card">' +
      '<p><strong>To mine Bitcoin2 you must run your own node.</strong> There is no shared or public mining node. Run a Bitcoin2 node, then connect the miner app (or use <code>generatetoaddress</code>) to mine.</p>' +
      '</div>' +
      '<div class="card">' +
      '<h2>Step 1: Run your node</h2>' +
      '<p>Build and run Bitcoin2, and connect to the network. Add this to <code>bitcoin2.conf</code>:</p>' +
      '<pre class="mono">addnode=' + nodeIp + '\nport=8334\nrpcport=8332\nserver=1\nrpcuser=youruser\nrpcpassword=yourpassword</pre>' +
      '<p><a href="https://github.com/AMCarbonaro/Bitcoin2/blob/main/docs/RUN_A_NODE.md" target="_blank">Full guide: Run a node (RUN_A_NODE.md)</a></p>' +
      '</div>' +
      '<div class="card">' +
      '<h2>Step 2: Get RPC URL and mining address</h2>' +
      '<p>On your node, run the script or use <code>bitcoin-cli getnewaddress</code>. See <a href="https://github.com/AMCarbonaro/Bitcoin2/blob/main/docs/MINER_APP_CONNECTION.md" target="_blank">MINER_APP_CONNECTION.md</a>.</p>' +
      '</div>' +
      '<div class="card">' +
      '<h2>Step 3: Mine</h2>' +
      '<p><strong>Option A – Miner app:</strong> Download the Bitcoin2 Miner app, enter your node’s RPC URL and your b2 address, then Start mining. See <a href="https://github.com/AMCarbonaro/Bitcoin2/blob/main/electron-app/GETTING_STARTED.md" target="_blank">GETTING_STARTED.md</a> in <code>electron-app/</code>.</p>' +
      '<p><strong>Option B – CLI:</strong></p>' +
      '<pre class="mono">bitcoin-cli generatetoaddress 1 &lt;your_b2_address&gt; 100000000</pre>' +
      '<p>Run in a loop for more blocks.</p>' +
      '</div>' +
      '<div class="card">' +
      '<p><a href="https://github.com/AMCarbonaro/Bitcoin2/blob/main/docs/RUN_A_NODE.md" target="_blank">Run a node</a> &nbsp; <a href="https://github.com/AMCarbonaro/Bitcoin2" target="_blank">Source (GitHub)</a></p>' +
      '</div>'
    );
  }

  function route() {
    var r = parseHash();
    if (r.path === 'home') return landingPage();
    if (r.path === 'onboard') return onboardingStep(r.parts[0]);
    if (r.path === 'block') return blockPage(r.parts[0]);
    if (r.path === 'tx') return txPage(r.parts[0]);
    if (r.path === 'address') return addressPage(r.parts[0]);
    if (r.path === 'wallet') return walletPage();
    if (r.path === 'mine') return minePage();
    if (r.path === 'explorer') return explorerHome();
    landingPage();
  }

  window.bitcoin2Route = route;
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (a && a.getAttribute('href')) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        e.stopPropagation();
        location.hash = href;
        setTimeout(route, 0);
      }
    }
  }, true);
  window.addEventListener('hashchange', route);
  window.addEventListener('load', function () { setTimeout(route, 0); });
  route();
})();
