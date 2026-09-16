window.OptiStore = (function () {
  const KEY = 'optidz_ai_v3';
  const KEY_DEMO = 'optidz_ai_v3_demo';
  const KEY_REAL = 'optidz_ai_v3_real';
  const DEMO_EMAIL = 'demo@optidz.dz';
  const ROLES = {
    admin: '*',
    opticien: ['dashboard','clients','rx','atelier','caisse','tables','products','stock','sales','quotes','orders','purchases','suppliers','rdv','finance','reports','ai','ocr','notifications','settings'],
    vendeur: ['dashboard','clients','atelier','caisse','products','stock','sales','quotes','orders','rdv','notifications'],
    assistant: ['dashboard','clients','rdv','ai','notifications']
  };

  const todayISO = () => new Date().toISOString().slice(0, 10);
  const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  const SPH_GROUPS = ['G2','G4','G6','G8','G10','G12','G14','G16','G18','G20','G22','G24','G26','G28','G30','G32+'];
  const TOR_GROUPS = ['G2','G4','G6','G8','G10'];

  function defaultRefTables() {
    return {
      marques: ['BOLON','POLAR','SOLECO','CORNELIA','BAUSCH LOMB','ELITE','JOOLY','GAUSS','CHEZ COLETTE','A F','A Z','ABORIGINAL','AIR FORCE','AIR LITE','ALBATROSS','AMARCORD','ANA HICKMANN','APLIQUE','ARMONY','AUZIA','RAY-BAN','ESSILOR','HOYA'],
      matieresVerre: ['Organique','Minéral','Polycarbonate','Trivex'],
      indices: ['1.50','1.56','1.60','1.67','1.74'],
      origines: ['France','Italie','Chine','Allemagne','Corée','USA','Algérie'],
      typesVerre: ['Unifocal','Bifocal','Progressif','Anti-fatigue','Bureau'],
      typesLentille: ['Journalière','Mensuelle','Hebdomadaire','Annuelle','Couleur'],
      matieresLentille: ['Hydrogel','Silicone hydrogel','Silicone'],
      packagesLentille: ['1','3','6','30','90'],
      dureesLentille: ['1 jour','15 jours','1 mois','3 mois','6 mois','1 an'],
      prescripteurs: [],
      professions: ['Fonctionnaire','Commerçant','Étudiant','Retraité','Sans emploi','Autre'],
      categories1: ['Homme','Femme','Enfant','Unisexe'],
      categories2: ['Vue','Solaire','Sport'],
      banques: ['CPA','BNA','BEA','CNEP','BNP','Société Générale'],
      agences: [],
      reglements: ['Espèces','Carte CIB','Edahabia','Virement','Chèque','CNAS'],
      entrees: ['Achat','Retour client','Inventaire +','Transfert in'],
      sorties: ['Vente','Casse','Inventaire −','Transfert out'],
      magasins: [],
      famillesVerre: ['Blanc','Blue cut','Photochromique','Anti-reflet','Teinté']
    };
  }

  function emptyEye() {
    return { sph: '', cyl: '', axis: '', add: '', prism: '', base: '' };
  }
  function normalizeEye(e) {
    e = e || {};
    if (e.loin || e.pres || e.inter) {
      return {
        loin: Object.assign(emptyEye(), e.loin || {}),
        inter: Object.assign(emptyEye(), e.inter || {}),
        pres: Object.assign(emptyEye(), e.pres || {}),
        ecart: e.ecart || e.pdR || '',
        hauteur: e.hauteur || ''
      };
    }
    return {
      loin: { sph: e.sph || '', cyl: e.cyl || '', axis: e.axis || '', add: e.add || '', prism: e.prism || '', base: e.base || '' },
      inter: emptyEye(),
      pres: emptyEye(),
      ecart: e.pdR || '',
      hauteur: ''
    };
  }

  function clientCredit(id, d) {
    const data = d || db;
    return (data.sales || []).filter((s) => s.clientId == id && s.status !== 'retour')
      .reduce((a, s) => a + Math.max(0, (s.total || 0) - (s.coverAmount || 0) - (s.paid || 0)), 0);
  }
  function lastVisit(id, d) {
    const data = d || db;
    const dates = (data.sales || []).filter((s) => s.clientId == id).map((s) => s.date).sort();
    return dates.length ? dates[dates.length - 1] : '';
  }
  function nextOpNum(d) {
    const data = d || db;
    const n = (data.sales || []).reduce((m, s) => Math.max(m, +s.opNum || 0), 0);
    return n + 1;
  }

  async function hashPassword(password) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('optidz:' + password));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function seed() {
    return {
      meta: { version: 2, created: Date.now(), mode: 'demo' },
      shop: {
        name: 'Optique Démo',
        slogan: "L'intelligence au service de l'optique algérienne.",
        logo: '',
        address: '12 Rue Didouche Mourad, Alger Centre',
        city: 'Alger',
        phone: '023 12 34 56',
        mobile: '0550 00 11 22',
        email: 'demo@optidz.dz',
        nif: '099912345612345',
        rc: '16/00-1234567B16',
        currency: 'DZD',
        currencyLabel: 'DA',
        taxEnabled: false,
        taxRate: 0,
        language: 'fr',
        aiEnabled: true,
        barcodeEnabled: true,
        scannerType: 'usb_hid',
        scannerBaud: 9600,
        loyaltyEnabled: true,
        loyaltyPointsPer100: 1,
        loyaltyDAPer100pts: 100,
        rxValidityMonths: 24,
        autoBackupHours: 6,
        lastBackup: 0,
        paymentMethods: ['Espèces', 'Carte CIB', 'Carte Edahabia', 'Virement', 'Chèque'],
        hours: 'Dim–Jeu 09:00–19:00 · Ven 09:00–12:00',
        minStockDefault: 3,
        notificationsOn: true,
        coverOrgs: ['Aucune', 'CNAS', 'CASNOS', 'Mutuelle', 'Entreprise'],
        ticketFooter: 'Merci de votre visite'
      },
      stores: [{ id: 's1', name: 'Alger Centre', city: 'Alger', phone: '0550 00 11 22' }],
      currentStore: 's1',
      users: [
        { id: 'u-demo', name: 'Amel Démo', email: 'demo@optidz.dz', phone: '0550 00 11 22', role: 'admin', password: 'Demo1234', active: true }
      ],
      session: null,
      refTables: defaultRefTables(),
      clients: [
        { id: 1, firstName: 'Amine', lastName: 'Benali', civility: 'Monsieur', profession: '', phone: '0555 12 34 56', email: 'amine.benali@email.dz', address: 'Hydra, Alger', birth: '1992-03-14', notes: '', extra: '', loyalty: 120, created: '2026-01-12' },
        { id: 2, firstName: 'Sara', lastName: 'Haddad', phone: '0661 22 33 44', email: 'sara.haddad@email.dz', address: 'Bir Mourad Raïs', birth: '1988-07-02', notes: '', extra: '', loyalty: 80, created: '2026-02-03' },
        { id: 3, firstName: 'Nadia', lastName: 'Mansouri', phone: '0770 45 67 89', email: 'nadia.m@email.dz', address: 'Oran Centre', birth: '1979-11-21', notes: '', extra: '', loyalty: 210, created: '2025-11-08' }
      ],
      prescriptions: [
        { id: 1, clientId: 1, date: '2026-09-08', doctor: 'Dr. Hamidi', od: { sph: '-2.00', cyl: '-0.50', axis: '90', add: '', prism: '', base: '' }, og: { sph: '-1.75', cyl: '-0.25', axis: '85', add: '', prism: '', base: '' }, pd: '62', pdR: '31', pdL: '31', height: '22', vcd: '12', panto: '8', type: 'Loin', notes: '', photo: '', conf: {} },
        { id: 2, clientId: 3, date: '2024-03-12', doctor: 'Dr. Bensaïd', od: { sph: '+1.50', cyl: '-0.75', axis: '180', add: '+2.00', prism: '', base: '' }, og: { sph: '+1.25', cyl: '-0.50', axis: '175', add: '+2.00', prism: '', base: '' }, pd: '63', pdR: '31.5', pdL: '31.5', height: '20', vcd: '12', panto: '8', type: 'Progressif', notes: 'À renouveler', photo: '', conf: {} }
      ],
      products: [
        { id: 1, type: 'monture', brand: 'Ray-Ban', model: 'RB 5228', ref: 'FR-001', color: 'Noir', size: '54-18-145', shape: 'Rectangle', material: 'Acétate', buy: 11000, sell: 18500, qty: 8, min: 2, storeId: 's1', barcode: '6130000000016', photo: '', gender: 'unisexe', location: 'A1', supplierId: 1 },
        { id: 2, type: 'monture', brand: 'OptiLine', model: 'Classic', ref: 'FR-002', color: 'Écaille', size: '52-17-140', shape: 'Papillon', material: 'Acétate', buy: 6500, sell: 12000, qty: 2, min: 3, storeId: 's1', barcode: '6130000000023', photo: '', gender: 'femme' },
        { id: 3, type: 'verre', brand: 'Essilor', model: '1.56 AR', ref: 'VL-001', indice: '1.56', material: 'Organique', treatments: 'Anti-reflet', antireflet: true, photochromic: false, uv: true, buy: 4200, sell: 8500, qty: 14, min: 5, storeId: 's1', barcode: '6130000000047', photo: '' },
        { id: 4, type: 'verre', brand: 'Essilor', model: '1.67 Blue Cut', ref: 'VL-002', indice: '1.67', material: 'Organique', treatments: 'Blue cut', antireflet: true, photochromic: false, uv: true, buy: 7600, sell: 14500, qty: 1, min: 3, storeId: 's1', barcode: '6130000000054', photo: '' },
        { id: 5, type: 'accessoire', brand: 'OptiLine', model: 'Étui rigide', ref: 'AC-001', buy: 500, sell: 1200, qty: 25, min: 5, storeId: 's1', barcode: '6130000000085', photo: '' },
        { id: 6, type: 'lentille', brand: 'Acuvue', model: 'Oasys', ref: 'LC-001', color: '', size: '', bc: '8.4', dia: '14.0', power: '-2.00', eye: 'les deux', renewMonths: 1, packQty: 6, buy: 2800, sell: 4500, qty: 12, min: 4, storeId: 's1', barcode: '6130000000092', photo: '' }
      ],
      movements: [
        { id: 'm1', date: '2026-09-08 10:30', productId: 1, type: 'Sortie', qty: -1, motif: 'Vente', storeId: 's1' }
      ],
      sales: [
        { id: 'V-2026-001', date: todayISO(), clientId: 1, items: [{ productId: 1, q: 1, price: 18500, discount: 0 }], discount: 0, tax: 0, total: 18500, paid: 18500, method: 'Espèces', storeId: 's1', userId: 'u-demo', status: 'payée', coverOrg: 'Aucune', coverAmount: 0, payments: [{ date: todayISO(), amount: 18500, method: 'Espèces' }] },
        { id: 'V-2026-002', date: '2026-09-07', clientId: 2, items: [{ productId: 2, q: 1, price: 12000, discount: 0 }], discount: 0, tax: 0, total: 12000, paid: 6000, method: 'Carte CIB', storeId: 's1', userId: 'u-demo', status: 'partielle', coverOrg: 'CNAS', coverAmount: 0, payments: [{ date: '2026-09-07', amount: 6000, method: 'Carte CIB' }] }
      ],
      orders: [
        { id: 'CMD-001', kind: 'lunettes', clientId: 1, product: 'Ray-Ban RB 5228 + verres 1.56', supplierId: 1, advance: 10000, total: 27000, remain: 17000, due: '2026-09-12', status: 'En fabrication', storeId: 's1', notes: '' }
      ],
      orderStatuses: ['Nouvelle', 'En préparation', 'Commandée', 'En fabrication', 'Reçue', 'Prête', 'Livrée', 'Annulée'],
      suppliers: [
        { id: 1, name: 'Opti Distribution Alger', contact: 'Karim Ziani', phone: '0550 11 22 33', email: 'karim@optidist.dz', address: 'Rouiba', products: 'Montures, accessoires', purchases: 245000, debt: 38000 }
      ],
      appointments: [
        { id: 'r1', clientId: 1, date: todayISO(), time: '10:00', reason: 'Ajustement monture', status: 'confirmé', notes: '' }
      ],
      expenses: [
        { id: 'e1', date: '2026-09-01', label: 'Loyer', amount: 180000, cat: 'Local' }
      ],
      invoices: [
        { id: 'FAC-2026-001', date: todayISO(), clientId: 1, saleId: 'V-2026-001', total: 18500, paid: 18500, status: 'Payée' }
      ],
      notifications: [],
      audit: [],
      contacts: [],
      quotes: [
        { id: 'DEV-001', date: todayISO(), clientId: 2, items: [{ productId: 2, q: 1, price: 12000, label: 'OptiLine Classic' }, { productId: 3, q: 2, price: 8500, label: 'Essilor 1.56 AR' }], total: 29000, status: 'envoyé', orderId: '', saleId: '', notes: 'Monture + verres anti-reflet' }
      ],
      purchaseOrders: [
        { id: 'BC-001', date: todayISO(), supplierId: 1, items: [{ productId: 4, q: 6, buy: 7600, received: 0 }], status: 'envoyée', total: 45600, notes: 'Verres 1.67 Blue Cut' }
      ],
      cashSessions: [],
      inventories: [],
      loyaltyLog: [
        { date: '2026-01-12', clientId: 1, pts: 120, reason: 'Solde initial', saleId: '' }
      ],
      resets: [],
      returns: [],
      transfers: [],
      cart: []
    };
  }

  function emptyShop({ name, email, city, phone } = {}) {
    const shopName = name || 'Mon optique';
    return {
      meta: { version: 2, created: Date.now(), mode: 'real' },
      shop: {
        name: shopName,
        slogan: "L'intelligence au service de l'optique algérienne.",
        logo: '',
        address: '',
        city: city || '',
        phone: phone || '',
        mobile: phone || '',
        email: email || '',
        nif: '',
        rc: '',
        currency: 'DZD',
        currencyLabel: 'DA',
        taxEnabled: false,
        taxRate: 0,
        language: 'fr',
        aiEnabled: true,
        barcodeEnabled: true,
        scannerType: 'usb_hid',
        scannerBaud: 9600,
        loyaltyEnabled: true,
        loyaltyPointsPer100: 1,
        loyaltyDAPer100pts: 100,
        rxValidityMonths: 24,
        autoBackupHours: 6,
        lastBackup: 0,
        paymentMethods: ['Espèces', 'Carte CIB', 'Carte Edahabia', 'Virement', 'Chèque'],
        hours: 'Dim–Jeu 09:00–19:00 · Ven 09:00–12:00',
        minStockDefault: 3,
        notificationsOn: true,
        coverOrgs: ['Aucune', 'CNAS', 'CASNOS', 'Mutuelle', 'Entreprise'],
        ticketFooter: 'Merci de votre visite'
      },
      stores: [{ id: 's1', name: shopName, city: city || '', phone: phone || '' }],
      currentStore: 's1',
      users: [],
      session: null,
      refTables: defaultRefTables(),
      clients: [],
      prescriptions: [],
      products: [],
      movements: [],
      sales: [],
      orders: [],
      orderStatuses: ['Nouvelle', 'En préparation', 'Commandée', 'En fabrication', 'Reçue', 'Prête', 'Livrée', 'Annulée'],
      suppliers: [],
      appointments: [],
      expenses: [],
      invoices: [],
      notifications: [],
      audit: [],
      contacts: [],
      quotes: [],
      purchaseOrders: [],
      cashSessions: [],
      inventories: [],
      loyaltyLog: [],
      resets: [],
      returns: [],
      transfers: [],
      cart: [],
      pendingDiscount: 0,
      pendingClientId: 0
    };
  }

  let db = null;
  const listeners = [];

  function storageKey() {
    return db?.meta?.mode === 'demo' ? KEY_DEMO : KEY_REAL;
  }

  function readLocal(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeLocal(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }

  let persistTimer = null;
  async function persist(immediate) {
    if (!db) return;
    const run = async () => {
      const safe = Object.assign({}, db, { shop: Object.assign({}, db.shop || {}) });
      if (safe.shop) delete safe.shop.claudeKey;
      const json = JSON.stringify(safe);
      writeLocal(storageKey(), safe);
      try { localStorage.setItem(KEY, json); } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
          console.warn('localStorage plein — données gardées via IndexedDB / fichier');
        }
      }
      if (db.meta?.mode === 'real') {
        if (window.optidzDesktop?.save) {
          try { await window.optidzDesktop.save(json); } catch {}
        }
        if (window.OptiDB?.save) {
          try { await OptiDB.save(safe); } catch {}
        }
      }
    };
    if (immediate) {
      if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
      return run();
    }
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => { persistTimer = null; run(); }, 280);
  }

  function notify() {
    buildNotifications();
    listeners.forEach((fn) => fn(db));
  }

  function addMonths(iso, months) {
    const d = new Date((iso || todayISO()) + 'T12:00:00');
    d.setMonth(d.getMonth() + (months || 0));
    return d.toISOString().slice(0, 10);
  }

  function rxExpiry(r) {
    const months = db.shop?.rxValidityMonths || 24;
    return addMonths(r.date, months);
  }

  function isRxExpired(r) {
    return rxExpiry(r) < todayISO();
  }

  function isRxSoon(r) {
    const exp = rxExpiry(r);
    const soon = addMonths(todayISO(), 2);
    return exp >= todayISO() && exp <= soon;
  }

  function waDigits(phone) {
    let d = String(phone || '').replace(/\D/g, '');
    if (d.startsWith('0')) d = '213' + d.slice(1);
    if (!d.startsWith('213') && d.length === 9) d = '213' + d;
    return d;
  }

  function waLink(phone, text) {
    return 'https://wa.me/' + waDigits(phone) + '?text=' + encodeURIComponent(text || '');
  }

  function openCashSession() {
    return (db.cashSessions || []).find((s) => s.status === 'open') || null;
  }

  function isDemoMode(d) {
    const m = d || db;
    return (m?.meta?.mode || 'demo') === 'demo';
  }

  function migrate(d) {
    d.meta = d.meta || { version: 2, created: Date.now() };
    if (!d.meta.mode) d.meta.mode = d.shop?.email === DEMO_EMAIL || d.shop?.name === 'Optique Démo' ? 'demo' : 'real';
    d.quotes = d.quotes || [];
    d.purchaseOrders = d.purchaseOrders || [];
    d.cashSessions = d.cashSessions || [];
    d.inventories = d.inventories || [];
    d.loyaltyLog = d.loyaltyLog || [];
    d.returns = d.returns || [];
    d.transfers = d.transfers || [];
    d.cart = d.cart || [];
    d.clients = d.clients || [];
    d.prescriptions = d.prescriptions || [];
    d.products = d.products || [];
    d.movements = d.movements || [];
    d.sales = d.sales || [];
    d.orders = d.orders || [];
    d.suppliers = d.suppliers || [];
    d.appointments = d.appointments || [];
    d.expenses = d.expenses || [];
    d.invoices = d.invoices || [];
    d.notifications = d.notifications || [];
    d.contacts = d.contacts || [];
    d.users = d.users || [];
    d.session = d.session || null;
    d.shop = d.shop || {};
    d.shop.loyaltyPointsPer100 = d.shop.loyaltyPointsPer100 ?? 1;
    d.shop.loyaltyDAPer100pts = d.shop.loyaltyDAPer100pts ?? 100;
    d.shop.rxValidityMonths = d.shop.rxValidityMonths ?? 24;
    d.shop.autoBackupHours = d.shop.autoBackupHours ?? 6;
    d.shop.lastBackup = d.shop.lastBackup || 0;
    d.shop.coverOrgs = d.shop.coverOrgs || ['Aucune', 'CNAS', 'CASNOS', 'Mutuelle', 'Entreprise'];
    d.shop.rc = d.shop.rc || '';
    d.shop.hours = d.shop.hours || 'Dim–Jeu 09:00–19:00 · Ven 09:00–12:00';
    d.shop.ticketFooter = d.shop.ticketFooter || 'Merci de votre visite';
    d.shop.minStockDefault = d.shop.minStockDefault ?? 3;
    d.shop.barcodeEnabled = d.shop.barcodeEnabled !== false;
    d.shop.scannerType = d.shop.scannerType || 'usb_hid';
    d.shop.scannerBaud = d.shop.scannerBaud || 9600;
    d.shop.notificationsOn = d.shop.notificationsOn !== false;
    d.shop.paymentMethods = d.shop.paymentMethods || ['Espèces', 'Carte CIB', 'Carte Edahabia', 'Virement', 'Chèque'];
    d.orderStatuses = d.orderStatuses || ['Nouvelle', 'En préparation', 'Commandée', 'En fabrication', 'Reçue', 'Prête', 'Livrée', 'Annulée'];
    d.stores = d.stores || [{ id: 's1', name: d.shop.name || 'Magasin', city: d.shop.city || '', phone: d.shop.phone || '' }];
    d.currentStore = d.currentStore || 's1';
    (d.suppliers || []).forEach((s) => { s.payments = s.payments || []; });
    d.shop.loyaltyEnabled = d.shop.loyaltyEnabled !== false;
    d.pendingDiscount = d.pendingDiscount || 0;
    d.pendingClientId = d.pendingClientId || 0;
    d.refTables = Object.assign(defaultRefTables(), d.refTables || {});
    (d.prescriptions || []).forEach((r) => {
      r.od = normalizeEye(r.od);
      r.og = normalizeEye(r.og);
    });
    (d.clients || []).forEach((c) => {
      c.civility = c.civility || '';
      c.profession = c.profession || '';
    });
    (d.products || []).forEach((p) => {
      p.priceGrid = p.priceGrid || { cylNeg: true, spherical: {}, toric: {} };
      p.stockKind = p.stockKind || (p.type === 'verre' ? 'stock' : '');
    });
    (d.sales || []).forEach((s) => {
      s.coverOrg = s.coverOrg || 'Aucune';
      s.coverAmount = s.coverAmount || 0;
      s.payments = s.payments || (s.paid ? [{ date: s.date, amount: s.paid, method: s.method }] : []);
      s.delivered = !!s.delivered;
      s.opNum = s.opNum || 0;
    });
    if (isDemoMode(d)) {
      if ((d.suppliers || []).length === 1) {
        d.suppliers.push({ id: 2, name: 'Essilor Algérie', contact: 'Samira Khelifi', phone: '0551 44 55 66', email: 'samira@essilor.dz', address: 'Hydra, Alger', products: 'Verres, traitements', purchases: 128000, debt: 14500, payments: [] });
      }
      if (!(d.quotes || []).length) {
        d.quotes = [{ id: 'DEV-001', date: todayISO(), clientId: 2, items: [{ productId: 2, q: 1, price: 12000, label: 'OptiLine Classic' }, { productId: 3, q: 2, price: 8500, label: 'Essilor 1.56 AR' }], total: 29000, status: 'envoyé', orderId: '', saleId: '', notes: 'Monture + verres anti-reflet' }];
      }
      if (!(d.purchaseOrders || []).length && (d.suppliers || []).length) {
        d.purchaseOrders = [{ id: 'BC-001', date: todayISO(), supplierId: d.suppliers[0].id, items: [{ productId: 4, q: 6, buy: 7600, received: 0 }], status: 'envoyée', total: 45600, notes: 'Verres 1.67 Blue Cut' }];
      }
      if (!(d.products || []).some((p) => p.type === 'lentille')) {
        d.products.push({ id: Date.now(), type: 'lentille', brand: 'Acuvue', model: 'Oasys', ref: 'LC-001', bc: '8.4', dia: '14.0', power: '-2.00', eye: 'les deux', renewMonths: 1, packQty: 6, buy: 2800, sell: 4500, qty: 12, min: 4, storeId: d.currentStore || 's1', barcode: '6130000000092', photo: '' });
      }
      if (!(d.prescriptions || []).some((r) => r.date && r.date < '2025-01-01') && (d.clients || []).length) {
        const c3 = d.clients.find((c) => c.id === 3) || d.clients[d.clients.length - 1];
        d.prescriptions.push({ id: Date.now(), clientId: c3.id, date: '2024-03-12', doctor: 'Dr. Bensaïd', od: { sph: '+1.50', cyl: '-0.75', axis: '180', add: '+2.00', prism: '', base: '' }, og: { sph: '+1.25', cyl: '-0.50', axis: '175', add: '+2.00', prism: '', base: '' }, pd: '63', pdR: '31.5', pdL: '31.5', height: '20', vcd: '12', panto: '8', type: 'Progressif', notes: 'À renouveler', photo: '', conf: {} });
      }
    }
    d.audit = d.audit || [];
    return d;
  }

  function buildNotifications() {
    const n = [];
    (db.products || []).forEach((p) => {
      if (p.qty <= 0) n.push({ id: 'out-' + p.id, type: 'rupture', text: 'Rupture : ' + p.brand + ' ' + (p.model || p.ref), level: 'bad' });
      else if (p.qty <= p.min) n.push({ id: 'low-' + p.id, type: 'stock', text: 'Stock faible : ' + p.brand + ' ' + (p.model || p.ref) + ' (' + p.qty + ')', level: 'warn' });
    });
    (db.orders || []).filter((o) => o.status === 'Prête').forEach((o) => n.push({ id: 'ord-' + o.id, type: 'commande', text: 'Commande ' + o.id + ' prête', level: 'ok' }));
    (db.sales || []).filter((s) => s.status !== 'retour' && (s.paid + (s.coverAmount || 0)) < s.total).forEach((s) => n.push({ id: 'pay-' + s.id, type: 'impaye', text: 'Reste à payer : ' + s.id + ' — ' + money(s.total - (s.coverAmount || 0) - s.paid), level: 'warn' }));
    const t = todayISO();
    (db.appointments || []).filter((a) => a.date === t).forEach((a) => n.push({ id: 'rdv-' + a.id, type: 'rdv', text: 'RDV ' + a.time + ' — ' + clientName(a.clientId), level: 'blue' }));
    (db.prescriptions || []).forEach((r) => {
      if (isRxExpired(r)) n.push({ id: 'rx-' + r.id, type: 'ordonnance', text: 'Ordonnance périmée : ' + clientName(r.clientId) + ' (' + r.date + ')', level: 'bad' });
      else if (isRxSoon(r)) n.push({ id: 'rxs-' + r.id, type: 'ordonnance', text: 'Ordonnance bientôt périmée : ' + clientName(r.clientId), level: 'warn' });
    });
    (db.clients || []).forEach((c) => {
      const lensItems = [];
      (db.sales || []).filter((s) => s.clientId === c.id && s.status !== 'retour').forEach((s) => {
        (s.items || []).forEach((i) => {
          const p = (db.products || []).find((x) => x.id === i.productId);
          if (p && p.type === 'lentille') lensItems.push({ date: s.date, months: p.renewMonths || 1, name: p.brand });
        });
      });
      if (lensItems.length) {
        lensItems.sort((a, b) => (a.date < b.date ? 1 : -1));
        const last = lensItems[0];
        if (addMonths(last.date, last.months) <= t) {
          n.push({ id: 'lens-' + c.id, type: 'lentilles', text: 'Renouvellement lentilles : ' + c.firstName + ' ' + c.lastName, level: 'warn' });
        }
      }
    });
    if (!openCashSession() && ((db.sales || []).length || (db.products || []).length || (db.clients || []).length)) {
      n.push({ id: 'cash-closed', type: 'caisse', text: 'Caisse du jour non ouverte', level: 'warn' });
    }
    db.notifications = n;
  }

  function clientName(id) {
    const c = db.clients.find((x) => x.id == id);
    return c ? c.firstName + ' ' + c.lastName : 'Comptoir';
  }

  async function ensureDemoUser(target) {
    if (!target.users.some((u) => (u.email || '').toLowerCase() === DEMO_EMAIL)) {
      target.users.push({ id: 'u-demo', name: 'Amel Démo', email: DEMO_EMAIL, phone: '0550 00 11 22', role: 'admin', password: 'Demo1234', active: true });
    }
  }

  async function switchWorkspace(mode) {
    if (!db) return;
    if ((db.meta?.mode || 'demo') === mode) return;
    await persist();
    if (mode === 'demo') {
      let demo = readLocal(KEY_DEMO);
      if (!demo || !demo.shop) demo = seed();
      demo.meta = Object.assign({}, demo.meta, { mode: 'demo' });
      db = migrate(demo);
      await ensureDemoUser(db);
    } else {
      let real = readLocal(KEY_REAL);
      if (!real || !real.shop) real = emptyShop({ name: 'Mon optique' });
      real.meta = Object.assign({}, real.meta, { mode: 'real' });
      db = migrate(real);
      await ensureDemoUser(db);
    }
    db.session = null;
    buildNotifications();
    await persist();
  }

  async function startRealShop({ name, shopName, email, city, phone }) {
    const blank = emptyShop({ name: shopName, email, city, phone });
    blank.users = [];
    if (window.OptiLicense?.getPending?.()) {
      window.OptiLicense.applyPendingToShop(blank, { shopName: shopName || name, shopEmail: email });
    }
    return forceEmptyPersist(blank);
  }

  async function save(auditMsg) {
    if (auditMsg && db.session) {
      db.audit.unshift({ date: new Date().toLocaleString('fr-DZ'), user: db.session.name, action: auditMsg });
      db.audit = db.audit.slice(0, 300);
    }
    await persist(true);
    notify();
  }

  function get() { return db; }
  function on(fn) { listeners.push(fn); }
  function can(page) {
    const role = db.session?.role || 'assistant';
    const list = ROLES[role];
    return list === '*' || (list && list.includes(page));
  }

  function looksLikeSeed(d) {
    if (!d) return false;
    if (d.meta?.mode === 'demo') return true;
    if (d.shop?.name === 'Optique Démo') return true;
    if (d.shop?.email === DEMO_EMAIL && !(d.users || []).some((u) => (u.email || '').toLowerCase() !== DEMO_EMAIL)) return true;
    const sales = d.sales || [];
    const products = d.products || [];
    const clients = d.clients || [];
    return sales.some((s) => s.id === 'V-2026-001' || s.id === 'V-2026-002')
      || products.some((p) => p.ref === 'FR-001' || p.barcode === '6130000000016')
      || clients.some((c) => c.firstName === 'Amine' && c.lastName === 'Benali');
  }

  function purgeToReal(parsed) {
    const keepUsers = ((parsed && parsed.users) || [])
      .filter((u) => (u.email || '').toLowerCase() !== DEMO_EMAIL)
      .map((u) => Object.assign({}, u));
    const shop = (parsed && parsed.shop) || {};
    const shopName = shop.name && shop.name !== 'Optique Démo' ? shop.name : (keepUsers[0] ? 'Mon optique' : 'Mon optique');
    const email = keepUsers[0]?.email || (shop.email && shop.email !== DEMO_EMAIL ? shop.email : '');
    const blank = emptyShop({
      name: shopName,
      email,
      city: shop.city === 'Alger' && shop.name === 'Optique Démo' ? '' : (shop.city || ''),
      phone: shop.phone === '023 12 34 56' ? '' : (shop.phone || shop.mobile || '')
    });
    blank.users = keepUsers;
    blank.session = null;
    blank.meta.mode = 'real';
    blank.meta.purgedDemo = true;
    return blank;
  }

  async function forceEmptyPersist(data) {
    db = migrate(data);
    db.meta.mode = 'real';
    db.session = null;
    buildNotifications();
    try { localStorage.removeItem(KEY_DEMO); } catch {}
    try { localStorage.removeItem('optidz_ai_v1'); } catch {}
    writeLocal(KEY_REAL, db);
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
    if (window.OptiDB?.save) {
      try { await OptiDB.save(db); } catch {}
    }
    if (window.optidzDesktop?.save) {
      try { await window.optidzDesktop.save(JSON.stringify(db)); } catch {}
    }
    return db;
  }

  async function load() {
    let parsed = null;
    if (window.OptiDB?.load) {
      try { parsed = await OptiDB.load(); } catch {}
    }
    if (!parsed || !parsed.shop || !parsed.users) {
      let raw = null;
      if (window.optidzDesktop?.load) {
        try { raw = await window.optidzDesktop.load(); } catch {}
      }
      if (!raw) {
        parsed = readLocal(KEY_REAL) || readLocal(KEY) || readLocal('optidz_ai_v1');
      } else {
        try { parsed = JSON.parse(raw); } catch { parsed = null; }
      }
    }

    const mustPurge = !localStorage.getItem('optidz_purged_v20')
      || !parsed
      || !parsed.shop
      || looksLikeSeed(parsed)
      || parsed.meta?.mode === 'demo';

    if (mustPurge) {
      try { localStorage.setItem('optidz_purged_v20', '1'); } catch {}
      try { localStorage.removeItem('optidz_purged_v19'); } catch {}
      const blank = purgeToReal(parsed);
      return forceEmptyPersist(blank);
    }

    if (!parsed.meta) parsed.meta = {};
    parsed.meta.mode = 'real';
    db = migrate(parsed);
    db.meta.mode = 'real';
    buildNotifications();
    await persist();
    return db;
  }

  async function login(email, password) {
    const mail = (email || '').trim().toLowerCase();
    if (mail === DEMO_EMAIL) return null;
    if (looksLikeSeed(db)) {
      await forceEmptyPersist(purgeToReal(db));
    }
    const u = db.users.find((x) => (x.email || '').toLowerCase() === mail && x.active !== false);
    if (!u || !password) return null;
    const hashed = await hashPassword(password);
    const ok = u.passwordHash ? u.passwordHash === hashed : u.password === password;
    if (!ok) return null;
    if (!u.passwordHash) {
      u.passwordHash = hashed;
      delete u.password;
    }
    db.meta.mode = 'real';
    db.session = { id: u.id, name: u.name, email: u.email, role: u.role, storeId: db.currentStore, started: Date.now() };
    if (window.OptiLicense?.syncShopLicenseFromVault) {
      window.OptiLicense.syncShopLicenseFromVault(db);
    }
    if (window.OptiLicense?.registerShopFromDb) {
      window.OptiLicense.registerShopFromDb(db);
    }
    if (window.OptiLicense?.syncControlToShop) {
      window.OptiLicense.syncControlToShop(db);
    }
    return db.session;
  }

  function licenseStatus() {
    if (window.OptiLicense?.syncShopLicenseFromVault) {
      return window.OptiLicense.syncShopLicenseFromVault(db);
    }
    return { state: 'none', allowed: true, label: '', daysLeft: 0, license: null };
  }

  function accessControl() {
    if (window.OptiLicense?.getAccessControl) {
      return window.OptiLicense.getAccessControl(db);
    }
    return { blocked: false, reason: '', problemNote: '' };
  }

  function isBlocked() {
    return !!accessControl().blocked;
  }

  function licenseAllowed() {
    if (isBlocked()) return false;
    const s = licenseStatus();
    // Licence payante → OK
    if (s.state === 'paid') return true;
    // Essai en cours → OK
    if (s.state === 'trial' && s.allowed) return true;
    // Essai terminé / révoqué / aucune clé → BLOQUÉ (l'app ne s'ouvre pas)
    if (s.state === 'expired' || s.state === 'revoked') return false;
    // Anciennes installs sans méta licence : autorisées seulement si vraiment aucune clé jamais activée
    // Dès qu'une licence essai existe (même expirée), on bloque
    if (db?.meta?.license?.type === 'trial') return false;
    if (s.state === 'none' && (db.users || []).length && !db.meta?.license) return true;
    return false;
  }

  function storageInfo() {
    const json = (() => { try { return JSON.stringify(db || {}); } catch { return ''; } })();
    const bytes = new Blob([json]).size;
    const mb = bytes / (1024 * 1024);
    return {
      usedBytes: bytes,
      usedMB: Math.round(mb * 100) / 100,
      localStorageLimitMB: 5,
      indexedDbLimitMB: 500,
      desktopLimit: 'Disque dur (quasi illimité)',
      where: window.optidzDesktop
        ? 'Fichier local Electron + IndexedDB'
        : 'localStorage (~5 Mo) + IndexedDB / SQLite navigateur (jusqu’à ~500 Mo+)'
    };
  }

  async function createUser({ name, email, phone, role, password, active }) {
    const passwordHash = await hashPassword(password);
    const user = { id: uid('u'), name, email: email.trim().toLowerCase(), phone: phone || '', role: role || 'assistant', passwordHash, active: active !== false };
    db.users.push(user);
    return user;
  }

  async function setPassword(userId, password) {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return false;
    u.passwordHash = await hashPassword(password);
    delete u.password;
    return true;
  }

  function logout() { db.session = null; }
  function needsSetup() { return !db.users.length; }
  function isRealAccount() { return !isDemoMode(db); }

  function emailTaken(email) {
    const mail = (email || '').trim().toLowerCase();
    if (!mail) return false;
    if (mail === DEMO_EMAIL) return true;
    const inDb = (d) => (d?.users || []).some((u) => (u.email || '').toLowerCase() === mail);
    if (inDb(db)) return true;
    return inDb(readLocal(KEY_REAL)) || inDb(readLocal(KEY_DEMO));
  }

  const money = (n) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n || 0).replace('DZD', 'DA');

  function earnPoints(amount) {
    if (!db.shop.loyaltyEnabled) return 0;
    const per = db.shop.loyaltyPointsPer100 || 1;
    return Math.floor((amount || 0) / 100) * per;
  }

  function redeemValue(pts) {
    const da = db.shop.loyaltyDAPer100pts || 100;
    return Math.floor((pts || 0) / 100) * da;
  }

  async function maybeBackup(force) {
    const hours = db.shop.autoBackupHours || 0;
    if (!force && !hours) return false;
    if (!force && Date.now() - (db.shop.lastBackup || 0) < hours * 3600 * 1000) return false;
    const safe = Object.assign({}, db, { shop: Object.assign({}, db.shop || {}) });
    if (safe.shop) delete safe.shop.claudeKey;
    const json = JSON.stringify(safe);
    try { localStorage.setItem('optidz_backup_copy', json); } catch {}
    if (window.optidzDesktop?.backup) {
      try { await window.optidzDesktop.backup(json); } catch {}
    }
    db.shop.lastBackup = Date.now();
    await persist();
    return true;
  }

  return {
    KEY, ROLES, seed, emptyShop, startRealShop, load, save, get, on, can, login, logout, uid, todayISO, clientName, money, persist,
    hashPassword, createUser, setPassword, needsSetup, migrate, waLink, waDigits, rxExpiry, isRxExpired, isRxSoon,
    openCashSession, earnPoints, redeemValue, maybeBackup, addMonths, isRealAccount, isDemoMode, emailTaken,
    licenseStatus, licenseAllowed, accessControl, isBlocked, storageInfo,
    defaultRefTables, normalizeEye, emptyEye, clientCredit, lastVisit, nextOpNum, SPH_GROUPS, TOR_GROUPS
  };
})();
