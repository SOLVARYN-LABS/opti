window.OptiLicense = (function () {
  const VAULT_KEY = 'optidz_license_vault_v1';
  const OWNER_SESSION = 'optidz_owner_session_v1';
  const PENDING_KEY = 'optidz_pending_license_v1';
  const USED_KEY = 'optidz_used_licenses_v1';
  const TRIAL_DAYS = 7;
  const OWNER_DEFAULT_PASS = 'OptiAdmin#2026';
  const SECRET = 'OptiDZ-License-Core-2026-v1';

  function uid(p) {
    return p + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  async function hash(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('optidz-lic:' + text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function syncChecksum(body) {
    // Checksum déterministe synchrone (hors crypto) pour validation offline rapide
    let h = 2166136261;
    const s = SECRET + '|' + body;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    let n = h >>> 0;
    for (let i = 0; i < 4; i++) {
      out += alphabet[n % alphabet.length];
      n = Math.floor(n / alphabet.length) ^ (h >>> (i * 3));
    }
    return out;
  }

  function normalizeCode(code) {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{4})/g, '$1-').replace(/-$/, '');
  }

  function rawCode(code) {
    return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function randomPart(n) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < n; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
  }

  /** ESSAI-T7XX-XXXX-SSSS ou PRO-P0XX-XXXX-SSSS */
  function makeCode(type) {
    const prefix = type === 'paid' ? 'PRO' : 'ESSAI';
    const kind = type === 'paid' ? 'P0' : 'T7';
    const body = kind + randomPart(6);
    const sig = syncChecksum(body);
    return normalizeCode(prefix + body + sig);
  }

  function parseSignedCode(code) {
    const raw = rawCode(code);
    // Accepte ESSAIT7......sig ou PROT0......sig ou corps seul T7... / P0...
    let core = raw;
    if (core.startsWith('ESSAI')) core = core.slice(5);
    else if (core.startsWith('PRO')) core = core.slice(3);
    if (core.length < 12) return null;
    const body = core.slice(0, -4);
    const sig = core.slice(-4);
    if (syncChecksum(body) !== sig) return null;
    if (body.startsWith('T7')) return { type: 'trial', days: TRIAL_DAYS, body, raw };
    if (body.startsWith('P0')) return { type: 'paid', days: 0, body, raw };
    return null;
  }

  function readUsed() {
    try {
      return JSON.parse(localStorage.getItem(USED_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function markUsed(raw, meta) {
    const u = readUsed();
    u[raw] = Object.assign({ usedAt: Date.now() }, meta || {});
    localStorage.setItem(USED_KEY, JSON.stringify(u));
  }

  function isLocallyUsed(raw) {
    return !!readUsed()[raw];
  }

  function readVault() {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeVault(v) {
    const json = JSON.stringify(v);
    localStorage.setItem(VAULT_KEY, json);
    if (window.optidzDesktop?.saveVault) {
      try { window.optidzDesktop.saveVault(json); } catch {}
    }
    return v;
  }

  async function hydrateVaultFromDesktop() {
    if (!window.optidzDesktop?.loadVault) return;
    try {
      const raw = await window.optidzDesktop.loadVault();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        localStorage.setItem(VAULT_KEY, raw);
      }
    } catch {}
  }

  async function ensureVault() {
    await hydrateVaultFromDesktop();
    let v = readVault();
    if (!v) {
      v = {
        version: 1,
        ownerPassHash: await hash(OWNER_DEFAULT_PASS),
        licenses: [],
        shops: [],
        users: [],
        control: { globalBlock: false, globalMessage: '' },
        createdAt: Date.now()
      };
      for (let i = 0; i < 3; i++) {
        const code = makeCode('trial');
        v.licenses.push({
          id: uid('lic'),
          code,
          type: 'trial',
          days: TRIAL_DAYS,
          note: 'Clé essai initiale',
          clientName: '',
          clientPhone: '',
          status: 'available',
          createdAt: Date.now(),
          activatedAt: null,
          expiresAt: null,
          shopName: '',
          shopEmail: ''
        });
      }
      writeVault(v);
    }
    if (!v.ownerPassHash) {
      v.ownerPassHash = await hash(OWNER_DEFAULT_PASS);
      writeVault(v);
    }
    v.licenses = v.licenses || [];
    v.shops = v.shops || [];
    v.users = v.users || [];
    v.control = v.control || { globalBlock: false, globalMessage: '' };
    if (!v.licenses.some((l) => l.type === 'paid')) {
      for (let i = 0; i < 3; i++) {
        v.licenses.unshift({
          id: uid('lic'),
          code: makeCode('paid'),
          type: 'paid',
          days: 0,
          note: 'Clé achat initiale',
          clientName: '',
          clientPhone: '',
          status: 'available',
          createdAt: Date.now(),
          activatedAt: null,
          expiresAt: null,
          shopName: '',
          shopEmail: ''
        });
      }
    }
    writeVault(v);
    return v;
  }

  function listLicenses() {
    const v = readVault();
    const list = (v?.licenses || []).slice();
    list.forEach((l) => {
      if (l.type === 'trial' && l.expiresAt && l.expiresAt < Date.now() && l.status === 'active') {
        l.status = 'expired';
      }
    });
    if (v) writeVault(v);
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async function createLicense({ type, note, clientName, clientPhone, days } = {}) {
    const v = await ensureVault();
    const isTrial = (type || 'trial') === 'trial';
    const lic = {
      id: uid('lic'),
      code: makeCode(isTrial ? 'trial' : 'paid'),
      type: isTrial ? 'trial' : 'paid',
      days: isTrial ? (days || TRIAL_DAYS) : 0,
      note: note || '',
      clientName: clientName || '',
      clientPhone: clientPhone || '',
      status: 'available',
      createdAt: Date.now(),
      activatedAt: null,
      expiresAt: null,
      shopName: '',
      shopEmail: ''
    };
    v.licenses.unshift(lic);
    writeVault(v);
    return lic;
  }

  function findByCode(code) {
    const raw = rawCode(code);
    return listLicenses().find((l) => rawCode(l.code) === raw) || null;
  }

  function saveLicense(lic) {
    const v = readVault();
    if (!v) return null;
    const i = v.licenses.findIndex((x) => x.id === lic.id);
    if (i < 0) {
      v.licenses.unshift(lic);
    } else {
      v.licenses[i] = lic;
    }
    writeVault(v);
    return lic;
  }

  function revokeLicense(id) {
    const v = readVault();
    const lic = (v?.licenses || []).find((x) => x.id === id);
    if (!lic) return false;
    lic.status = 'revoked';
    writeVault(v);
    return true;
  }

  function deleteLicense(id) {
    const v = readVault();
    if (!v) return false;
    v.licenses = (v.licenses || []).filter((x) => x.id !== id);
    writeVault(v);
    return true;
  }

  function extendLicense(id, extraDays) {
    const v = readVault();
    const lic = (v?.licenses || []).find((x) => x.id === id);
    if (!lic) return null;
    const add = (extraDays || TRIAL_DAYS) * 86400000;
    if (lic.expiresAt && lic.expiresAt > Date.now()) lic.expiresAt += add;
    else lic.expiresAt = Date.now() + add;
    if (lic.status === 'expired') lic.status = 'active';
    writeVault(v);
    return lic;
  }

  function setPending(lic) {
    localStorage.setItem(PENDING_KEY, JSON.stringify({
      id: lic.id || '',
      code: lic.code,
      type: lic.type,
      days: lic.days || TRIAL_DAYS
    }));
  }

  function getPending() {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearPending() {
    try { localStorage.removeItem(PENDING_KEY); } catch {}
  }

  function resolveKey(code, expectType) {
    const parsed = parseSignedCode(code);
    if (!parsed) return { ok: false, error: 'Clé invalide ou falsifiée.' };
    if (expectType && parsed.type !== expectType) {
      return {
        ok: false,
        error: expectType === 'trial'
          ? 'Cette clé n’est pas une clé d’essai.'
          : 'Cette clé n’est pas une clé d’achat.'
      };
    }
    const vaultLic = findByCode(code);
    if (vaultLic?.status === 'revoked') return { ok: false, error: 'Clé révoquée.' };
    if (isLocallyUsed(parsed.raw) || vaultLic?.status === 'active' || vaultLic?.status === 'used' || vaultLic?.status === 'expired') {
      return { ok: false, error: 'Cette clé a déjà été utilisée sur ce poste.' };
    }
    const lic = vaultLic || {
      id: uid('lic'),
      code: normalizeCode((parsed.type === 'paid' ? 'PRO' : 'ESSAI') + parsed.body + syncChecksum(parsed.body)),
      type: parsed.type,
      days: parsed.days,
      note: 'Activée hors coffre admin',
      clientName: '',
      clientPhone: '',
      status: 'available',
      createdAt: Date.now(),
      activatedAt: null,
      expiresAt: null,
      shopName: '',
      shopEmail: ''
    };
    return { ok: true, license: lic, parsed };
  }

  async function prepareTrialKey(code) {
    await ensureVault();
    const res = resolveKey(code, 'trial');
    if (!res.ok) return res;
    setPending(res.license);
    return { ok: true, license: res.license };
  }

  async function preparePaidKey(code) {
    await ensureVault();
    const res = resolveKey(code, 'paid');
    if (!res.ok) return res;
    setPending(res.license);
    return { ok: true, license: res.license };
  }

  function applyPendingToShop(db, { shopName, shopEmail } = {}) {
    const pending = getPending();
    if (!pending || !db) return null;
    const parsed = parseSignedCode(pending.code);
    if (!parsed) {
      clearPending();
      return null;
    }
    let lic = findByCode(pending.code);
    if (!lic) {
      lic = {
        id: pending.id || uid('lic'),
        code: normalizeCode((parsed.type === 'paid' ? 'PRO' : 'ESSAI') + parsed.body + syncChecksum(parsed.body)),
        type: parsed.type,
        days: parsed.days,
        note: '',
        clientName: '',
        clientPhone: '',
        status: 'available',
        createdAt: Date.now(),
        activatedAt: null,
        expiresAt: null,
        shopName: '',
        shopEmail: ''
      };
    }
    if (lic.status === 'revoked') {
      clearPending();
      return null;
    }
    const now = Date.now();
    const days = lic.type === 'trial' ? (lic.days || TRIAL_DAYS) : 0;
    const expiresAt = lic.type === 'trial' ? now + days * 86400000 : null;
    lic.status = 'active';
    lic.activatedAt = now;
    lic.expiresAt = expiresAt;
    lic.shopName = shopName || db.shop?.name || '';
    lic.shopEmail = (shopEmail || db.shop?.email || '').toLowerCase();
    saveLicense(lic);
    markUsed(parsed.raw, { type: lic.type, shopEmail: lic.shopEmail, shopName: lic.shopName });
    db.meta = db.meta || {};
    db.meta.license = {
      id: lic.id,
      code: lic.code,
      type: lic.type,
      activatedAt: now,
      expiresAt,
      days
    };
    clearPending();
    return db.meta.license;
  }

  function syncShopLicenseFromVault(db) {
    if (!db?.meta?.license?.code) return getShopStatus(db);
    const lic = findByCode(db.meta.license.code);
    if (lic) {
      if (lic.status === 'revoked') db.meta.license.revoked = true;
      if (lic.expiresAt) db.meta.license.expiresAt = lic.expiresAt;
      if (lic.type === 'paid') {
        db.meta.license.type = 'paid';
        db.meta.license.expiresAt = null;
        db.meta.license.expired = false;
      }
      if (lic.type === 'trial') {
        let exp = lic.expiresAt || db.meta.license.expiresAt;
        if (!exp && (lic.activatedAt || db.meta.license.activatedAt)) {
          exp = (lic.activatedAt || db.meta.license.activatedAt) + ((lic.days || TRIAL_DAYS) * 86400000);
        }
        if (exp) db.meta.license.expiresAt = exp;
        if (exp && Date.now() > exp) {
          if (lic.status === 'active') {
            lic.status = 'expired';
            saveLicense(lic);
          }
          db.meta.license.expired = true;
        }
      }
    } else if (db.meta.license.type === 'trial') {
      let exp = db.meta.license.expiresAt;
      if (!exp && db.meta.license.activatedAt) {
        exp = db.meta.license.activatedAt + ((db.meta.license.days || TRIAL_DAYS) * 86400000);
        db.meta.license.expiresAt = exp;
      }
      if (exp && Date.now() > exp) db.meta.license.expired = true;
    }
    return getShopStatus(db);
  }

  function getShopStatus(db) {
    const L = db?.meta?.license;
    if (!L || !L.code) {
      return { state: 'none', label: 'Aucune licence', license: null, daysLeft: 0, allowed: false };
    }
    if (L.revoked) {
      return { state: 'revoked', label: 'Licence révoquée', license: L, daysLeft: 0, allowed: false };
    }
    if (L.type === 'paid') {
      L.expired = false;
      return { state: 'paid', label: 'Licence achetée', license: L, daysLeft: Infinity, allowed: true };
    }
    // Essai 7 jours
    let exp = L.expiresAt || 0;
    if (!exp && L.activatedAt) {
      exp = L.activatedAt + ((L.days || TRIAL_DAYS) * 86400000);
      L.expiresAt = exp;
    }
    const leftMs = exp - Date.now();
    const daysLeft = Math.max(0, Math.ceil(leftMs / 86400000));
    if (!exp || leftMs <= 0 || L.expired) {
      L.expired = true;
      return {
        state: 'expired',
        label: 'Essai de ' + (L.days || TRIAL_DAYS) + ' jours terminé',
        license: L,
        daysLeft: 0,
        allowed: false,
        expiresAt: exp
      };
    }
    L.expired = false;
    return {
      state: 'trial',
      label: 'Essai — ' + daysLeft + ' j restant(s)',
      license: L,
      daysLeft,
      allowed: true,
      expiresAt: exp
    };
  }

  function activatePaidOnShop(db, code) {
    const parsed = parseSignedCode(code);
    if (!parsed || parsed.type !== 'paid') {
      return { ok: false, error: 'Clé d’achat invalide.' };
    }
    let lic = findByCode(code);
    if (lic?.status === 'revoked') return { ok: false, error: 'Clé révoquée.' };
    const shopMail = (db.shop?.email || '').toLowerCase();
    if (isLocallyUsed(parsed.raw)) {
      const used = readUsed()[parsed.raw];
      if (used?.shopEmail && used.shopEmail !== shopMail) {
        return { ok: false, error: 'Cette clé est déjà utilisée.' };
      }
    }
    if (!lic) {
      lic = {
        id: uid('lic'),
        code: normalizeCode('PRO' + parsed.body + syncChecksum(parsed.body)),
        type: 'paid',
        days: 0,
        note: '',
        clientName: '',
        clientPhone: '',
        status: 'available',
        createdAt: Date.now(),
        activatedAt: null,
        expiresAt: null,
        shopName: '',
        shopEmail: ''
      };
    }
    const now = Date.now();
    lic.status = 'active';
    lic.activatedAt = now;
    lic.expiresAt = null;
    lic.type = 'paid';
    lic.shopName = db.shop?.name || '';
    lic.shopEmail = shopMail;
    saveLicense(lic);
    markUsed(parsed.raw, { type: 'paid', shopEmail: lic.shopEmail });
    db.meta = db.meta || {};
    db.meta.license = {
      id: lic.id,
      code: lic.code,
      type: 'paid',
      activatedAt: now,
      expiresAt: null,
      days: 0
    };
    return { ok: true, license: db.meta.license };
  }

  async function ownerLogin(password) {
    const v = await ensureVault();
    const h = await hash(password || '');
    if (h !== v.ownerPassHash) return false;
    sessionStorage.setItem(OWNER_SESSION, '1');
    return true;
  }

  function ownerLogout() {
    try { sessionStorage.removeItem(OWNER_SESSION); } catch {}
  }

  function isOwnerSession() {
    try { return sessionStorage.getItem(OWNER_SESSION) === '1'; } catch { return false; }
  }

  async function changeOwnerPassword(current, next) {
    const v = await ensureVault();
    const h = await hash(current || '');
    if (h !== v.ownerPassHash) return { ok: false, error: 'Mot de passe actuel incorrect.' };
    if (!next || next.length < 8) return { ok: false, error: 'Nouveau mot de passe : 8 caractères min.' };
    v.ownerPassHash = await hash(next);
    writeVault(v);
    return { ok: true };
  }

  function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('fr-DZ');
  }

  function listShops() {
    const v = readVault();
    return (v?.shops || []).slice().sort((a, b) => (b.lastSeen || b.createdAt || 0) - (a.lastSeen || a.createdAt || 0));
  }

  function listAppUsers() {
    const v = readVault();
    return (v?.users || []).slice().sort((a, b) => (b.lastSeen || b.createdAt || 0) - (a.lastSeen || a.createdAt || 0));
  }

  function findShop(idOrEmail) {
    const key = String(idOrEmail || '').toLowerCase();
    return listShops().find((s) => s.id === idOrEmail || (s.email || '').toLowerCase() === key) || null;
  }

  /** Enregistre / met à jour le magasin + ses utilisateurs dans le coffre admin. */
  function registerShopFromDb(db) {
    if (!db?.shop) return null;
    const v = readVault();
    if (!v) return null;
    v.shops = v.shops || [];
    v.users = v.users || [];
    const email = (db.shop.email || db.session?.email || '').toLowerCase();
    if (!email && !(db.users || []).length) return null;
    const shopKey = email || ('shop-' + (db.shop.name || 'x').toLowerCase());
    let shop = v.shops.find((s) => (s.email || '').toLowerCase() === shopKey || s.id === db.meta?.shopRegistryId);
    if (!shop) {
      shop = {
        id: uid('shop'),
        shopName: db.shop.name || 'Optique',
        email: email || shopKey,
        phone: db.shop.phone || db.shop.mobile || '',
        city: db.shop.city || '',
        ownerName: db.session?.name || (db.users || [])[0]?.name || '',
        licenseCode: db.meta?.license?.code || '',
        licenseType: db.meta?.license?.type || '',
        createdAt: Date.now(),
        lastSeen: Date.now(),
        blocked: false,
        blockReason: '',
        problemNote: '',
        active: true,
        userCount: (db.users || []).length
      };
      v.shops.unshift(shop);
    } else {
      shop.shopName = db.shop.name || shop.shopName;
      shop.email = email || shop.email;
      shop.phone = db.shop.phone || db.shop.mobile || shop.phone;
      shop.city = db.shop.city || shop.city;
      shop.ownerName = db.session?.name || shop.ownerName;
      shop.licenseCode = db.meta?.license?.code || shop.licenseCode;
      shop.licenseType = db.meta?.license?.type || shop.licenseType;
      shop.lastSeen = Date.now();
      shop.userCount = (db.users || []).length;
      shop.active = true;
    }
    db.meta = db.meta || {};
    db.meta.shopRegistryId = shop.id;

    (db.users || []).forEach((u) => {
      const mail = (u.email || '').toLowerCase();
      if (!mail) return;
      let row = v.users.find((x) => (x.email || '').toLowerCase() === mail && x.shopId === shop.id);
      if (!row) {
        row = {
          id: uid('au'),
          shopId: shop.id,
          shopName: shop.shopName,
          name: u.name || '',
          email: mail,
          phone: u.phone || '',
          role: u.role || 'assistant',
          active: u.active !== false,
          blocked: false,
          blockReason: '',
          createdAt: Date.now(),
          lastSeen: Date.now()
        };
        v.users.push(row);
      } else {
        row.name = u.name || row.name;
        row.phone = u.phone || row.phone;
        row.role = u.role || row.role;
        row.active = u.active !== false;
        row.shopName = shop.shopName;
        row.lastSeen = Date.now();
      }
    });
    writeVault(v);
    return shop;
  }

  function blockShop(id, reason) {
    const v = readVault();
    const shop = (v?.shops || []).find((s) => s.id === id);
    if (!shop) return false;
    shop.blocked = true;
    shop.blockReason = reason || 'Compte suspendu par OptiDZ.';
    shop.blockedAt = Date.now();
    writeVault(v);
    return true;
  }

  function unblockShop(id) {
    const v = readVault();
    const shop = (v?.shops || []).find((s) => s.id === id);
    if (!shop) return false;
    shop.blocked = false;
    shop.blockReason = '';
    shop.blockedAt = null;
    writeVault(v);
    return true;
  }

  function setShopProblem(id, note) {
    const v = readVault();
    const shop = (v?.shops || []).find((s) => s.id === id);
    if (!shop) return false;
    shop.problemNote = note || '';
    shop.problemAt = note ? Date.now() : null;
    writeVault(v);
    return true;
  }

  function blockUser(id, reason) {
    const v = readVault();
    const u = (v?.users || []).find((x) => x.id === id);
    if (!u) return false;
    u.blocked = true;
    u.blockReason = reason || 'Utilisateur bloqué par OptiDZ.';
    writeVault(v);
    return true;
  }

  function unblockUser(id) {
    const v = readVault();
    const u = (v?.users || []).find((x) => x.id === id);
    if (!u) return false;
    u.blocked = false;
    u.blockReason = '';
    writeVault(v);
    return true;
  }

  function setGlobalBlock(on, message) {
    const v = readVault();
    if (!v) return false;
    v.control = v.control || {};
    v.control.globalBlock = !!on;
    v.control.globalMessage = on ? (message || 'Application temporairement suspendue par OptiDZ.') : '';
    v.control.updatedAt = Date.now();
    writeVault(v);
    return true;
  }

  function getControl() {
    const v = readVault();
    return v?.control || { globalBlock: false, globalMessage: '' };
  }

  /** Statut blocage pour le magasin courant (global, magasin, ou user session). */
  function getAccessControl(db) {
    const ctrl = getControl();
    if (ctrl.globalBlock) {
      return {
        blocked: true,
        scope: 'global',
        reason: ctrl.globalMessage || 'Application suspendue par OptiDZ.'
      };
    }
    const email = (db?.shop?.email || db?.session?.email || '').toLowerCase();
    const shop = email ? findShop(email) : (db?.meta?.shopRegistryId ? findShop(db.meta.shopRegistryId) : null);
    if (shop?.blocked) {
      return {
        blocked: true,
        scope: 'shop',
        reason: shop.blockReason || 'Ce magasin a été bloqué par OptiDZ.',
        problemNote: shop.problemNote || ''
      };
    }
    const userMail = (db?.session?.email || '').toLowerCase();
    if (userMail) {
      const u = listAppUsers().find((x) => (x.email || '').toLowerCase() === userMail && (!shop || x.shopId === shop.id));
      if (u?.blocked) {
        return {
          blocked: true,
          scope: 'user',
          reason: u.blockReason || 'Votre compte a été bloqué par OptiDZ.'
        };
      }
    }
    const note = shop?.problemNote || '';
    return { blocked: false, scope: null, reason: '', problemNote: note };
  }

  function syncControlToShop(db) {
    if (!db) return getAccessControl(db);
    const st = getAccessControl(db);
    db.meta = db.meta || {};
    db.meta.control = {
      blocked: !!st.blocked,
      reason: st.reason || '',
      problemNote: st.problemNote || '',
      scope: st.scope || null,
      checkedAt: Date.now()
    };
    return st;
  }

  function stats() {
    const list = listLicenses();
    const shops = listShops();
    return {
      total: list.length,
      availableTrial: list.filter((l) => l.type === 'trial' && l.status === 'available').length,
      activeTrial: list.filter((l) => l.type === 'trial' && l.status === 'active').length,
      expired: list.filter((l) => l.status === 'expired' || (l.type === 'trial' && l.expiresAt && l.expiresAt < Date.now())).length,
      paid: list.filter((l) => l.type === 'paid' && (l.status === 'active' || l.status === 'available')).length,
      revoked: list.filter((l) => l.status === 'revoked').length,
      shops: shops.length,
      blockedShops: shops.filter((s) => s.blocked).length,
      users: listAppUsers().length,
      globalBlock: !!getControl().globalBlock
    };
  }

  return {
    TRIAL_DAYS,
    OWNER_DEFAULT_PASS,
    ensureVault,
    normalizeCode,
    listLicenses,
    createLicense,
    findByCode,
    revokeLicense,
    deleteLicense,
    extendLicense,
    prepareTrialKey,
    preparePaidKey,
    getPending,
    clearPending,
    setPending,
    applyPendingToShop,
    syncShopLicenseFromVault,
    getShopStatus,
    activatePaidOnShop,
    ownerLogin,
    ownerLogout,
    isOwnerSession,
    changeOwnerPassword,
    stats,
    formatDate,
    parseSignedCode,
    listShops,
    listAppUsers,
    findShop,
    registerShopFromDb,
    blockShop,
    unblockShop,
    setShopProblem,
    blockUser,
    unblockUser,
    setGlobalBlock,
    getControl,
    getAccessControl,
    syncControlToShop
  };
})();
