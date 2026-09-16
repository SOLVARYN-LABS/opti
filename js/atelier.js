window.OptiAtelier = (function () {
  const db = () => OptiStore.get();
  const money = (n) => OptiStore.money(n);
  const A = () => window.OptiApp;
  const esc = (s) => A().esc(s);
  const toast = (s) => A().toast(s);
  const go = (h) => A().go(h);
  const shell = (p, i) => A().shell(p, i);
  const openModal = (t, b, cls) => {
    const m = document.getElementById('modal');
    m.classList.add('open');
    m.innerHTML = `<div class="box ${cls || 'wide'}"><div class="toolbar"><h2 class="h1" style="font-size:24px">${esc(t)}</h2><button class="btn sm" onclick="OptiApp.closeModal()">Fermer</button></div>${b}</div>`;
  };
  const closeModal = () => A().closeModal();
  const tables = () => db().refTables || OptiStore.defaultRefTables();
  const opts = (list, val) => {
    const rows = ['', ...(list || [])];
    if (val && !rows.includes(val)) rows.splice(1, 0, val);
    return rows.map((x) => `<option ${x === (val || '') ? 'selected' : ''}>${esc(x)}</option>`).join('');
  };
  const prodOpts = (type, val) => {
    const rows = db().products.filter((p) => !type || p.type === type);
    return `<option value="">—</option>` + rows.map((p) => `<option value="${p.id}" ${String(p.id) === String(val || '') ? 'selected' : ''}>${esc(p.brand)} ${esc(p.model || p.ref || '')}</option>`).join('');
  };
  const ageOf = (birth) => {
    if (!birth) return '';
    const d = new Date(birth);
    if (Number.isNaN(+d)) return '';
    let a = new Date().getFullYear() - d.getFullYear();
    const m = new Date().getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) a--;
    return a;
  };
  const eyeVal = (eye, dist, k) => (eye && eye[dist] && eye[dist][k]) || '';

  function rxCell(id, val) {
    return `<input class="rx-in" id="${id}" value="${esc(val || '')}">`;
  }
  function eyeBlock(side, eye) {
    eye = OptiStore.normalizeEye(eye);
    const p = side;
    const row = (dist, label) => `<tr>
      <th>${label}</th>
      <td>${rxCell(p + dist + 'sph', eyeVal(eye, dist, 'sph'))}</td>
      <td>${rxCell(p + dist + 'cyl', eyeVal(eye, dist, 'cyl'))}</td>
      <td>${rxCell(p + dist + 'axis', eyeVal(eye, dist, 'axis'))}</td>
      <td>${rxCell(p + dist + 'add', eyeVal(eye, dist, 'add'))}</td>
      <td>${rxCell(p + dist + 'prism', eyeVal(eye, dist, 'prism'))}</td>
      <td>${rxCell(p + dist + 'base', eyeVal(eye, dist, 'base'))}</td>
    </tr>`;
    return `<table class="rx-mini">
      <thead><tr><th>${side === 'od' ? 'OD' : 'OG'}</th><th>Sphère</th><th>Cylindre</th><th>Axe</th><th>Add</th><th>Prisme</th><th>Base</th></tr></thead>
      <tbody>
        ${row('loin', 'Loin')}${row('inter', 'Interm')}${row('pres', 'Près')}
        <tr><td>Écarts</td><td colspan="2">${rxCell(p + 'ecart', eye.ecart)}</td><td>H</td><td colspan="3">${rxCell(p + 'haut', eye.hauteur)}</td></tr>
      </tbody>
    </table>`;
  }
  function readEye(side) {
    const g = (k) => document.getElementById(side + k)?.value || '';
    const dist = (d) => ({ sph: g(d + 'sph'), cyl: g(d + 'cyl'), axis: g(d + 'axis'), add: g(d + 'add'), prism: g(d + 'prism'), base: g(d + 'base') });
    return { loin: dist('loin'), inter: dist('inter'), pres: dist('pres'), ecart: g('ecart'), hauteur: g('haut') };
  }
  function copyOdToOg() {
    ['loin', 'inter', 'pres'].forEach((d) => {
      ['sph', 'cyl', 'axis', 'add', 'prism', 'base'].forEach((k) => {
        const a = document.getElementById('od' + d + k);
        const b = document.getElementById('og' + d + k);
        if (a && b) b.value = a.value;
      });
    });
    const e = document.getElementById('odecart'); const e2 = document.getElementById('ogecart');
    if (e && e2) e2.value = e.value;
    const h = document.getElementById('odhaut'); const h2 = document.getElementById('oghaut');
    if (h && h2) h2.value = h.value;
    toast('OD copié vers OG');
  }

  function openAtelierFor(cid) {
    go('#/app/atelier');
    setTimeout(() => {
      const s = document.getElementById('opClientId');
      if (s) { s.value = String(cid); fillClientFromSelect(); }
    }, 60);
  }
  function fillClientFromSelect() {
    const id = +document.getElementById('opClientId')?.value || 0;
    const c = db().clients.find((x) => x.id === id);
    if (!c) return;
    const set = (i, v) => { const el = document.getElementById(i); if (el) el.value = v || ''; };
    set('opCiv', c.civility || 'Monsieur');
    set('opLast', c.lastName || '');
    set('opFirst', c.firstName || '');
    set('opBirth', c.birth || '');
    set('opTel', c.phone || '');
    set('opProf', c.profession || '');
    set('opAddr', c.address || '');
    set('opNote', c.notes || '');
    set('opAge', ageOf(c.birth));
    const rx = db().prescriptions.filter((r) => r.clientId === id).slice(-1)[0];
    if (rx) fillVision(rx);
    toast('Fiche client chargée');
  }
  function fillVision(rx) {
    const od = OptiStore.normalizeEye(rx.od);
    const og = OptiStore.normalizeEye(rx.og);
    const put = (side, eye) => {
      ['loin', 'inter', 'pres'].forEach((d) => {
        ['sph', 'cyl', 'axis', 'add', 'prism', 'base'].forEach((k) => {
          const el = document.getElementById(side + d + k);
          if (el) el.value = eye[d]?.[k] || '';
        });
      });
      const e = document.getElementById(side + 'ecart'); if (e) e.value = eye.ecart || '';
      const h = document.getElementById(side + 'haut'); if (h) h.value = eye.hauteur || '';
    };
    put('od', od); put('og', og);
    const doc = document.getElementById('opDoc');
    if (doc && rx.doctor) doc.value = rx.doctor;
    const dt = document.getElementById('opRxDate');
    if (dt && rx.date) dt.value = rx.date;
  }
  function onBirthChange() {
    const el = document.getElementById('opAge');
    if (el) el.value = ageOf(document.getElementById('opBirth')?.value);
  }
  function recalcOp() {
    const n = (id) => +document.getElementById(id)?.value || 0;
    const line = (prix, rem, q) => Math.max(0, prix * Math.max(1, q || 1) * (1 - rem / 100));
    const ht = line(n('pLoinV'), n('rLoinV')) + line(n('pLoinM'), n('rLoinM'))
      + line(n('pPresV'), n('rPresV')) + line(n('pPresM'), n('rPresM'))
      + line(n('pAcc1'), n('rAcc1'), n('qAcc1')) + line(n('pAcc2'), n('rAcc2'), n('qAcc2'));
    const remG = n('opRemPct');
    const after = Math.max(0, ht * (1 - remG / 100));
    const paid = n('opPaid');
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = Math.round(v); };
    set('opAvant', ht);
    set('opTotal', after);
    set('opReste', Math.max(0, after - paid));
  }
  function onProductPick(selId, priceId) {
    const id = +document.getElementById(selId)?.value || 0;
    const p = db().products.find((x) => x.id === id);
    if (p && document.getElementById(priceId)) document.getElementById(priceId).value = p.sell || 0;
    recalcOp();
  }

  function renderAtelier(saleId) {
    const d = db();
    const sale = d.sales.find((s) => s.id === saleId) || null;
    const c = sale ? d.clients.find((x) => x.id === sale.clientId) : null;
    const vis = sale?.vision || { od: {}, og: {} };
    const od = OptiStore.normalizeEye(vis.od || {});
    const og = OptiStore.normalizeEye(vis.og || {});
    const item = (kind) => (sale?.items || []).find((i) => i.kind === kind) || {};
    const opNum = sale?.opNum || OptiStore.nextOpNum();
    const doctors = Array.from(new Set([...(tables().prescripteurs || []), ...d.prescriptions.map((r) => r.doctor).filter(Boolean)]));
    const line = (kind, label, type, prixId, remId, selId, extra) => {
      const it = item(kind);
      extra = extra || '';
      return `<tr>
        <th>${label}</th>
        <td><select id="${selId}" onchange="OptiApp.onProductPick('${selId}','${prixId}')">${prodOpts(type, it.productId)}</select></td>
        <td class="op-tint"></td>
        <td><input id="${prixId}" type="number" value="${it.price || ''}" oninput="OptiApp.recalcOp()"></td>
        <td><input id="${remId}" type="number" value="${it.discount || ''}" oninput="OptiApp.recalcOp()"></td>
        ${extra}
        <td><input type="checkbox" id="liv_${kind}" ${it.delivered || sale?.delivered ? 'checked' : ''}></td>
      </tr>`;
    };
    shell('atelier', `
      <h1 class="h1">Vente comptoir</h1>
      <div class="sub">Client, vision OD/OG, montures / verres / accessoires, livraison et encaissement — comme en magasin.</div>
      ${OptiOps.cashBanner()}
      <form class="op-sheet" onsubmit="OptiApp.saveAtelier(event,'${sale ? sale.id : ''}');return false">
        <div class="op-head">
          <div class="field"><label>Client existant</label>
            <select id="opClientId" onchange="OptiApp.fillClientFromSelect()">
              <option value="0">Nouveau client</option>
              ${d.clients.map((x) => `<option value="${x.id}" ${c && x.id === c.id ? 'selected' : ''}>${esc(x.lastName)} ${esc(x.firstName)}</option>`).join('')}
            </select>
          </div>
          <div class="op-num">Opération <b>${opNum}</b></div>
          <label class="op-livrer"><input type="checkbox" id="opLivrer" ${sale?.delivered ? 'checked' : ''}> LIVRER</label>
        </div>
        <div class="card op-id">
          <h3>Identification</h3>
          <div class="op-id-grid">
            <div class="field"><label>Civilité</label><select id="opCiv">${['Monsieur','Madame','Mademoiselle','Enfant'].map((x) => `<option ${x === (c?.civility || 'Monsieur') ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            <div class="field"><label>Nom</label><input id="opLast" required value="${esc(c?.lastName || '')}"></div>
            <div class="field"><label>Prénom</label><input id="opFirst" value="${esc(c?.firstName || '')}"></div>
            <div class="field"><label>Naissance</label><input id="opBirth" type="date" value="${esc(c?.birth || '')}" onchange="OptiApp.onBirthChange()"></div>
            <div class="field"><label>Âge</label><input id="opAge" readonly value="${esc(ageOf(c?.birth))}"></div>
            <div class="field"><label>Tél</label><input id="opTel" value="${esc(c?.phone || '')}"></div>
            <div class="field"><label>Profession</label><select id="opProf">${opts(tables().professions, c?.profession)}</select></div>
            <div class="field"><label>Adresse</label><input id="opAddr" value="${esc(c?.address || '')}"></div>
            <div class="field"><label>Note</label><input id="opNote" value="${esc(c?.notes || '')}"></div>
          </div>
        </div>
        <div class="card op-rx">
          <div class="op-rx-meta">
            <div class="field"><label>Médecin</label><input id="opDoc" list="opDocs" value="${esc(sale?.doctor || '')}" placeholder="Prescripteur">
              <datalist id="opDocs">${doctors.map((x) => `<option value="${esc(x)}">`).join('')}</datalist></div>
            <div class="field"><label>Date prescription</label><input id="opRxDate" type="date" value="${esc(sale?.rxDate || OptiStore.todayISO())}"></div>
            <button type="button" class="btn sm" onclick="OptiApp.copyOdToOg()">OD → OG</button>
          </div>
          <div class="op-eyes">
            ${eyeBlock('od', od)}
            ${eyeBlock('og', og)}
          </div>
        </div>
        <div class="card tablewrap">
          <table class="op-lines">
            <thead><tr><th></th><th>Produit</th><th></th><th>Prix U</th><th>Rem. %</th><th></th><th>Livrée</th></tr></thead>
            <tbody>
              ${line('verre_loin', 'LOIN Verres', 'verre', 'pLoinV', 'rLoinV', 'sLoinV', '<td></td>')}
              ${line('monture_loin', 'Montures', 'monture', 'pLoinM', 'rLoinM', 'sLoinM', '<td></td>')}
              ${line('verre_pres', 'PRÈS Verres', 'verre', 'pPresV', 'rPresV', 'sPresV', '<td></td>')}
              ${line('monture_pres', 'Montures', 'monture', 'pPresM', 'rPresM', 'sPresM', '<td></td>')}
              <tr>
                <th>Accessoire 1</th>
                <td><select id="sAcc1" onchange="OptiApp.onProductPick('sAcc1','pAcc1')">${prodOpts('accessoire', item('acc1').productId)}</select></td>
                <td></td>
                <td><input id="pAcc1" type="number" value="${item('acc1').price || ''}" oninput="OptiApp.recalcOp()"></td>
                <td><input id="rAcc1" type="number" value="${item('acc1').discount || ''}" oninput="OptiApp.recalcOp()"></td>
                <td><input id="qAcc1" type="number" min="1" value="${item('acc1').q || 1}" oninput="OptiApp.recalcOp()" title="Qté"></td>
                <td><input type="checkbox" id="liv_acc1" ${item('acc1').delivered ? 'checked' : ''}></td>
              </tr>
              <tr>
                <th>Accessoire 2</th>
                <td><select id="sAcc2" onchange="OptiApp.onProductPick('sAcc2','pAcc2')">${prodOpts('accessoire', item('acc2').productId)}</select></td>
                <td></td>
                <td><input id="pAcc2" type="number" value="${item('acc2').price || ''}" oninput="OptiApp.recalcOp()"></td>
                <td><input id="rAcc2" type="number" value="${item('acc2').discount || ''}" oninput="OptiApp.recalcOp()"></td>
                <td><input id="qAcc2" type="number" min="1" value="${item('acc2').q || 1}" oninput="OptiApp.recalcOp()" title="Qté"></td>
                <td><input type="checkbox" id="liv_acc2" ${item('acc2').delivered ? 'checked' : ''}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="op-foot">
          <div class="op-print">
            <label><input type="checkbox" id="opPrintRx" ${sale?.printRx !== false ? 'checked' : ''}> Imprimer l’historique de la vue</label>
            <label><input type="checkbox" id="opPrintRecu" ${sale?.printRecu !== false ? 'checked' : ''}> Imprimer Atelier / Reçu</label>
          </div>
          <div class="op-tot">
            <div class="field"><label>Total avant remise</label><input id="opAvant" readonly></div>
            <div class="field"><label>Remise %</label><input id="opRemPct" type="number" value="${sale?.discount || 0}" oninput="OptiApp.recalcOp()"></div>
            <div class="field"><label>Total</label><input id="opTotal" readonly></div>
            <div class="field"><label>Encaissé</label><input id="opPaid" type="number" value="${sale?.paid || 0}" oninput="OptiApp.recalcOp()"></div>
            <div class="field"><label>Reste à payer</label><input id="opReste" readonly></div>
            <div class="field"><label>Mode</label><select id="opPay">${(d.shop.paymentMethods || []).map((m) => `<option ${m === (sale?.method || 'Espèces') ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn gold" type="submit">Enregistrer l’opération</button>
          <button class="btn" type="button" onclick="OptiApp.go('#/app/atelier')">Nouvelle</button>
          ${sale ? `<button class="btn" type="button" onclick="OptiApp.printRecu('${sale.id}')">Reçu</button>` : ''}
        </div>
      </form>
      <div class="card tablewrap" style="margin-top:16px">
        <div class="toolbar"><strong>Opérations du magasin</strong></div>
        <table class="data"><thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Total</th><th>Payé</th><th>Reste</th><th>Livré</th><th></th></tr></thead>
        <tbody>${d.sales.slice().reverse().slice(0, 40).map((s) => {
          const rest = Math.max(0, s.total - (s.coverAmount || 0) - s.paid);
          return `<tr><td>${s.opNum || '—'}</td><td>${esc(s.date)}</td><td>${esc(OptiStore.clientName(s.clientId))}</td><td>${money(s.total)}</td><td>${money(s.paid)}</td><td>${money(rest)}</td>
            <td>${s.delivered ? '<span class="badge ok">Livré</span>' : '<span class="badge warn">Atelier</span>'}</td>
            <td><button class="btn sm" onclick="OptiApp.renderAtelier('${s.id}')">Ouvrir</button>
              <button class="btn sm" onclick="OptiApp.printRecu('${s.id}')">Reçu</button></td></tr>`;
        }).join('') || '<tr><td colspan="8" class="muted">Aucune opération.</td></tr>'}</tbody></table>
      </div>
    `);
    setTimeout(recalcOp, 40);
  }

  function readLine(kind, sel, prix, rem, qid, liv) {
    const productId = +(document.getElementById(sel)?.value || 0);
    const p = db().products.find((x) => x.id === productId);
    const price = +(document.getElementById(prix)?.value || 0);
    const discount = +(document.getElementById(rem)?.value || 0);
    const q = +(document.getElementById(qid)?.value || 1) || 1;
    if (!productId && !price) return null;
    return {
      kind, productId: productId || 0, q, price, discount,
      label: p ? (p.brand + ' ' + (p.model || p.ref || '')) : kind,
      delivered: !!document.getElementById(liv)?.checked
    };
  }

  async function saveAtelier(e, saleId) {
    e.preventDefault();
    const d = db();
    const lastName = (document.getElementById('opLast')?.value || '').trim();
    const firstName = (document.getElementById('opFirst')?.value || '').trim();
    if (!lastName) return toast('Nom du client obligatoire.');
    let cid = +document.getElementById('opClientId')?.value || 0;
    const payload = {
      civility: document.getElementById('opCiv')?.value || '',
      lastName, firstName,
      birth: document.getElementById('opBirth')?.value || '',
      phone: document.getElementById('opTel')?.value || '',
      profession: document.getElementById('opProf')?.value || '',
      address: document.getElementById('opAddr')?.value || '',
      notes: document.getElementById('opNote')?.value || ''
    };
    if (cid) Object.assign(d.clients.find((x) => x.id === cid) || {}, payload);
    else {
      cid = Date.now();
      d.clients.push({ id: cid, loyalty: 0, created: OptiStore.todayISO(), email: '', extra: '', ...payload });
    }
    const vision = { od: readEye('od'), og: readEye('og') };
    const doctor = document.getElementById('opDoc')?.value || '';
    const rxDate = document.getElementById('opRxDate')?.value || OptiStore.todayISO();
    if (doctor && !(tables().prescripteurs || []).includes(doctor)) {
      d.refTables.prescripteurs = d.refTables.prescripteurs || [];
      d.refTables.prescripteurs.push(doctor);
    }
    d.prescriptions.push({
      id: Date.now() + 1, clientId: cid, date: rxDate, doctor, type: 'Atelier',
      od: vision.od, og: vision.og, pd: vision.od.ecart || vision.og.ecart || '', notes: '', photo: '', conf: {}
    });
    const items = [
      readLine('verre_loin', 'sLoinV', 'pLoinV', 'rLoinV', null, 'liv_verre_loin'),
      readLine('monture_loin', 'sLoinM', 'pLoinM', 'rLoinM', null, 'liv_monture_loin'),
      readLine('verre_pres', 'sPresV', 'pPresV', 'rPresV', null, 'liv_verre_pres'),
      readLine('monture_pres', 'sPresM', 'pPresM', 'rPresM', null, 'liv_monture_pres'),
      readLine('acc1', 'sAcc1', 'pAcc1', 'rAcc1', 'qAcc1', 'liv_acc1'),
      readLine('acc2', 'sAcc2', 'pAcc2', 'rAcc2', 'qAcc2', 'liv_acc2')
    ].filter(Boolean);
    const lineTot = (it) => it.price * (it.q || 1) * (1 - (it.discount || 0) / 100);
    const ht = items.reduce((a, it) => a + lineTot(it), 0);
    const disc = +(document.getElementById('opRemPct')?.value || 0);
    const total = Math.max(0, ht * (1 - disc / 100));
    const paidN = Math.min(total, +(document.getElementById('opPaid')?.value || 0));
    const delivered = !!document.getElementById('opLivrer')?.checked;
    const method = document.getElementById('opPay')?.value || 'Espèces';
    const prev = d.sales.find((s) => s.id === saleId);
    if (prev && prev.status !== 'retour') {
      (prev.items || []).forEach((it) => {
        if (!it.productId) return;
        const p = d.products.find((x) => x.id === it.productId);
        if (p) p.qty += (it.q || 1);
      });
    }
    items.forEach((it) => {
      if (!it.productId) return;
      const p = d.products.find((x) => x.id === it.productId);
      if (!p) return;
      p.qty = Math.max(0, p.qty - (it.q || 1));
      d.movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type: 'Sortie', qty: -(it.q || 1), motif: 'Opération', storeId: d.currentStore });
    });
    const opNum = prev?.opNum || OptiStore.nextOpNum();
    const sale = {
      id: prev?.id || ('V-' + Date.now()),
      date: prev?.date || OptiStore.todayISO(),
      clientId: cid, items, discount: disc, tax: 0, total, paid: paidN, method,
      storeId: d.currentStore, userId: d.session?.id,
      status: paidN >= total ? 'payée' : (paidN > 0 ? 'partielle' : 'impayée'),
      coverOrg: 'Aucune', coverAmount: 0,
      payments: paidN ? [{ date: OptiStore.todayISO(), amount: paidN, method }] : [],
      vision, doctor, rxDate, delivered, opNum,
      printRx: !!document.getElementById('opPrintRx')?.checked,
      printRecu: !!document.getElementById('opPrintRecu')?.checked,
      atelier: true
    };
    if (prev) {
      const delta = paidN - (prev.paid || 0);
      Object.assign(prev, sale);
      if (delta > 0) OptiOps.addToCash(delta, method);
    } else {
      d.sales.push(sale);
      d.invoices.push({ id: 'FAC-' + Date.now(), date: sale.date, clientId: cid, saleId: sale.id, total, paid: paidN, status: sale.status === 'payée' ? 'Payée' : 'Partiellement payée' });
      OptiOps.addToCash(paidN, method);
      if (cid && paidN) {
        const cli = d.clients.find((x) => x.id === cid);
        const pts = OptiStore.earnPoints(paidN);
        if (cli && pts) {
          cli.loyalty = (cli.loyalty || 0) + pts;
          d.loyaltyLog.push({ date: sale.date, clientId: cid, pts, reason: 'Opération ' + sale.id, saleId: sale.id });
        }
      }
    }
    await OptiStore.save('Opération ' + sale.opNum);
    toast(delivered ? 'Opération enregistrée — LIVRÉ' : 'Opération enregistrée');
    if (sale.printRecu) printRecu(sale.id);
    renderAtelier(sale.id);
  }

  function printRecu(id) {
    const s = db().sales.find((x) => x.id === id);
    if (!s) return toast('Reçu introuvable');
    const shop = db().shop;
    const c = db().clients.find((x) => x.id === s.clientId) || {};
    const v = s.vision || { od: {}, og: {} };
    const od = OptiStore.normalizeEye(v.od);
    const og = OptiStore.normalizeEye(v.og);
    const row = (eye, dist) => `<td>${esc(eye[dist]?.sph || '')}</td><td>${esc(eye[dist]?.cyl || '')}</td><td>${esc(eye[dist]?.axis || '')}</td><td>${esc(eye[dist]?.add || '')}</td><td>${esc(eye[dist]?.prism || '')}</td><td>${esc(eye[dist]?.base || '')}</td>`;
    const it = (k) => (s.items || []).find((i) => i.kind === k);
    const lab = (k) => { const x = it(k); return x ? esc(x.label) : ''; };
    const pr = (k) => { const x = it(k); return x ? money(x.price * (x.q || 1) * (1 - (x.discount || 0) / 100)) : ''; };
    const rest = Math.max(0, (s.total || 0) - (s.paid || 0));
    const paidStamp = (s.paid || 0) >= (s.total || 0) && s.total ? 'PAYÉ' : ((s.paid || 0) > 0 ? 'ACOMPTE' : '');
    const livStamp = s.delivered ? 'LIVRÉ' : '';
    OptiOps.printDoc('Reçu ' + (s.opNum || s.id), `
      <div class="recu">
        <div class="recu-top">
          <div>
            <div class="recu-no">Reçu ${esc(String(s.opNum || s.id))}</div>
            <div>${esc(c.civility || '')} ${esc(c.lastName || '')} ${esc(c.firstName || '')}</div>
            <div>Tél. ${esc(c.phone || '')}</div>
            <div>Prescripteur : ${esc(s.doctor || '')}</div>
            <div>Date de réception : ${esc(s.date)}</div>
          </div>
          <div class="recu-shop">
            <strong>${esc(shop.name)}</strong><br>${esc(shop.address || '')}<br>${esc(shop.city || '')}<br>${esc(shop.phone || '')} ${esc(shop.mobile || '')}<br>${esc(shop.email || '')}
          </div>
        </div>
        <table class="recu-rx">
          <thead><tr><th></th><th colspan="6">OD</th><th colspan="6">OG</th></tr>
          <tr><th></th><th>Sph</th><th>Cyl</th><th>Axe</th><th>Add</th><th>Prism</th><th>Base</th><th>Sph</th><th>Cyl</th><th>Axe</th><th>Add</th><th>Prism</th><th>Base</th></tr></thead>
          <tbody>
            <tr><th>Loin</th>${row(od, 'loin')}${row(og, 'loin')}</tr>
            <tr><th>Interm</th>${row(od, 'inter')}${row(og, 'inter')}</tr>
            <tr><th>Près</th>${row(od, 'pres')}${row(og, 'pres')}</tr>
            <tr><th>Écart / H</th><td colspan="6">${esc(od.ecart || '')} / ${esc(od.hauteur || '')}</td><td colspan="6">${esc(og.ecart || '')} / ${esc(og.hauteur || '')}</td></tr>
          </tbody>
        </table>
        <table class="recu-art">
          <tr><th>OD</th><td>${lab('verre_loin')}</td><td class="r">${pr('verre_loin')}</td></tr>
          <tr><th>OG</th><td>${lab('verre_pres') || lab('verre_loin')}</td><td class="r">${pr('verre_pres')}</td></tr>
          <tr><th>MONTURE</th><td>${lab('monture_loin') || lab('monture_pres')}</td><td class="r">${pr('monture_loin') || pr('monture_pres')}</td></tr>
          <tr><th>ACC1</th><td>${lab('acc1')}</td><td class="r">${pr('acc1')}</td></tr>
          <tr><th>ACC2</th><td>${lab('acc2')}</td><td class="r">${pr('acc2')}</td></tr>
        </table>
        <div class="recu-stamps">${paidStamp ? `<span class="stamp ok">${paidStamp}</span>` : ''}${livStamp ? `<span class="stamp liv">${livStamp}</span>` : ''}</div>
        <table class="recu-tot">
          <tr><td>Total</td><td class="r">${money(s.total)}</td></tr>
          <tr><td>Encaissé</td><td class="r">${money(s.paid)}</td></tr>
          <tr><td>Reste à payer</td><td class="r">${money(rest)}</td></tr>
        </table>
        <p class="recu-foot">AVIS IMPORTANT · ${esc(shop.ticketFooter || '')}</p>
      </div>
      <style>
        .recu{font-family:ui-sans-serif,system-ui,sans-serif;color:#111;max-width:190mm;margin:0 auto;font-size:12px}
        .recu-top{display:flex;justify-content:space-between;gap:24px;margin-bottom:12px}
        .recu-no{font-size:18px;font-weight:800}
        .recu-rx,.recu-art,.recu-tot{width:100%;border-collapse:collapse;margin:8px 0}
        .recu-rx th,.recu-rx td,.recu-art th,.recu-art td,.recu-tot td{border:1px solid #bbb;padding:4px 6px}
        .r{text-align:right}
        .recu-stamps{display:flex;gap:12px;margin:10px 0}
        .stamp{border:2px solid #0D7A70;color:#0D7A70;font-weight:800;padding:6px 14px;transform:rotate(-8deg)}
        .stamp.liv{border-color:#147A45;color:#147A45}
        .recu-foot{font-size:11px;color:#555;margin-top:16px}
        @media print{button{display:none}}
      </style>
    `, 'a4');
  }

  const TABLE_META = [
    ['marques', 'Marques'],
    ['matieresVerre', 'Matière verre'],
    ['indices', 'Indice verre'],
    ['origines', 'Origine'],
    ['typesVerre', 'Type verre'],
    ['famillesVerre', 'Famille verre'],
    ['typesLentille', 'Type lentille'],
    ['matieresLentille', 'Matière lentille'],
    ['packagesLentille', 'Package lentille'],
    ['dureesLentille', 'Durée de vie lentille'],
    ['prescripteurs', 'Prescripteurs'],
    ['professions', 'Profession'],
    ['categories1', 'Catégories 1'],
    ['categories2', 'Catégories 2'],
    ['banques', 'Banque'],
    ['agences', 'Agence'],
    ['reglements', 'Règlement'],
    ['entrees', 'Entrées'],
    ['sorties', 'Sorties'],
    ['magasins', 'Magasins']
  ];
  let tableKey = 'marques';

  function renderTables() {
    const t = tables();
    const key = tableKey;
    const list = t[key] || [];
    shell('tables', `
      <h1 class="h1">Tables</h1>
      <div class="sub">Listes de référence : marques, matières, indices, prescripteurs… utilisées partout dans OptiDZ.</div>
      <div class="tabs">${TABLE_META.map(([k, l]) => `<button class="${k === key ? 'active' : ''}" onclick="OptiApp.setTableKey('${k}')">${l}</button>`).join('')}</div>
      <div class="card">
        <div class="toolbar">
          <input class="search" id="tblNew" placeholder="Nouvelle valeur…">
          <button class="btn gold" onclick="OptiApp.addTableRow()">Ajouter</button>
        </div>
        <div class="tablewrap"><table class="data"><thead><tr><th>Code</th><th>Libellé</th><th></th></tr></thead>
        <tbody>${list.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x)}</td>
          <td><button class="btn sm danger" onclick="OptiApp.delTableRow(${i})">Supprimer</button></td></tr>`).join('') || '<tr><td colspan="3" class="muted">Liste vide.</td></tr>'}</tbody></table></div>
      </div>
    `);
  }
  function setTableKey(k) { tableKey = k; renderTables(); }
  async function addTableRow() {
    const v = (document.getElementById('tblNew')?.value || '').trim();
    if (!v) return toast('Saisissez une valeur.');
    db().refTables[tableKey] = db().refTables[tableKey] || [];
    if (db().refTables[tableKey].some((x) => String(x).toLowerCase() === v.toLowerCase())) return toast('Déjà dans la liste.');
    db().refTables[tableKey].push(v);
    await OptiStore.save('Table ' + tableKey);
    renderTables();
  }
  async function delTableRow(i) {
    db().refTables[tableKey].splice(i, 1);
    await OptiStore.save('Table');
    renderTables();
  }

  let prodFormTab = 'fiche';
  function editProduct(id) {
    const p = db().products.find((x) => x.id === id) || { type: prodFormTab === 'verre' ? 'verre' : 'monture' };
    const type = p.type || 'monture';
    prodFormTab = type === 'verre' ? (prodFormTab === 'prix' || prodFormTab === 'stock' || prodFormTab === 'note' ? prodFormTab : 'fiche')
      : type === 'lentille' ? (prodFormTab === 'stock' || prodFormTab === 'note' ? prodFormTab : 'fiche') : 'fiche';
    const t = tables();
    const tabs = type === 'verre'
      ? [['fiche', 'Verre'], ['prix', 'Table des prix'], ['stock', 'Stock'], ['note', 'Note']]
      : type === 'lentille'
        ? [['fiche', 'Lentille'], ['stock', 'Stock'], ['note', 'Note']]
        : [];
    const g = p.priceGrid || { cylNeg: true, spherical: {}, toric: {} };
    const sphRows = OptiStore.SPH_GROUPS.map((grp) => {
      const row = g.spherical?.[grp] || {};
      return `<tr><th>${grp}</th>
        <td><input id="sgb_${grp}" type="number" value="${row.buy || ''}"></td>
        <td><input id="sgs_${grp}" type="number" value="${row.sell || ''}"></td>
        ${OptiStore.TOR_GROUPS.map((col) => {
          const cell = (g.toric?.[grp] || {})[col] || {};
          return `<td><input id="tg_${grp}_${col}" type="number" value="${cell.sell || ''}" title="Vente ${grp}/${col}"></td>`;
        }).join('')}</tr>`;
    }).join('');
    const ficheVerre = `
      <div class="formgrid">
        <div class="field"><label>Origine</label><select id="pOrig">${opts(t.origines, p.origin)}</select></div>
        <div class="field"><label>Nom du verre</label><input id="pModel" value="${esc(p.model || '')}"></div>
        <div class="field"><label>Famille verre</label><select id="pFam">${opts(t.famillesVerre, p.family)}</select></div>
        <div class="field"><label>Référence</label><input id="pRef" value="${esc(p.ref || '')}"></div>
        <div class="field"><label>Fournisseur</label><select id="pSup"><option value="">—</option>${db().suppliers.map((s) => `<option value="${s.id}" ${String(s.id) === String(p.supplierId || '') ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Marque</label><select id="pBrand">${opts(t.marques, p.brand)}</select></div>
        <div class="field"><label>Matière</label><select id="pMat">${opts(t.matieresVerre, p.material)}</select></div>
        <div class="field"><label>Type</label><select id="pKind">${opts(t.typesVerre, p.verreType)}</select></div>
        <div class="field"><label>Indice</label><select id="pInd">${opts(t.indices, p.indice)}</select></div>
        <div class="field"><label>Diamètre</label><input id="pDia" value="${esc(p.dia || '')}"></div>
        <div class="field"><label>Teinte</label><input id="pTeinte" value="${esc(p.teinte || p.color || '')}"></div>
      </div>
      <label class="hint"><input type="radio" name="pStockKind" value="stock" ${p.stockKind !== 'commande' ? 'checked' : ''}> Verre de stock</label>
      <label class="hint"><input type="radio" name="pStockKind" value="commande" ${p.stockKind === 'commande' ? 'checked' : ''}> Verre de commande</label>
      <label class="hint"><input type="checkbox" id="pPH" ${p.photochromic ? 'checked' : ''}> Photochromiques</label>
      <label class="hint"><input type="checkbox" id="pAR" ${p.antireflet ? 'checked' : ''}> Anti-reflet</label>
      <label class="hint"><input type="checkbox" id="pUV" ${p.uv ? 'checked' : ''}> UV</label>`;
    const ficheLent = `
      <div class="formgrid">
        <div class="field"><label>Marque</label><select id="pBrand">${opts(t.marques, p.brand)}</select></div>
        <div class="field"><label>Modèle</label><input id="pModel" value="${esc(p.model || '')}"></div>
        <div class="field"><label>Origine</label><select id="pOrig">${opts(t.origines, p.origin)}</select></div>
        <div class="field"><label>Référence</label><input id="pRef" value="${esc(p.ref || '')}"></div>
        <div class="field"><label>Fournisseur</label><select id="pSup"><option value="">—</option>${db().suppliers.map((s) => `<option value="${s.id}" ${String(s.id) === String(p.supplierId || '') ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Matière</label><select id="pMat">${opts(t.matieresLentille, p.material)}</select></div>
        <div class="field"><label>Diamètre</label><input id="pDia" value="${esc(p.dia || '')}" placeholder="14.0"></div>
        <div class="field"><label>Courbure BC</label><input id="pBc" value="${esc(p.bc || '')}" placeholder="8.4"></div>
        <div class="field"><label>Package</label><select id="pPackSel">${opts(t.packagesLentille, String(p.packQty || ''))}</select></div>
        <div class="field"><label>Type</label><select id="pKind">${opts(t.typesLentille, p.lentilleType)}</select></div>
        <div class="field"><label>Durée</label><select id="pDuree">${opts(t.dureesLentille, p.duree)}</select></div>
        <div class="field"><label>Couleur</label><input id="pColor" value="${esc(p.color || '')}"></div>
        <div class="field"><label>TVA %</label><input id="pTva" type="number" value="${p.tva || 0}"></div>
        <div class="field"><label>Œil</label><select id="pEye">${['les deux','OD','OG'].map((x) => `<option ${x === (p.eye || 'les deux') ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      </div>
      <h3>Achat / vente sphérique</h3>
      <div class="formgrid">
        <div class="field"><label>Prix d’achat</label><input id="pBuySph" type="number" value="${p.buySph || p.buy || 0}"></div>
        <div class="field"><label>Rem %</label><input id="pRemSph" type="number" value="${p.remSph || 0}"></div>
        <div class="field"><label>Coef</label><input id="pCoefSph" type="number" step="0.01" value="${p.coefSph || 1.5}"></div>
        <div class="field"><label>Prix vente HT</label><input id="pSellSphHT" type="number" value="${p.sellSphHT || p.sell || 0}"></div>
        <div class="field"><label>Prix d’achat net</label><input id="pBuySphNet" type="number" value="${p.buySphNet || p.buy || 0}"></div>
        <div class="field"><label>Prix vente TTC</label><input id="pSellSphTTC" type="number" value="${p.sell || 0}"></div>
      </div>
      <h3>Achat / vente torique</h3>
      <div class="formgrid">
        <div class="field"><label>Prix d’achat</label><input id="pBuyTor" type="number" value="${p.buyTor || 0}"></div>
        <div class="field"><label>Rem %</label><input id="pRemTor" type="number" value="${p.remTor || 0}"></div>
        <div class="field"><label>Coef</label><input id="pCoefTor" type="number" step="0.01" value="${p.coefTor || 1.5}"></div>
        <div class="field"><label>Prix vente HT</label><input id="pSellTorHT" type="number" value="${p.sellTorHT || 0}"></div>
        <div class="field"><label>Prix d’achat net</label><input id="pBuyTorNet" type="number" value="${p.buyTorNet || 0}"></div>
        <div class="field"><label>Prix vente TTC</label><input id="pSellTorTTC" type="number" value="${p.sellTor || 0}"></div>
      </div>`;
    const ficheStd = `
      <div class="formgrid">
        <div class="field"><label>Marque</label><select id="pBrand">${opts(t.marques, p.brand)}</select></div>
        <div class="field"><label>Modèle</label><input id="pModel" value="${esc(p.model || '')}"></div>
        <div class="field"><label>Référence</label><input id="pRef" value="${esc(p.ref || '')}"></div>
        <div class="field"><label>Couleur</label><input id="pColor" value="${esc(p.color || '')}"></div>
        <div class="field"><label>Taille</label><input id="pSize" value="${esc(p.size || '')}"></div>
        <div class="field"><label>Forme</label><input id="pShape" value="${esc(p.shape || '')}"></div>
        <div class="field"><label>Matière</label><input id="pMat" value="${esc(p.material || '')}"></div>
      </div>`;
    const stockF = `
      <div class="formgrid">
        <div class="field"><label>Prix d’achat DA</label><input id="pBuy" type="number" value="${p.buy || 0}"></div>
        <div class="field"><label>Prix de vente DA</label><input id="pSell" type="number" value="${p.sell || 0}"></div>
        <div class="field"><label>Quantité</label><input id="pQty" type="number" value="${p.qty || 0}"></div>
        <div class="field"><label>Stock min</label><input id="pMin" type="number" value="${p.min || 0}"></div>
        <div class="field"><label>Code-barres</label><input id="pBar" value="${esc(p.barcode || '')}"></div>
        <div class="field"><label>Emplacement</label><input id="pLoc" value="${esc(p.location || '')}"></div>
        <div class="field"><label>Boutique</label><select id="pStore">${db().stores.map((s) => `<option value="${s.id}" ${s.id === p.storeId ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>Photo</label><input id="pPhoto" type="file" accept="image/*"></div>`;
    const noteF = `<div class="field"><label>Note</label><textarea id="pNote">${esc(p.note || '')}</textarea></div>`;
    const prixF = `
      <label class="hint"><input type="checkbox" id="pCylNeg" ${g.cylNeg !== false ? 'checked' : ''}> Cylindre négatif</label>
      <p class="muted">Verre sphérique : prix par groupe. Verre torique : colonnes G2 à G10.</p>
      <div class="tablewrap"><table class="data pg-grid">
        <thead><tr><th></th><th>P.A. sph.</th><th>P.V. sph.</th>${OptiStore.TOR_GROUPS.map((c) => `<th>Tor ${c}</th>`).join('')}</tr></thead>
        <tbody>${sphRows}</tbody>
      </table></div>
      <div class="toolbar">
        <button type="button" class="btn sm" onclick="OptiApp.applyGridBuy()">Appliquer P.A. G2 à tous</button>
        <button type="button" class="btn sm" onclick="OptiApp.calcGridSell()">Calculer les prix (×1.8)</button>
      </div>`;
    const body = prodFormTab === 'prix' ? prixF : prodFormTab === 'stock' ? stockF : prodFormTab === 'note' ? noteF
      : (type === 'verre' ? ficheVerre : type === 'lentille' ? ficheLent : ficheStd + stockF);
    const hiddenStock = (type === 'verre' || type === 'lentille') && prodFormTab !== 'stock'
      ? `<div class="hide">${stockF}</div>` : '';
    openModal(id ? 'Produit' : 'Nouveau produit', `
      <form class="form" onsubmit="OptiApp.saveProduct(event,${id || 0});return false">
        <div class="formgrid">
          <div class="field"><label>Type d’article</label>
            <select id="pType" onchange="OptiApp.switchProdType(${id || 0})">${['monture','verre','lentille','accessoire'].map((x) => `<option ${x === type ? 'selected' : ''}>${x}</option>`).join('')}</select>
          </div>
        </div>
        ${tabs.length ? `<div class="tabs">${tabs.map(([k, l]) => `<button type="button" class="${prodFormTab === k ? 'active' : ''}" onclick="OptiApp.setProdFormTab('${k}',${id || 0})">${l}</button>`).join('')}</div>` : ''}
        ${body}
        ${hiddenStock}
        ${prodFormTab === 'fiche' && type !== 'monture' && type !== 'accessoire' ? '' : ''}
        <button class="btn gold">Enregistrer</button>
      </form>`, 'full');
  }
  function setProdFormTab(tab, id) {
    stashProdDraft();
    prodFormTab = tab;
    editProduct(id || 0);
    applyProdDraft();
  }
  function switchProdType(id) {
    const type = document.getElementById('pType')?.value;
    stashProdDraft();
    prodFormTab = 'fiche';
    const p = db().products.find((x) => x.id === id) || {};
    p.type = type;
    if (!id) window._prodDraft = Object.assign(window._prodDraft || {}, { type });
    editProduct(id || 0);
    applyProdDraft();
    const sel = document.getElementById('pType');
    if (sel) sel.value = type;
  }
  function stashProdDraft() {
    const ids = ['pType','pBrand','pModel','pRef','pColor','pSize','pShape','pMat','pInd','pBc','pDia','pBuy','pSell','pQty','pMin','pBar','pLoc','pNote','pOrig','pFam','pKind','pTeinte','pTva','pDuree','pPackSel'];
    const o = window._prodDraft || {};
    ids.forEach((id) => { const el = document.getElementById(id); if (el) o[id] = el.value; });
    window._prodDraft = o;
  }
  function applyProdDraft() {
    const o = window._prodDraft || {};
    Object.keys(o).forEach((id) => { const el = document.getElementById(id); if (el && o[id] != null) el.value = o[id]; });
  }
  function applyGridBuy() {
    const v = document.getElementById('sgb_G2')?.value;
    if (!v) return toast('Saisissez le P.A. de G2.');
    OptiStore.SPH_GROUPS.forEach((g) => { const el = document.getElementById('sgb_' + g); if (el) el.value = v; });
    toast('Prix d’achat copié');
  }
  function calcGridSell() {
    OptiStore.SPH_GROUPS.forEach((g) => {
      const b = +document.getElementById('sgb_' + g)?.value || 0;
      const s = document.getElementById('sgs_' + g);
      if (s && b) s.value = Math.round(b * 1.8);
    });
    toast('Prix de vente calculés × 1.8');
  }

  async function saveProduct(e, id) {
    e.preventDefault();
    const val = (i) => document.getElementById(i)?.value || '';
    const num = (i) => +(document.getElementById(i)?.value || 0);
    const chk = (i) => !!document.getElementById(i)?.checked;
    const type = val('pType') || 'monture';
    const spherical = {};
    const toric = {};
    OptiStore.SPH_GROUPS.forEach((g) => {
      spherical[g] = { buy: num('sgb_' + g), sell: num('sgs_' + g) };
      toric[g] = {};
      OptiStore.TOR_GROUPS.forEach((c) => { toric[g][c] = { sell: num('tg_' + g + '_' + c) }; });
    });
    const o = {
      type,
      brand: val('pBrand'),
      model: val('pModel'),
      ref: val('pRef'),
      color: val('pColor') || val('pTeinte'),
      size: val('pSize'),
      shape: val('pShape'),
      material: val('pMat'),
      indice: val('pInd'),
      power: val('pInd'),
      treatments: '',
      buy: num('pBuy') || num('pBuySphNet') || num('pBuySph'),
      sell: num('pSell') || num('pSellSphTTC') || num('pSellSphHT'),
      qty: num('pQty'),
      min: num('pMin'),
      barcode: val('pBar'),
      storeId: val('pStore') || db().currentStore,
      location: val('pLoc'),
      supplierId: val('pSup') ? +val('pSup') : '',
      antireflet: chk('pAR'),
      photochromic: chk('pPH'),
      uv: chk('pUV'),
      bc: val('pBc'),
      dia: val('pDia'),
      eye: val('pEye') || 'les deux',
      packQty: +val('pPackSel') || num('pPack') || 0,
      origin: val('pOrig'),
      family: val('pFam'),
      verreType: val('pKind'),
      lentilleType: type === 'lentille' ? val('pKind') : '',
      teinte: val('pTeinte'),
      stockKind: document.querySelector('input[name="pStockKind"]:checked')?.value || 'stock',
      note: val('pNote'),
      tva: num('pTva'),
      duree: val('pDuree'),
      buySph: num('pBuySph'), remSph: num('pRemSph'), coefSph: num('pCoefSph'),
      sellSphHT: num('pSellSphHT'), buySphNet: num('pBuySphNet'),
      buyTor: num('pBuyTor'), remTor: num('pRemTor'), coefTor: num('pCoefTor'),
      sellTorHT: num('pSellTorHT'), buyTorNet: num('pBuyTorNet'), sellTor: num('pSellTorTTC'),
      priceGrid: { cylNeg: chk('pCylNeg'), spherical, toric },
      renewMonths: type === 'lentille' ? (val('pDuree').includes('mois') ? parseInt(val('pDuree'), 10) || 1 : 1) : 0
    };
    if (!o.sell && spherical.G2?.sell) o.sell = spherical.G2.sell;
    if (!o.buy && spherical.G2?.buy) o.buy = spherical.G2.buy;
    const f = document.getElementById('pPhoto')?.files?.[0];
    if (f) o.photo = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
    if (id) Object.assign(db().products.find((x) => x.id === id), o);
    else db().products.push({ id: Date.now(), ...o });
    window._prodDraft = null;
    prodFormTab = 'fiche';
    await OptiStore.save('Produit');
    closeModal();
    toast('Produit enregistré');
    A().renderProducts();
  }

  function renderCaisseJour() {
    const c = OptiStore.openCashSession();
    const today = OptiStore.todayISO();
    const sales = db().sales.filter((s) => s.date === today && s.status !== 'retour');
    const ca = sales.reduce((a, s) => a + (s.paid || 0), 0);
    const especes = sales.filter((s) => /espèce/i.test(s.method || '')).reduce((a, s) => a + (s.paid || 0), 0);
    const other = ca - especes;
    const unpaid = sales.reduce((a, s) => a + Math.max(0, s.total - (s.coverAmount || 0) - s.paid), 0);
    const expected = c ? c.openingFloat + (c.salesCash || 0) : 0;
    shell('caisse', `
      <h1 class="h1">Clôturer la caisse</h1>
      <div class="sub">Fond de caisse, encaissements du jour, écart et impression de la clôture.</div>
      ${OptiOps.cashBanner()}
      <div class="grid4">
        <div class="card kpi"><div class="label">Fond</div><div class="n">${money(c?.openingFloat || 0)}</div></div>
        <div class="card kpi"><div class="label">Encaissé jour</div><div class="n">${money(ca)}</div></div>
        <div class="card kpi"><div class="label">Espèces</div><div class="n">${money(c?.salesCash || especes)}</div></div>
        <div class="card kpi"><div class="label">Impayés jour</div><div class="n">${money(unpaid)}</div></div>
      </div>
      <div class="card" style="margin-top:16px">
        <p>Théorique espèces (fond + ventes espèces) : <b>${money(expected)}</b></p>
        <p class="muted">CIB ${money(c?.salesCIB || 0)} · Edahabia ${money(c?.salesEdahabia || 0)} · Autres ${money(c?.salesOther || other)}</p>
        <div class="toolbar">
          ${c ? `<button class="btn gold" onclick="OptiApp.closeCash()">Clôturer maintenant</button>
            <button class="btn" onclick="OptiApp.printCashClose()">Imprimer le journal</button>` : `<button class="btn gold" onclick="OptiApp.openCash()">Ouvrir la caisse</button>`}
        </div>
      </div>
      <div class="card tablewrap" style="margin-top:16px">
        <strong>Ventes du ${esc(today)}</strong>
        <table class="data"><thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Payé</th><th>Mode</th><th>Livré</th></tr></thead>
        <tbody>${sales.map((s) => `<tr><td>${s.opNum || s.id}</td><td>${esc(OptiStore.clientName(s.clientId))}</td><td>${money(s.total)}</td><td>${money(s.paid)}</td><td>${esc(s.method || '')}</td><td>${s.delivered ? 'Oui' : 'Non'}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Aucune vente aujourd’hui.</td></tr>'}</tbody></table>
      </div>
      <div class="card" style="margin-top:16px">
        <strong>Historique des sessions</strong>
        ${(db().cashSessions || []).slice().reverse().slice(0, 12).map((x) => `<div class="alert">${esc(x.date)} · ${x.status === 'open' ? 'ouverte' : 'clôturée'} · fond ${money(x.openingFloat || 0)} · espèces ${money(x.salesCash || 0)} · écart ${money(x.difference || 0)}</div>`).join('') || '<p class="muted">Aucune session.</p>'}
      </div>
    `);
  }

  function printCashClose() {
    const c = OptiStore.openCashSession() || (db().cashSessions || []).slice(-1)[0];
    const today = c?.date || OptiStore.todayISO();
    const sales = db().sales.filter((s) => s.date === today && s.status !== 'retour');
    const ca = sales.reduce((a, s) => a + (s.paid || 0), 0);
    OptiOps.printDoc('Clôture caisse ' + today, OptiOps.docFrame
      ? `<div class="sheet"><div class="wrap">
          <h2>Clôture de caisse — ${esc(today)}</h2>
          <p>${esc(db().shop.name)} · ${esc(c?.status === 'open' ? 'session ouverte' : 'session clôturée')}</p>
          <table><thead><tr><th>Opération</th><th>Client</th><th class="r">Payé</th><th>Mode</th></tr></thead>
          <tbody>${sales.map((s) => `<tr><td>${esc(String(s.opNum || s.id))}</td><td>${esc(OptiStore.clientName(s.clientId))}</td><td class="r">${money(s.paid)}</td><td>${esc(s.method || '')}</td></tr>`).join('')}</tbody></table>
          <p>Fond ${money(c?.openingFloat || 0)} · Encaissé ${money(ca)} · Espèces ${money(c?.salesCash || 0)} · Écart ${money(c?.difference || 0)}</p>
        </div></div>`
      : `<h2>Clôture ${esc(today)}</h2><p>Encaissé ${money(ca)}</p>`, 'a4');
  }

  return {
    renderAtelier, saveAtelier, fillClientFromSelect, openAtelierFor, onBirthChange, recalcOp, onProductPick, copyOdToOg,
    printRecu, renderTables, setTableKey, addTableRow, delTableRow,
    editProduct, saveProduct, setProdFormTab, switchProdType, applyGridBuy, calcGridSell,
    renderCaisseJour,     printCashClose
  };
})();

async function markDelivered(id) {
  const s = OptiStore.get().sales.find((x) => x.id === id);
  if (!s) return;
  s.delivered = true;
  (s.items || []).forEach((i) => { i.delivered = true; });
  await OptiStore.save('Livraison ' + id);
  window.OptiApp.toast('Marqué livré');
  window.OptiApp.renderSales();
}

if (window.OptiApp) Object.assign(window.OptiApp, window.OptiAtelier, { markDelivered });
