window.OptiDB = (function () {
  const IDB_NAME = 'optidz_sqlite';
  const IDB_KEY = 'sqlite';
  const ARRAYS = [
    'stores', 'users', 'clients', 'prescriptions', 'products', 'movements', 'sales', 'orders',
    'suppliers', 'appointments', 'expenses', 'invoices', 'audit', 'contacts', 'quotes',
    'purchaseOrders', 'cashSessions', 'inventories', 'loyaltyLog', 'resets', 'returns', 'transfers', 'cart'
  ];
  const SCALARS = ['shop', 'meta', 'session', 'currentStore', 'orderStatuses', 'pendingDiscount', 'pendingClientId', 'refTables'];

  let SQL = null;
  let sqlite = null;
  let ready = false;
  let engine = 'json';
  let lastError = '';

  function statsFrom(data) {
    const d = data || {};
    return {
      engine,
      ready,
      clients: (d.clients || []).length,
      products: (d.products || []).length,
      sales: (d.sales || []).length,
      users: (d.users || []).length,
      error: lastError
    };
  }

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbGet() {
    try {
      const db = await idbOpen();
      return await new Promise((resolve) => {
        const tx = db.transaction('files', 'readonly').objectStore('files').get(IDB_KEY);
        tx.onsuccess = () => resolve(tx.result || null);
        tx.onerror = () => resolve(null);
      });
    } catch { return null; }
  }
  async function idbPut(bytes) {
    try {
      const db = await idbOpen();
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite').objectStore('files').put(bytes, IDB_KEY);
        tx.onsuccess = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {}
  }

  function hasTable(db, name) {
    try {
      const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
      stmt.bind([name]);
      const ok = stmt.step();
      stmt.free();
      return ok;
    } catch { return false; }
  }
  function count(db, table) {
    try {
      const r = db.exec('SELECT COUNT(*) FROM ' + table);
      return r[0] ? r[0].values[0][0] : 0;
    } catch { return 0; }
  }
  function run(db, sql, params) {
    if (!params) { db.run(sql); return; }
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
  }
  function pick(obj, keys) {
    const out = {};
    keys.forEach((k) => { if (obj && obj[k] !== undefined) out[k] = obj[k]; });
    return out;
  }
  function rest(obj, keys) {
    const skip = new Set(keys);
    const out = {};
    Object.keys(obj || {}).forEach((k) => { if (!skip.has(k)) out[k] = obj[k]; });
    return out;
  }
  function extraOf(obj, keys) {
    const r = rest(obj, keys);
    return Object.keys(r).length ? JSON.stringify(r) : null;
  }
  function mergeRow(base, extraJson) {
    let extra = {};
    try { extra = extraJson ? JSON.parse(extraJson) : {}; } catch { extra = {}; }
    return Object.assign(extra, base);
  }
  function schema(db) {
    db.run('PRAGMA foreign_keys = ON;');
    db.run(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);`);
    db.run(`CREATE TABLE IF NOT EXISTS rec (
      col TEXT NOT NULL, id TEXT NOT NULL, json TEXT NOT NULL, updated INTEGER NOT NULL,
      PRIMARY KEY (col, id)
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL);`);
    db.run(`CREATE TABLE IF NOT EXISTS shop (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT, slogan TEXT, address TEXT, city TEXT, phone TEXT, mobile TEXT, email TEXT,
      nif TEXT, rc TEXT, currency TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY, name TEXT, city TEXT, phone TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      phone TEXT, role TEXT NOT NULL, password_hash TEXT, password TEXT,
      active INTEGER DEFAULT 1, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
      phone TEXT, email TEXT, address TEXT, birth TEXT, loyalty INTEGER DEFAULT 0,
      created TEXT, notes TEXT, extra TEXT
    );`);
    db.run('CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);');
    db.run('CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(last_name, first_name);');
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY, type TEXT, brand TEXT, model TEXT, ref TEXT, barcode TEXT,
      buy REAL, sell REAL, qty INTEGER, min INTEGER, store_id TEXT, extra TEXT
    );`);
    db.run('CREATE INDEX IF NOT EXISTS idx_products_ref ON products(ref);');
    db.run('CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);');
    db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY, client_id INTEGER, date TEXT, doctor TEXT, type TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY, date TEXT, client_id INTEGER, total REAL, paid REAL,
      discount REAL, tax REAL, method TEXT, status TEXT, store_id TEXT, user_id TEXT, extra TEXT
    );`);
    db.run('CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);');
    db.run('CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);');
    db.run(`CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id TEXT NOT NULL, product_id INTEGER,
      qty REAL, price REAL, discount REAL, label TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS sale_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, sale_id TEXT NOT NULL, date TEXT, amount REAL, method TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, kind TEXT, client_id INTEGER, product TEXT, supplier_id INTEGER,
      advance REAL, total REAL, remain REAL, due TEXT, status TEXT, store_id TEXT, notes TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY, name TEXT, contact TEXT, phone TEXT, email TEXT,
      address TEXT, products TEXT, purchases REAL, debt REAL, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY, client_id INTEGER, date TEXT, time TEXT, reason TEXT, status TEXT, notes TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY, date TEXT, label TEXT, amount REAL, cat TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY, date TEXT, client_id INTEGER, sale_id TEXT, total REAL, paid REAL, status TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY, date TEXT, client_id INTEGER, total REAL, status TEXT, notes TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS quote_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, quote_id TEXT NOT NULL, product_id INTEGER,
      qty REAL, price REAL, label TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, date TEXT, supplier_id INTEGER, total REAL, status TEXT, notes TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS po_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, po_id TEXT NOT NULL, product_id INTEGER,
      qty REAL, buy REAL, received REAL
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY, date TEXT, product_id INTEGER, type TEXT, qty REAL, motif TEXT, store_id TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS cash_sessions (
      id TEXT PRIMARY KEY, status TEXT, extra TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS loyalty_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, client_id INTEGER, pts INTEGER, reason TEXT, sale_id TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, user TEXT, action TEXT
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS inventories (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS resets (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS returns (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS transfers (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
    db.run(`CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY AUTOINCREMENT, extra TEXT);`);
  }

  function setSetting(db, k, v) {
    run(db, 'INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)', [k, JSON.stringify(v)]);
  }
  function getSetting(db, k, fb) {
    try {
      const stmt = db.prepare('SELECT v FROM settings WHERE k=?');
      stmt.bind([k]);
      let val = fb;
      if (stmt.step()) {
        try { val = JSON.parse(stmt.get()[0]); } catch { val = fb; }
      }
      stmt.free();
      return val;
    } catch { return fb; }
  }

  function wipeBiz(db) {
    [
      'sale_items', 'sale_payments', 'quote_items', 'po_items', 'sales', 'quotes', 'purchase_orders',
      'clients', 'products', 'prescriptions', 'orders', 'suppliers', 'appointments', 'expenses',
      'invoices', 'movements', 'cash_sessions', 'loyalty_log', 'audit', 'contacts', 'inventories',
      'resets', 'returns', 'transfers', 'cart', 'users', 'stores', 'shop', 'settings'
    ].forEach((t) => { try { db.run('DELETE FROM ' + t); } catch {} });
  }

  function toRelational(db, data) {
    const shop = Object.assign({}, data.shop || {});
    delete shop.claudeKey;
    const shopKeys = ['name', 'slogan', 'address', 'city', 'phone', 'mobile', 'email', 'nif', 'rc', 'currency'];
    run(db, `INSERT INTO shop (id, name, slogan, address, city, phone, mobile, email, nif, rc, currency, extra)
      VALUES (1,?,?,?,?,?,?,?,?,?,?,?)`, [
      shop.name || '', shop.slogan || '', shop.address || '', shop.city || '', shop.phone || '',
      shop.mobile || '', shop.email || '', shop.nif || '', shop.rc || '', shop.currency || 'DZD',
      extraOf(shop, shopKeys)
    ]);
    SCALARS.filter((k) => k !== 'shop').forEach((k) => {
      if (data[k] !== undefined) setSetting(db, k, data[k]);
    });
    setSetting(db, 'schema_version', 2);

    (data.stores || []).forEach((s) => {
      const keys = ['id', 'name', 'city', 'phone'];
      run(db, 'INSERT INTO stores (id, name, city, phone, extra) VALUES (?,?,?,?,?)',
        [String(s.id), s.name || '', s.city || '', s.phone || '', extraOf(s, keys)]);
    });
    (data.users || []).forEach((u) => {
      const keys = ['id', 'name', 'email', 'phone', 'role', 'passwordHash', 'password', 'active'];
      run(db, `INSERT INTO users (id, name, email, phone, role, password_hash, password, active, extra)
        VALUES (?,?,?,?,?,?,?,?,?)`, [
        String(u.id), u.name || '', (u.email || '').toLowerCase(), u.phone || '', u.role || 'assistant',
        u.passwordHash || null, u.password || null, u.active === false ? 0 : 1, extraOf(u, keys)
      ]);
    });
    (data.clients || []).forEach((c) => {
      const keys = ['id', 'firstName', 'lastName', 'phone', 'email', 'address', 'birth', 'loyalty', 'created', 'notes'];
      run(db, `INSERT INTO clients (id, first_name, last_name, phone, email, address, birth, loyalty, created, notes, extra)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
        c.id, c.firstName || '', c.lastName || '', c.phone || '', c.email || '', c.address || '',
        c.birth || '', c.loyalty || 0, c.created || '', c.notes || '', extraOf(c, keys)
      ]);
    });
    (data.products || []).forEach((p) => {
      const keys = ['id', 'type', 'brand', 'model', 'ref', 'barcode', 'buy', 'sell', 'qty', 'min', 'storeId'];
      run(db, `INSERT INTO products (id, type, brand, model, ref, barcode, buy, sell, qty, min, store_id, extra)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [
        p.id, p.type || '', p.brand || '', p.model || '', p.ref || '', p.barcode || '',
        p.buy || 0, p.sell || 0, p.qty || 0, p.min || 0, p.storeId || '', extraOf(p, keys)
      ]);
    });
    (data.prescriptions || []).forEach((r) => {
      const keys = ['id', 'clientId', 'date', 'doctor', 'type'];
      run(db, 'INSERT INTO prescriptions (id, client_id, date, doctor, type, extra) VALUES (?,?,?,?,?,?)',
        [r.id, r.clientId || 0, r.date || '', r.doctor || '', r.type || '', extraOf(r, keys)]);
    });
    (data.sales || []).forEach((s) => {
      const keys = ['id', 'date', 'clientId', 'total', 'paid', 'discount', 'tax', 'method', 'status', 'storeId', 'userId', 'items', 'payments'];
      run(db, `INSERT INTO sales (id, date, client_id, total, paid, discount, tax, method, status, store_id, user_id, extra)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [
        String(s.id), s.date || '', s.clientId || 0, s.total || 0, s.paid || 0, s.discount || 0, s.tax || 0,
        s.method || '', s.status || '', s.storeId || '', s.userId || '', extraOf(s, keys)
      ]);
      (s.items || []).forEach((it) => {
        run(db, 'INSERT INTO sale_items (sale_id, product_id, qty, price, discount, label) VALUES (?,?,?,?,?,?)',
          [String(s.id), it.productId || 0, it.q || it.qty || 1, it.price || 0, it.discount || 0, it.label || '']);
      });
      (s.payments || []).forEach((pay) => {
        run(db, 'INSERT INTO sale_payments (sale_id, date, amount, method) VALUES (?,?,?,?)',
          [String(s.id), pay.date || s.date || '', pay.amount || 0, pay.method || s.method || '']);
      });
    });
    (data.orders || []).forEach((o) => {
      const keys = ['id', 'kind', 'clientId', 'product', 'supplierId', 'advance', 'total', 'remain', 'due', 'status', 'storeId', 'notes'];
      run(db, `INSERT INTO orders (id, kind, client_id, product, supplier_id, advance, total, remain, due, status, store_id, notes, extra)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        String(o.id), o.kind || '', o.clientId || 0, o.product || '', o.supplierId || 0, o.advance || 0,
        o.total || 0, o.remain || 0, o.due || '', o.status || '', o.storeId || '', o.notes || '', extraOf(o, keys)
      ]);
    });
    (data.suppliers || []).forEach((s) => {
      const keys = ['id', 'name', 'contact', 'phone', 'email', 'address', 'products', 'purchases', 'debt'];
      run(db, `INSERT INTO suppliers (id, name, contact, phone, email, address, products, purchases, debt, extra)
        VALUES (?,?,?,?,?,?,?,?,?,?)`, [
        s.id, s.name || '', s.contact || '', s.phone || '', s.email || '', s.address || '',
        s.products || '', s.purchases || 0, s.debt || 0, extraOf(s, keys)
      ]);
    });
    (data.appointments || []).forEach((a) => {
      const keys = ['id', 'clientId', 'date', 'time', 'reason', 'status', 'notes'];
      run(db, `INSERT INTO appointments (id, client_id, date, time, reason, status, notes, extra)
        VALUES (?,?,?,?,?,?,?,?)`, [
        String(a.id), a.clientId || 0, a.date || '', a.time || '', a.reason || '', a.status || '', a.notes || '', extraOf(a, keys)
      ]);
    });
    (data.expenses || []).forEach((e) => {
      const keys = ['id', 'date', 'label', 'amount', 'cat'];
      run(db, 'INSERT INTO expenses (id, date, label, amount, cat, extra) VALUES (?,?,?,?,?,?)',
        [String(e.id), e.date || '', e.label || '', e.amount || 0, e.cat || '', extraOf(e, keys)]);
    });
    (data.invoices || []).forEach((f) => {
      const keys = ['id', 'date', 'clientId', 'saleId', 'total', 'paid', 'status'];
      run(db, 'INSERT INTO invoices (id, date, client_id, sale_id, total, paid, status, extra) VALUES (?,?,?,?,?,?,?,?)',
        [String(f.id), f.date || '', f.clientId || 0, f.saleId || '', f.total || 0, f.paid || 0, f.status || '', extraOf(f, keys)]);
    });
    (data.quotes || []).forEach((q) => {
      const keys = ['id', 'date', 'clientId', 'total', 'status', 'notes', 'items'];
      run(db, 'INSERT INTO quotes (id, date, client_id, total, status, notes, extra) VALUES (?,?,?,?,?,?,?)',
        [String(q.id), q.date || '', q.clientId || 0, q.total || 0, q.status || '', q.notes || '', extraOf(q, keys)]);
      (q.items || []).forEach((it) => {
        run(db, 'INSERT INTO quote_items (quote_id, product_id, qty, price, label) VALUES (?,?,?,?,?)',
          [String(q.id), it.productId || 0, it.q || it.qty || 1, it.price || 0, it.label || '']);
      });
    });
    (data.purchaseOrders || []).forEach((p) => {
      const keys = ['id', 'date', 'supplierId', 'total', 'status', 'notes', 'items'];
      run(db, 'INSERT INTO purchase_orders (id, date, supplier_id, total, status, notes, extra) VALUES (?,?,?,?,?,?,?)',
        [String(p.id), p.date || '', p.supplierId || 0, p.total || 0, p.status || '', p.notes || '', extraOf(p, keys)]);
      (p.items || []).forEach((it) => {
        run(db, 'INSERT INTO po_items (po_id, product_id, qty, buy, received) VALUES (?,?,?,?,?)',
          [String(p.id), it.productId || 0, it.q || it.qty || 1, it.buy || 0, it.received || 0]);
      });
    });
    (data.movements || []).forEach((m) => {
      const keys = ['id', 'date', 'productId', 'type', 'qty', 'motif', 'storeId'];
      run(db, 'INSERT INTO movements (id, date, product_id, type, qty, motif, store_id, extra) VALUES (?,?,?,?,?,?,?,?)',
        [String(m.id), m.date || '', m.productId || 0, m.type || '', m.qty || 0, m.motif || '', m.storeId || '', extraOf(m, keys)]);
    });
    (data.cashSessions || []).forEach((c, i) => {
      run(db, 'INSERT INTO cash_sessions (id, status, extra) VALUES (?,?,?)',
        [String(c.id || 'cs-' + i), c.status || '', JSON.stringify(c)]);
    });
    (data.loyaltyLog || []).forEach((l) => {
      run(db, 'INSERT INTO loyalty_log (date, client_id, pts, reason, sale_id) VALUES (?,?,?,?,?)',
        [l.date || '', l.clientId || 0, l.pts || 0, l.reason || '', l.saleId || '']);
    });
    (data.audit || []).forEach((a) => {
      run(db, 'INSERT INTO audit (date, user, action) VALUES (?,?,?)', [a.date || '', a.user || '', a.action || '']);
    });
    function dumpJson(table, list) {
      (list || []).forEach((row) => run(db, 'INSERT INTO ' + table + ' (extra) VALUES (?)', [JSON.stringify(row)]));
    }
    dumpJson('contacts', data.contacts);
    dumpJson('inventories', data.inventories);
    dumpJson('resets', data.resets);
    dumpJson('returns', data.returns);
    dumpJson('transfers', data.transfers);
    dumpJson('cart', data.cart);
  }

  function sel(db, sql) {
    const r = db.exec(sql);
    if (!r[0]) return [];
    const cols = r[0].columns;
    return r[0].values.map((vals) => {
      const o = {};
      cols.forEach((c, i) => { o[c] = vals[i]; });
      return o;
    });
  }

  function fromRelational(db) {
    const data = {};
    ARRAYS.forEach((k) => { data[k] = []; });
    SCALARS.filter((k) => k !== 'shop').forEach((k) => {
      const v = getSetting(db, k, undefined);
      if (v !== undefined) data[k] = v;
    });
    data.pendingDiscount = data.pendingDiscount || 0;
    data.pendingClientId = data.pendingClientId || 0;
    data.orderStatuses = data.orderStatuses || ['Nouvelle', 'En préparation', 'Commandée', 'En fabrication', 'Reçue', 'Prête', 'Livrée', 'Annulée'];
    data.session = data.session || null;
    data.currentStore = data.currentStore || 's1';

    const shopRow = sel(db, 'SELECT * FROM shop WHERE id=1')[0];
    if (shopRow) {
      data.shop = mergeRow({
        name: shopRow.name, slogan: shopRow.slogan, address: shopRow.address, city: shopRow.city,
        phone: shopRow.phone, mobile: shopRow.mobile, email: shopRow.email, nif: shopRow.nif,
        rc: shopRow.rc, currency: shopRow.currency
      }, shopRow.extra);
    } else data.shop = {};

    data.stores = sel(db, 'SELECT * FROM stores').map((r) => mergeRow({ id: r.id, name: r.name, city: r.city, phone: r.phone }, r.extra));
    data.users = sel(db, 'SELECT * FROM users').map((r) => mergeRow({
      id: r.id, name: r.name, email: r.email, phone: r.phone, role: r.role,
      passwordHash: r.password_hash, password: r.password, active: !!r.active
    }, r.extra));
    data.clients = sel(db, 'SELECT * FROM clients').map((r) => mergeRow({
      id: r.id, firstName: r.first_name, lastName: r.last_name, phone: r.phone, email: r.email,
      address: r.address, birth: r.birth, loyalty: r.loyalty, created: r.created, notes: r.notes
    }, r.extra));
    data.products = sel(db, 'SELECT * FROM products').map((r) => mergeRow({
      id: r.id, type: r.type, brand: r.brand, model: r.model, ref: r.ref, barcode: r.barcode,
      buy: r.buy, sell: r.sell, qty: r.qty, min: r.min, storeId: r.store_id
    }, r.extra));
    data.prescriptions = sel(db, 'SELECT * FROM prescriptions').map((r) => mergeRow({
      id: r.id, clientId: r.client_id, date: r.date, doctor: r.doctor, type: r.type
    }, r.extra));

    const itemsBySale = {};
    sel(db, 'SELECT * FROM sale_items').forEach((it) => {
      (itemsBySale[it.sale_id] = itemsBySale[it.sale_id] || []).push({
        productId: it.product_id, q: it.qty, price: it.price, discount: it.discount, label: it.label
      });
    });
    const payBySale = {};
    sel(db, 'SELECT * FROM sale_payments').forEach((p) => {
      (payBySale[p.sale_id] = payBySale[p.sale_id] || []).push({ date: p.date, amount: p.amount, method: p.method });
    });
    data.sales = sel(db, 'SELECT * FROM sales').map((r) => mergeRow({
      id: r.id, date: r.date, clientId: r.client_id, total: r.total, paid: r.paid, discount: r.discount,
      tax: r.tax, method: r.method, status: r.status, storeId: r.store_id, userId: r.user_id,
      items: itemsBySale[r.id] || [], payments: payBySale[r.id] || []
    }, r.extra));

    data.orders = sel(db, 'SELECT * FROM orders').map((r) => mergeRow({
      id: r.id, kind: r.kind, clientId: r.client_id, product: r.product, supplierId: r.supplier_id,
      advance: r.advance, total: r.total, remain: r.remain, due: r.due, status: r.status,
      storeId: r.store_id, notes: r.notes
    }, r.extra));
    data.suppliers = sel(db, 'SELECT * FROM suppliers').map((r) => mergeRow({
      id: r.id, name: r.name, contact: r.contact, phone: r.phone, email: r.email, address: r.address,
      products: r.products, purchases: r.purchases, debt: r.debt
    }, r.extra));
    data.appointments = sel(db, 'SELECT * FROM appointments').map((r) => mergeRow({
      id: r.id, clientId: r.client_id, date: r.date, time: r.time, reason: r.reason, status: r.status, notes: r.notes
    }, r.extra));
    data.expenses = sel(db, 'SELECT * FROM expenses').map((r) => mergeRow({
      id: r.id, date: r.date, label: r.label, amount: r.amount, cat: r.cat
    }, r.extra));
    data.invoices = sel(db, 'SELECT * FROM invoices').map((r) => mergeRow({
      id: r.id, date: r.date, clientId: r.client_id, saleId: r.sale_id, total: r.total, paid: r.paid, status: r.status
    }, r.extra));

    const qItems = {};
    sel(db, 'SELECT * FROM quote_items').forEach((it) => {
      (qItems[it.quote_id] = qItems[it.quote_id] || []).push({
        productId: it.product_id, q: it.qty, price: it.price, label: it.label
      });
    });
    data.quotes = sel(db, 'SELECT * FROM quotes').map((r) => mergeRow({
      id: r.id, date: r.date, clientId: r.client_id, total: r.total, status: r.status, notes: r.notes,
      items: qItems[r.id] || []
    }, r.extra));

    const poItems = {};
    sel(db, 'SELECT * FROM po_items').forEach((it) => {
      (poItems[it.po_id] = poItems[it.po_id] || []).push({
        productId: it.product_id, q: it.qty, buy: it.buy, received: it.received
      });
    });
    data.purchaseOrders = sel(db, 'SELECT * FROM purchase_orders').map((r) => mergeRow({
      id: r.id, date: r.date, supplierId: r.supplier_id, total: r.total, status: r.status, notes: r.notes,
      items: poItems[r.id] || []
    }, r.extra));
    data.movements = sel(db, 'SELECT * FROM movements').map((r) => mergeRow({
      id: r.id, date: r.date, productId: r.product_id, type: r.type, qty: r.qty, motif: r.motif, storeId: r.store_id
    }, r.extra));
    data.cashSessions = sel(db, 'SELECT extra FROM cash_sessions').map((r) => {
      try { return JSON.parse(r.extra); } catch { return {}; }
    });
    data.loyaltyLog = sel(db, 'SELECT date, client_id, pts, reason, sale_id FROM loyalty_log').map((r) => ({
      date: r.date, clientId: r.client_id, pts: r.pts, reason: r.reason, saleId: r.sale_id
    }));
    data.audit = sel(db, 'SELECT date, user, action FROM audit ORDER BY id DESC').map((r) => ({
      date: r.date, user: r.user, action: r.action
    }));
    function loadJson(table) {
      return sel(db, 'SELECT extra FROM ' + table).map((r) => {
        try { return JSON.parse(r.extra); } catch { return {}; }
      });
    }
    data.contacts = loadJson('contacts');
    data.inventories = loadJson('inventories');
    data.resets = loadJson('resets');
    data.returns = loadJson('returns');
    data.transfers = loadJson('transfers');
    data.cart = loadJson('cart');
    data.notifications = [];
    data.meta = data.meta || { version: 2 };
    return data;
  }

  function fromLegacy(db) {
    const data = {};
    const kv = db.exec('SELECT k, v FROM kv');
    if (kv[0]) {
      kv[0].values.forEach(([k, v]) => {
        try { data[k] = JSON.parse(v); } catch { data[k] = v; }
      });
    }
    ARRAYS.forEach((col) => { data[col] = data[col] || []; });
    const rec = db.exec('SELECT col, json FROM rec ORDER BY col, id');
    if (rec[0]) {
      rec[0].values.forEach(([col, json]) => {
        if (!data[col]) data[col] = [];
        try { data[col].push(JSON.parse(json)); } catch {}
      });
    }
    if (!data.shop || !data.users) return null;
    return data;
  }

  async function flushFile() {
    const bytes = sqlite.export();
    if (window.optidzDesktop?.saveDb) {
      try { await window.optidzDesktop.saveDb(bytes); } catch {}
    }
    await idbPut(bytes);
  }

  async function init() {
    if (ready) return true;
    try {
      if (typeof initSqlJs !== 'function') throw new Error('sql.js absent');
      SQL = await initSqlJs({ locateFile: (f) => 'vendor/sqljs/' + f });
      let bytes = null;
      if (window.optidzDesktop?.loadDb) {
        try {
          const buf = await window.optidzDesktop.loadDb();
          if (buf && buf.byteLength) bytes = new Uint8Array(buf);
        } catch {}
      }
      if (!bytes) {
        const fromIdb = await idbGet();
        if (fromIdb) bytes = fromIdb instanceof Uint8Array ? fromIdb : new Uint8Array(fromIdb);
      }
      sqlite = bytes && bytes.length ? new SQL.Database(bytes) : new SQL.Database();
      schema(sqlite);
      engine = 'sqlite';
      ready = true;
      lastError = '';
      return true;
    } catch (err) {
      lastError = String(err.message || err);
      engine = 'json';
      ready = false;
      return false;
    }
  }

  async function load() {
    const ok = await init();
    if (!ok || !sqlite) return null;
    try {
      if (count(sqlite, 'clients') || count(sqlite, 'shop')) return fromRelational(sqlite);
      const legacy = fromLegacy(sqlite);
      if (legacy && legacy.shop && legacy.users && legacy.users.length) return legacy;
      return null;
    } catch (err) {
      lastError = String(err.message || err);
      return null;
    }
  }

  async function save(data) {
    const ok = await init();
    if (!ok || !sqlite) return false;
    try {
      sqlite.run('BEGIN');
      wipeBiz(sqlite);
      toRelational(sqlite, data);
      sqlite.run('COMMIT');
      engine = 'sqlite';
      await flushFile();
      return true;
    } catch (err) {
      try { sqlite.run('ROLLBACK'); } catch {}
      lastError = String(err.message || err);
      return false;
    }
  }

  function info(data) { return statsFrom(data); }

  return { init, load, save, info, ARRAYS };
})();
