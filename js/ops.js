window.OptiOps = (function () {
  const db = () => OptiStore.get();
  const money = (n) => OptiStore.money(n);
  const A = () => window.OptiApp;
  const esc = (s) => A().esc(s);
  const toast = (s) => A().toast(s);
  const go = (h) => A().go(h);
  const openModal = (t, b) => A().openModal(t, b);
  const closeModal = () => A().closeModal();
  const shell = (p, i) => A().shell(p, i);

  const ONES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  function under100(n) {
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
    if (n < 17) return ONES[n];
    if (n < 20) return 'dix-' + ONES[n - 10];
    if (n < 70) return tens[Math.floor(n / 10)] + (n % 10 ? (n % 10 === 1 ? '-et-un' : '-' + ONES[n % 10]) : '');
    if (n < 80) return n === 71 ? 'soixante-et-onze' : 'soixante-' + under100(n - 60);
    if (n < 90) return 'quatre-vingt' + (n === 80 ? 's' : '-' + ONES[n % 10]);
    return 'quatre-vingt-' + under100(n - 80);
  }
  function under1000(n) {
    if (n < 100) return under100(n);
    const h = Math.floor(n / 100), r = n % 100;
    const hs = h === 1 ? 'cent' : ONES[h] + ' cent' + (!r && h > 1 ? 's' : '');
    return hs + (r ? ' ' + under100(r) : '');
  }
  function daWords(n) {
    n = Math.round(Math.abs(n || 0));
    if (!n) return 'zéro dinar algérien';
    let out = '';
    const mil = Math.floor(n / 1000000), rest = n % 1000000;
    const th = Math.floor(rest / 1000), u = rest % 1000;
    if (mil) out += (mil === 1 ? 'un million' : under1000(mil) + ' millions') + ' ';
    if (th) out += (th === 1 ? 'mille' : under1000(th) + ' mille') + ' ';
    if (u) out += under1000(u);
    return (out.trim() + ' dinar' + (n > 1 ? 's' : '') + ' algérien' + (n > 1 ? 's' : '')).replace(/\s+/g, ' ');
  }

  function printCss(kind) {
    if (kind === 'ticket') {
      return 'body{font-family:ui-sans-serif,system-ui,sans-serif;width:72mm;margin:0 auto;font-size:12px;color:#111}table{width:100%;border-collapse:collapse}td{padding:3px 0}hr{border:0;border-top:1px dashed #999}.t{text-align:center}@media print{@page{size:80mm auto;margin:4mm}button{display:none}}';
    }
    if (kind === 'recu') {
      return `@page{size:A5 portrait;margin:5mm}*{box-sizing:border-box}body{margin:0;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:10.5px}button{margin:12px auto;display:block;background:#0D7A70;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:700}@media print{button{display:none}}`;
    }
    return `@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#12151A;font-family:"Source Sans 3",system-ui,sans-serif;font-size:13px}.sheet{max-width:190mm;margin:0 auto}.band{height:8px;background:linear-gradient(90deg,#0A5F58,#0D7A70,#14968A);border-radius:4px 4px 0 0}.wrap{border:1px solid #E4E8E6;border-top:0;padding:22px 26px 18px;border-radius:0 0 8px 8px}.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:22px}.brand{display:flex;gap:12px;align-items:center}.mark{width:46px;height:46px;border-radius:12px;background:#0D7A70;color:#fff;display:grid;place-items:center;font-weight:800;font-size:18px}.shopname{font-size:22px;margin:0;letter-spacing:-.04em;font-weight:700}.muted{color:#667078;line-height:1.45}.doc{text-align:right}.doc h2{margin:0;font-size:26px;letter-spacing:-.04em;color:#0D7A70}.pill{display:inline-block;background:#E6F5F3;color:#0A5F58;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;margin-top:6px}.boxes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 18px}.box{border:1px solid #E4E8E6;border-radius:10px;padding:12px 14px;background:#F7FAF9}.box b{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#667078;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:4px 0 16px}th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#667078;border-bottom:2px solid #0D7A70;padding:8px 6px}td{padding:9px 6px;border-bottom:1px solid #EEF1F0}td.r,th.r{text-align:right}.tot{width:280px;margin-left:auto;border:1px solid #E4E8E6;border-radius:12px;overflow:hidden}.tot div{display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid #EEF1F0}.tot div:last-child{border:0;background:#0D7A70;color:#fff;font-weight:700;font-size:15px}.words{margin:16px 0;padding:10px 12px;background:#F4F6F5;border-radius:8px;font-style:italic;color:#445}.signs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:28px}.sign{height:78px;border-top:1px dashed #CDD5D2;padding-top:8px;color:#667078;font-size:12px}.foot{margin-top:22px;padding-top:10px;border-top:1px solid #E4E8E6;font-size:11px;color:#667078;display:flex;justify-content:space-between}button{margin:16px auto;display:block;background:#0D7A70;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-weight:700}@media print{button{display:none}.sheet{max-width:none}}`;
  }

  function printDoc(title, body, kind) {
    const w = window.open('', '_blank');
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${printCss(kind)}</style></head><body>${body}<button onclick="print()">Imprimer / PDF</button><script>setTimeout(function(){print()},250)<\/script></body></html>`);
    w.document.close();
  }

  function shopMark() {
    const s = db().shop;
    if (s.logo) return `<img src="${s.logo}" style="width:46px;height:46px;border-radius:12px;object-fit:cover">`;
    return `<div class="mark">O+</div>`;
  }
  function shopBlock() {
    const s = db().shop;
    return `<div class="brand">${shopMark()}<div><p class="shopname">${esc(s.name)}</p><div class="muted">${esc(s.address || '')}<br>${esc(s.phone || '')}${s.mobile ? ' · ' + esc(s.mobile) : ''}<br>NIF ${esc(s.nif || '—')}${s.rc ? ' · RC ' + esc(s.rc) : ''}</div></div></div>`;
  }
  function docFrame(title, number, date, extra, body) {
    const s = db().shop;
    return `<div class="sheet"><div class="band"></div><div class="wrap"><div class="top">${shopBlock()}<div class="doc"><h2>${esc(title)}</h2><div class="muted">${esc(number)}<br>${esc(date)}</div>${extra || ''}</div></div>${body}<div class="foot"><span>${esc(s.name)} · ${esc(s.city || 'Algérie')} · Paiement en DA</span><span>Document généré par OptiDZ</span></div></div></div>`;
  }

  function saleLines(s) {
    return (s.items || []).map((i) => {
      const p = db().products.find((x) => x.id === i.productId);
      const label = i.label || (p ? (p.brand + ' ' + (p.model || p.ref || '')) : 'Article');
      const ref = p?.ref ? `<div class="muted">${esc(p.ref)}</div>` : '';
      return `<tr><td>${esc(label)}${ref}</td><td class="r">${i.q}</td><td class="r">${money(i.price)}</td><td class="r">${money(i.price * i.q)}</td></tr>`;
    }).join('');
  }

  function printTicket(id) {
    const s = db().sales.find((x) => x.id === id);
    if (!s) return;
    if (s.atelier && window.OptiApp?.printRecu) return window.OptiApp.printRecu(id);
    const shop = db().shop;
    const code = String(s.id || '').replace(/"/g, '');
    printDoc(s.id, `
      <div class="t"><strong>${esc(shop.name)}</strong><br>${esc(shop.address || '')}<br>${esc(shop.phone || '')}<br>NIF ${esc(shop.nif || '—')}</div>
      <hr><div>Ticket ${esc(s.id)}<br>${esc(s.date)}<br>${esc(OptiStore.clientName(s.clientId))}</div><hr>
      <table>${(s.items || []).map((i) => { const p = db().products.find((x) => x.id === i.productId); return `<tr><td>${esc(p ? p.brand : i.label || '')} x${i.q}</td><td style="text-align:right">${money(i.price * i.q)}</td></tr>`; }).join('')}</table>
      <hr><p>Total ${money(s.total)}<br>Payé ${money(s.paid)}<br>Reste ${money(patientRest(s))}${s.coverAmount ? '<br>Prise en charge ' + esc(s.coverOrg) + ' ' + money(s.coverAmount) : ''}</p>
      <div class="t" style="margin-top:8px">
        <svg id="ticketBc"></svg>
        <div style="font-size:11px;margin-top:2px">${esc(s.id)}</div>
      </div>
      <p class="t">${esc(shop.ticketFooter || shop.slogan || 'Merci de votre visite')}</p>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
      <script>
        try {
          JsBarcode('#ticketBc', ${JSON.stringify(code)}, { format: 'CODE128', width: 1.35, height: 42, displayValue: false, margin: 0 });
        } catch (e) {}
      <\/script>`, 'ticket');
  }

  function digitsOnly(s) {
    return String(s || '').replace(/\D/g, '');
  }

  function findByScanCode(raw) {
    const code = String(raw || '').trim();
    if (!code) return null;
    const low = code.toLowerCase();
    const dig = digitsOnly(code);

    const sale = (db().sales || []).find((s) => s.id === code || String(s.id).toLowerCase() === low);
    if (sale) return { type: 'sale', item: sale };

    const inv = (db().invoices || []).find((f) => f.id === code || String(f.id).toLowerCase() === low);
    if (inv) {
      const linked = (db().sales || []).find((s) => s.id === inv.saleId);
      if (linked) return { type: 'sale', item: linked, via: inv.id };
    }

    const order = (db().orders || []).find((o) => o.id === code || String(o.id).toLowerCase() === low);
    if (order) return { type: 'order', item: order };

    const quote = (db().quotes || []).find((q) => q.id === code || String(q.id).toLowerCase() === low);
    if (quote) return { type: 'quote', item: quote };

    const po = (db().purchaseOrders || []).find((p) => p.id === code || String(p.id).toLowerCase() === low);
    if (po) return { type: 'po', item: po };

    const product = (db().products || []).find((p) => {
      if (!p) return false;
      if (p.barcode === code || p.ref === code) return true;
      if (String(p.ref || '').toLowerCase() === low) return true;
      const bd = digitsOnly(p.barcode);
      return dig && bd && (bd === dig || bd.endsWith(dig) || dig.endsWith(bd));
    });
    if (product) return { type: 'product', item: product };

    return null;
  }

  function openScannedTicket(saleId) {
    const s = db().sales.find((x) => x.id === saleId);
    if (!s) return toast('Ticket introuvable');
    const rest = patientRest(s);
    openModal('Ticket ' + s.id, `
      <div class="form">
        <p class="muted">Client : <b>${esc(OptiStore.clientName(s.clientId))}</b> · ${esc(s.date)} · ${esc(s.method || '—')}</p>
        <div class="alert">Total ${money(s.total)} · Payé ${money(s.paid)} · Reste ${money(rest)}${s.coverAmount ? ' · ' + esc(s.coverOrg) + ' ' + money(s.coverAmount) : ''}</div>
        <div class="toolbar">
          <button class="btn gold" onclick="OptiApp.printTicket('${s.id}');OptiApp.closeModal()">Réimprimer ticket</button>
          <button class="btn" onclick="OptiApp.printInvoice('${s.id}');OptiApp.closeModal()">Facture PDF</button>
          ${rest && s.status !== 'retour' ? `<button class="btn gold" onclick="OptiApp.closeModal();OptiApp.payRemain('${s.id}')">Encaisser le solde</button>` : ''}
          ${s.status !== 'retour' ? `<button class="btn" onclick="OptiApp.closeModal();OptiApp.startReturn('${s.id}')">Retour</button>` : ''}
        </div>
      </div>`);
  }

  function handleScanCode(raw, opts = {}) {
    if (db().shop?.barcodeEnabled === false) return false;
    const code = String(raw || '').trim();
    if (code.length < 3) return false;
    const hit = findByScanCode(code);
    if (!hit) {
      if (!opts.silent) toast('Référence inconnue : ' + code);
      return false;
    }
    if (hit.type === 'sale') {
      if (!String(location.hash).includes('/sales')) go('#/app/sales');
      setTimeout(() => openScannedTicket(hit.item.id), 80);
      toast(hit.via ? 'Facture ' + hit.via + ' → ticket ' + hit.item.id : 'Ticket ' + hit.item.id);
      return true;
    }
    if (hit.type === 'order') {
      go('#/app/orders');
      toast('Commande ' + hit.item.id);
      return true;
    }
    if (hit.type === 'quote') {
      go('#/app/quotes');
      toast('Devis ' + hit.item.id);
      return true;
    }
    if (hit.type === 'po') {
      go('#/app/purchases');
      toast('Bon ' + hit.item.id);
      return true;
    }
    if (hit.type === 'product') {
      const p = hit.item;
      const onSales = String(location.hash).includes('/sales');
      const onStock = String(location.hash).includes('/stock') || String(location.hash).includes('/products');
      if (onSales || opts.forceCart) {
        A().addCart(p.id);
        toast(p.brand + ' · ' + (p.ref || p.barcode || ''));
      } else if (onStock) {
        A().editProduct(p.id);
      } else {
        go('#/app/sales');
        setTimeout(() => A().addCart(p.id), 120);
        toast(p.brand + ' ajouté en caisse');
      }
      return true;
    }
    return false;
  }

  let wedgeInstalled = false;
  function installWedgeScanner() {
    if (wedgeInstalled) return;
    wedgeInstalled = true;
    let buf = '';
    let last = 0;
    let rapid = 0;
    document.addEventListener('keydown', (e) => {
      if (db().shop?.barcodeEnabled === false) return;
      if (!db().session) return;
      const mode = currentScannerType();
      if (mode === 'manual' || mode === 'camera') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const t = e.target;
      const tag = (t?.tagName || '').toLowerCase();
      const isScanField = t && (t.id === 'bc' || t.id === 'scan' || t.id === 'ticketScan' || t.classList?.contains('scan-target'));
      const isText = tag === 'textarea' || (tag === 'input' && !isScanField && t.type !== 'checkbox' && t.type !== 'radio' && t.type !== 'button' && t.type !== 'submit' && t.type !== 'file');
      const now = Date.now();
      if (now - last > 70) {
        buf = '';
        rapid = 0;
      }
      if (e.key === 'Enter') {
        if (buf.length >= 3 && (rapid >= 2 || isScanField || !isText)) {
          const code = buf;
          buf = '';
          rapid = 0;
          if (!isScanField) {
            e.preventDefault();
            e.stopPropagation();
          }
          handleScanCode(code);
        } else {
          buf = '';
          rapid = 0;
        }
        last = now;
        return;
      }
      if (e.key.length === 1) {
        if (now - last < 55) rapid += 1;
        buf += e.key;
        last = now;
        if (buf.length > 64) buf = buf.slice(-64);
      }
    }, true);
  }

  const SCANNER_TYPES = [
    { id: 'usb_hid', label: 'USB douchette (HID clavier)', hint: 'Honeywell, Zebra, Datalogic, Netum… en mode clavier. Branchez et scannez.' },
    { id: 'bt_hid', label: 'Bluetooth douchette (HID)', hint: 'Appariez la douchette Bluetooth dans Windows, puis scannez comme un clavier.' },
    { id: 'bt_spp', label: 'Bluetooth série (SPP / COM)', hint: 'Scanners BT en mode port série. Connectez le port COM ci-dessous.' },
    { id: 'usb_com', label: 'USB série / RS232 (COM)', hint: 'Câble COM ou adaptateur USB-série. Choisissez le port puis Connecter.' },
    { id: 'camera', label: 'Caméra / webcam', hint: 'Lecture via la caméra du PC ou tablette.' },
    { id: 'phone_bt', label: 'Téléphone Bluetooth / app', hint: 'App mobile qui envoie le code comme un clavier Bluetooth HID.' },
    { id: 'presentation', label: 'Mode présentation (USB/BT)', hint: 'Certains scanners envoient Entrée automatiquement — mode rapide caisse.' },
    { id: 'manual', label: 'Saisie manuelle uniquement', hint: 'Pas de douchette : tapez la référence dans le champ scan.' }
  ];

  function currentScannerType() {
    return db().shop?.scannerType || 'usb_hid';
  }

  function scannerTypeMeta(id) {
    return SCANNER_TYPES.find((x) => x.id === id) || SCANNER_TYPES[0];
  }

  function scannerTypeOptions(selected) {
    const cur = selected || currentScannerType();
    return SCANNER_TYPES.map((t) => `<option value="${t.id}" ${t.id === cur ? 'selected' : ''}>${esc(t.label)}</option>`).join('');
  }

  async function setScannerType(id) {
    const meta = scannerTypeMeta(id);
    db().shop.scannerType = meta.id;
    await OptiStore.save('Scanner : ' + meta.label);
    toast(meta.label);
    const hint = document.getElementById('scannerHint');
    if (hint) hint.textContent = meta.hint;
    const sel = document.getElementById('scannerType');
    if (sel) sel.value = meta.id;
    if (meta.id === 'camera') openCameraScan();
    if (meta.id === 'bt_hid' || meta.id === 'bt_spp' || meta.id === 'phone_bt') {
      showScannerPanel();
    }
  }

  async function openBluetoothSettings() {
    try {
      if (window.optidzDesktop?.openBluetooth) {
        await window.optidzDesktop.openBluetooth();
        toast('Paramètres Bluetooth Windows ouverts');
        return;
      }
    } catch {}
    toast('Ouvrez Paramètres Windows → Bluetooth, puis appariez la douchette.');
  }

  async function listBluetoothScanners() {
    let rows = [];
    try {
      if (window.optidzDesktop?.listScanDevices) {
        rows = await window.optidzDesktop.listScanDevices() || [];
      }
    } catch {}
    return rows;
  }

  async function showScannerPanel() {
    const cur = currentScannerType();
    const meta = scannerTypeMeta(cur);
    const devices = await listBluetoothScanners();
    openModal('Appareils de scan', `
      <div class="form scanner-panel">
        <div class="field">
          <label>Type d’appareil</label>
          <select id="scannerTypeModal" onchange="OptiApp.setScannerType(this.value)">${scannerTypeOptions(cur)}</select>
        </div>
        <p class="hint" id="scannerHintModal">${esc(meta.hint)}</p>
        <div class="settings-actions">
          <button type="button" class="btn gold" onclick="OptiApp.openBluetoothSettings()">Bluetooth Windows</button>
          <button type="button" class="btn" onclick="OptiApp.connectSerialScanner()">Connecter port COM / BT-SPP</button>
          <button type="button" class="btn" onclick="OptiApp.openCameraScan()">Caméra</button>
          <button type="button" class="btn" onclick="OptiApp.refreshScannerPanel()">Actualiser liste</button>
        </div>
        <strong class="settings-mini-title">Appareils Bluetooth / scanners détectés</strong>
        <div class="scanner-device-list">
          ${devices.length ? devices.map((d) => `<div class="scanner-device ${d.ok ? 'ok' : ''}">
            <b>${esc(d.name)}</b>
            <small>${esc(d.status || d.class || 'Bluetooth')}</small>
          </div>`).join('') : '<p class="muted">Aucun périphérique listé. Appariez d’abord la douchette dans Bluetooth Windows, puis Actualiser.</p>'}
        </div>
        <p class="muted">Compatible : USB HID, Bluetooth HID, Bluetooth SPP, USB-COM, caméra, téléphone en clavier BT.</p>
      </div>`);
  }

  async function refreshScannerPanel() {
    closeModal();
    await showScannerPanel();
  }

  let serialReader = null;
  let serialPort = null;
  async function connectSerialScanner() {
    if (!('serial' in navigator)) {
      return toast('Port série non disponible. Utilisez USB HID / Bluetooth HID, ou Electron récent.');
    }
    try {
      stopSerialScanner();
      serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: +(db().shop?.scannerBaud || 9600) });
      const decoder = new TextDecoderStream();
      serialPort.readable.pipeTo(decoder.writable);
      serialReader = decoder.readable.getReader();
      toast('Scanner COM / Bluetooth SPP connecté');
      let line = '';
      (async () => {
        while (serialPort && serialReader) {
          const { value, done } = await serialReader.read();
          if (done) break;
          line += value || '';
          if (/[\r\n]/.test(line)) {
            const parts = line.split(/[\r\n]+/);
            line = parts.pop() || '';
            parts.map((p) => p.trim()).filter(Boolean).forEach((code) => handleScanCode(code));
          }
        }
      })().catch(() => stopSerialScanner());
    } catch (err) {
      if (String(err?.message || err).includes('No port selected')) return;
      toast('Connexion série annulée ou impossible');
    }
  }

  function stopSerialScanner() {
    try { serialReader?.cancel?.(); } catch {}
    try { serialPort?.close?.(); } catch {}
    serialReader = null;
    serialPort = null;
  }

  let camStream = null;
  async function openCameraScan() {
    if (!navigator.mediaDevices?.getUserMedia) return toast('Caméra non supportée sur ce poste.');
    if (db().shop) db().shop.scannerType = 'camera';
    openModal('Scan caméra', `
      <div class="form">
        <p class="muted">Caméra active. Pour une douchette Bluetooth/USB, fermez et choisissez le type dans la liste.</p>
        <video id="camScanVid" playsinline style="width:100%;max-height:320px;border-radius:12px;background:#111"></video>
        <p class="hint" id="camScanHint">Pointez un code-barres produit ou un ticket OptiDZ…</p>
        <div class="toolbar">
          <button class="btn" type="button" onclick="OptiApp.showScannerPanel()">Choisir un appareil</button>
          <button class="btn" type="button" onclick="OptiApp.stopCameraScan();OptiApp.closeModal()">Fermer</button>
        </div>
      </div>`);
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      const vid = document.getElementById('camScanVid');
      if (vid) {
        vid.srcObject = camStream;
        await vid.play();
      }
      if ('BarcodeDetector' in window) {
        const det = new window.BarcodeDetector({ formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code', 'upc_a', 'upc_e'] });
        const loop = async () => {
          if (!camStream) return;
          try {
            const codes = await det.detect(vid);
            if (codes?.[0]?.rawValue) {
              const v = codes[0].rawValue;
              stopCameraScan();
              closeModal();
              handleScanCode(v);
              return;
            }
          } catch {}
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      } else {
        const hint = document.getElementById('camScanHint');
        if (hint) hint.textContent = 'Scan caméra limité ici. Préférez une douchette USB ou Bluetooth HID.';
      }
    } catch {
      toast('Impossible d’ouvrir la caméra.');
      closeModal();
    }
  }

  function stopCameraScan() {
    try {
      (camStream?.getTracks?.() || []).forEach((t) => t.stop());
    } catch {}
    camStream = null;
  }

  function scanTicketField() {
    const el = document.getElementById('ticketScan') || document.getElementById('bc');
    if (!el) return;
    handleScanCode(el.value);
    el.value = '';
    el.focus();
  }

  function scannerBarHtml() {
    const meta = scannerTypeMeta(currentScannerType());
    return `<div class="scan-bar card">
      <div class="scan-bar-copy">
        <strong>Scan produit ou ticket</strong>
        <small id="scannerHint">${esc(meta.hint)}</small>
      </div>
      <select id="scannerType" class="scanner-select" onchange="OptiApp.setScannerType(this.value)" title="Type d’appareil">
        ${scannerTypeOptions()}
      </select>
      <input class="search scan-target" id="ticketScan" placeholder="Scannez ici…" autofocus
        onkeydown="if(event.key==='Enter'){OptiApp.scanTicketField();event.preventDefault()}">
      <button type="button" class="btn gold sm" onclick="OptiApp.scanTicketField()">OK</button>
      <button type="button" class="btn sm" onclick="OptiApp.showScannerPanel()">Appareils</button>
      <button type="button" class="btn sm" onclick="OptiApp.openBluetoothSettings()">Bluetooth</button>
      <button type="button" class="btn sm" onclick="OptiApp.openCameraScan()">Caméra</button>
    </div>`;
  }

  function printInvoice(id) {
    const s = db().sales.find((x) => x.id === id);
    if (!s) return;
    const fac = (db().invoices || []).find((f) => f.saleId === s.id);
    const c = db().clients.find((x) => x.id === s.clientId);
    const rest = patientRest(s);
    const status = s.status === 'retour' ? 'Annulée' : rest ? 'Partiellement payée' : 'Payée';
    printDoc(fac?.id || s.id, docFrame('FACTURE', fac?.id || s.id, s.date, `<span class="pill">${status}</span>`, `
      <div class="boxes"><div class="box"><b>Facturé à</b>${esc(OptiStore.clientName(s.clientId))}<br>${esc(c?.address || 'Comptoir')}<br>${esc(c?.phone || '')}</div>
      <div class="box"><b>Paiement</b>Mode : ${esc(s.method || '—')}<br>${s.coverOrg && s.coverOrg !== 'Aucune' ? 'Organisme : ' + esc(s.coverOrg) + '<br>' : ''}Vente ${esc(s.id)}</div></div>
      <table><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">P.U.</th><th class="r">Montant</th></tr></thead><tbody>${saleLines(s)}</tbody></table>
      <div class="tot">${s.tax ? `<div><span>TVA</span><span>${money(s.tax)}</span></div>` : ''}${s.loyaltyDiscount ? `<div><span>Remise fidélité</span><span>− ${money(s.loyaltyDiscount)}</span></div>` : ''}${s.coverAmount ? `<div><span>${esc(s.coverOrg)}</span><span>${money(s.coverAmount)}</span></div>` : ''}<div><span>Payé</span><span>${money(s.paid)}</span></div><div><span>Reste à payer</span><span>${money(rest)}</span></div><div><span>Total TTC</span><span>${money(s.total)}</span></div></div>
      <p class="words">Arrêté la présente facture à la somme de : ${daWords(s.total)}.</p>
      <div class="signs"><div class="sign">Cachet et signature de l’optique</div><div class="sign">Signature du client</div></div>
    `), 'a4');
  }

  function printQuote(id) {
    const q = db().quotes.find((x) => x.id === id);
    if (!q) return;
    const c = db().clients.find((x) => x.id === q.clientId);
    printDoc(q.id, docFrame('DEVIS', q.id, q.date, `<span class="pill">${esc(q.status)}</span>`, `
      <div class="boxes"><div class="box"><b>Client</b>${esc(OptiStore.clientName(q.clientId))}<br>${esc(c?.phone || '')}<br>${esc(c?.address || '')}</div>
      <div class="box"><b>Validité</b>Devis valable 15 jours.<br>${esc(q.notes || 'Monture et verres selon essai.')}</div></div>
      <table><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">P.U.</th><th class="r">Montant</th></tr></thead>
      <tbody>${(q.items || []).map((i) => `<tr><td>${esc(i.label)}</td><td class="r">${i.q}</td><td class="r">${money(i.price)}</td><td class="r">${money(i.price * i.q)}</td></tr>`).join('')}</tbody></table>
      <div class="tot"><div><span>Total TTC</span><span>${money(q.total)}</span></div></div>
      <p class="words">Arrêté le présent devis à la somme de : ${daWords(q.total)}.</p>
      <div class="signs"><div class="sign">Cachet de l’optique</div><div class="sign">Bon pour accord client</div></div>
    `), 'a4');
  }

  function printClientStatement(id) {
    const c = db().clients.find((x) => x.id === id);
    if (!c) return;
    const sales = db().sales.filter((x) => x.clientId === id && x.status !== 'retour');
    const due = sales.reduce((a, s) => a + patientRest(s), 0);
    const rows = sales.map((s) => {
      const fac = (db().invoices || []).find((f) => f.saleId === s.id);
      return `<tr><td>${esc(fac?.id || s.id)}</td><td>${esc(s.date)}</td><td class="r">${money(s.total)}</td><td class="r">${money(s.paid)}</td><td class="r">${money(patientRest(s))}</td></tr>`;
    }).join('') || '<tr><td colspan="5">Aucune facture.</td></tr>';
    printDoc('Relevé ' + c.lastName, docFrame('RELEVÉ CLIENT', 'C-' + c.id, OptiStore.todayISO(), `<span class="pill">${c.loyalty || 0} pts fidélité</span>`, `
      <div class="boxes"><div class="box"><b>Client</b>${esc(c.firstName)} ${esc(c.lastName)}<br>${esc(c.phone)}<br>${esc(c.address || '')}</div>
      <div class="box"><b>Situation</b>${sales.length} facture(s)<br>Reste dû : <b>${money(due)}</b></div></div>
      <table><thead><tr><th>Facture</th><th>Date</th><th class="r">Total</th><th class="r">Payé</th><th class="r">Reste</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><div><span>Solde à régler</span><span>${money(due)}</span></div></div>
    `), 'a4');
  }

  function printPO(id) {
    const po = db().purchaseOrders.find((x) => x.id === id);
    if (!po) return;
    const sup = db().suppliers.find((s) => s.id === po.supplierId) || {};
    printDoc(po.id, docFrame('BON DE COMMANDE', po.id, po.date, `<span class="pill">${esc(po.status)}</span>`, `
      <div class="boxes"><div class="box"><b>Fournisseur</b>${esc(sup.name || '')}<br>${esc(sup.contact || '')}<br>${esc(sup.phone || '')}<br>${esc(sup.address || '')}</div>
      <div class="box"><b>Livraison</b>${esc(db().shop.address || '')}<br>${esc(db().shop.phone || '')}<br>${esc(po.notes || '')}</div></div>
      <table><thead><tr><th>Réf / produit</th><th class="r">Qté</th><th class="r">P.A.</th><th class="r">Montant</th></tr></thead>
      <tbody>${(po.items || []).map((i) => { const p = db().products.find((x) => x.id === i.productId); return `<tr><td>${esc(i.label || p?.brand || '')}${p ? '<div class="muted">' + esc(p.ref) + '</div>' : ''}</td><td class="r">${i.q}</td><td class="r">${money(i.buy)}</td><td class="r">${money(i.buy * i.q)}</td></tr>`; }).join('')}</tbody></table>
      <div class="tot"><div><span>Total HT estimé</span><span>${money(po.total)}</span></div></div>
      <div class="signs"><div class="sign">Visa magasin</div><div class="sign">Visa fournisseur</div></div>
    `), 'a4');
  }

  function patientRest(s) {
    return Math.max(0, (s.total || 0) - (s.coverAmount || 0) - (s.paid || 0));
  }

  function cashBanner() {
    const c = OptiStore.openCashSession();
    if (c) {
      return `<div class="alert-bar ok"><strong>Caisse ouverte</strong> · fond ${money(c.openingFloat)} · ${esc(c.openedAt)}
        <button class="btn sm" onclick="OptiApp.closeCash()">Clôturer</button></div>`;
    }
    return `<div class="alert-bar warn"><strong>Caisse non ouverte</strong> — ouvrez-la avant d’encaisser.
      <button class="btn sm gold" onclick="OptiApp.openCash()">Ouvrir la caisse</button></div>`;
  }

  function openCash() {
    openModal('Ouverture de caisse', `<form class="form" onsubmit="OptiApp.saveOpenCash(event)">
      <p class="muted">Saisissez le fond de caisse (espèces) au début de la journée.</p>
      <div class="field"><label>Fond de caisse DA</label><input id="cashFloat" type="number" min="0" value="0" required></div>
      <button class="btn gold">Ouvrir</button></form>`);
  }

  async function saveOpenCash(e) {
    e.preventDefault();
    if (OptiStore.openCashSession()) return toast('Une caisse est déjà ouverte.');
    db().cashSessions.push({
      id: OptiStore.uid('cs'),
      date: OptiStore.todayISO(),
      openedAt: new Date().toLocaleString('fr-DZ'),
      closedAt: '',
      openingFloat: +cashFloat.value || 0,
      expected: +cashFloat.value || 0,
      counted: 0,
      difference: 0,
      salesCash: 0, salesCIB: 0, salesEdahabia: 0, salesOther: 0,
      userId: db().session?.id,
      status: 'open',
      notes: ''
    });
    await OptiStore.save('Ouverture caisse');
    closeModal();
    toast('Caisse ouverte');
    if (A().renderCaisseJour && String(location.hash).includes('caisse')) A().renderCaisseJour();
    else A().renderSales();
  }

  function closeCash() {
    const c = OptiStore.openCashSession();
    if (!c) return toast('Aucune caisse ouverte.');
    const expected = c.openingFloat + c.salesCash;
    openModal('Clôture de caisse', `<form class="form" onsubmit="OptiApp.saveCloseCash(event)">
      <p>Espèces théoriques : <b>${money(expected)}</b></p>
      <p class="muted">CIB ${money(c.salesCIB)} · Edahabia ${money(c.salesEdahabia)} · Autres ${money(c.salesOther)}</p>
      <div class="field"><label>Espèces comptées DA</label><input id="cashCounted" type="number" value="${Math.round(expected)}" required></div>
      <div class="field"><label>Notes</label><textarea id="cashNotes"></textarea></div>
      <button class="btn gold">Clôturer</button></form>`);
  }

  async function saveCloseCash(e) {
    e.preventDefault();
    const c = OptiStore.openCashSession();
    if (!c) return;
    c.counted = +cashCounted.value || 0;
    c.expected = c.openingFloat + c.salesCash;
    c.difference = c.counted - c.expected;
    c.notes = cashNotes.value;
    c.closedAt = new Date().toLocaleString('fr-DZ');
    c.status = 'closed';
    await OptiStore.save('Clôture caisse');
    closeModal();
    toast(c.difference ? ('Écart : ' + money(c.difference)) : 'Caisse clôturée sans écart');
    A().renderCaisseJour ? A().renderCaisseJour() : A().renderSales();
  }

  function addToCash(amount, method) {
    const c = OptiStore.openCashSession();
    if (!c) return;
    const m = (method || '').toLowerCase();
    if (m.includes('espèce')) c.salesCash += amount;
    else if (m.includes('cib')) c.salesCIB += amount;
    else if (m.includes('edahabia') || m.includes('dahabia')) c.salesEdahabia += amount;
    else c.salesOther += amount;
  }

  function payRemain(id) {
    const s = db().sales.find((x) => x.id === id);
    if (!s) return;
    const rest = patientRest(s);
    if (!rest) return toast('Déjà soldée.');
    openModal('Encaisser le solde — ' + s.id, `<form class="form" onsubmit="OptiApp.savePayRemain(event,'${s.id}')">
      <p>Reste : <b>${money(rest)}</b> · Client ${esc(OptiStore.clientName(s.clientId))}</p>
      <div class="field"><label>Montant DA</label><input id="prAmt" type="number" min="1" max="${rest}" value="${Math.round(rest)}" required></div>
      <div class="field"><label>Mode</label><select id="prMode">${db().shop.paymentMethods.map((m) => `<option>${esc(m)}</option>`).join('')}</select></div>
      <button class="btn gold">Encaisser</button></form>`);
  }

  async function savePayRemain(e, id) {
    e.preventDefault();
    const s = db().sales.find((x) => x.id === id);
    const rest = patientRest(s);
    const amt = Math.min(rest, Math.max(0, +prAmt.value || 0));
    if (!amt) return toast('Montant invalide.');
    s.paid += amt;
    s.payments = s.payments || [];
    s.payments.push({ date: OptiStore.todayISO(), amount: amt, method: prMode.value });
    s.method = prMode.value;
    s.status = patientRest(s) <= 0 ? 'payée' : 'partielle';
    const fac = (db().invoices || []).find((f) => f.saleId === s.id);
    if (fac) { fac.paid = s.paid; fac.status = s.status === 'payée' ? 'Payée' : 'Partiellement payée'; }
    if (s.clientId) {
      const c = db().clients.find((x) => x.id === s.clientId);
      const pts = OptiStore.earnPoints(amt);
      if (c && pts) { c.loyalty = (c.loyalty || 0) + pts; db().loyaltyLog.push({ date: OptiStore.todayISO(), clientId: c.id, pts, reason: 'Solde ' + s.id, saleId: s.id }); }
    }
    addToCash(amt, prMode.value);
    await OptiStore.save('Solde ' + s.id);
    closeModal();
    toast('Paiement enregistré');
    A().renderSales();
  }

  function startReturn(id) {
    const s = db().sales.find((x) => x.id === id);
    if (!s || s.status === 'retour') return toast('Retour déjà fait.');
    openModal('Retour / échange — ' + s.id, `<form class="form" onsubmit="OptiApp.saveReturn(event,'${s.id}')">
      <div class="field"><label>Type</label><select id="retType">
        <option value="retour">Retour (remboursement + stock)</option>
        <option value="avoir">Avoir (crédit client, stock)</option>
        <option value="echange">Échange (stock + nouvel article)</option>
      </select></div>
      <div class="field"><label>Remboursement DA</label><input id="retAmt" type="number" value="${Math.round(s.paid)}"></div>
      <div class="field"><label>Produit d’échange</label><select id="retEx"><option value="0">—</option>${db().products.map((p) => `<option value="${p.id}">${esc(p.ref)} ${esc(p.brand)} (${p.qty})</option>`).join('')}</select></div>
      <div class="field"><label>Note</label><textarea id="retNote"></textarea></div>
      <button class="btn gold">Valider</button></form>`);
  }

  async function saveReturn(e, id) {
    e.preventDefault();
    const s = db().sales.find((x) => x.id === id);
    const type = retType.value;
    (s.items || []).forEach((i) => {
      const p = db().products.find((x) => x.id === i.productId);
      if (p) {
        p.qty += i.q;
        db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type: 'Retour', qty: i.q, motif: type, storeId: db().currentStore });
      }
    });
    const refund = +retAmt.value || 0;
    if (type === 'echange' && +retEx.value) {
      const np = db().products.find((x) => x.id == retEx.value);
      if (np && np.qty > 0) {
        np.qty -= 1;
        db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: np.id, type: 'Sortie', qty: -1, motif: 'Échange ' + s.id, storeId: db().currentStore });
      }
    }
    if (type === 'avoir' && s.clientId) {
      const c = db().clients.find((x) => x.id === s.clientId);
      if (c) c.loyalty = (c.loyalty || 0) + Math.round(refund / 100);
    }
    s.status = 'retour';
    db().returns.push({ id: OptiStore.uid('rt'), saleId: id, date: OptiStore.todayISO(), type, refund, note: retNote.value, restock: true });
    await OptiStore.save('Retour ' + id);
    closeModal();
    toast(type === 'avoir' ? 'Avoir enregistré' : 'Retour enregistré');
    A().renderSales();
  }

  function renderQuotes() {
    const rows = db().quotes.slice().reverse();
    shell('quotes', `
      <h1 class="h1">Devis</h1><div class="sub">Proposition → acceptation → commande ou vente.</div>
      <div class="toolbar"><button class="btn gold" onclick="OptiApp.editQuote()">+ Devis</button></div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Total</th><th>Statut</th><th></th></tr></thead>
      <tbody>${rows.map((q) => `<tr><td>${q.id}</td><td>${esc(q.date)}</td><td>${esc(OptiStore.clientName(q.clientId))}</td><td>${money(q.total)}</td>
        <td><span class="badge ${q.status === 'converti' ? 'ok' : q.status === 'refusé' ? 'bad' : 'warn'}">${esc(q.status)}</span></td>
        <td>
          <button class="btn sm" onclick="OptiApp.printQuote('${q.id}')">PDF</button>
          ${q.status === 'converti' ? '' : `<button class="btn sm" onclick="OptiApp.convertQuote('${q.id}','order')">Commande</button>
          <button class="btn sm gold" onclick="OptiApp.convertQuote('${q.id}','sale')">Vente</button>
          <button class="btn sm" onclick="OptiApp.setQuoteStatus('${q.id}','refusé')">Refuser</button>`}
        </td></tr>`).join('') || '<tr><td colspan="6" class="muted">Aucun devis.</td></tr>'}</tbody></table></div>`);
  }

  function editQuote() {
    openModal('Nouveau devis', `<form class="form" onsubmit="OptiApp.saveQuote(event)">
      <div class="field"><label>Client</label><select id="qClient">${db().clients.map((c) => `<option value="${c.id}">${esc(c.firstName)} ${esc(c.lastName)}</option>`).join('')}</select></div>
      <div class="field"><label>Lignes (une par ligne : réf ou nom, quantité, prix)</label>
        <textarea id="qLines" placeholder="FR-002, 1, 12000"></textarea></div>
      <div class="field"><label>Notes</label><textarea id="qNotes"></textarea></div>
      <button class="btn gold">Enregistrer</button></form>`);
  }

  async function saveQuote(e) {
    e.preventDefault();
    const items = qLines.value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [a, b, c] = line.split(',').map((x) => x.trim());
      const p = db().products.find((x) => x.ref === a || (x.brand + ' ' + (x.model || '')).toLowerCase() === a.toLowerCase());
      const q = +(b || 1) || 1;
      const price = +(c || p?.sell || 0);
      return { productId: p?.id || 0, q, price, label: p ? p.brand + ' ' + (p.model || p.ref) : a };
    });
    if (!items.length) return toast('Ajoutez au moins une ligne.');
    const total = items.reduce((n, i) => n + i.price * i.q, 0);
    const id = 'DEV-' + String(db().quotes.length + 1).padStart(3, '0');
    db().quotes.push({ id, date: OptiStore.todayISO(), clientId: +qClient.value, items, total, status: 'envoyé', orderId: '', saleId: '', notes: qNotes.value });
    await OptiStore.save('Devis ' + id);
    closeModal();
    toast('Devis créé');
    renderQuotes();
  }

  async function setQuoteStatus(id, status) {
    const q = db().quotes.find((x) => x.id === id);
    if (!q) return;
    q.status = status;
    await OptiStore.save('Devis ' + id);
    renderQuotes();
  }

  async function convertQuote(id, to) {
    const q = db().quotes.find((x) => x.id === id);
    if (!q || q.status === 'converti') return;
    if (to === 'order') {
      const oid = 'CMD-' + String(db().orders.length + 1).padStart(3, '0');
      db().orders.push({
        id: oid, kind: 'lunettes', clientId: q.clientId, supplierId: db().suppliers[0]?.id || 0,
        product: q.items.map((i) => i.label + ' ×' + i.q).join(', '), total: q.total, advance: 0, remain: q.total,
        due: OptiStore.addMonths(OptiStore.todayISO(), 0), status: 'Nouvelle', storeId: db().currentStore, notes: 'Depuis ' + q.id, quoteId: q.id
      });
      q.orderId = oid;
      q.status = 'converti';
      await OptiStore.save('Devis → commande');
      toast('Commande ' + oid + ' créée');
      go('#/app/orders');
      return;
    }
    db().pendingClientId = q.clientId;
    db().cart = q.items.filter((i) => i.productId).map((i) => ({ productId: i.productId, q: i.q, price: i.price, discount: 0 }));
    q.status = 'converti';
    await OptiStore.save('Devis → caisse');
    toast('Lignes envoyées en caisse — choisissez le client et encaissez');
    go('#/app/sales');
  }

  function renderPurchases() {
    const rows = db().purchaseOrders.slice().reverse();
    shell('purchases', `
      <h1 class="h1">Achats fournisseurs</h1><div class="sub">Bon de commande, réception, mise à jour du stock.</div>
      <div class="toolbar"><button class="btn gold" onclick="OptiApp.editPO()">+ Bon de commande</button></div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>N°</th><th>Date</th><th>Fournisseur</th><th>Total</th><th>Statut</th><th></th></tr></thead>
      <tbody>${rows.map((p) => `<tr><td>${p.id}</td><td>${esc(p.date)}</td><td>${esc(db().suppliers.find((s) => s.id === p.supplierId)?.name || '')}</td><td>${money(p.total)}</td>
        <td><span class="badge ${p.status === 'reçue' ? 'ok' : 'warn'}">${esc(p.status)}</span></td>
        <td>
          <button class="btn sm" onclick="OptiApp.printPO('${p.id}')">PDF</button>
          ${p.status === 'reçue' ? '' : `<button class="btn sm gold" onclick="OptiApp.receivePO('${p.id}')">Réceptionner</button>`}
        </td></tr>`).join('') || '<tr><td colspan="6" class="muted">Aucun bon.</td></tr>'}</tbody></table></div>`);
  }

  function editPO() {
    openModal('Bon de commande', `<form class="form" onsubmit="OptiApp.savePO(event)">
      <div class="field"><label>Fournisseur</label><select id="poSup">${db().suppliers.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Lignes (réf, quantité, prix d’achat)</label><textarea id="poLines" placeholder="VL-002, 6, 7600"></textarea></div>
      <div class="field"><label>Notes</label><textarea id="poNotes"></textarea></div>
      <button class="btn gold">Créer</button></form>`);
  }

  async function savePO(e) {
    e.preventDefault();
    const items = poLines.value.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const [a, b, c] = line.split(',').map((x) => x.trim());
      const p = db().products.find((x) => x.ref === a);
      return { productId: p?.id || 0, q: +(b || 1), buy: +(c || p?.buy || 0), received: 0, label: p ? p.brand : a };
    });
    if (!items.length) return toast('Ajoutez des lignes.');
    const total = items.reduce((n, i) => n + i.buy * i.q, 0);
    const id = 'BC-' + String(db().purchaseOrders.length + 1).padStart(3, '0');
    db().purchaseOrders.push({ id, date: OptiStore.todayISO(), supplierId: +poSup.value, items, status: 'envoyée', total, notes: poNotes.value });
    const sup = db().suppliers.find((s) => s.id == poSup.value);
    if (sup) sup.debt = (sup.debt || 0) + total;
    await OptiStore.save('Bon ' + id);
    closeModal();
    renderPurchases();
  }

  async function receivePO(id) {
    const po = db().purchaseOrders.find((x) => x.id === id);
    if (!po || po.status === 'reçue') return;
    po.items.forEach((i) => {
      const p = db().products.find((x) => x.id === i.productId);
      if (!p) return;
      const q = i.q - (i.received || 0);
      p.qty += q;
      i.received = i.q;
      db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type: 'Entrée', qty: q, motif: 'Réception ' + po.id, storeId: p.storeId });
    });
    po.status = 'reçue';
    const sup = db().suppliers.find((s) => s.id === po.supplierId);
    if (sup) { sup.purchases = (sup.purchases || 0) + po.total; }
    await OptiStore.save('Réception ' + id);
    toast('Stock mis à jour');
    renderPurchases();
  }

  function renderInventory() {
    const lines = db().products.map((p) => `<tr>
      <td>${esc(p.ref)}</td><td>${esc(p.brand)} ${esc(p.model || '')}</td>
      <td>${p.qty}</td>
      <td><input class="inv-c" data-id="${p.id}" type="number" value="${p.qty}" style="width:90px"></td>
    </tr>`).join('');
    shell('stock', `
      <h1 class="h1">Inventaire physique</h1><div class="sub">Comptez le rayon, comparez, validez les écarts.</div>
      <div class="toolbar"><button class="btn" onclick="OptiApp.go('#/app/stock')">Retour stock</button>
        <button class="btn gold" onclick="OptiApp.saveInventory()">Valider l’inventaire</button></div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>Réf</th><th>Produit</th><th>Logiciel</th><th>Compté</th></tr></thead><tbody>${lines}</tbody></table></div>`);
  }

  async function saveInventory() {
    const diffs = [];
    document.querySelectorAll('.inv-c').forEach((el) => {
      const p = db().products.find((x) => x.id == el.dataset.id);
      const counted = +el.value;
      const diff = counted - p.qty;
      if (diff) diffs.push({ productId: p.id, expected: p.qty, counted, diff });
      p.qty = counted;
      if (diff) db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type: 'Inventaire', qty: diff, motif: 'Écart inventaire', storeId: p.storeId });
    });
    db().inventories.push({ id: OptiStore.uid('inv'), date: OptiStore.todayISO(), userId: db().session?.id, lines: diffs, status: 'validé' });
    await OptiStore.save('Inventaire');
    toast(diffs.length ? diffs.length + ' écart(s) enregistré(s)' : 'Aucun écart');
    go('#/app/stock');
  }

  function renderLabels() {
    shell('products', `
      <h1 class="h1">Étiquettes codes-barres</h1><div class="sub">Cochez les produits, imprimez les collants rayon.</div>
      <div class="toolbar"><button class="btn" onclick="OptiApp.go('#/app/products')">Retour produits</button>
        <button class="btn gold" onclick="OptiApp.printLabels()">Imprimer la sélection</button></div>
      <div class="card">${db().products.map((p) => `<label class="hint" style="display:block;padding:6px 0"><input type="checkbox" class="lab-p" value="${p.id}" checked> ${esc(p.ref)} — ${esc(p.brand)} ${esc(p.model || '')} · ${money(p.sell)}</label>`).join('')}</div>`);
  }

  function printLabels() {
    const ids = [...document.querySelectorAll('.lab-p:checked')].map((x) => +x.value);
    const items = db().products.filter((p) => ids.includes(p.id));
    if (!items.length) return toast('Cochez au moins un produit.');
    const w = window.open('', '_blank');
    const cards = items.map((p, i) => `<div class="lab"><svg id="b${i}"></svg><div><b>${esc(p.brand)}</b><br>${esc(p.ref)} · ${money(p.sell)}</div></div>`).join('');
    w.document.write(`<html><head><title>Étiquettes</title>
      <style>.sheet{display:flex;flex-wrap:wrap;gap:8px}.lab{width:180px;border:1px solid #ccc;padding:8px;text-align:center;font-family:sans-serif;font-size:12px}@media print{@page{margin:8mm}}</style>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script></head>
      <body><div class="sheet">${cards}</div>
      <script>
        const items = ${JSON.stringify(items.map((p) => p.barcode || p.ref))};
        items.forEach((c,i)=>{ try { JsBarcode('#b'+i, String(c||'0000'), {format:'CODE128',width:1.2,height:36,displayValue:true,fontSize:10}); } catch(e) {} });
        print();
      <\/script></body></html>`);
    w.document.close();
  }

  function fold(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
  }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function scoreHay(hay, q) {
    const h = fold(hay);
    const needle = fold(q);
    if (!needle) return 0;
    if (h === needle) return 100;
    if (h.startsWith(needle)) return 80;
    const toks = needle.split(/\s+/).filter(Boolean);
    let s = 0;
    for (const t of toks) {
      if (!t) continue;
      const i = h.indexOf(t);
      if (i === 0) s += 28;
      else if (i > 0) s += 16;
      else {
        let p = 0;
        for (const ch of h) { if (ch === t[p]) p++; }
        if (p === t.length && t.length > 2) s += 6;
        else return 0;
      }
    }
    return s;
  }
  function hl(text, q) {
    const raw = String(text || '');
    const needle = fold(q).split(/\s+/).filter((t) => t.length > 1)[0];
    if (!needle) return esc(raw);
    const h = fold(raw);
    const i = h.indexOf(needle);
    if (i < 0) return esc(raw);
    return esc(raw.slice(0, i)) + '<mark>' + esc(raw.slice(i, i + needle.length)) + '</mark>' + esc(raw.slice(i + needle.length));
  }

  let omniSel = 0;
  let omniHits = [];
  function omniClose() {
    document.getElementById('omniList')?.classList.add('hide');
    document.getElementById('omniWrap')?.classList.remove('focus', 'open');
  }
  function omniFocus() {
    document.getElementById('omniWrap')?.classList.add('focus');
    globalSearch(document.getElementById('omni')?.value || '');
  }
  function omniKey(e) {
    const box = document.getElementById('omniList');
    const items = box ? [...box.querySelectorAll('.omni-hit')] : [];
    if (e.key === 'Escape') { e.preventDefault(); omniClose(); e.target.blur(); return; }
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); omniSel = (omniSel + 1) % items.length; paintSel(items); }
    if (e.key === 'ArrowUp') { e.preventDefault(); omniSel = (omniSel - 1 + items.length) % items.length; paintSel(items); }
    if (e.key === 'Enter') { e.preventDefault(); items[omniSel]?.click(); }
  }
  function paintSel(items) {
    items.forEach((el, i) => el.classList.toggle('on', i === omniSel));
    items[omniSel]?.scrollIntoView({ block: 'nearest' });
  }
  function omniGo(i) {
    const hit = omniHits[Number(i)];
    omniClose();
    if (!hit) return;
    if (typeof hit.act === 'function') hit.act();
    else if (hit.h) go(hit.h);
  }
  function paintOmni(list, raw) {
    const box = document.getElementById('omniList');
    if (!box) return;
    omniHits = list;
    omniSel = 0;
    box.classList.remove('hide');
    if (!list.length) {
      box.innerHTML = `<div class="omni-empty">Aucun résultat pour « ${esc(raw)} »<small>Essayez un prénom, un téléphone, une réf, « caisse » ou « impayé ».</small></div>`;
      return;
    }
    box.innerHTML = list.map((h, i) => h.t === 'Astuce'
      ? `<div class="omni-empty"><b>${esc(h.l)}</b><small>${esc(h.sub || '')}</small></div>`
      : `<button type="button" class="omni-hit${i === 0 && list[0].t !== 'Astuce' ? ' on' : ''}${list[0].t === 'Astuce' && i === 1 ? ' on' : ''}" onclick="OptiApp.omniGo(${i})">
      <span class="badge goldb">${esc(h.t)}</span>
      <span class="omni-txt"><b>${raw ? hl(h.l, raw) : esc(h.l)}</b><small>${esc(h.sub || '')}</small></span>
    </button>`).join('');
  }

  function globalSearch(q) {
    const box = document.getElementById('omniList');
    const wrap = document.getElementById('omniWrap');
    if (!box) return;
    const raw = (q || '').trim();
    const qd = digits(raw);
    wrap?.classList.add('open', 'focus');
    const hits = [];
    const add = (hit) => { if (hit && hit.s >= 6) hits.push(hit); };

    const pages = [
      ['Tableau de bord', '#/app/dashboard', 'accueil dash synthese'],
      ['Vente comptoir', '#/app/atelier', 'vente comptoir operation atelier livrer recu vision'],
      ['Caisse', '#/app/sales', 'caisse pos vente encaisser ticket'],
      ['Clôture caisse', '#/app/caisse', 'cloturer caisse fond ecart journee'],
      ['Tables', '#/app/tables', 'tables marques matieres indices prescripteur'],
      ['Clients', '#/app/clients', 'client fiche patient'],
      ['Dossiers', '#/app/rx', 'ordonnance prescription dossier optique'],
      ['Produits', '#/app/products', 'produit monture verre lentille catalogue'],
      ['Stock', '#/app/stock', 'stock rayon inventaire rupture'],
      ['Devis', '#/app/quotes', 'devis proposition'],
      ['Commandes', '#/app/orders', 'commande lunettes pret'],
      ['Achats', '#/app/purchases', 'achat bon commande fournisseur'],
      ['Fournisseurs', '#/app/suppliers', 'fournisseur essilor'],
      ['Agenda', '#/app/rdv', 'rdv rendez vous agenda'],
      ['Finances', '#/app/finance', 'finance depense tresorerie'],
      ['Factures / rapports', '#/app/reports', 'facture rapport pdf'],
      ['Paramètres', '#/app/settings', 'parametre boutique']
    ];

    if (!raw) {
      const low = db().products.filter((p) => p.qty <= p.min).length;
      const unpaid = db().sales.filter((s) => s.status !== 'retour' && (s.paid + (s.coverAmount || 0)) < s.total).length;
      paintOmni([
        { t: 'Astuce', l: 'Nom, téléphone, réf, facture…', sub: 'Ex. amine · 0555 · FR-001 · caisse · impayé', h: '' },
        { t: 'Page', l: 'Caisse', sub: 'Ouvrir la vente', h: '#/app/sales' },
        { t: 'Page', l: 'Dossiers', sub: 'Ordonnances', h: '#/app/rx' },
        { t: 'Page', l: 'Stock', sub: low ? low + ' article(s) à réassort' : 'Rayon et inventaire', h: '#/app/stock' },
        { t: 'Page', l: 'Clients', sub: 'Fiches et fidélité', h: '#/app/clients' },
        unpaid ? { t: 'Impayé', l: unpaid + ' vente(s) en reste', sub: 'Voir la caisse', h: '#/app/sales' } : { t: 'Page', l: 'Agenda', sub: 'Rendez-vous du jour', h: '#/app/rdv' }
      ].filter(Boolean), '');
      return;
    }

    pages.forEach(([l, h, k]) => add({ t: 'Page', l, sub: 'Aller à l’écran', h, s: Math.max(scoreHay(l, raw), scoreHay(k, raw)) + (fold(l) === fold(raw) ? 20 : 0) }));

    if (raw.length < 2 && qd.length < 4) {
      hits.sort((a, b) => b.s - a.s);
      paintOmni(hits.slice(0, 8), raw);
      return;
    }

    if (/impay|reste|solde|credit/i.test(raw)) {
      db().sales.filter((s) => s.status !== 'retour' && (s.paid + (s.coverAmount || 0)) < s.total).forEach((s) => {
        hits.push({ t: 'Impayé', l: s.id + ' · ' + OptiStore.clientName(s.clientId), sub: money((s.total || 0) - (s.coverAmount || 0) - s.paid) + ' restants', h: '#/app/sales', s: 92 });
      });
    }
    if (/rupture|faible|reassort|alerte/i.test(raw) || /^stock$/i.test(raw)) {
      db().products.filter((p) => p.qty <= p.min).forEach((p) => {
        hits.push({ t: 'Stock', l: p.ref + ' · ' + p.brand, sub: 'Qté ' + p.qty + ' / min ' + p.min, h: '#/app/stock', act: () => A().editProduct(p.id), s: 90 });
      });
    }
    if (/pret|prête|prêtes|livr/i.test(raw)) {
      db().orders.filter((o) => /prêt/i.test(o.status || '')).forEach((o) => {
        hits.push({ t: 'Commande', l: o.id + ' · ' + (o.product || ''), sub: o.status + ' · ' + OptiStore.clientName(o.clientId), h: '#/app/orders', s: 90 });
      });
    }

    db().clients.forEach((c) => {
      const hay = [c.firstName, c.lastName, c.phone, c.email, c.address, 'C-' + c.id].join(' ');
      let s = scoreHay(hay, raw);
      if (qd.length >= 4 && digits(c.phone).includes(qd)) s = Math.max(s, 72);
      add({ t: 'Client', l: c.firstName + ' ' + c.lastName, sub: c.phone + (c.loyalty ? ' · ' + c.loyalty + ' pts' : ''), h: '#/app/clients', act: () => A().viewClient(c.id), s });
    });
    db().products.forEach((p) => {
      const hay = [p.brand, p.model, p.ref, p.barcode, p.color, p.type, p.location].join(' ');
      let s = scoreHay(hay, raw);
      if (qd.length >= 4 && digits(p.barcode).includes(qd)) s = Math.max(s, 75);
      add({ t: 'Produit', l: (p.ref || '') + ' ' + p.brand + ' ' + (p.model || ''), sub: money(p.sell) + ' · stock ' + p.qty, h: '#/app/products', act: () => A().editProduct(p.id), s });
    });
    (db().prescriptions || []).forEach((r) => {
      const name = OptiStore.clientName(r.clientId);
      add({ t: 'Dossier', l: name + ' · ' + (r.date || ''), sub: (r.type || 'Ordonnance') + (r.doctor ? ' · ' + r.doctor : ''), h: '#/app/rx', s: scoreHay(name + ' ' + r.doctor + ' ' + r.type + ' ordonnance dossier', raw) });
    });
    db().sales.forEach((s) => {
      const inv = (db().invoices || []).find((f) => f.saleId === s.id);
      const hay = [s.id, OptiStore.clientName(s.clientId), s.method, inv?.id].join(' ');
      add({ t: 'Vente', l: s.id + ' · ' + OptiStore.clientName(s.clientId), sub: money(s.total) + ' · ' + (s.status || ''), h: '#/app/sales', s: scoreHay(hay, raw) });
    });
    (db().invoices || []).forEach((f) => {
      add({ t: 'Facture', l: f.id, sub: (f.date || '') + ' · ' + money(f.total) + ' · ' + (f.status || ''), h: '#/app/sales', act: f.saleId ? () => A().printInvoice(f.saleId) : null, s: scoreHay(f.id + ' facture ' + OptiStore.clientName(f.clientId), raw) });
    });
    db().orders.forEach((o) => {
      add({ t: 'Commande', l: o.id + ' · ' + (o.product || ''), sub: o.status + ' · reste ' + money(o.remain), h: '#/app/orders', s: scoreHay(o.id + ' ' + o.product + ' ' + OptiStore.clientName(o.clientId) + ' ' + o.status, raw) });
    });
    (db().quotes || []).forEach((x) => {
      add({ t: 'Devis', l: x.id, sub: OptiStore.clientName(x.clientId) + ' · ' + money(x.total), h: '#/app/quotes', s: scoreHay(x.id + ' devis ' + OptiStore.clientName(x.clientId), raw) });
    });
    (db().suppliers || []).forEach((s) => {
      add({ t: 'Fournisseur', l: s.name, sub: (s.contact || '') + ' · dette ' + money(s.debt), h: '#/app/suppliers', act: () => A().viewSupplier(s.id), s: scoreHay(s.name + ' ' + s.contact + ' ' + s.phone, raw) });
    });
    (db().appointments || []).forEach((a) => {
      add({ t: 'RDV', l: (a.time || '') + ' · ' + OptiStore.clientName(a.clientId), sub: (a.date || '') + ' · ' + (a.reason || ''), h: '#/app/rdv', s: scoreHay((a.reason || '') + ' rdv ' + OptiStore.clientName(a.clientId) + ' ' + a.date, raw) });
    });

    hits.sort((a, b) => b.s - a.s);
    paintOmni(hits.slice(0, 10), raw);
  }

  function waClient(id, kind) {
    const c = db().clients.find((x) => x.id === id);
    if (!c?.phone) return toast('Pas de téléphone.');
    let msg = 'Bonjour ' + c.firstName + ', Optique ' + (db().shop.name || '') + '.';
    if (kind === 'ready') msg = 'Bonjour ' + c.firstName + ', vos lunettes sont prêtes. Vous pouvez passer les récupérer. — ' + db().shop.name;
    else if (kind === 'rdv') msg = 'Rappel rendez-vous à ' + db().shop.name + '. Répondez pour confirmer.';
    window.open(OptiStore.waLink(c.phone, msg), '_blank');
  }

  function waOrder(id) {
    const o = db().orders.find((x) => x.id === id);
    const c = db().clients.find((x) => x.id === o?.clientId);
    if (!c?.phone) return toast('Pas de téléphone client.');
    const msg = 'Bonjour ' + c.firstName + ', votre commande ' + o.id + ' est ' + o.status.toLowerCase() + (o.status === 'Prête' ? '. Vous pouvez passer les récupérer.' : '.') + ' Reste : ' + money(o.remain) + '. — ' + db().shop.name;
    window.open(OptiStore.waLink(c.phone, msg), '_blank');
  }

  function redeemLoyalty(id) {
    const c = db().clients.find((x) => x.id === id);
    const max = OptiStore.redeemValue(c.loyalty || 0);
    openModal('Utiliser les points', `<form class="form" onsubmit="OptiApp.saveRedeem(event,${id})">
      <p>${esc(c.firstName)} a <b>${c.loyalty || 0} pts</b> soit jusqu’à <b>${money(max)}</b> de remise.</p>
      <div class="field"><label>Points à utiliser (par 100)</label><input id="rdPts" type="number" min="100" step="100" max="${c.loyalty || 0}" value="${Math.min(c.loyalty || 0, 100)}"></div>
      <button class="btn gold" ${max ? '' : 'disabled'}>Créer la remise</button></form>`);
  }

  async function saveRedeem(e, id) {
    e.preventDefault();
    const c = db().clients.find((x) => x.id === id);
    const pts = Math.min(c.loyalty || 0, Math.floor((+rdPts.value || 0) / 100) * 100);
    const da = OptiStore.redeemValue(pts);
    if (!da) return toast('Minimum 100 points.');
    c.loyalty -= pts;
    db().loyaltyLog.push({ date: OptiStore.todayISO(), clientId: id, pts: -pts, reason: 'Remise ' + da + ' DA', saleId: '' });
    db().pendingDiscount = (db().pendingDiscount || 0) + da;
    await OptiStore.save('Fidélité');
    closeModal();
    toast('Remise fidélité ' + money(da) + ' à appliquer en caisse');
    go('#/app/sales');
  }

  async function forceBackup() {
    const ok = await OptiStore.maybeBackup(true);
    toast(ok ? 'Sauvegarde enregistrée' : 'Sauvegarde impossible');
  }

  async function reorderLow() {
    const lows = db().products.filter((p) => p.qty <= p.min);
    if (!lows.length) return toast('Aucun produit sous le seuil.');
    const supId = db().suppliers[0]?.id;
    if (!supId) return toast('Ajoutez un fournisseur.');
    const items = lows.map((p) => ({ productId: p.id, q: Math.max(p.min * 2 - p.qty, 1), buy: p.buy, received: 0, label: p.brand + ' ' + (p.model || p.ref) }));
    const total = items.reduce((n, i) => n + i.buy * i.q, 0);
    const id = 'BC-' + String(db().purchaseOrders.length + 1).padStart(3, '0');
    db().purchaseOrders.push({ id, date: OptiStore.todayISO(), supplierId: supId, items, status: 'envoyée', total, notes: 'Réassort automatique stock faible' });
    const sup = db().suppliers.find((s) => s.id === supId);
    if (sup) sup.debt = (sup.debt || 0) + total;
    await OptiStore.save('Réassort ' + id);
    toast('Bon ' + id + ' créé pour ' + items.length + ' références');
    go('#/app/purchases');
  }

  function viewSupplier(id) {
    const s = db().suppliers.find((x) => x.id === id);
    if (!s) return;
    const pos = (db().purchaseOrders || []).filter((p) => p.supplierId === id);
    const linked = db().products.filter((p) => p.supplierId == id);
    const pays = s.payments || [];
    openModal(s.name, `
      <div class="grid2">
        <div class="card"><strong>Fiche</strong><p class="muted">${esc(s.contact)}<br>${esc(s.phone)}<br>${esc(s.email || '')}<br>${esc(s.address || '')}</p>
          <p>Achats ${money(s.purchases)} · Dette <b>${money(s.debt)}</b></p>
          <button class="btn sm" onclick="OptiApp.editSupplier(${id})">Modifier</button>
          ${s.phone ? `<button class="btn sm" onclick="OptiApp.waSupplier(${id})">WhatsApp</button>` : ''}
          <button class="btn sm gold" onclick="OptiApp.paySupplier(${id})">Payer une dette</button>
        </div>
        <div class="card"><strong>Catalogue lié</strong>${linked.map((p) => `<div class="alert">${esc(p.ref)} · ${esc(p.brand)} · stock ${p.qty}</div>`).join('') || '<p class="muted">Aucun produit rattaché. Indiquez le fournisseur sur la fiche produit.</p>'}</div>
      </div>
      <div class="card" style="margin-top:12px"><strong>Bons de commande</strong>
        ${pos.map((p) => `<div class="alert">${p.id} · ${p.date} · ${money(p.total)} · ${esc(p.status)}
          <button class="btn sm" onclick="OptiApp.printPO('${p.id}')">PDF</button></div>`).join('') || '<p class="muted">Aucun bon.</p>'}
      </div>
      <div class="card" style="margin-top:12px"><strong>Règlements</strong>
        ${pays.slice().reverse().map((p) => `<div class="alert">${esc(p.date)} · ${money(p.amount)} · ${esc(p.method)}</div>`).join('') || '<p class="muted">Aucun règlement.</p>'}
      </div>`);
  }

  function paySupplier(id) {
    const s = db().suppliers.find((x) => x.id === id);
    openModal('Règlement fournisseur', `<form class="form" onsubmit="OptiApp.savePaySupplier(event,${id})">
      <p>Dette actuelle : <b>${money(s.debt)}</b></p>
      <div class="field"><label>Montant DA</label><input id="spAmt" type="number" min="1" max="${Math.max(s.debt, 1)}" value="${Math.round(s.debt)}" required></div>
      <div class="field"><label>Mode</label><select id="spMode">${db().shop.paymentMethods.map((m) => `<option>${esc(m)}</option>`).join('')}</select></div>
      <button class="btn gold">Enregistrer</button></form>`);
  }

  async function savePaySupplier(e, id) {
    e.preventDefault();
    const s = db().suppliers.find((x) => x.id === id);
    const amt = Math.min(s.debt || 0, Math.max(0, +spAmt.value || 0));
    if (!amt) return toast('Montant invalide.');
    s.debt = Math.max(0, (s.debt || 0) - amt);
    s.payments = s.payments || [];
    s.payments.push({ date: OptiStore.todayISO(), amount: amt, method: spMode.value });
    await OptiStore.save('Règlement ' + s.name);
    closeModal();
    toast('Dette mise à jour');
    A().renderSuppliers();
  }

  function waSupplier(id) {
    const s = db().suppliers.find((x) => x.id === id);
    if (!s?.phone) return toast('Pas de téléphone.');
    window.open(OptiStore.waLink(s.phone, 'Bonjour ' + (s.contact || '') + ', commande depuis ' + db().shop.name + '.'), '_blank');
  }

  return {
    printTicket, printInvoice, printQuote, printDoc, printClientStatement, printPO, docFrame,
    cashBanner, openCash, saveOpenCash, closeCash, saveCloseCash,
    addToCash, payRemain, savePayRemain, startReturn, saveReturn, renderQuotes, editQuote, saveQuote, setQuoteStatus,
    convertQuote, renderPurchases, editPO, savePO, receivePO, renderInventory, saveInventory, renderLabels, printLabels,
    globalSearch, omniFocus, omniKey, omniGo, omniClose, waClient, waOrder, redeemLoyalty, saveRedeem, forceBackup,
    reorderLow, viewSupplier, paySupplier, savePaySupplier, waSupplier,
    findByScanCode, handleScanCode, openScannedTicket, installWedgeScanner,
    openCameraScan, stopCameraScan, scanTicketField, SCANNER_TYPES,
    setScannerType, showScannerPanel, refreshScannerPanel, openBluetoothSettings,
    connectSerialScanner, stopSerialScanner, scannerBarHtml, scannerTypeOptions
  };
})();

if (window.OptiApp) Object.assign(window.OptiApp, window.OptiOps);
