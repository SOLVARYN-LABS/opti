window.OptiApp = (function () {
  const LOGO = `<img class="mark" src="assets/logo-mark.png" alt="OptiDZ" width="34" height="34">`;
  const ico = (name) => {
    const p = {
      dashboard: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
      clients: '<circle cx="12" cy="8" r="3.2"/><path d="M5 19c.6-3.2 3.2-5 7-5s6.4 1.8 7 5"/>',
      rx: '<circle cx="9" cy="12" r="3.5"/><circle cx="15" cy="12" r="3.5"/><path d="M12.5 12h.2M5.2 12H6.4M17.6 12h1.2"/>',
      products: '<path d="M4 8l8-3 8 3v10l-8 3-8-3V8z"/><path d="M12 5v16M4 8l8 3 8-3"/>',
      stock: '<path d="M4 7h16v12H4z"/><path d="M4 11h16M9 7v12"/>',
      sales: '<path d="M5 18V8h4l2-3h6v13z"/><circle cx="9" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>',
      orders: '<path d="M7 5h10l2 4v10H5V9l2-4z"/><path d="M5 9h14M10 13h4"/>',
      suppliers: '<path d="M4 18V9l8-4 8 4v9H4z"/><path d="M10 18v-5h4v5"/>',
      rdv: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 10h16M8 4v4M16 4v4"/>',
      finance: '<path d="M5 16l4-4 3 2 7-8"/><path d="M14 6h5v5"/>',
      reports: '<path d="M6 18V10M11 18V7M16 18v-5"/>',
      notifications: '<path d="M12 4a6 6 0 0 1 6 6c0 5 2 6 2 6H4s2-1 2-6a6 6 0 0 1 6-6z"/><path d="M10 20h4"/>',
      ai: '<circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2M7.2 7.2l1.4 1.4M15.4 15.4l1.4 1.4M16.8 7.2l-1.4 1.4M8.6 15.4l-1.4 1.4"/>',
      ocr: '<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 6V5h6v1"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.5 6.5l1.4 1.4M16.1 16.1l1.4 1.4M17.5 6.5l-1.4 1.4M7.9 16.1L6.5 17.5"/>',
      quotes: '<path d="M7 5h10v14H7z"/><path d="M10 9h4M10 13h4"/>',
      purchases: '<path d="M4 8h16l-2 10H6L4 8z"/><path d="M9 8V6h6v2"/>',
      logout: '<path d="M10 5H6v14h4M13 12H6M13 12l3-3M13 12l3 3"/>',
      about: '<circle cx="12" cy="12" r="8"/><path d="M12 10v6M12 7.5h.01"/>',
      atelier: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h5"/>',
      tables: '<path d="M4 6h16v12H4z"/><path d="M4 10h16M10 6v12"/>',
      caisse: '<rect x="5" y="7" width="14" height="12" rx="2"/><path d="M9 11h6"/>'
    };
    return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${p[name] || ''}</svg>`;
  };
  let lang = localStorage.getItem('optidz_lang') || 'fr';
  let chatOpen = false;
  let claudeOpen = false;
  let claudeBusy = false;
  const claudeHist = [{ role: 'assistant', text: 'Bonjour. Je peux vous aider sur tout OptiDZ : stock, caisse, clients, dossiers, commandes, devis… et lire une photo d’ordonnance.' }];
  let claudePhoto = null;
  let authMode = 'welcome';
  let cal = new Date();
  let stockTab = 'rayon';
  let prodTab = 'all';
  let ocr = null;
  const APP_VERSION = '1.0.3';
  const APP_BUILD = '2026.09.12';
  const DEVS = [
    { name: 'Benaboud Roqia', role: 'Développeuse Full Stack & IA', focus: 'Produit, interface, assistant intelligent' },
    { name: 'Abdarahim Salem', role: 'Développeur Full Stack & IA', focus: 'Architecture, données, automatisation' }
  ];

  const T = {
    fr: {
      demo: 'Demander une démo', login: 'Se connecter', about: 'À propos', prices: 'Tarifs', contact: 'Contact',
      kicker: 'Logiciel algérien · Intelligence artificielle',
      h1a: 'Gérez votre optique.', h1b: 'L’IA s’occupe du reste.',
      lead: 'OptiDZ AI est le logiciel de gestion conçu pour les opticiens algériens : caisse, stock, dossiers optiques, commandes, et un assistant qui lit les ordonnances.',
      open: 'Ouvrir le logiciel', feat: 'L’atelier numérique',
      slogan: 'L’intelligence au service de l’optique algérienne.'
    },
    ar: {
      demo: 'طلب عرض', login: 'دخول', about: 'من نحن', prices: 'الأسعار', contact: 'اتصال',
      kicker: 'برنامج جزائري · ذكاء اصطناعي',
      h1a: 'سيّر محلّك.', h1b: 'الذكاء الاصطناعي يكمل الباقي.',
      lead: 'OptiDZ AI برنامج تسيير للنظاراتيين في الجزائر: صندوق، مخزون، ملفات بصرية، طلبيات، ومساعد يقرأ الوصفات.',
      open: 'فتح البرنامج', feat: 'الورشة الرقمية',
      slogan: 'الذكاء في خدمة البصريات الجزائرية.'
    }
  };
  const t = () => T[lang] || T.fr;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const db = () => OptiStore.get();
  const money = (n) => OptiStore.money(n);
  const go = (h) => {
    if (location.hash !== h) location.hash = h;
    route();
  };
  const toast = (s) => { const el = document.getElementById('toast'); el.textContent = s; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); };

  function openModal(title, body) {
    const m = document.getElementById('modal');
    m.classList.add('open');
    m.innerHTML = `<div class="box"><div class="toolbar"><h2 class="h1" style="font-size:28px">${esc(title)}</h2><button class="btn sm" onclick="OptiApp.closeModal()">Fermer</button></div>${body}</div>`;
  }
  function closeModal() { document.getElementById('modal').classList.remove('open'); document.getElementById('modal').innerHTML = ''; }

  function brand(inApp) {
    const href = inApp ? '#/app/dashboard' : '#/welcome';
    return `<a class="brand" href="${href}">${LOGO}<span class="brand-name"><b>Opti<i>DZ</i></b></span></a>`;
  }

  function renderHome() {
    if (db().session) return go('#/app/dashboard');
    return renderAuth();
  }

  function renderPricing() { return renderHome(); }
  function renderContact() { return renderHome(); }

  function authFrame(title, lead, formHtml) {
    return `<div class="auth auth-live auth-pro">
      <section class="auth-visual auth-visual-photo">
        <div class="auth-photo-wrap" aria-hidden="true">
          <img class="auth-photo" src="assets/optique-login.png" alt="">
          <div class="auth-photo-shade"></div>
        </div>
        ${brand()}
        <div class="auth-photo-tags">
          <span class="auth-tag cnas">CNAS</span>
          <span class="auth-tag rx">Ordonnance</span>
          <span class="auth-tag ai">IA</span>
        </div>
        <div class="auth-bottom-bar">
          <div class="auth-bottom-copy">
            <p class="auth-kicker">Logiciel opticien · Algérie · v${APP_VERSION}</p>
            <h2>${title}</h2>
            <p>${lead}</p>
          </div>
          <ul class="auth-feats-h">
            <li><strong>CNAS</strong><span>Prise en charge</span></li>
            <li><strong>Ordonnance</strong><span>Dossiers 24 mois</span></li>
            <li><strong>Caisse</strong><span>Tickets & dinars</span></li>
            <li><strong>Stock</strong><span>Rayon & alertes</span></li>
          </ul>
          <p class="auth-meta-line">OptiDZ · Gestion d’optique · © Protégé</p>
        </div>
      </section>
      <section class="auth-form">
        <div class="auth-card">${formHtml}</div>
      </section>
    </div>`;
  }

  const ONBOARD_KEY = 'optidz_onboard_done_v1';
  let onboardStep = 0;
  function hasOnboarded() {
    try { return localStorage.getItem(ONBOARD_KEY) === '1'; } catch { return false; }
  }
  function markOnboarded() {
    try { localStorage.setItem(ONBOARD_KEY, '1'); } catch {}
  }

  function renderOnboarding() {
    const slides = [
      {
        kicker: 'Bienvenue',
        title: 'Bienvenue dans <em>OptiDZ</em>',
        text: 'Le logiciel métier conçu pour les opticiens en Algérie — simple, rapide, entièrement sur votre poste.',
        points: [['Magasin', 'Tout en un écran'], ['Dinars', 'Caisse locale'], ['Algérie', 'CNAS & dossiers']]
      },
      {
        kicker: 'Votre journée',
        title: 'Caisse, stock<br>et dossiers',
        text: 'Encaisser, suivre les ordonnances, gérer le rayon et les commandes — sans tableur, sans paperasse.',
        points: [['Caisse', 'Tickets & CNAS'], ['Stock', 'Alertes rayon'], ['Dossiers', '24 mois']]
      },
      {
        kicker: 'Prêt',
        title: 'Scannez, vendez,<br>pilotez',
        text: 'Douchette USB ou Bluetooth, tickets de référence, rapports et assistant — votre optique démarre maintenant.',
        points: [['Scan', 'Tous appareils'], ['Rapports', 'Excel & PDF'], ['IA', 'Aide magasin']]
      }
    ];
    const s = slides[Math.max(0, Math.min(onboardStep, slides.length - 1))];
    const last = onboardStep >= slides.length - 1;
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = `<div class="onboard" data-step="${onboardStep}">
      <div class="onboard-bg" aria-hidden="true">
        <span class="ob-orb a"></span><span class="ob-orb b"></span><span class="ob-orb c"></span>
        <div class="ob-rings"><i></i><i></i><i></i></div>
        <div class="ob-grain"></div>
      </div>
      <header class="onboard-top">
        ${brand()}
        <button type="button" class="onboard-skip" onclick="OptiApp.finishOnboard()">Passer</button>
      </header>
      <main class="onboard-main">
        <div class="onboard-visual" aria-hidden="true">
          <div class="onboard-lens"><i></i><b></b><i></i></div>
          <div class="onboard-float f1">CNAS</div>
          <div class="onboard-float f2">Caisse</div>
          <div class="onboard-float f3">Scan</div>
        </div>
        <div class="onboard-copy">
          <p class="onboard-kicker">${s.kicker}</p>
          <h1>${s.title}</h1>
          <p class="onboard-lead">${s.text}</p>
          <ul class="onboard-points">
            ${s.points.map(([t, d], i) => `<li style="animation-delay:${.12 + i * .08}s"><strong>${t}</strong><span>${d}</span></li>`).join('')}
          </ul>
        </div>
      </main>
      <footer class="onboard-foot">
        <div class="onboard-dots" role="tablist">
          ${slides.map((_, i) => `<button type="button" class="${i === onboardStep ? 'on' : ''}" aria-label="Écran ${i + 1}" onclick="OptiApp.goOnboard(${i})"></button>`).join('')}
        </div>
        <div class="onboard-actions">
          ${onboardStep > 0 ? `<button type="button" class="btn ghost onboard-btn" onclick="OptiApp.goOnboard(${onboardStep - 1})">Retour</button>` : '<span></span>'}
          <button type="button" class="btn gold onboard-btn" onclick="${last ? 'OptiApp.finishOnboard()' : `OptiApp.goOnboard(${onboardStep + 1})`}">
            <span>${last ? 'Continuer vers la connexion' : 'Suivant'}</span>
          </button>
        </div>
      </footer>
    </div>`;
  }

  function goOnboard(step) {
    onboardStep = Math.max(0, Math.min(2, +step || 0));
    renderOnboarding();
  }

  function finishOnboard() {
    markOnboarded();
    authMode = 'welcome';
    location.hash = '#/welcome';
    renderAuth();
  }

  function renderWelcome() {
    if (!hasOnboarded()) {
      onboardStep = 0;
      return renderOnboarding();
    }
    const hasUsers = !!(db().users || []).length;
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = `<div class="welcome-gate" style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;color:#fff;background:linear-gradient(155deg,#052E2B 0%,#0A5F58 42%,#0D7A70 72%,#14968A 100%)">
      <div class="welcome-bg" aria-hidden="true">
        <span class="w-orb o1"></span><span class="w-orb o2"></span><span class="w-orb o3"></span>
        <div class="w-grid"></div>
      </div>
      <header class="welcome-top">
        ${brand()}
        <div class="welcome-badges">
          <span class="w-pill">v${APP_VERSION}</span>
          <span class="w-pill soft">Essai 7 jours</span>
          <span class="w-pill soft">Algérie</span>
        </div>
      </header>
      <main class="welcome-main welcome-main-solo">
        <div class="welcome-copy" style="color:#fff;max-width:640px;width:100%">
          <p class="auth-kicker" style="color:#C5EDE8">Accès OptiDZ</p>
          <h1 style="color:#fff">Opti<span style="color:#9BE0D6">DZ</span></h1>
          <p class="welcome-lead" style="color:rgba(255,255,255,.92)">Deux licences : essai 7 jours, ou achat illimité. Dans les deux cas, entrez la clé donnée par OptiDZ.</p>
          <div class="access-choice">
            <button type="button" class="access-card trial" onclick="OptiApp.setAuthMode('trial')" style="background:#fff;color:#12151A;border:0;border-radius:20px;padding:22px 20px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:10px;align-items:flex-start;box-shadow:0 16px 40px rgba(0,0,0,.28)">
              <span class="access-badge" style="background:#0D7A70;color:#fff;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:750">Licence 1 · 7 jours</span>
              <strong style="color:#0A5F58;font-size:22px">Essayer gratuitement</strong>
              <span style="color:#4A5560;font-size:14px;line-height:1.45">Entrez votre clé d’essai (ESSAI) puis créez votre optique.</span>
            </button>
            <button type="button" class="access-card buy" onclick="OptiApp.setAuthMode('paidkey')" style="background:#E8F7F4;color:#12151A;border:1px solid rgba(13,122,112,.25);border-radius:20px;padding:22px 20px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:10px;align-items:flex-start;box-shadow:0 16px 40px rgba(0,0,0,.28)">
              <span class="access-badge buy" style="background:#0A5F58;color:#fff;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:750">Licence 2 · Achat</span>
              <strong style="color:#073F3A;font-size:22px">J’ai acheté</strong>
              <span style="color:#3D4F4B;font-size:14px;line-height:1.45">Entrez votre clé d’achat (PRO) donnée par l’admin.</span>
            </button>
          </div>
          ${hasUsers ? `<p class="welcome-extra"><button type="button" class="linkish light" onclick="OptiApp.setAuthMode('login')">Déjà un compte ? Se connecter</button></p>` : ''}
        </div>
      </main>
      <footer class="welcome-foot" style="color:rgba(255,255,255,.8)">OptiDZ · Développé en Algérie</footer>
    </div>`;
  }

  function keyGate(title, lead, formInner) {
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = `<div class="welcome-gate key-gate" style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 18px;color:#fff;background:linear-gradient(155deg,#052E2B 0%,#0A5F58 42%,#0D7A70 72%,#14968A 100%)">
      <div style="width:100%;max-width:460px">
        ${brand()}
        <div class="auth-card" style="margin-top:22px;background:#fff;color:#12151A;border-radius:22px;padding:28px 26px;box-shadow:0 22px 50px rgba(0,0,0,.28)">
          <p class="auth-kicker" style="color:#0A5F58;margin:0 0 8px">Licence OptiDZ</p>
          <h1 style="margin:0 0 8px;color:#0A5F58">${title}</h1>
          <p class="lead" style="color:#667078">${lead}</p>
          ${formInner}
        </div>
      </div>
    </div>`;
  }

  function renderTrialKey() {
    const pending = OptiLicense.getPending();
    keyGate(
      'Clé d’essai',
      'Entrez la clé ESSAI envoyée par OptiDZ. Valable 7 jours.',
      `<form class="form" onsubmit="OptiApp.submitTrialKey(event);return false">
          <div class="field">
            <label>Clé d’essai</label>
            <input id="trialKey" required autocomplete="off" placeholder="ESSAI-XXXX-XXXX" value="${esc(pending?.code || '')}" style="letter-spacing:.08em;font-weight:700;text-transform:uppercase;font-size:18px">
          </div>
          <p class="error" id="trialKeyError" style="display:none"></p>
          <button class="btn gold full login-go" type="submit"><span>Valider puis créer le compte</span></button>
        </form>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.setAuthMode('welcome')">← Retour</button> · <button type="button" class="linkish" onclick="OptiApp.setAuthMode('paidkey')">Clé d’achat</button></p>`
    );
    setTimeout(() => document.getElementById('trialKey')?.focus(), 80);
  }

  function renderPaidKey() {
    const pending = OptiLicense.getPending();
    keyGate(
      'Clé d’achat',
      'Entrez la clé PRO envoyée par l’admin après paiement. Ensuite vous vous connectez.',
      `<form class="form" onsubmit="OptiApp.submitPaidKey(event);return false">
          <div class="field">
            <label>Clé d’achat</label>
            <input id="buyKey" required autocomplete="off" placeholder="PRO-XXXX-XXXX" value="${esc(pending?.type === 'paid' ? (pending.code || '') : '')}" style="letter-spacing:.08em;font-weight:700;text-transform:uppercase;font-size:18px">
          </div>
          <p class="error" id="buyKeyError" style="display:none"></p>
          <button class="btn gold full login-go" type="submit"><span>Valider puis se connecter</span></button>
        </form>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.setAuthMode('welcome')">← Retour</button> · <button type="button" class="linkish" onclick="OptiApp.setAuthMode('trial')">Essai 7 jours</button></p>`
    );
    setTimeout(() => document.getElementById('buyKey')?.focus(), 80);
  }

  async function submitTrialKey(e) {
    e.preventDefault();
    const raw = document.getElementById('trialKey')?.value || '';
    const err = document.getElementById('trialKeyError');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    const res = await OptiLicense.prepareTrialKey(raw);
    if (!res.ok) {
      if (err) { err.textContent = res.error; err.style.display = 'block'; }
      return toast(res.error);
    }
    toast('Clé acceptée — créez votre optique');
    authMode = 'signup';
    location.hash = '#/signup';
    renderAuth();
  }

  function renderLicenseLock() {
    const st = OptiStore.licenseStatus();
    const expLabel = st.expiresAt || st.license?.expiresAt
      ? new Date(st.expiresAt || st.license.expiresAt).toLocaleString('fr-DZ')
      : '';
    keyGate(
      'Essai expiré',
      `${esc(st.label || 'Essai terminé')}${expLabel ? ' · ' + esc(expLabel) : ''}. Entrez la clé d’achat (PRO) pour rouvrir OptiDZ.`,
      `<div class="alert-bar warn" style="margin-bottom:16px">Vos données restent sur ce poste. Après achat, tout reprend normalement.</div>
        <form class="form" onsubmit="OptiApp.activatePaidKey(event);return false">
          <div class="field">
            <label>Clé d’achat</label>
            <input id="paidKey" required autocomplete="off" placeholder="PRO-XXXX-XXXX" style="letter-spacing:.08em;font-weight:700;text-transform:uppercase">
          </div>
          <p class="error" id="paidKeyError" style="display:none"></p>
          <button class="btn gold full" type="submit">Activer et ouvrir OptiDZ</button>
        </form>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.logout()">Déconnexion</button></p>`
    );
  }

  async function activatePaidKey(e) {
    e.preventDefault();
    const raw = document.getElementById('paidKey')?.value || '';
    const err = document.getElementById('paidKeyError');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    const res = OptiLicense.activatePaidOnShop(db(), raw);
    if (!res.ok) {
      if (err) { err.textContent = res.error; err.style.display = 'block'; }
      return toast(res.error);
    }
    OptiLicense.registerShopFromDb(db());
    await OptiStore.save('Activation licence payante');
    toast('Licence achetée activée — OptiDZ ouvert');
    go('#/app/dashboard');
  }

  function renderBlocked() {
    const st = OptiStore.accessControl();
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = authFrame(
      'Accès suspendu.',
      'OptiDZ a bloqué ce compte. Contactez l’éditeur pour régulariser.',
      `<h1>Application bloquée</h1>
        <p class="lead">${esc(st.reason || 'Accès refusé par l’administration OptiDZ.')}</p>
        ${st.problemNote ? `<div class="alert-bar warn" style="margin-bottom:14px"><b>Problème signalé :</b> ${esc(st.problemNote)}</div>` : ''}
        <p class="muted">Scope : ${esc(st.scope || 'admin')}</p>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.logout()">Déconnexion</button></p>`
    );
  }

  function guardAccess() {
    if (!guardAccess._lastReg || Date.now() - guardAccess._lastReg > 60000) {
      OptiLicense.registerShopFromDb(db());
      guardAccess._lastReg = Date.now();
    }
    OptiLicense.syncShopLicenseFromVault(db());
    const ctrl = OptiStore.accessControl();
    if (ctrl.blocked) {
      renderBlocked();
      return false;
    }
    if (!OptiStore.licenseAllowed()) {
      renderLicenseLock();
      return false;
    }
    return true;
  }

  function renderAuth() {
    if (authMode === 'welcome') return renderWelcome();
    if (authMode === 'trial') return renderTrialKey();
    if (authMode === 'paidkey') return renderPaidKey();
    const pending = OptiLicense.getPending();
    const trialSignup = pending && pending.type === 'trial';
    const paidSignup = pending && pending.type === 'paid';
    if (authMode === 'signup') {
      keyGate(
        trialSignup || paidSignup ? 'Inscription' : 'Nouvelle optique',
        trialSignup
          ? `Clé essai <b>${esc(OptiLicense.normalizeCode(pending.code))}</b> — ${OptiLicense.TRIAL_DAYS} jours.`
          : paidSignup
            ? `Clé achat <b>${esc(OptiLicense.normalizeCode(pending.code))}</b> — licence illimitée.`
            : 'Validez d’abord une clé d’essai ou d’achat.',
        `${trialSignup || paidSignup ? '' : `<p class="alert-bar warn" style="margin-bottom:14px">Passez par <button type="button" class="linkish" onclick="OptiApp.setAuthMode('trial')">Essai</button> ou <button type="button" class="linkish" onclick="OptiApp.setAuthMode('paidkey')">clé d’achat</button>.</p>`}
        <form class="form" id="signupForm" onsubmit="OptiApp.doSignup(event);return false">
          <div class="field">
            <label>Nom</label>
            <input id="signupName" required autocomplete="name" placeholder="Votre nom" ${trialSignup || paidSignup ? '' : 'disabled'}>
          </div>
          <div class="field">
            <label>Nom de l’optique</label>
            <input id="signupShop" required placeholder="Nom du magasin" ${trialSignup || paidSignup ? '' : 'disabled'}>
          </div>
          <div class="field">
            <label>Email</label>
            <input id="signupEmail" type="email" required autocomplete="username" placeholder="vous@optique.dz" ${trialSignup || paidSignup ? '' : 'disabled'}>
          </div>
          <div class="field pass-field">
            <label>Mot de passe</label>
            <input id="signupPass" type="password" required minlength="8" autocomplete="new-password" placeholder="8 caractères minimum" ${trialSignup || paidSignup ? '' : 'disabled'}>
            <button type="button" class="pass-eye" onclick="OptiApp.togglePass('signupPass')" aria-label="Afficher le mot de passe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <p class="error" id="signupError" style="display:none"></p>
          <button class="btn gold full login-go" type="submit" id="signupBtn" ${trialSignup || paidSignup ? '' : 'disabled'}><span>${paidSignup ? 'Créer le compte (licence)' : 'Créer le compte essai'}</span></button>
        </form>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.clearPendingTrial()">← Changer de clé</button> · <button type="button" class="linkish" onclick="OptiApp.setAuthMode('login')">J’ai déjà un compte</button></p>`
      );
      setTimeout(() => document.getElementById('signupName')?.focus(), 80);
      return;
    }
    keyGate(
      'Connexion',
      'Entrez l’email et le mot de passe du magasin.',
      `<form class="form" id="loginForm" onsubmit="OptiApp.doLogin(event);return false">
          <div class="field">
            <label>Email</label>
            <input id="loginEmail" type="email" required autocomplete="username" placeholder="vous@optique.dz">
          </div>
          <div class="field pass-field">
            <label>Mot de passe</label>
            <input id="loginPassword" type="password" required autocomplete="current-password">
            <button type="button" class="pass-eye" onclick="OptiApp.togglePass('loginPassword')" aria-label="Afficher le mot de passe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <p class="error" id="loginError" style="display:none">Email ou mot de passe incorrect.</p>
          <button class="btn gold full login-go" type="submit" id="loginBtn"><span>Entrer dans OptiDZ</span></button>
        </form>
        <p class="auth-foot"><button type="button" class="linkish" onclick="OptiApp.setAuthMode('welcome')">← Accueil</button> · <button type="button" class="linkish" onclick="OptiApp.setAuthMode('paidkey')">Clé d’achat</button></p>`
    );
    setTimeout(() => document.getElementById('loginEmail')?.focus(), 80);
  }

  function setAuthMode(mode) {
    if (mode === 'signup' && !OptiLicense.getPending()) {
      authMode = 'trial';
      location.hash = '#/trial';
      return renderAuth();
    }
    authMode = mode === 'signup' ? 'signup'
      : mode === 'login' ? 'login'
      : mode === 'trial' ? 'trial'
      : mode === 'paidkey' ? 'paidkey'
      : 'welcome';
    if (authMode === 'welcome') location.hash = '#/welcome';
    else if (authMode === 'signup') location.hash = '#/signup';
    else if (authMode === 'trial') location.hash = '#/trial';
    else if (authMode === 'paidkey') location.hash = '#/achat';
    else location.hash = '#/login';
    renderAuth();
  }

  function fillDemo() {
    toast('Le mode démo est désactivé. Créez un compte via Inscription.');
  }

  function togglePass(id) {
    const p = document.getElementById(id || 'loginPassword');
    if (!p) return;
    p.type = p.type === 'password' ? 'text' : 'password';
  }

  function renderSetup() {
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = authFrame(
      'Installation du magasin.',
      'Une seule fois sur ce poste : nom de l’optique et compte administrateur.',
      `<h1>Installation</h1>
        <p class="lead">Créez le magasin et le compte administrateur.</p>
        <form class="form" onsubmit="OptiApp.doSetup(event);return false">
          <div class="field"><label>Nom de l'optique</label><input id="setupShop" required placeholder="Nom du magasin"></div>
          <div class="formgrid">
            <div class="field"><label>Ville</label><input id="setupCity" required></div>
            <div class="field"><label>Téléphone</label><input id="setupPhone" required></div>
          </div>
          <div class="field"><label>Votre nom</label><input id="setupName" required></div>
          <div class="field"><label>Email de connexion</label><input id="setupEmail" type="email" required autocomplete="username"></div>
          <div class="field"><label>Mot de passe</label><input id="setupPass" type="password" required minlength="8" autocomplete="new-password" placeholder="8 caractères minimum"></div>
          <div class="field"><label>Confirmer</label><input id="setupPass2" type="password" required minlength="8" autocomplete="new-password"></div>
          <button class="btn gold full" type="submit">Créer le compte</button>
        </form>`
    );
  }

  async function doSetup(e) {
    e.preventDefault();
    const shop = document.getElementById('setupShop').value.trim();
    const city = document.getElementById('setupCity').value.trim();
    const phone = document.getElementById('setupPhone').value.trim();
    const name = document.getElementById('setupName').value.trim();
    const email = document.getElementById('setupEmail').value.trim().toLowerCase();
    const pass = document.getElementById('setupPass').value;
    const pass2 = document.getElementById('setupPass2').value;
    if (pass.length < 8) return toast('Le mot de passe doit contenir au moins 8 caractères.');
    if (pass !== pass2) return toast('Les mots de passe ne correspondent pas.');
    if (email === 'demo@optidz.dz') return toast('Choisissez un autre email que le compte démo.');
    await OptiStore.startRealShop({ shopName: shop, email, city, phone });
    await OptiStore.createUser({ name, email, phone, role: 'admin', password: pass });
    const s = await OptiStore.login(email, pass);
    await OptiStore.save('Création du magasin');
    toast('Bienvenue ' + s.name);
    go('#/app/dashboard');
  }

  async function submitPaidKey(e) {
    e.preventDefault();
    const raw = document.getElementById('buyKey')?.value || '';
    const err = document.getElementById('buyKeyError');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    const hasShop = !!(db().users || []).length;
    if (hasShop) {
      const res = OptiLicense.activatePaidOnShop(db(), raw);
      if (!res.ok) {
        if (err) { err.textContent = res.error; err.style.display = 'block'; }
        return toast(res.error);
      }
      OptiLicense.registerShopFromDb(db());
      await OptiStore.save('Activation licence payante');
      toast('Clé d’achat acceptée — connectez-vous');
      authMode = 'login';
      location.hash = '#/login';
      return renderAuth();
    }
    const res = await OptiLicense.preparePaidKey(raw);
    if (!res.ok) {
      if (err) { err.textContent = res.error; err.style.display = 'block'; }
      return toast(res.error);
    }
    toast('Clé d’achat acceptée — créez votre optique');
    authMode = 'signup';
    location.hash = '#/signup';
    renderAuth();
  }

  async function doSignup(e) {
    e.preventDefault();
    const pending = OptiLicense.getPending();
    if (!pending || (pending.type !== 'trial' && pending.type !== 'paid')) {
      toast('Validez d’abord une clé');
      return setAuthMode('trial');
    }
    const name = (document.getElementById('signupName')?.value || '').trim();
    const shop = (document.getElementById('signupShop')?.value || '').trim();
    const email = (document.getElementById('signupEmail')?.value || '').trim().toLowerCase();
    const pass = document.getElementById('signupPass')?.value || '';
    const err = document.getElementById('signupError');
    const btn = document.getElementById('signupBtn');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    if (!name || !shop || !email || !pass) return toast('Remplissez tous les champs.');
    if (email === 'demo@optidz.dz') {
      if (err) { err.textContent = 'Choisissez un autre email que le compte démo.'; err.style.display = 'block'; }
      return toast('Choisissez un autre email que le compte démo.');
    }
    if (pass.length < 8) {
      if (err) { err.textContent = 'Le mot de passe doit contenir au moins 8 caractères.'; err.style.display = 'block'; }
      return toast('Mot de passe trop court (8 caractères min.).');
    }
    if (OptiStore.emailTaken(email)) {
      if (err) { err.textContent = 'Cet email existe déjà.'; err.style.display = 'block'; }
      return toast('Cet email existe déjà.');
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Création…'; }
    try {
      await OptiStore.startRealShop({ shopName: shop, email });
      await OptiStore.createUser({ name, email, role: 'admin', password: pass });
      const s = await OptiStore.login(email, pass);
      OptiLicense.registerShopFromDb(db());
      await OptiStore.save(pending.type === 'paid' ? 'Inscription licence achetée' : 'Inscription essai 7j');
      document.querySelector('.auth-live')?.classList.add('auth-ok');
      await new Promise((r) => setTimeout(r, 280));
      toast(pending.type === 'paid'
        ? 'Licence activée — Bienvenue ' + (s?.name || name)
        : 'Essai activé — ' + OptiLicense.TRIAL_DAYS + ' jours · Bienvenue ' + (s?.name || name));
      go('#/app/dashboard');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Créer le compte</span>'; }
    }
  }

  async function doLogin(e) {
    e.preventDefault();
    const emailEl = document.getElementById('loginEmail');
    const passEl = document.getElementById('loginPassword');
    const err = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    if (!emailEl || !passEl) return;
    if (err) err.style.display = 'none';
    if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }
    try {
      const s = await OptiStore.login(emailEl.value.trim(), passEl.value);
      if (!s) {
        if (err) err.style.display = 'block';
        toast('Email ou mot de passe incorrect');
        return;
      }
      await OptiStore.save('Connexion');
      document.querySelector('.auth-live')?.classList.add('auth-ok');
      await new Promise((r) => setTimeout(r, 280));
      if (!guardAccess()) return;
      go('#/app/dashboard');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Entrer dans OptiDZ</span>'; }
    }
  }

  const NAV = [
    ['sec', 'Vue', ''],
    ['Tableau de bord', 'dashboard', 'dashboard'],
    ['Clients', 'clients', 'clients'],
    ['Dossiers', 'rx', 'rx'],
    ['sec', 'Vente', ''],
    ['Vente comptoir', 'atelier', 'atelier'],
    ['Caisse', 'sales', 'sales'],
    ['Clôture caisse', 'caisse', 'caisse'],
    ['Devis', 'quotes', 'quotes'],
    ['Commandes', 'orders', 'orders'],
    ['Agenda', 'rdv', 'rdv'],
    ['sec', 'Stock', ''],
    ['Produits', 'products', 'products'],
    ['Stock', 'stock', 'stock'],
    ['Tables', 'tables', 'tables'],
    ['Achats', 'purchases', 'purchases'],
    ['Fournisseurs', 'suppliers', 'suppliers'],
    ['sec', 'Pilotage', ''],
    ['Finances', 'finance', 'finance'],
    ['Rapports', 'reports', 'reports'],
    ['Alertes', 'notifications', 'notifications'],
    ['Analyses', 'ai', 'ai'],
    ['Scanner', 'ocr', 'ocr'],
    ['Paramètres', 'settings', 'settings']
  ];

  function shell(page, inner) {
    const u = db().session;
    const shop = db().shop.name || 'OptiDZ';
    const lic = OptiStore.licenseStatus();
    const ctrl = OptiStore.accessControl();
    const online = navigator.onLine !== false;
    const licBanner = !online
      ? `<div class="lic-banner offline">Mode hors ligne — données locales sur ce poste</div>`
      : ctrl.problemNote && !ctrl.blocked
        ? `<div class="lic-banner problem">Message admin : ${esc(ctrl.problemNote)}</div>`
      : lic.state === 'trial'
      ? `<div class="lic-banner trial">Essai gratuit — <b>${lic.daysLeft} jour(s)</b> restant(s) · clé ${esc(OptiLicense.normalizeCode(lic.license?.code || ''))}</div>`
      : lic.state === 'paid'
        ? `<div class="lic-banner paid">Licence achetée active</div>`
        : '';
    document.getElementById('root').className = '';
    document.getElementById('root').innerHTML = `<div class="ws">
      <aside class="side">
        ${brand(true)}
        <div class="shop">${esc(shop)}${db().shop.city ? '<br>' + esc(db().shop.city) : ''}</div>
        <nav>${NAV.map(([l,id,ic])=>{
          if (l === 'sec') return `<div class="sec">${id}</div>`;
          if (!OptiStore.can(id)) return '';
          return `<button class="${id===page?'active':''}" onclick="OptiApp.go('#/app/${id}')">${ico(ic)} <span class="txt">${l}</span></button>`;
        }).join('')}
        <div class="sec">Compte</div>
        <button class="${page==='about'?'active':''}" onclick="OptiApp.go('#/app/about')">${ico('about')} <span class="txt">À propos</span></button>
        <button onclick="OptiApp.logout()">${ico('logout')} <span class="txt">Déconnexion</span></button>
        </nav>
        <div class="side-live"><span class="dot"></span><span class="txt">Magasin en ligne</span></div>
      </aside>
      <div class="main">
        ${licBanner}
        <header class="top top-live">
          <div class="top-title">
            <span class="top-kicker">${esc(db().shop?.name || 'OptiDZ')}</span>
            <strong>${page === 'about' ? 'À propos' : (NAV.find(x=>x[1]===page)?.[0]||'')}</strong>
          </div>
          <div class="omni" id="omniWrap">
            <svg class="omni-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M16.2 16.2L21 21" stroke-linecap="round"/></svg>
            <input class="search" id="omni" placeholder="Recherche intelligente : client, produit, facture, page…" autocomplete="off"
              oninput="OptiApp.globalSearch(this.value)"
              onfocus="OptiApp.omniFocus()"
              onkeydown="OptiApp.omniKey(event)">
            <kbd class="omni-kbd">Ctrl K</kbd>
            <div id="omniList" class="omni-list hide"></div>
          </div>
          <div class="userline">
            <button type="button" class="btn sm gold" onclick="OptiApp.go('#/app/caisse')">Clôturer la caisse</button>
            <span class="badge goldb role-live">${esc(u.role)}</span>
            <span class="avatar av-live">${esc((u.name||'?')[0])}</span>
            <span class="user-name">${esc(u.name)}</span>
            <button type="button" class="chat-btn" onclick="OptiApp.toggleClaude()" title="Assistant OptiDZ" aria-label="Ouvrir l’assistant">
              <span class="chat-btn-ring" aria-hidden="true"></span>
              <span class="chat-btn-ring r2" aria-hidden="true"></span>
              <svg class="chat-bot-ico" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="6" y="10" width="20" height="14" rx="7" fill="currentColor" opacity=".12"/>
                <path d="M16 5v4M10 16.5h12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                <circle cx="12.5" cy="16.5" r="2.4" fill="currentColor"/>
                <circle cx="19.5" cy="16.5" r="2.4" fill="currentColor"/>
                <path d="M11 22.5c1.4 1.2 2.9 1.8 5 1.8s3.6-.6 5-1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                <circle cx="16" cy="4.2" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </header>
        <div class="content page-in">${inner}</div>
      </div>
    </div>`;
    if (claudeOpen) document.querySelector('.chat-btn')?.classList.add('on');
  }

  async function logout() {
    OptiStore.logout();
    await OptiStore.save('Déconnexion');
    authMode = 'welcome';
    go('#/welcome');
  }

  function clearPendingTrial() {
    OptiLicense.clearPending();
    setAuthMode('welcome');
  }

  function aboutPanelHtml() {
    return `
      <div class="about-page">
        <section class="about-banner">
          <div class="about-banner-copy">
            <p class="about-kicker">À propos de nous</p>
            <h1>OptiDZ <em>v${APP_VERSION}</em></h1>
            <p>Logiciel de gestion d’optique intelligent, conçu en Algérie — caisse, CNAS, ordonnances, stock et assistant IA.</p>
            <div class="about-chips">
              <span>Build ${APP_BUILD}</span>
              <span>Full Stack · IA</span>
              <span>dz.optidz.app</span>
            </div>
          </div>
          <div class="about-banner-orb" aria-hidden="true"><i></i><b></b><i></i></div>
        </section>
        <section class="about-devs">
          <h2>Développeurs</h2>
          <div class="dev-cards">
            ${DEVS.map((d,i)=>`<article class="dev-card" style="animation-delay:${.08+i*.12}s">
              <div class="dev-av lg">${esc(d.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div>
              <h3>${esc(d.name)}</h3>
              <p class="dev-role">${esc(d.role)}</p>
              <p>${esc(d.focus)}</p>
            </article>`).join('')}
          </div>
        </section>
        <section class="about-protect">
          <h2>Protection du projet</h2>
          <div class="protect-grid">
            <div><strong>Propriété</strong><p>© ${new Date().getFullYear()} Benaboud Roqia & Abdarahim Salem. Tous droits réservés.</p></div>
            <div><strong>Licence</strong><p>Usage magasin autorisé uniquement. Copie, revente ou redistribution interdites.</p></div>
            <div><strong>Données</strong><p>Informations locales sur ce poste. Aucune clé API exposée à l’écran.</p></div>
            <div><strong>Version</strong><p>OptiDZ ${APP_VERSION} · build ${APP_BUILD}</p></div>
          </div>
          <p class="protect-seal">Projet protégé — reproduction non autorisée</p>
        </section>
      </div>`;
  }

  function renderAbout() {
    shell('about', aboutPanelHtml());
  }

  function kpi(label, n, extra) {
    return `<div class="card kpi"><div class="label">${label}${extra ? ' <span class="muted">' + extra + '</span>' : ''}</div><div class="n">${n}</div></div>`;
  }
  function kpiMoney(label, n) {
    return `<div class="card kpi dash-kpi"><div class="label">${label}</div><div class="n" data-money="${n}">${money(0)}</div></div>`;
  }
  function kpiInt(label, n) {
    return `<div class="card kpi dash-kpi"><div class="label">${label}</div><div class="n" data-int="${n}">0</div></div>`;
  }

  let dashClock = null;
  function playDash() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const run = (el, target, fmt) => {
      if (reduced) { el.textContent = fmt(target); return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 860);
        el.textContent = fmt(Math.round(target * ease(p)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    document.querySelectorAll('[data-money]').forEach((el) => run(el, +el.getAttribute('data-money') || 0, money));
    document.querySelectorAll('[data-int]').forEach((el) => run(el, +el.getAttribute('data-int') || 0, (n) => String(n)));
    if (dashClock) clearInterval(dashClock);
    const tick = () => {
      const el = document.getElementById('dashClock');
      if (!el) { clearInterval(dashClock); dashClock = null; return; }
      el.textContent = new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    tick();
    dashClock = setInterval(tick, 1000);
  }

  function renderDashboard() {
    const d = db();
    const t = OptiStore.todayISO();
    const month = OptiAI.monthStart();
    const salesDay = d.sales.filter((s) => s.date === t);
    const salesMonth = d.sales.filter((s) => s.date >= month);
    const caM = salesMonth.reduce((a, s) => a + s.total, 0);
    const caD = salesDay.reduce((a, s) => a + s.total, 0);
    const profit = d.sales.reduce((a, s) => a + (s.items || []).reduce((b, i) => {
      const p = d.products.find((x) => x.id === i.productId);
      return b + (i.price - (p?.buy || i.price * 0.55)) * i.q;
    }, 0), 0);
    const exp = d.expenses.reduce((a, e) => a + e.amount, 0);
    const pending = d.orders.filter((o) => !['Livrée', 'Annulée'].includes(o.status));
    const low = OptiAI.lowStock();
    const top = OptiAI.topProducts(4);
    const rdv = d.appointments.filter((a) => a.date === t);
    const monthSales = [0, 0, 0, 0, 0, 0];
    (d.sales || []).forEach((s) => {
      if (!s.date || s.status === 'retour') return;
      const m = Number(String(s.date).slice(5, 7));
      const now = new Date().getMonth() + 1;
      const idx = (m - (now - 5) + 12) % 12;
      if (idx >= 0 && idx < 6) monthSales[idx] += s.total || 0;
    });
    const vals = monthSales;
    const mx = Math.max(...vals, 1);
    const hour = new Date().getHours();
    const hi = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const unpaid = d.sales.filter((s) => s.status !== 'retour').reduce((a, s) => a + Math.max(0, s.total - (s.coverAmount || 0) - s.paid), 0);
    const rxExp = d.prescriptions.filter((r) => OptiStore.isRxExpired(r)).length;
    const quotesOpen = d.quotes.filter((q) => q.status !== 'converti' && q.status !== 'refusé').length;
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - i);
      monthLabels.push(dt.toLocaleDateString('fr-DZ', { month: 'short' }));
    }
    shell('dashboard', `
      <h1 class="h1">${hi}${d.session?.name ? ', ' + esc(d.session.name.split(' ')[0]) : ''}.</h1>
      <div class="sub">${esc(d.shop.name || 'Votre optique')} — ${esc(d.shop.city || 'Algérie')} · <span id="dashClock"></span></div>
      <div class="grid4">${kpiMoney('CA du mois', caM)}${kpiMoney('Ventes du jour', caD)}${kpiInt('Clients', d.clients.length)}${kpiMoney('Bénéfice estimé', profit - exp)}</div>
      ${OptiOps.cashBanner()}
      <div class="grid4" style="margin-top:12px">${kpiInt('Devis ouverts', quotesOpen)}${kpiInt('Ordonnances périmées', rxExp)}${kpiMoney('Impayés', unpaid)}${kpi('Caisse', OptiStore.openCashSession() ? 'Ouverte' : 'Fermée')}</div>
      <div class="toolbar" style="margin-top:12px">
        <button class="btn gold" onclick="OptiApp.go('#/app/atelier')">Vente comptoir</button>
        <button class="btn" onclick="OptiApp.go('#/app/caisse')">Clôturer la caisse</button>
      </div>
      <div class="grid2" style="margin-top:16px">
        <div class="card dash-chart"><div class="toolbar"><strong>Chiffre d’affaires</strong><span class="label">6 mois</span></div>
          <div class="chart">${vals.map((v,i)=>`<div class="bar" style="height:${v > 0 ? Math.max(12, v / mx * 150) : 4}px"><b>${esc(monthLabels[i] || '')}</b></div>`).join('')}</div>
        </div>
        <div class="card dash-feed"><div class="toolbar"><strong>Alertes</strong><span class="badge warn">${d.notifications.length}</span></div>
          ${d.notifications.slice(0,6).map(n=>`<div class="alert"><span class="badge ${n.level}">${n.type}</span> ${esc(n.text)}</div>`).join('')||'<p class="muted">Aucune alerte.</p>'}
        </div>
      </div>
      <div class="grid3" style="margin-top:16px">
        <div class="card dash-feed"><strong>Rendez-vous du jour</strong>${rdv.map(a=>`<div class="alert"><b>${a.time}</b> ${esc(OptiStore.clientName(a.clientId))} — ${esc(a.reason)}</div>`).join('')||'<p class="muted">Aucun rendez-vous.</p>'}</div>
        <div class="card dash-feed"><strong>Commandes en cours</strong>${pending.slice(0,5).map(o=>`<div class="alert">${o.id} · <span class="badge warn">${o.status}</span></div>`).join('')||'<p class="muted">Aucune commande en cours.</p>'}</div>
        <div class="card dash-feed"><strong>Stock</strong>${top.length ? top.map(p=>`<div class="alert">${esc(p.brand)} ${esc(p.model||'')} <b style="float:right">${p.qty}</b></div>`).join('') : '<p class="muted">Aucun produit enregistré.</p>'}</div>
      </div>
      <div class="grid4" style="margin-top:16px">${kpiInt('Nouvelles commandes', pending.filter(o=>o.status==='Nouvelle').length)}${kpiInt('Ruptures', d.products.filter(p=>p.qty<=0).length)}${kpiInt('Stock faible', low.length)}${kpiMoney('Dépenses', exp)}</div>
    `);
    playDash();
  }

  function renderClients() {
    const q = (document.getElementById('q')?.value || '').toLowerCase();
    const rows = db().clients.filter((c) => (c.firstName + c.lastName + c.phone + (c.email || '') + (c.profession || '')).toLowerCase().includes(q));
    shell('clients', `
      <h1 class="h1">Fichier des clients</h1><div class="sub">Fiches, dernière visite, crédit, historique et carte fidélité.</div>
      <div class="toolbar"><input class="search" id="q" placeholder="Nom, téléphone, profession…" oninput="OptiApp.renderClients()" value="${esc(q)}">
        <button class="btn gold" onclick="OptiApp.editClient()">+ Client</button>
        <button class="btn gold" onclick="OptiApp.go('#/app/atelier')">Vente comptoir</button>
        <button class="btn" onclick="OptiApp.exportCSV('clients')">Exporter</button>
      </div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>Code</th><th>Nom</th><th>Naissance</th><th>Tél</th><th>Profession</th><th>Client depuis</th><th>Dernière visite</th><th>Crédit</th><th></th></tr></thead>
      <tbody>${rows.length ? rows.map(c=>{
        const credit = OptiStore.clientCredit(c.id);
        const last = OptiStore.lastVisit(c.id) || c.created || '';
        return `<tr><td>C-${c.id}</td><td><strong>${esc(c.civility||'')} ${esc(c.lastName||'')} ${esc(c.firstName||'')}</strong></td><td>${esc(c.birth||'')}</td><td>${esc(c.phone)}</td><td>${esc(c.profession||'')}</td><td>${esc(c.created||'')}</td><td>${esc(last)}</td><td>${credit?money(credit):'0'}</td>
        <td><button class="btn sm" onclick="OptiApp.viewClient(${c.id})">Ouvrir</button>
          <button class="btn sm gold" onclick="OptiApp.openAtelierFor(${c.id})">Opération</button></td></tr>`;
      }).join('') : '<tr><td colspan="9" class="muted">Aucun client. Ajoutez votre premier client.</td></tr>'}</tbody></table></div>`);
    const qel = document.getElementById('q'); if (qel) { qel.focus(); const n = qel.value.length; qel.setSelectionRange(n, n); }
  }

  function editClient(id) {
    const c = db().clients.find((x) => x.id === id) || {};
    openModal(id ? 'Modifier le client' : 'Nouveau client', `
      <form class="form" onsubmit="OptiApp.saveClient(event,${id||0})">
        <div class="formgrid">
          <div class="field"><label>Civilité</label><select id="civility">${['','Monsieur','Madame','Mademoiselle','Enfant'].map(x=>`<option ${x===(c.civility||'')?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Prénom</label><input id="firstName" value="${esc(c.firstName||'')}" required></div>
          <div class="field"><label>Nom</label><input id="lastName" value="${esc(c.lastName||'')}" required></div>
          <div class="field"><label>Téléphone</label><input id="phone" value="${esc(c.phone||'')}" placeholder="0550 00 00 00" required></div>
          <div class="field"><label>Naissance</label><input id="birth" type="date" value="${esc(c.birth||'')}"></div>
          <div class="field"><label>Profession</label><input id="profession" list="profList" value="${esc(c.profession||'')}"><datalist id="profList">${(db().refTables?.professions||[]).map(x=>`<option value="${esc(x)}">`).join('')}</datalist></div>
        </div>
        <div class="field"><label>Adresse</label><input id="address" value="${esc(c.address||'')}"></div>
        <div class="field"><label>Email</label><input id="emailC" value="${esc(c.email||'')}"></div>
        <div class="field"><label>Informations complémentaires</label><input id="extra" value="${esc(c.extra||'')}"></div>
        <div class="field"><label>Notes</label><textarea id="notes">${esc(c.notes||'')}</textarea></div>
        <button class="btn gold">Enregistrer</button>
      </form>`);
  }
  async function saveClient(e, id) {
    e.preventDefault();
    const o = { firstName: firstName.value, lastName: lastName.value, phone: phone.value, birth: birth.value, address: address.value, email: emailC.value, extra: extra.value, notes: notes.value, civility: civility?.value || '', profession: profession?.value || '' };
    if (id) Object.assign(db().clients.find((x) => x.id === id), o);
    else db().clients.push({ id: Date.now(), loyalty: 0, created: OptiStore.todayISO(), ...o });
    await OptiStore.save('Client enregistré');
    closeModal(); toast('Client enregistré'); renderClients();
  }
  function viewClient(id) {
    const c = db().clients.find((x) => x.id === id);
    const rx = db().prescriptions.filter((x) => x.clientId === id);
    const sales = db().sales.filter((x) => x.clientId === id);
    const ords = db().orders.filter((x) => x.clientId === id);
    const pays = sales.map((s) => `${s.id} ${money(s.paid)}/${money(s.total)}`);
    const rdv = db().appointments.filter((x) => x.clientId === id);
    const fac = db().invoices.filter((x) => x.clientId === id);
    openModal(c.firstName + ' ' + c.lastName, `
      <div class="grid2">
        <div class="card"><strong>Fiche</strong><p class="muted">${esc(c.phone)}<br>${esc(c.address)}<br>${esc(c.birth||'')} · ${c.loyalty||0} pts (${money(OptiStore.redeemValue(c.loyalty||0))})</p>
          <button class="btn sm" onclick="OptiApp.editClient(${id})">Modifier</button>
          <button class="btn sm" onclick="OptiApp.printClientStatement(${id})">Fiche / relevé</button>
          <button class="btn sm" onclick="OptiApp.waClient(${id})">WhatsApp</button>
          <button class="btn sm" onclick="OptiApp.waClient(${id},'ready')">Lunettes prêtes</button>
          <button class="btn sm gold" onclick="OptiApp.redeemLoyalty(${id})">Utiliser points</button>
          <button class="btn sm danger" onclick="OptiApp.delClient(${id})">Supprimer</button>
        </div>
        <div class="card"><strong>Carte client</strong><p class="muted">${esc(c.firstName)} ${esc(c.lastName)} — C-${id}</p><div class="thumb">C-${id}</div></div>
      </div>
      <div class="card" style="margin-top:12px">
        <p><b>Ordonnances</b> ${rx.length} · <b>Achats</b> ${sales.length} · <b>Commandes</b> ${ords.length}</p>
        <p class="muted">Paiements : ${pays.join(' · ')||'—'}<br>RDV : ${rdv.map(a=>a.date+' '+a.time).join(' · ')||'—'}</p>
        <div class="toolbar"><button class="btn sm gold" onclick="OptiApp.printClientStatement(${id})">Relevé PDF</button></div>
        ${fac.map(f=>{const sale=db().sales.find(s=>s.id===f.saleId);return `<div class="alert">${esc(f.id)} · ${esc(f.date)} · ${money(f.total)} · ${esc(f.status)}
          ${sale?`<button class="btn sm" onclick="OptiApp.printInvoice('${sale.id}')">Facture PDF</button>`:''}</div>`;}).join('')||'<p class="muted">Aucune facture.</p>'}
        ${rx.map(r=>{const exp=OptiStore.isRxExpired(r);const soon=OptiStore.isRxSoon(r);return `<div class="rxbox" style="margin-top:8px">${r.date} ${r.type||''} — OD ${rxLine(r.od)} · OG ${rxLine(r.og)} ${exp?'<span class="badge bad">périmée</span>':soon?'<span class="badge warn">à renouveler</span>':''}</div>`;}).join('')}
      </div>`);
  }
  async function delClient(id) {
    if (!confirm('Supprimer ce client ?')) return;
    db().clients = db().clients.filter((x) => x.id !== id);
    await OptiStore.save('Client supprimé'); closeModal(); renderClients();
  }
  function printClient(id) { OptiOps.printClientStatement(id); }

  function rxLine(e) {
    if (!e) return '';
    if (e.loin) {
      const d = e.loin;
      return `${d.sph || ''} / ${d.cyl || ''} × ${d.axis || ''}`;
    }
    return `${e.sph || ''} / ${e.cyl || ''} × ${e.axis || ''}`;
  }
  function renderRx() {
    const q = (document.getElementById('q')?.value || '').toLowerCase();
    const rows = db().prescriptions.filter((r) => (OptiStore.clientName(r.clientId) + r.type + rxLine(r.od)).toLowerCase().includes(q));
    shell('rx', `
      <h1 class="h1">Dossier optique</h1><div class="sub">Ordonnances OD/OG, mesures, historique et comparaison.</div>
      <div class="toolbar"><input class="search" id="q" oninput="OptiApp.renderRx()" placeholder="Client, type…">
        <button class="btn gold" onclick="OptiApp.editRx()">+ Prescription</button>
        <button class="btn" onclick="OptiApp.go('#/app/ocr')">Scanner une ordonnance</button></div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>Client</th><th>OD</th><th>OG</th><th>PD</th><th>Type</th><th>Médecin</th><th>Date</th><th></th></tr></thead>
      <tbody>${rows.map(r=>{const exp=OptiStore.isRxExpired(r);return `<tr><td>${esc(OptiStore.clientName(r.clientId))}</td><td>${esc(rxLine(r.od))}</td><td>${esc(rxLine(r.og))}</td><td>${esc(r.pd)} mm</td><td>${esc(r.type||'')}</td><td>${esc(r.doctor||'')}</td><td>${esc(r.date)} ${exp?'<span class="badge bad">périmée</span>':OptiStore.isRxSoon(r)?'<span class="badge warn">bientôt</span>':''}</td>
        <td><button class="btn sm" onclick="OptiApp.editRx(${r.id})">Ouvrir</button></td></tr>`;}).join('')}</tbody></table></div>`);
  }
  function eyeFields(p, e) {
    e = OptiStore.normalizeEye(e);
    const row = (dist, label) => `<tr>
      <th>${label}</th>
      <td><input id="${p}${dist}sph" value="${esc(e[dist].sph || '')}"></td>
      <td><input id="${p}${dist}cyl" value="${esc(e[dist].cyl || '')}"></td>
      <td><input id="${p}${dist}axis" value="${esc(e[dist].axis || '')}"></td>
      <td><input id="${p}${dist}add" value="${esc(e[dist].add || '')}"></td>
      <td><input id="${p}${dist}prism" value="${esc(e[dist].prism || '')}"></td>
      <td><input id="${p}${dist}base" value="${esc(e[dist].base || '')}"></td>
    </tr>`;
    return `<div class="rxbox"><h3>${p === 'od' ? 'OD — Œil droit' : 'OG — Œil gauche'}</h3>
      <div class="tablewrap"><table class="data rx-mini">
        <thead><tr><th></th><th>Sphère</th><th>Cylindre</th><th>Axe</th><th>Add</th><th>Prisme</th><th>Base</th></tr></thead>
        <tbody>${row('loin', 'Loin')}${row('inter', 'Interm')}${row('pres', 'Près')}
          <tr><td>Écart / H</td><td colspan="2"><input id="${p}ecart" value="${esc(e.ecart || '')}"></td><td colspan="4"><input id="${p}haut" value="${esc(e.hauteur || '')}"></td></tr>
        </tbody>
      </table></div></div>`;
  }
  function editRx(id) {
    const r = db().prescriptions.find((x) => x.id === id) || { od: {}, og: {} };
    const prev = id ? db().prescriptions.filter((x) => x.clientId === r.clientId && x.id !== id).slice(-1)[0] : null;
    openModal(id ? 'Prescription' : 'Nouvelle prescription', `
      <form class="form" onsubmit="OptiApp.saveRx(event,${id||0})">
        <div class="formgrid">
          <div class="field"><label>Client</label><select id="rxClient">${db().clients.map(c=>`<option value="${c.id}" ${c.id==r.clientId?'selected':''}>${esc(c.firstName)} ${esc(c.lastName)}</option>`).join('')}</select></div>
          <div class="field"><label>Médecin prescripteur</label><input id="rxDoc" value="${esc(r.doctor||'')}"></div>
          <div class="field"><label>Date</label><input id="rxDate" type="date" value="${esc(r.date||OptiStore.todayISO())}"></div>
          <div class="field"><label>Type</label><select id="rxType">${['Loin','Près','Intermédiaire','Progressif'].map(x=>`<option ${x===r.type?'selected':''}>${x}</option>`).join('')}</select></div>
        </div>
        <div class="eyegrid">${eyeFields('od', r.od)}${eyeFields('og', r.og)}</div>
        <div class="formgrid" style="grid-template-columns:repeat(3,1fr)">
          <div class="field"><label>PD</label><input id="pd" value="${esc(r.pd||'')}"></div>
          <div class="field"><label>DP droite</label><input id="pdR" value="${esc(r.pdR||'')}"></div>
          <div class="field"><label>DP gauche</label><input id="pdL" value="${esc(r.pdL||'')}"></div>
          <div class="field"><label>Hauteur</label><input id="height" value="${esc(r.height||'')}"></div>
          <div class="field"><label>Distance verre-œil</label><input id="vcd" value="${esc(r.vcd||'')}"></div>
          <div class="field"><label>Angle pantoscopique</label><input id="panto" value="${esc(r.panto||'')}"></div>
        </div>
        <div class="field"><label>Notes</label><textarea id="rxNotes">${esc(r.notes||'')}</textarea></div>
        ${prev ? `<div class="rxbox"><strong>Comparaison précédente (${prev.date})</strong><p class="muted">OD ${rxLine(prev.od)} → ${rxLine(r.od||{})}<br>OG ${rxLine(prev.og)} → ${rxLine(r.og||{})}</p></div>` : ''}
        <button class="btn gold">Enregistrer après vérification</button>
      </form>`);
  }
  async function saveRx(e, id) {
    e.preventDefault();
    const o = {
      clientId: +rxClient.value, doctor: rxDoc.value, date: rxDate.value, type: rxType.value,
      od: {
        loin: { sph: odloinsph.value, cyl: odloincyl.value, axis: odloinaxis.value, add: odloinadd.value, prism: odloinprism.value, base: odloinbase.value },
        inter: { sph: odintersph.value, cyl: odintercyl.value, axis: odinteraxis.value, add: odinteradd.value, prism: odinterprism.value, base: odinterbase.value },
        pres: { sph: odpressph.value, cyl: odprescyl.value, axis: odpresaxis.value, add: odpresadd.value, prism: odpresprism.value, base: odpresbase.value },
        ecart: odecart.value, hauteur: odhaut.value
      },
      og: {
        loin: { sph: ogloinsph.value, cyl: ogloincyl.value, axis: ogloinaxis.value, add: ogloinadd.value, prism: ogloinprism.value, base: ogloinbase.value },
        inter: { sph: ogintersph.value, cyl: ogintercyl.value, axis: oginteraxis.value, add: oginteradd.value, prism: oginterprism.value, base: oginterbase.value },
        pres: { sph: ogpressph.value, cyl: ogprescyl.value, axis: ogpresaxis.value, add: ogpresadd.value, prism: ogpresprism.value, base: ogpresbase.value },
        ecart: ogecart.value, hauteur: oghaut.value
      },
      pd: pd.value, pdR: pdR.value, pdL: pdL.value, height: height.value, vcd: vcd.value, panto: panto.value, notes: rxNotes.value
    };
    if (id) Object.assign(db().prescriptions.find((x) => x.id === id), o);
    else db().prescriptions.push({ id: Date.now(), photo: '', conf: {}, ...o });
    await OptiStore.save('Prescription'); closeModal(); toast('Prescription validée par l’opticien'); renderRx();
  }

  function renderProducts() {
    const q = (document.getElementById('q')?.value || '').toLowerCase();
    const list = db().products.filter((p) => (prodTab === 'all' || p.type === prodTab) && (p.brand + (p.model || '') + p.ref + (p.color || '')).toLowerCase().includes(q));
    const colors = { monture: '#0F6E66', verre: '#3D6B7A', lentille: '#4A7C6A', accessoire: '#5C6A68' };
    shell('products', `
      <h1 class="h1">Produits</h1><div class="sub">Montures, verres, lentilles, accessoires — photos, codes-barres, prix DA.</div>
      <div class="tabs">
        ${[['all','Tous'],['monture','Montures'],['verre','Verres'],['lentille','Lentilles'],['accessoire','Accessoires']].map(([id,l])=>`<button class="${prodTab===id?'active':''}" onclick="OptiApp.setProdTab('${id}')">${l}</button>`).join('')}
      </div>
      <div class="toolbar"><input class="search" id="q" oninput="OptiApp.renderProducts()" placeholder="Référence, marque, couleur…">
        <button class="btn gold" onclick="OptiApp.editProduct()">+ Produit</button>
        <button class="btn" onclick="OptiApp.renderLabels()">Étiquettes codes-barres</button></div>
      <div class="pos-grid">${list.map(p=>`<button class="pitem" onclick="OptiApp.editProduct(${p.id})">
        <div class="thumb" style="background:${colors[p.type]||'#0F6E66'}">${esc((p.brand||'?')[0])}</div>
        <strong>${esc(p.brand)} ${esc(p.model||'')}</strong>
        <div class="label">${esc(p.ref)} · ${esc(p.color||p.type)}</div>
        <div>${money(p.sell)} · <span class="badge ${p.qty<=p.min?'bad':'ok'}">${p.qty}</span>${p.type==='lentille'&&p.bc?`<div class="label">BC ${esc(p.bc)} · Ø ${esc(p.dia||'')} · ${esc(p.power||'')}</div>`:''}</div>
      </button>`).join('')}</div>`);
  }
  function setProdTab(id) { prodTab = id; renderProducts(); }
  function editProduct(id) {
    const p = db().products.find((x) => x.id === id) || { type: 'monture' };
    openModal(id ? 'Modifier produit' : 'Nouveau produit', `
      <form class="form" onsubmit="OptiApp.saveProduct(event,${id||0})">
        <div class="formgrid">
          <div class="field"><label>Type</label><select id="pType">${['monture','verre','lentille','accessoire'].map(x=>`<option ${x===p.type?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Marque</label><input id="pBrand" value="${esc(p.brand||'')}"></div>
          <div class="field"><label>Modèle</label><input id="pModel" value="${esc(p.model||'')}"></div>
          <div class="field"><label>Référence</label><input id="pRef" value="${esc(p.ref||'')}"></div>
          <div class="field"><label>Couleur</label><input id="pColor" value="${esc(p.color||'')}"></div>
          <div class="field"><label>Taille</label><input id="pSize" value="${esc(p.size||'')}"></div>
          <div class="field"><label>Forme</label><input id="pShape" value="${esc(p.shape||'')}"></div>
          <div class="field"><label>Matière</label><input id="pMat" value="${esc(p.material||'')}"></div>
          <div class="field"><label>Indice / puissance</label><input id="pInd" value="${esc(p.indice||p.power||'')}"></div>
          <div class="field"><label>Rayon BC (lentilles)</label><input id="pBc" value="${esc(p.bc||'')}" placeholder="8.4"></div>
          <div class="field"><label>Diamètre (lentilles)</label><input id="pDia" value="${esc(p.dia||'')}" placeholder="14.0"></div>
          <div class="field"><label>Œil</label><select id="pEye">${['les deux','OD','OG'].map(x=>`<option ${x===(p.eye||'les deux')?'selected':''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Renouvellement (mois)</label><input id="pRenew" type="number" value="${p.renewMonths||''}" placeholder="1, 3 ou 6"></div>
          <div class="field"><label>Boîte (lentilles)</label><input id="pPack" type="number" value="${p.packQty||''}"></div>
          <div class="field"><label>Traitements</label><input id="pTr" value="${esc(p.treatments||'')}"></div>
          <div class="field"><label>Prix d’achat DA</label><input id="pBuy" type="number" value="${p.buy||0}"></div>
          <div class="field"><label>Prix de vente DA</label><input id="pSell" type="number" value="${p.sell||0}"></div>
          <div class="field"><label>Quantité</label><input id="pQty" type="number" value="${p.qty||0}"></div>
          <div class="field"><label>Stock min</label><input id="pMin" type="number" value="${p.min||0}"></div>
          <div class="field"><label>Code-barres</label><input id="pBar" value="${esc(p.barcode||'')}"></div>
          <div class="field"><label>Boutique</label><select id="pStore">${db().stores.map(s=>`<option value="${s.id}" ${s.id===p.storeId?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Emplacement rayon</label><input id="pLoc" value="${esc(p.location||'')}" placeholder="A3 / tiroir verres"></div>
          <div class="field"><label>Fournisseur</label><select id="pSup"><option value="">—</option>${db().suppliers.map(s=>`<option value="${s.id}" ${String(s.id)===String(p.supplierId||'')?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Photo</label><input id="pPhoto" type="file" accept="image/*"></div>
        <label class="hint"><input type="checkbox" id="pAR" ${p.antireflet?'checked':''}> Anti-reflet</label>
        <label class="hint"><input type="checkbox" id="pPH" ${p.photochromic?'checked':''}> Photochromique</label>
        <label class="hint"><input type="checkbox" id="pUV" ${p.uv?'checked':''}> Protection UV</label>
        <button class="btn gold">Enregistrer</button>
      </form>`);
  }
  async function saveProduct(e, id) {
    e.preventDefault();
    const o = { type: pType.value, brand: pBrand.value, model: pModel.value, ref: pRef.value, color: pColor.value, size: pSize.value, shape: pShape.value, material: pMat.value, indice: pInd.value, power: pInd.value, treatments: pTr.value, buy: +pBuy.value, sell: +pSell.value, qty: +pQty.value, min: +pMin.value, barcode: pBar.value, storeId: pStore.value, location: pLoc.value, supplierId: pSup.value ? +pSup.value : '', antireflet: pAR.checked, photochromic: pPH.checked, uv: pUV.checked, bc: pBc.value, dia: pDia.value, eye: pEye.value, renewMonths: +pRenew.value || 0, packQty: +pPack.value || 0 };
    const f = pPhoto.files[0];
    if (f) o.photo = await readFile(f);
    if (id) Object.assign(db().products.find((x) => x.id === id), o);
    else db().products.push({ id: Date.now(), ...o });
    await OptiStore.save('Produit'); closeModal(); renderProducts();
  }
  function readFile(f) { return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); }); }

  function renderStock() {
    const q = (document.getElementById('stq')?.value || '').toLowerCase();
    const low = OptiAI.lowStock();
    const out = db().products.filter((p) => p.qty <= 0);
    const valBuy = db().products.reduce((a, p) => a + p.qty * (p.buy || 0), 0);
    const valSell = db().products.reduce((a, p) => a + p.qty * (p.sell || 0), 0);
    const list = db().products.filter((p) => (p.brand + (p.model || '') + p.ref + (p.location || '')).toLowerCase().includes(q));
    const rayon = list.map((p) => {
      const pct = p.min ? Math.min(100, Math.round((p.qty / Math.max(p.min * 2, 1)) * 100)) : 100;
      const cls = p.qty <= 0 ? 'out' : p.qty <= p.min ? 'low' : '';
      return `<tr>
        <td><strong>${esc(p.ref)}</strong></td>
        <td>${esc(p.brand)} ${esc(p.model || '')}<div class="label">${esc(p.type)}${p.location ? ' · ' + esc(p.location) : ''}</div></td>
        <td>${p.qty} / min ${p.min}<span class="stock-bar ${cls}"><i style="width:${Math.max(8, pct)}%"></i></span></td>
        <td>${money(p.buy)}</td>
        <td>${money(p.qty * (p.buy || 0))}</td>
        <td>${money(p.qty * (p.sell || 0))}</td>
        <td>${p.qty <= 0 ? '<span class="badge bad">rupture</span>' : p.qty <= p.min ? '<span class="badge warn">faible</span>' : '<span class="badge ok">ok</span>'}</td>
      </tr>`;
    }).join('');
    const reorder = low.map((p) => `<tr><td>${esc(p.ref)}</td><td>${esc(p.brand)}</td><td>${p.qty}</td><td>${p.min}</td><td>${Math.max(p.min * 2 - p.qty, 1)}</td><td>${money((p.buy || 0) * Math.max(p.min * 2 - p.qty, 1))}</td></tr>`).join('');
    shell('stock', `
      <h1 class="h1">Stock</h1><div class="sub">Rayon, valorisation, réassort fournisseur et historique des mouvements.</div>
      <div class="grid4">${kpi('Valeur d’achat', money(valBuy))}${kpi('Valeur vente', money(valSell))}${kpi('Stock faible', low.length)}${kpi('Ruptures', out.length)}</div>
      <div class="tabs" style="margin-top:16px">
        ${[['rayon','Rayon & valorisation'],['reorder','À réapprovisionner'],['mouv','Mouvements']].map(([id,l])=>`<button class="${stockTab===id?'active':''}" onclick="OptiApp.setStockTab('${id}')">${l}</button>`).join('')}
      </div>
      <div class="toolbar">
        <input class="search" id="stq" placeholder="Réf, marque, emplacement…" oninput="OptiApp.renderStock()" value="${esc(q)}">
        <button class="btn gold" onclick="OptiApp.stockMove('Entrée')">Entrée</button>
        <button class="btn" onclick="OptiApp.stockMove('Sortie')">Sortie</button>
        <button class="btn" onclick="OptiApp.stockMove('Transfert')">Transfert</button>
        <button class="btn" onclick="OptiApp.renderInventory()">Inventaire</button>
        <button class="btn gold" onclick="OptiApp.reorderLow()">Commander le manquant</button>
        <input class="search" id="scan" placeholder="Scanner…" onkeydown="if(event.key==='Enter')OptiApp.scanStock()">
      </div>
      ${stockTab === 'rayon' ? `<div class="card tablewrap"><table class="data"><thead><tr><th>Réf</th><th>Produit</th><th>Quantité</th><th>P.A.</th><th>Valeur achat</th><th>Valeur vente</th><th></th></tr></thead><tbody>${rayon || '<tr><td colspan="7" class="muted">Aucun produit.</td></tr>'}</tbody></table></div>` : ''}
      ${stockTab === 'reorder' ? `<div class="card tablewrap"><table class="data"><thead><tr><th>Réf</th><th>Produit</th><th>Stock</th><th>Min</th><th>Qté suggérée</th><th>Coût</th></tr></thead><tbody>${reorder || '<tr><td colspan="6" class="muted">Rien à commander.</td></tr>'}</tbody></table></div>` : ''}
      ${stockTab === 'mouv' ? `<div class="card tablewrap"><table class="data"><thead><tr><th>Date</th><th>Produit</th><th>Type</th><th>Qté</th><th>Motif</th><th>Boutique</th></tr></thead>
      <tbody>${db().movements.slice().reverse().map(m=>{const p=db().products.find(x=>x.id===m.productId);return `<tr><td>${esc(m.date)}</td><td>${esc(p?p.brand+' '+(p.model||''):'')}</td><td><span class="badge ${m.qty>0?'ok':'bad'}">${esc(m.type)}</span></td><td>${m.qty>0?'+':''}${m.qty}</td><td>${esc(m.motif)}</td><td>${esc(db().stores.find(s=>s.id===m.storeId)?.name||'')}</td></tr>`;}).join('')}</tbody></table></div>` : ''}
    `);
    const el = document.getElementById('stq'); if (el && stockTab === 'rayon') { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); }
  }
  function setStockTab(id) { stockTab = id; renderStock(); }
  function stockMove(type) {
    openModal(type + ' de stock', `<form class="form" onsubmit="OptiApp.saveMove(event,'${type}')">
      <div class="field"><label>Produit</label><select id="mProd">${db().products.map(p=>`<option value="${p.id}">${esc(p.ref)} — ${esc(p.brand)} (${p.qty})</option>`).join('')}</select></div>
      <div class="formgrid">
        <div class="field"><label>Quantité</label><input id="mQty" type="number" min="1" value="1"></div>
        ${type==='Transfert'?`<div class="field"><label>Vers boutique</label><select id="mTo">${db().stores.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>`:''}
      </div>
      <div class="field"><label>Motif</label><input id="mMotif" value="${type}"></div>
      <button class="btn gold">Valider</button></form>`);
  }
  async function saveMove(e, type) {
    e.preventDefault();
    const p = db().products.find((x) => x.id == mProd.value);
    let q = +mQty.value;
    if (type === 'Sortie') q = -q;
    if (type === 'Inventaire') { const target = q; q = target - p.qty; }
    if (type === 'Transfert') {
      const dest = db().products.find((x) => x.ref === p.ref && x.storeId === mTo.value) || { ...p, id: Date.now(), storeId: mTo.value, qty: 0 };
      if (!db().products.includes(dest) && dest.id !== p.id) db().products.push(dest);
      p.qty = Math.max(0, p.qty - Math.abs(q));
      dest.qty += Math.abs(q);
      db().transfers.push({ from: p.storeId, to: mTo.value, productId: p.id, qty: Math.abs(q), date: new Date().toLocaleString('fr-DZ') });
    } else p.qty = Math.max(0, p.qty + q);
    db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type, qty: type==='Transfert'? -Math.abs(+mQty.value): q, motif: mMotif.value, storeId: p.storeId });
    await OptiStore.save('Mouvement stock'); closeModal(); renderStock();
  }
  function scanStock() {
    const el = document.getElementById('scan');
    const code = (el?.value || '').trim();
    if (el) el.value = '';
    if (!code) return;
    if (OptiOps.handleScanCode(code)) return;
    toast('Produit introuvable');
  }

  function renderSales() {
    const d = db();
    shell('sales', `
      <h1 class="h1">Caisse</h1><div class="sub">Vente, scanners USB / Bluetooth / caméra, tickets de référence, CNAS — en dinars.</div>
      ${OptiOps.cashBanner()}
      ${OptiOps.scannerBarHtml()}
      <div class="grid2">
        <div class="card">
          <div class="toolbar"><strong>Nouvelle vente</strong>
            <input class="search scan-target" id="bc" placeholder="Code-barres produit" onkeydown="if(event.key==='Enter'){OptiApp.addBarcode();event.preventDefault()}">
          </div>
          <div class="formgrid">
            <div class="field"><label>Client</label><select id="saleClient" onchange="OptiApp.renderCart()"><option value="0">Comptoir</option>${d.clients.map(c=>`<option value="${c.id}" ${c.id===(d.pendingClientId||0)?'selected':''}>${esc(c.firstName)} ${esc(c.lastName)}</option>`).join('')}</select></div>
            <div class="field"><label>Remise globale %</label><input id="saleDisc" type="number" value="0" oninput="OptiApp.renderCart()"></div>
            <div class="field"><label>Prise en charge</label><select id="saleCover" onchange="OptiApp.renderCart()">${(d.shop.coverOrgs||['Aucune']).map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
            <div class="field"><label>Montant organisme DA</label><input id="saleCoverAmt" type="number" value="0" oninput="OptiApp.renderCart()"></div>
          </div>
          <div class="pos-grid" style="margin-top:10px">${d.products.map(p=>`<button class="pitem" onclick="OptiApp.addCart(${p.id})"><strong>${esc(p.ref)}</strong><div class="label">${esc(p.brand)}</div><div>${money(p.sell)}</div></button>`).join('')}</div>
        </div>
        <div class="card" id="cartBox"></div>
      </div>
      <div class="card" style="margin-top:16px"><div class="toolbar"><strong>Historique</strong><button class="btn sm" onclick="OptiApp.exportCSV('sales')">Excel</button></div>
        <div class="tablewrap"><table class="data"><thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Total</th><th>Payé</th><th>Reste</th><th>Mode</th><th></th></tr></thead>
        <tbody>${d.sales.slice().reverse().map(s=>{const rest=Math.max(0,s.total-(s.coverAmount||0)-s.paid);return `<tr><td>${s.id}</td><td>${s.date}</td><td>${esc(OptiStore.clientName(s.clientId))}</td><td>${money(s.total)}</td><td>${money(s.paid)}</td><td>${money(rest)}</td><td>${esc(s.method)}${s.coverOrg&&s.coverOrg!=='Aucune'?' · '+esc(s.coverOrg):''}</td>
          <td>
            <button class="btn sm" onclick="OptiApp.printTicket('${s.id}')">Ticket</button>
            <button class="btn sm" onclick="OptiApp.printRecu('${s.id}')">Reçu optique</button>
            <button class="btn sm" onclick="OptiApp.printInvoice('${s.id}')">Facture PDF</button>
            ${s.status!=='retour'&&!s.delivered?`<button class="btn sm" onclick="OptiApp.markDelivered('${s.id}')">Livrer</button>`:''}
            ${s.status!=='retour'&&rest?`<button class="btn sm gold" onclick="OptiApp.payRemain('${s.id}')">Solde</button>`:''}
            ${s.status!=='retour'?`<button class="btn sm" onclick="OptiApp.startReturn('${s.id}')">Retour</button>`:''}
          </td></tr>`;}).join('')}</tbody></table></div></div>`);
    renderCart();
    setTimeout(() => document.getElementById('ticketScan')?.focus(), 60);
  }
  function addCart(id) {
    const p = db().products.find((x) => x.id === id);
    if (!p || p.qty < 1) return toast('Stock insuffisant');
    const line = db().cart.find((x) => x.productId === id);
    if (line) line.q++; else db().cart.push({ productId: id, q: 1, price: p.sell, discount: 0 });
    renderCart();
  }
  function addBarcode() {
    const el = document.getElementById('bc');
    const code = (el?.value || '').trim();
    if (el) el.value = '';
    if (!code) return;
    if (OptiOps.handleScanCode(code, { forceCart: true })) return;
    toast('Code inconnu');
  }
  function renderCart() {
    const box = document.getElementById('cartBox');
    if (!box) return;
    const disc = +(document.getElementById('saleDisc')?.value || 0);
    const taxOn = db().shop.taxEnabled;
    const coverAmt = +(document.getElementById('saleCoverAmt')?.value || 0);
    const fid = db().pendingDiscount || 0;
    const ht = db().cart.reduce((a, x) => a + x.price * x.q * (1 - (x.discount || 0) / 100), 0);
    const after = Math.max(0, ht * (1 - disc / 100) - fid);
    const tax = taxOn ? after * (db().shop.taxRate / 100) : 0;
    const total = after + tax;
    const patient = Math.max(0, total - coverAmt);
    const cid = +(document.getElementById('saleClient')?.value || 0);
    const cli = db().clients.find((x) => x.id === cid);
    box.innerHTML = `<strong>Panier</strong>
      ${db().cart.map((x,i)=>{const p=db().products.find(y=>y.id===x.productId);return `<div class="alert">${esc(p?p.brand+' '+(p.model||''):x.label||'Article')} × ${x.q} <b style="float:right">${money(x.price*x.q)} <button class="btn sm" onclick="OptiApp.dropCart(${i})">×</button></b></div>`;}).join('')||'<p class="muted">Panier vide — scannez ou cliquez un produit.</p>'}
      ${fid?`<p class="hint">Remise fidélité : −${money(fid)}</p>`:''}
      <div class="label">Total TTC</div><div class="n">${money(total)}</div>
      ${taxOn?`<p class="hint">TVA ${db().shop.taxRate}% : ${money(tax)}</p>`:''}
      ${coverAmt?`<p class="hint">Organisme : ${money(coverAmt)} · Patient : ${money(patient)}</p>`:''}
      ${cli?`<p class="hint">${esc(cli.firstName)} · ${cli.loyalty||0} pts · <button class="btn sm" type="button" onclick="OptiApp.redeemLoyalty(${cli.id})">Utiliser points</button></p>`:''}
      <div class="field"><label>Montant payé (patient)</label><input id="paid" type="number" value="${Math.round(patient)}"></div>
      <div class="field"><label>Mode</label><select id="payMode">${db().shop.paymentMethods.map(m=>`<option>${m}</option>`).join('')}</select></div>
      <div class="toolbar"><button class="btn gold" ${db().cart.length?'':'disabled'} onclick="OptiApp.checkout()">Encaisser</button>
        <button class="btn" onclick="OptiApp.clearCart()">Annuler</button></div>`;
  }
  function dropCart(i) { db().cart.splice(i, 1); renderCart(); }
  function clearCart() { db().cart = []; renderCart(); }
  async function checkout() {
    if (!db().cart.length) return;
    const cid = +saleClient.value || 0;
    if (cid) {
      const expired = db().prescriptions.filter((r) => r.clientId === cid && OptiStore.isRxExpired(r));
      if (expired.length && !confirm('Ordonnance périmée pour ce client. Continuer la vente ?')) return;
    }
    const disc = +(document.getElementById('saleDisc')?.value || 0);
    const fid = db().pendingDiscount || 0;
    const coverOrg = document.getElementById('saleCover')?.value || 'Aucune';
    const coverAmt = +(document.getElementById('saleCoverAmt')?.value || 0);
    const ht = db().cart.reduce((a, x) => a + x.price * x.q * (1 - (x.discount || 0) / 100), 0);
    const after = Math.max(0, ht * (1 - disc / 100) - fid);
    const tax = db().shop.taxEnabled ? after * (db().shop.taxRate / 100) : 0;
    const total = after + tax;
    const patientDue = Math.max(0, total - coverAmt);
    const paidN = Math.min(patientDue, +paid.value || 0);
    db().cart.forEach((x) => {
      const p = db().products.find((y) => y.id === x.productId);
      if (!p) return;
      p.qty -= x.q;
      db().movements.push({ id: OptiStore.uid('m'), date: new Date().toLocaleString('fr-DZ'), productId: p.id, type: 'Sortie', qty: -x.q, motif: 'Vente', storeId: db().currentStore });
    });
    const sale = {
      id: 'V-' + Date.now(), date: OptiStore.todayISO(), clientId: cid,
      items: JSON.parse(JSON.stringify(db().cart)), discount: disc, tax, total, paid: paidN, method: payMode.value,
      storeId: db().currentStore, userId: db().session.id, status: paidN >= patientDue ? 'payée' : 'partielle',
      coverOrg, coverAmount: coverAmt, loyaltyDiscount: fid,
      payments: paidN ? [{ date: OptiStore.todayISO(), amount: paidN, method: payMode.value }] : []
    };
    db().sales.push(sale);
    db().invoices.push({ id: 'FAC-' + Date.now(), date: sale.date, clientId: cid, saleId: sale.id, total, paid: paidN, status: sale.status === 'payée' ? 'Payée' : 'Partiellement payée' });
    if (cid) {
      const c = db().clients.find((x) => x.id === cid);
      const pts = OptiStore.earnPoints(paidN);
      if (c && pts) {
        c.loyalty = (c.loyalty || 0) + pts;
        db().loyaltyLog.push({ date: sale.date, clientId: cid, pts, reason: 'Vente ' + sale.id, saleId: sale.id });
      }
    }
    OptiOps.addToCash(paidN, payMode.value);
    db().cart = [];
    db().pendingDiscount = 0;
    db().pendingClientId = 0;
    await OptiStore.save('Vente ' + sale.id);
    toast('Vente enregistrée');
    OptiOps.printTicket(sale.id);
    renderSales();
  }
  function receipt(id) { OptiOps.printTicket(id); }
  async function returnSale(id) { OptiOps.startReturn(id); }

  function renderOrders() {
    const f = document.getElementById('of')?.value || '';
    const rows = db().orders.filter((o) => !f || o.status === f);
    shell('orders', `
      <h1 class="h1">Commandes</h1><div class="sub">Lunettes, verres, lentilles — suivi jusqu’à la livraison.</div>
      <div class="toolbar"><button class="btn gold" onclick="OptiApp.editOrder()">+ Commande</button>
        <select class="search" id="of" onchange="OptiApp.renderOrders()"><option value="">Tous</option>${db().orderStatuses.map(s=>`<option ${s===f?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="card tablewrap"><table class="data"><thead><tr><th>N°</th><th>Type</th><th>Client</th><th>Produit</th><th>Fournisseur</th><th>Reste</th><th>Date</th><th>Statut</th><th></th></tr></thead>
      <tbody>${rows.map(o=>`<tr><td>${o.id}</td><td>${esc(o.kind)}</td><td>${esc(OptiStore.clientName(o.clientId))}</td><td>${esc(o.product)}</td><td>${esc(db().suppliers.find(s=>s.id===o.supplierId)?.name||'')}</td><td>${money(o.remain)}</td><td>${esc(o.due)}</td>
        <td><span class="badge ${o.status==='Livrée'?'ok':o.status==='Annulée'?'bad':'warn'}">${esc(o.status)}</span></td>
        <td><button class="btn sm" onclick="OptiApp.nextOrder('${o.id}')">Suivant</button>
          <button class="btn sm" onclick="OptiApp.waOrder('${o.id}')">WhatsApp</button></td></tr>`).join('')}</tbody></table></div>`);
  }
  function editOrder() {
    openModal('Nouvelle commande', `<form class="form" onsubmit="OptiApp.saveOrder(event)">
      <div class="formgrid">
        <div class="field"><label>Type</label><select id="oKind"><option>lunettes</option><option>verres</option><option>lentilles</option></select></div>
        <div class="field"><label>Client</label><select id="oClient">${db().clients.map(c=>`<option value="${c.id}">${esc(c.firstName)} ${esc(c.lastName)}</option>`).join('')}</select></div>
        <div class="field"><label>Fournisseur</label><select id="oSup">${db().suppliers.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Date prévue</label><input id="oDue" type="date"></div>
        <div class="field"><label>Prix total DA</label><input id="oTotal" type="number" value="0"></div>
        <div class="field"><label>Avance</label><input id="oAdv" type="number" value="0"></div>
      </div>
      <div class="field"><label>Description</label><input id="oProd" placeholder="Monture + verres"></div>
      <button class="btn gold">Créer</button></form>`);
  }
  async function saveOrder(e) {
    e.preventDefault();
    const t = +oTotal.value, a = +oAdv.value;
    db().orders.push({ id: 'CMD-' + String(db().orders.length + 1).padStart(3, '0'), kind: oKind.value, clientId: +oClient.value, supplierId: +oSup.value, product: oProd.value, total: t, advance: a, remain: Math.max(0, t - a), due: oDue.value, status: 'Nouvelle', storeId: db().currentStore, notes: '' });
    await OptiStore.save('Commande'); closeModal(); renderOrders();
  }
  async function nextOrder(id) {
    const o = db().orders.find((x) => x.id === id);
    const i = db().orderStatuses.indexOf(o.status);
    if (o.status === 'Annulée' || i === db().orderStatuses.length - 2) return toast('Déjà terminée');
    if (o.status === 'Livrée') return;
    o.status = db().orderStatuses[i + 1];
    await OptiStore.save('Statut ' + id);
    renderOrders();
  }

  function renderSuppliers() {
    const debt = db().suppliers.reduce((a, s) => a + (s.debt || 0), 0);
    const buy = db().suppliers.reduce((a, s) => a + (s.purchases || 0), 0);
    const pending = (db().purchaseOrders || []).filter((p) => p.status !== 'reçue').length;
    shell('suppliers', `
      <h1 class="h1">Fournisseurs</h1><div class="sub">Fiches, dettes, bons de commande et règlements.</div>
      <div class="grid4">${kpi('Fournisseurs', db().suppliers.length)}${kpi('Achats cumulés', money(buy))}${kpi('Dettes', money(debt))}${kpi('Bons en cours', pending)}</div>
      <div class="toolbar"><button class="btn gold" onclick="OptiApp.editSupplier()">+ Fournisseur</button>
        <button class="btn" onclick="OptiApp.go('#/app/purchases')">Bons de commande</button></div>
      <div class="sup-grid">${db().suppliers.map(s=>`<div class="card sup-card">
        <h3>${esc(s.name)}</h3>
        <p class="muted">${esc(s.contact)} · ${esc(s.phone)}<br>${esc(s.products || s.address || '')}</p>
        <div class="toolbar" style="margin:0"><span class="label">Dette ${money(s.debt)}</span><span class="label">Achats ${money(s.purchases)}</span></div>
        <div class="toolbar" style="margin:0">
          <button class="btn sm gold" onclick="OptiApp.viewSupplier(${s.id})">Ouvrir</button>
          <button class="btn sm" onclick="OptiApp.editSupplier(${s.id})">Modifier</button>
          ${s.phone?`<button class="btn sm" onclick="OptiApp.waSupplier(${s.id})">WhatsApp</button>`:''}
        </div>
      </div>`).join('')}</div>`);
  }
  function editSupplier(id) {
    const s = db().suppliers.find((x) => x.id === id) || {};
    openModal(id ? 'Fournisseur' : 'Nouveau fournisseur', `<form class="form" onsubmit="OptiApp.saveSupplier(event,${id||0})">
      <div class="formgrid">
        <div class="field"><label>Nom</label><input id="sName" value="${esc(s.name||'')}"></div>
        <div class="field"><label>Contact</label><input id="sContact" value="${esc(s.contact||'')}"></div>
        <div class="field"><label>Téléphone</label><input id="sPhone" value="${esc(s.phone||'')}"></div>
        <div class="field"><label>Email</label><input id="sEmail" value="${esc(s.email||'')}"></div>
      </div>
      <div class="field"><label>Adresse</label><input id="sAddr" value="${esc(s.address||'')}"></div>
      <div class="field"><label>Produits fournis</label><input id="sProd" value="${esc(s.products||'')}"></div>
      <div class="formgrid"><div class="field"><label>Achats DA</label><input id="sPur" type="number" value="${s.purchases||0}"></div>
      <div class="field"><label>Dette DA</label><input id="sDebt" type="number" value="${s.debt||0}"></div></div>
      <button class="btn gold">Enregistrer</button></form>`);
  }
  async function saveSupplier(e, id) {
    e.preventDefault();
    const o = { name: sName.value, contact: sContact.value, phone: sPhone.value, email: sEmail.value, address: sAddr.value, products: sProd.value, purchases: +sPur.value, debt: +sDebt.value };
    if (id) Object.assign(db().suppliers.find((x) => x.id === id), o);
    else db().suppliers.push({ id: Date.now(), ...o });
    await OptiStore.save('Fournisseur'); closeModal(); renderSuppliers();
  }

  function renderRdv() {
    const y = cal.getFullYear(), m = cal.getMonth();
    const first = new Date(y, m, 1).getDay() || 7;
    const days = new Date(y, m + 1, 0).getDate();
    let cells = '';
    for (let i = 1; i < first; i++) cells += '<div></div>';
    for (let d = 1; d <= days; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const ev = db().appointments.filter((a) => a.date === iso);
      cells += `<div class="d"><b>${d}</b>${ev.map(a=>`<div class="ev">${a.time} ${esc(OptiStore.clientName(a.clientId))}</div>`).join('')}</div>`;
    }
    const today = db().appointments.filter((a) => a.date === OptiStore.todayISO());
    shell('rdv', `
      <h1 class="h1">Rendez-vous</h1><div class="sub">Calendrier, rappels du jour, historique.</div>
      <div class="toolbar">
        <button class="btn" onclick="OptiApp.shiftCal(-1)">←</button>
        <strong>${cal.toLocaleDateString('fr-DZ',{month:'long',year:'numeric'})}</strong>
        <button class="btn" onclick="OptiApp.shiftCal(1)">→</button>
        <button class="btn gold" onclick="OptiApp.editRdv()">+ RDV</button>
      </div>
      <div class="card"><div class="cal">${cells}</div></div>
      <div class="card" style="margin-top:16px"><strong>Aujourd’hui</strong>${today.map(a=>`<div class="alert">${a.time} · ${esc(OptiStore.clientName(a.clientId))} · ${esc(a.reason)}
        <button class="btn sm" onclick="OptiApp.editRdv('${a.id}')">Modifier</button>
        <button class="btn sm" onclick="OptiApp.cancelRdv('${a.id}')">Annuler</button></div>`).join('')||'<p class="muted">Aucun rendez-vous.</p>'}</div>`);
  }
  function shiftCal(n) { cal.setMonth(cal.getMonth() + n); renderRdv(); }
  function editRdv(id) {
    const a = db().appointments.find((x) => x.id === id) || { date: OptiStore.todayISO(), time: '10:00' };
    openModal('Rendez-vous', `<form class="form" onsubmit="OptiApp.saveRdv(event,'${id||''}')">
      <div class="formgrid">
        <div class="field"><label>Client</label><select id="aClient">${db().clients.map(c=>`<option value="${c.id}" ${c.id==a.clientId?'selected':''}>${esc(c.firstName)} ${esc(c.lastName)}</option>`).join('')}</select></div>
        <div class="field"><label>Date</label><input id="aDate" type="date" value="${esc(a.date||'')}"></div>
        <div class="field"><label>Heure</label><input id="aTime" type="time" value="${esc(a.time||'')}"></div>
        <div class="field"><label>Motif</label><input id="aReason" value="${esc(a.reason||'')}"></div>
      </div>
      <div class="field"><label>Notes / rappel</label><textarea id="aNotes">${esc(a.notes||'')}</textarea></div>
      <button class="btn gold">Enregistrer</button></form>`);
  }
  async function saveRdv(e, id) {
    e.preventDefault();
    const o = { clientId: +aClient.value, date: aDate.value, time: aTime.value, reason: aReason.value, notes: aNotes.value, status: 'confirmé' };
    if (id) Object.assign(db().appointments.find((x) => x.id === id), o);
    else db().appointments.push({ id: OptiStore.uid('r'), ...o });
    await OptiStore.save('RDV'); closeModal(); toast('Rendez-vous enregistré — rappel local activé'); renderRdv();
  }
  async function cancelRdv(id) {
    db().appointments.find((x) => x.id === id).status = 'annulé';
    db().appointments = db().appointments.filter((x) => x.id !== id || true);
    db().appointments = db().appointments.filter((x) => x.id !== id);
    await OptiStore.save('RDV annulé'); renderRdv();
  }

  function renderFinance() {
    const ca = db().sales.reduce((a, s) => a + s.total, 0);
    const paid = db().sales.reduce((a, s) => a + s.paid, 0);
    const exp = db().expenses.reduce((a, e) => a + e.amount, 0);
    const debt = db().suppliers.reduce((a, s) => a + s.debt, 0);
    const unpaid = ca - paid;
    shell('finance', `
      <h1 class="h1">Finances</h1><div class="sub">Caisse, bénéfices, impayés, dettes fournisseurs — en DA.</div>
      <div class="grid4">${kpi('Chiffre d’affaires', money(ca),'↗')}${kpi('Encaissé', money(paid),'✓')}${kpi('Impayés', money(unpaid),'!')}${kpi('Bénéfice', money(ca-exp),'✦')}</div>
      <div class="grid2" style="margin-top:16px">
        <div class="card"><div class="toolbar"><strong>Dépenses</strong><button class="btn sm" onclick="OptiApp.addExp()">+ Dépense</button></div>
          ${db().expenses.map(e=>`<div class="alert">${e.date} · ${esc(e.label)} <b style="float:right">${money(e.amount)}</b></div>`).join('')}
        </div>
        <div class="card"><strong>Dettes fournisseurs</strong>${db().suppliers.map(s=>`<div class="alert">${esc(s.name)} <b style="float:right">${money(s.debt)}</b></div>`).join('')}
          <p class="muted">Caisse théorique : ${money(paid - exp)}</p></div>
      </div>
      <div class="card" style="margin-top:16px"><strong>Caisse du jour</strong>
        ${OptiOps.cashBanner()}
        ${(db().cashSessions||[]).slice().reverse().slice(0,8).map(c=>`<div class="alert">${esc(c.date)} · ${c.status==='open'?'ouverte':'clôturée'} · espèces ${money(c.salesCash||0)} · écart ${money(c.difference||0)}</div>`).join('')||'<p class="muted">Aucune session. Ouvrez la caisse depuis l’écran Caisse.</p>'}
      </div>`);
  }
  function addExp() {
    openModal('Dépense', `<form class="form" onsubmit="OptiApp.saveExp(event)">
      <div class="field"><label>Libellé</label><input id="eLabel" required></div>
      <div class="formgrid"><div class="field"><label>Montant DA</label><input id="eAmt" type="number" required></div>
      <div class="field"><label>Catégorie</label><input id="eCat" value="Charges"></div></div>
      <button class="btn gold">Ajouter</button></form>`);
  }
  async function saveExp(e) {
    e.preventDefault();
    db().expenses.push({ id: OptiStore.uid('e'), date: OptiStore.todayISO(), label: eLabel.value, amount: +eAmt.value, cat: eCat.value });
    await OptiStore.save('Dépense'); closeModal(); renderFinance();
  }

  function renderReports() {
    shell('reports', `
      <h1 class="h1">Rapports</h1><div class="sub">Ventes, achats, stock, clients, fournisseurs, financier — PDF, Excel, impression.</div>
      <div class="grid3">
        ${[['Ventes','sales'],['Achats / dépenses','expenses'],['Stock','products'],['Clients','clients'],['Fournisseurs','suppliers'],['Financier','finance']].map(([l,k])=>`<div class="card"><h3>${l}</h3><div class="toolbar"><button class="btn" onclick="OptiApp.exportCSV('${k}')">Excel</button><button class="btn" onclick="print()">PDF / Imprimer</button></div></div>`).join('')}
      </div>
      <div class="card" style="margin-top:16px"><strong>Plus / moins vendus</strong>
        <p>${OptiAI.topProducts(5).map(p=>esc(p.brand+' '+(p.model||''))).join(' · ')}</p>
        <p class="muted">${esc(OptiAI.commercialSummary())}</p>
        <p class="muted">Prévision : ${money(OptiAI.forecast().nextMonth)} — ${esc(OptiAI.forecast().strong)}</p>
      </div>`);
  }

  function exportCSV(kind) {
    let rows = [];
    if (kind === 'clients') rows = [['Nom','Tel','Adresse']].concat(db().clients.map((c) => [c.firstName + ' ' + c.lastName, c.phone, c.address]));
    else if (kind === 'sales') rows = [['ID','Date','Total','Payé']].concat(db().sales.map((s) => [s.id, s.date, s.total, s.paid]));
    else if (kind === 'products') rows = [['Ref','Marque','Qté','Prix']].concat(db().products.map((p) => [p.ref, p.brand, p.qty, p.sell]));
    else if (kind === 'suppliers') rows = [['Nom','Dette']].concat(db().suppliers.map((s) => [s.name, s.debt]));
    else if (kind === 'expenses') rows = [['Date','Label','Montant']].concat(db().expenses.map((e) => [e.date, e.label, e.amount]));
    else rows = [['Indicateur','Valeur'],['CA', db().sales.reduce((a,s)=>a+s.total,0)]];
    const csv = '\ufeff' + rows.map((r) => r.join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'optidz-' + kind + '.csv';
    a.click();
    toast('Export Excel (CSV) créé');
  }

  function renderNotif() {
    shell('notifications', `
      <h1 class="h1">Notifications</h1>
      <div class="card">${db().notifications.map(n=>`<div class="alert"><span class="badge ${n.level}">${n.type}</span> ${esc(n.text)}</div>`).join('')||'<p class="muted"> RAS</p>'}
      ${OptiAI.anomalies().map(a=>`<div class="alert"><span class="badge bad">IA</span> ${esc(a)}</div>`).join('')}
      </div>`);
  }

  function renderAI() {
    shell('ai', `
      <h1 class="h1">Analyses</h1><div class="sub">Questions sur les ventes, le stock et les commandes. Aucun diagnostic médical.</div>
      <div class="grid2">
        <div class="card">
          <div class="chat-msgs" id="iaMsgs" style="height:360px;background:#faf7f1;border-radius:12px"></div>
          <div class="chat-in"><input id="iaIn" placeholder="Combien avons-nous vendu aujourd’hui ?" onkeydown="if(event.key==='Enter')OptiApp.askIA()"><button class="btn gold sm" onclick="OptiApp.askIA()">Envoyer</button></div>
        </div>
        <div class="card">
          <strong>Actions IA</strong>
          <div class="toolbar" style="margin-top:12px">
            <button class="btn" onclick="OptiApp.quickIA('Quels produits sont presque en rupture ?')">Stock</button>
            <button class="btn" onclick="OptiApp.quickIA('Combien avons-nous gagné ce mois-ci ?')">CA</button>
            <button class="btn" onclick="OptiApp.quickIA('Montures noires pour femme à moins de 20000 DA')">Recherche</button>
            <button class="btn" onclick="OptiApp.quickIA('Prévisions')">Prévisions</button>
            <button class="btn" onclick="OptiApp.quickIA('Anomalies')">Anomalies</button>
          </div>
          <hr style="border:0;border-top:1px solid #eadfcb;margin:16px 0">
          <strong>Génération</strong>
          <div class="toolbar"><button class="btn sm" onclick="OptiApp.gen('sales')">Résumé ventes</button>
            <button class="btn sm" onclick="OptiApp.gen('client')">Message client</button>
            <button class="btn sm" onclick="OptiApp.gen('product')">Description produit</button>
            <button class="btn sm" onclick="OptiApp.gen('order')">Résumé commande</button></div>
          <p class="muted" id="genOut" style="margin-top:12px">${esc(OptiAI.commercialSummary())}</p>
          <p class="muted">${OptiAI.stockAdvice().map(x=>esc(x.text)).join('<br>')}</p>
        </div>
      </div>`);
    pushIA('bot', 'Bonjour. Posez une question sur les ventes, le stock, les commandes ou le catalogue.');
  }
  function pushIA(who, text) {
    const box = document.getElementById('iaMsgs');
    if (!box) return;
    box.innerHTML += `<div class="bubble ${who === 'me' ? 'me' : 'bot'}">${esc(text).replace(/\n/g, '<br>')}</div>`;
    box.scrollTop = box.scrollHeight;
  }
  function askIA() {
    const q = iaIn.value.trim(); if (!q) return;
    iaIn.value = '';
    quickIA(q);
  }
  function quickIA(q) {
    pushIA('me', q);
    const a = OptiAI.intern(q);
    let text = a.text;
    if (a.products) text += '\n' + a.products.map((p) => p.brand + ' ' + (p.model || '') + ' — ' + money(p.sell)).join('\n');
    setTimeout(() => pushIA('bot', text), 180);
  }
  function gen(k) { document.getElementById('genOut').textContent = OptiAI.generate(k); }

  function renderOCR() {
    const c = ocr;
    shell('ocr', `
      <h1 class="h1">Scanner d’ordonnance</h1>
      <div class="sub">Importez une photo, vérifiez les valeurs, puis enregistrez dans le dossier client.</div>
      <div class="sub">Photo → IA/OCR → extraction → vérification par l’opticien → dossier. L’IA n’invente aucune valeur illisible.</div>
      <div class="grid2">
        <div class="card">
          <div class="drop">Déposez une photo ou un scan PDF image<br>
            <input type="file" accept="image/*" onchange="OptiApp.runOCR(this)">
          </div>
          <p class="muted">${c?.note || 'En attente d’un document.'}</p>
          ${c ? `<img src="${c.preview||''}" style="max-height:220px;border-radius:12px;margin-top:8px">` : ''}
        </div>
        <div class="card">
          ${c ? `<form class="form" onsubmit="OptiApp.saveOCR(event)">
            <div class="field"><label>Client</label><select id="ocrClient">${db().clients.map(x=>`<option value="${x.id}">${esc(x.firstName)} ${esc(x.lastName)}</option>`).join('')}</select></div>
            <div class="eyegrid">${eyeFields('od', c.od)}${eyeFields('og', c.og)}</div>
            <div class="formgrid"><div class="field"><label>PD</label><input id="pd" value="${esc(c.pd||'')}"></div>
            <div class="field"><label>Médecin</label><input id="rxDoc" value="${esc(c.doctor||'')}"></div></div>
            <p class="hint">Les champs jaunes = confiance faible, à vérifier.</p>
            <button class="btn gold">Valider et enregistrer</button>
          </form>` : '<p class="muted">Importez d’abord le document.</p>'}
        </div>
      </div>`);
  }
  async function runOCR(input) {
    const f = input.files[0]; if (!f) return;
    toast('Analyse OCR…');
    const parsed = await OptiAI.ocrImage(f);
    parsed.preview = URL.createObjectURL(f);
    ocr = parsed;
    renderOCR();
    toast(parsed.raw ? 'Extraction proposée — vérifiez' : 'À vérifier : rien n’a été inventé');
  }
  async function saveOCR(e) {
    e.preventDefault();
    db().prescriptions.push({
      id: Date.now(),
      clientId: +ocrClient.value,
      doctor: document.getElementById('rxDoc')?.value || '',
      date: OptiStore.todayISO(),
      type: 'Scan validé',
      od: { sph: odsph.value, cyl: odcyl.value, axis: odaxis.value, add: odadd.value, prism: odprism.value, base: odbase.value },
      og: { sph: ogsph.value, cyl: ogcyl.value, axis: ogaxis.value, add: ogadd.value, prism: ogprism.value, base: ogbase.value },
      pd: document.getElementById('pd')?.value || '',
      pdR: '', pdL: '', height: '', vcd: '', panto: '',
      notes: 'Import OCR vérifié par l’opticien',
      photo: ocr?.preview || '',
      conf: ocr?.conf || {}
    });
    ocr = null;
    await OptiStore.save('OCR validé');
    toast('Ordonnance archivée après validation humaine');
    go('#/app/rx');
  }

  let settingsTab = 'shop';
  function setSettingsTab(tab) {
    settingsTab = tab;
    renderSettings();
  }

  function renderSettings() {
    const s = db().shop;
    const users = db().users || [];
    const d = db();
    const tab = settingsTab || 'shop';
    const logoPrev = s.logo
      ? `<img class="settings-logo-prev" src="${esc(s.logo)}" alt="Logo">`
      : `<div class="settings-logo-empty">Logo</div>`;
    const tabs = [
      ['shop', 'Magasin'],
      ['ops', 'Caisse & stock'],
      ['prefs', 'Options'],
      ['users', 'Comptes'],
      ['data', 'Données']
    ];

    shell('settings', `
      <div class="settings-head">
        <div>
          <h1 class="h1">Paramètres</h1>
          <p class="sub">Identité du magasin, caisse, comptes et sauvegardes — organisés comme le reste d’OptiDZ.</p>
        </div>
        <button type="button" class="btn" onclick="OptiApp.go('#/app/about')">À propos</button>
      </div>

      <div class="settings-stats">
        <div class="settings-stat"><b>${users.length}</b><span>Utilisateurs</span></div>
        <div class="settings-stat"><b>${(d.clients||[]).length}</b><span>Clients</span></div>
        <div class="settings-stat"><b>${(d.products||[]).length}</b><span>Produits</span></div>
        <div class="settings-stat"><b>${s.lastBackup ? new Date(s.lastBackup).toLocaleDateString('fr-DZ') : '—'}</b><span>Dernière sauvegarde</span></div>
      </div>

      <div class="settings-tabs" role="tablist">
        ${tabs.map(([id,label])=>`<button type="button" role="tab" class="${tab===id?'on':''}" onclick="OptiApp.setSettingsTab('${id}')">${label}</button>`).join('')}
      </div>

      <div class="settings-panel page-in">
        ${tab === 'shop' ? `
        <form class="settings-card form" onsubmit="OptiApp.saveShop(event)">
          <div class="settings-card-top">
            <span class="settings-badge">Magasin</span>
            <div>
              <strong>Identité de l’optique</strong>
              <small>Nom, coordonnées et logo affichés sur tickets et factures</small>
            </div>
          </div>
          <div class="settings-identity">
            <div class="settings-logo-box">${logoPrev}
              <label class="btn sm settings-logo-btn">Changer<input id="shLogo" class="hide" type="file" accept="image/*"></label>
            </div>
            <div class="settings-identity-fields">
              <div class="field"><label>Nom du magasin</label><input id="shName" value="${esc(s.name)}" required></div>
              <div class="field"><label>Slogan</label><input id="shSlogan" value="${esc(s.slogan||'')}" placeholder="Phrase courte sur le ticket"></div>
            </div>
          </div>
          <div class="field"><label>Adresse</label><input id="shAddr" value="${esc(s.address)}"></div>
          <div class="formgrid">
            <div class="field"><label>Ville</label><input id="shCity" value="${esc(s.city||'')}"></div>
            <div class="field"><label>Email magasin</label><input id="shEmail" type="email" value="${esc(s.email||'')}"></div>
            <div class="field"><label>Téléphone</label><input id="shPhone" value="${esc(s.phone)}"></div>
            <div class="field"><label>Mobile / WhatsApp</label><input id="shMob" value="${esc(s.mobile)}"></div>
          </div>
          <div class="field"><label>Horaires</label><input id="shHours" value="${esc(s.hours||'')}" placeholder="Dim–Jeu 09:00–19:00"></div>
          <div class="formgrid">
            <div class="field"><label>NIF</label><input id="shNif" value="${esc(s.nif||'')}"></div>
            <div class="field"><label>RC</label><input id="shRc" value="${esc(s.rc||'')}"></div>
          </div>
          <div class="field"><label>Message bas de ticket</label><input id="shTicket" value="${esc(s.ticketFooter||'Merci de votre visite')}" placeholder="Merci de votre visite"></div>
          <button class="btn gold" type="submit">Enregistrer le magasin</button>
        </form>` : ''}

        ${tab === 'ops' ? `
        <form class="settings-card form" onsubmit="OptiApp.saveShop(event)">
          <div class="settings-card-top">
            <span class="settings-badge">Ops</span>
            <div>
              <strong>Caisse, CNAS & stock</strong>
              <small>Paiements, prises en charge, TVA et alertes rayon</small>
            </div>
          </div>
          <div class="formgrid">
            <div class="field"><label>TVA active</label><select id="shTax"><option value="0" ${!s.taxEnabled?'selected':''}>Non</option><option value="1" ${s.taxEnabled?'selected':''}>Oui</option></select></div>
            <div class="field"><label>Taux TVA %</label><input id="shRate" type="number" min="0" step="0.1" value="${s.taxRate||0}"></div>
            <div class="field"><label>Stock mini par défaut</label><input id="shMinStock" type="number" min="0" value="${s.minStockDefault||3}"></div>
            <div class="field"><label>Validité ordonnance (mois)</label><input id="shRxM" type="number" min="1" value="${s.rxValidityMonths||24}"></div>
          </div>
          <div class="field"><label>Moyens de paiement (virgules)</label><input id="shPay" value="${esc((s.paymentMethods||[]).join(', '))}"></div>
          <div class="field"><label>Organismes / CNAS (virgules)</label><input id="shCover" value="${esc((s.coverOrgs||[]).join(', '))}" placeholder="Aucune, CNAS, CASNOS…"></div>
          <div class="settings-toggles">
            <label class="settings-switch"><input type="checkbox" id="shBar" ${s.barcodeEnabled!==false?'checked':''}><span>Scanner code-barres activé</span></label>
            <label class="settings-switch"><input type="checkbox" id="shLoyOn" ${s.loyaltyEnabled!==false?'checked':''}><span>Programme fidélité</span></label>
          </div>
          <div class="field"><label>Type d’appareil de scan</label>
            <select id="shScanType">${OptiOps.scannerTypeOptions(s.scannerType||'usb_hid')}</select>
          </div>
          <div class="formgrid">
            <div class="field"><label>Vitesse port série (baud)</label><input id="shScanBaud" type="number" value="${s.scannerBaud||9600}"></div>
            <div class="field" style="display:flex;align-items:flex-end;gap:8px">
              <button type="button" class="btn" onclick="OptiApp.showScannerPanel()">Gérer les appareils</button>
              <button type="button" class="btn" onclick="OptiApp.openBluetoothSettings()">Bluetooth</button>
            </div>
          </div>
          <div class="formgrid">
            <div class="field"><label>Points / 100 DA</label><input id="shLoy" type="number" min="0" value="${s.loyaltyPointsPer100||1}"></div>
            <div class="field"><label>100 pts = DA</label><input id="shLoyDA" type="number" min="0" value="${s.loyaltyDAPer100pts||100}"></div>
          </div>
          <button class="btn gold" type="submit">Enregistrer caisse & stock</button>
        </form>` : ''}

        ${tab === 'prefs' ? `
        <form class="settings-card form" onsubmit="OptiApp.saveShop(event)">
          <div class="settings-card-top">
            <span class="settings-badge">Options</span>
            <div>
              <strong>Préférences du poste</strong>
              <small>Langue, IA, alertes et sauvegarde automatique</small>
            </div>
          </div>
          <div class="formgrid">
            <div class="field"><label>Langue</label><select id="shLang"><option value="fr">Français</option><option value="ar" ${s.language==='ar'?'selected':''}>العربية</option></select></div>
            <div class="field"><label>Sauvegarde auto (heures)</label><input id="shBak" type="number" min="0" value="${s.autoBackupHours||6}"><small class="hint">0 = désactivée</small></div>
          </div>
          <div class="settings-toggles">
            <label class="settings-switch"><input type="checkbox" id="shAI" ${s.aiEnabled?'checked':''}><span>Modules IA (chat & lecture photo)</span></label>
            <label class="settings-switch"><input type="checkbox" id="shNotif" ${s.notificationsOn!==false?'checked':''}><span>Alertes stock & échéances</span></label>
          </div>
          <div class="settings-quick">
            <button type="button" class="btn" onclick="OptiApp.go('#/app/notifications')">Voir les alertes</button>
            <button type="button" class="btn" onclick="OptiApp.go('#/app/ai')">Ouvrir Analyses IA</button>
            <button type="button" class="btn" onclick="OptiApp.go('#/app/reports')">Rapports & exports</button>
          </div>
          <button class="btn gold" type="submit">Enregistrer les options</button>
        </form>` : ''}

        ${tab === 'users' ? `
        <div class="settings-card">
          <div class="settings-card-top">
            <span class="settings-badge">Comptes</span>
            <div>
              <strong>Utilisateurs & rôles</strong>
              <small>${users.length} compte(s) — admin, opticien, vendeur, assistant</small>
            </div>
          </div>
          <div class="settings-users">
            ${users.map(u=>`<div class="settings-user ${u.active===false?'off':''}">
              <span class="avatar">${esc((u.name||'?')[0])}</span>
              <div class="settings-user-meta">
                <b>${esc(u.name)}</b>
                <small>${esc(u.email)} · ${esc(u.role)}</small>
              </div>
              <select onchange="OptiApp.setRole('${u.id}',this.value)">${['admin','opticien','vendeur','assistant'].map(r=>`<option ${r===u.role?'selected':''}>${r}</option>`).join('')}</select>
              <button class="btn sm" onclick="OptiApp.resetUserPass('${u.id}')">Mot de passe</button>
              <button class="btn sm" onclick="OptiApp.toggleUserActive('${u.id}')">${u.active===false?'Activer':'Suspendre'}</button>
              ${d.session && d.session.id===u.id ? '' : `<button class="btn sm danger" onclick="OptiApp.removeUser('${u.id}')">Retirer</button>`}
            </div>`).join('')||'<p class="muted">Aucun utilisateur.</p>'}
          </div>
          <form class="form settings-add-user" onsubmit="OptiApp.addUser(event);return false">
            <strong class="settings-mini-title">Ajouter un utilisateur</strong>
            <div class="formgrid">
              <div class="field"><label>Nom</label><input id="nuName" required></div>
              <div class="field"><label>Email</label><input id="nuEmail" type="email" required></div>
              <div class="field"><label>Rôle</label><select id="nuRole"><option value="opticien">opticien</option><option value="vendeur">vendeur</option><option value="assistant">assistant</option><option value="admin">admin</option></select></div>
              <div class="field"><label>Mot de passe</label><input id="nuPass" type="password" required minlength="8"></div>
            </div>
            <button class="btn gold sm" type="submit">Ajouter</button>
          </form>
        </div>` : ''}

        ${tab === 'data' ? `
        <div class="settings-stack">
          <div class="settings-card">
            <div class="settings-card-top">
              <span class="settings-badge">Stockage</span>
              <div>
                <strong>Où sont vos données</strong>
                <small>${esc(OptiStore.storageInfo().where)}</small>
              </div>
            </div>
            <div class="settings-stats" style="margin:0">
              <div class="settings-stat"><b>${OptiStore.storageInfo().usedMB} Mo</b><span>Utilisé maintenant</span></div>
              <div class="settings-stat"><b>~5 Mo</b><span>Limite navigateur rapide</span></div>
              <div class="settings-stat"><b>~500 Mo+</b><span>IndexedDB / SQLite</span></div>
              <div class="settings-stat"><b>Disque</b><span>Mode Electron</span></div>
            </div>
            <p class="muted" style="margin-top:12px">Tout reste <b>sur ce poste</b> (hors ligne). Pas de cloud. Faites des sauvegardes JSON régulièrement.</p>
          </div>
          <div class="settings-card">
            <div class="settings-card-top">
              <span class="settings-badge">Data</span>
              <div>
                <strong>Sauvegarde & restauration</strong>
                <small>Dernière : ${s.lastBackup ? new Date(s.lastBackup).toLocaleString('fr-DZ') : 'jamais'} · auto ${s.autoBackupHours||0} h</small>
              </div>
            </div>
            <div class="settings-actions">
              <button class="btn gold" onclick="OptiApp.forceBackup()">Sauvegarder maintenant</button>
              <button class="btn" onclick="OptiApp.backup()">Télécharger JSON</button>
              <button class="btn" onclick="document.getElementById('imp').click()">Restaurer JSON</button>
              <input id="imp" class="hide" type="file" accept="application/json" onchange="OptiApp.restore(this)">
            </div>
            <p class="muted" style="margin-top:12px">Conservez une copie hors du poste. La restauration remplace toutes les données locales.</p>
          </div>
          <div class="settings-card">
            <div class="settings-card-top">
              <span class="settings-badge">Export</span>
              <div>
                <strong>Exports rapides</strong>
                <small>Fichiers Excel pour compta et inventaire</small>
              </div>
            </div>
            <div class="settings-actions">
              <button class="btn" onclick="OptiApp.exportCSV('clients')">Clients</button>
              <button class="btn" onclick="OptiApp.exportCSV('products')">Stock</button>
              <button class="btn" onclick="OptiApp.exportCSV('sales')">Ventes</button>
              <button class="btn" onclick="OptiApp.exportCSV('suppliers')">Fournisseurs</button>
              <button class="btn" onclick="OptiApp.go('#/app/reports')">Tous les rapports</button>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-card-top">
              <span class="settings-badge">Journal</span>
              <div>
                <strong>Activité récente</strong>
                <small>Actions enregistrées sur ce poste</small>
              </div>
            </div>
            <div class="settings-audit">
              ${(d.audit||[]).slice(0,10).map(a=>`<div class="alert">${esc(a.date)} · ${esc(a.user)} · ${esc(a.action)}</div>`).join('')||'<p class="muted">Aucun journal pour le moment.</p>'}
            </div>
            <div class="settings-actions" style="margin-top:12px">
              <button class="btn sm" onclick="OptiApp.clearAudit()">Vider le journal</button>
              <button class="btn sm danger" onclick="OptiApp.reset()">Réinitialiser le logiciel</button>
            </div>
          </div>
        </div>` : ''}
      </div>
    `);
  }

  function collectShopForm(partial) {
    const s = db().shop;
    const g = (id) => document.getElementById(id);
    const val = (id, fallback) => (g(id) ? g(id).value : fallback);
    const chk = (id, fallback) => (g(id) ? g(id).checked : fallback);
    const split = (id, fallback) => {
      if (!g(id)) return fallback;
      return g(id).value.split(',').map((x) => x.trim()).filter(Boolean);
    };
    const next = { ...s };
    if (g('shName')) next.name = val('shName', s.name);
    if (g('shSlogan')) next.slogan = val('shSlogan', s.slogan || '');
    if (g('shAddr')) next.address = val('shAddr', s.address);
    if (g('shCity')) next.city = val('shCity', s.city || '');
    if (g('shEmail')) next.email = val('shEmail', s.email || '');
    if (g('shPhone')) next.phone = val('shPhone', s.phone);
    if (g('shMob')) next.mobile = val('shMob', s.mobile);
    if (g('shHours')) next.hours = val('shHours', s.hours || '');
    if (g('shNif')) next.nif = val('shNif', s.nif || '');
    if (g('shRc')) next.rc = val('shRc', s.rc || '');
    if (g('shTicket')) next.ticketFooter = val('shTicket', s.ticketFooter || 'Merci de votre visite');
    if (g('shTax')) next.taxEnabled = val('shTax', s.taxEnabled ? '1' : '0') === '1';
    if (g('shRate')) next.taxRate = +val('shRate', s.taxRate || 0);
    if (g('shMinStock')) next.minStockDefault = +val('shMinStock', s.minStockDefault || 3);
    if (g('shRxM')) next.rxValidityMonths = +val('shRxM', s.rxValidityMonths || 24);
    if (g('shPay')) next.paymentMethods = split('shPay', s.paymentMethods || []);
    if (g('shCover')) next.coverOrgs = split('shCover', s.coverOrgs || []);
    if (g('shBar')) next.barcodeEnabled = chk('shBar', s.barcodeEnabled !== false);
    if (g('shScanType')) next.scannerType = val('shScanType', s.scannerType || 'usb_hid');
    if (g('shScanBaud')) next.scannerBaud = +val('shScanBaud', s.scannerBaud || 9600) || 9600;
    if (g('shLoyOn')) next.loyaltyEnabled = chk('shLoyOn', s.loyaltyEnabled !== false);
    if (g('shLoy')) next.loyaltyPointsPer100 = +val('shLoy', s.loyaltyPointsPer100 || 1);
    if (g('shLoyDA')) next.loyaltyDAPer100pts = +val('shLoyDA', s.loyaltyDAPer100pts || 100);
    if (g('shLang')) next.language = val('shLang', s.language || 'fr');
    if (g('shBak')) next.autoBackupHours = +val('shBak', s.autoBackupHours || 6);
    if (g('shAI')) next.aiEnabled = chk('shAI', !!s.aiEnabled);
    if (g('shNotif')) next.notificationsOn = chk('shNotif', s.notificationsOn !== false);
    return next;
  }

  async function saveShop(e) {
    e.preventDefault();
    Object.assign(db().shop, collectShopForm());
    const logoInput = document.getElementById('shLogo');
    const f = logoInput && logoInput.files && logoInput.files[0];
    if (f) db().shop.logo = await readFile(f);
    if (db().stores && db().stores[0]) {
      Object.assign(db().stores[0], {
        name: db().shop.name,
        city: db().shop.city || '',
        phone: db().shop.phone || db().shop.mobile || ''
      });
    }
    await OptiStore.save('Paramètres');
    toast('Paramètres enregistrés');
    renderSettings();
  }

  async function toggleUserActive(id) {
    const u = db().users.find((x) => x.id === id);
    if (!u) return;
    if (db().session && db().session.id === id) return toast('Impossible de suspendre votre session.');
    u.active = u.active === false;
    await OptiStore.save(u.active === false ? 'Utilisateur suspendu' : 'Utilisateur activé');
    toast(u.active === false ? 'Compte suspendu' : 'Compte activé');
    renderSettings();
  }

  async function removeUser(id) {
    if (db().session && db().session.id === id) return toast('Impossible de retirer votre compte.');
    if (!confirm('Retirer cet utilisateur du magasin ?')) return;
    db().users = (db().users || []).filter((u) => u.id !== id);
    await OptiStore.save('Utilisateur retiré');
    toast('Utilisateur retiré');
    renderSettings();
  }

  async function clearAudit() {
    if (!confirm('Vider le journal d’activité ?')) return;
    db().audit = [];
    await OptiStore.save('Journal vidé');
    toast('Journal vidé');
    renderSettings();
  }

  async function setRole(id, role) {
    db().users.find((x) => x.id === id).role = role;
    await OptiStore.save('Rôle modifié');
  }
  async function addUser(e) {
    e.preventDefault();
    const email = document.getElementById('nuEmail').value.trim().toLowerCase();
    if (db().users.some((u) => u.email === email)) return toast('Cet email existe déjà.');
    const pass = document.getElementById('nuPass').value;
    if (pass.length < 8) return toast('Mot de passe trop court (8 caractères min.).');
    await OptiStore.createUser({
      name: document.getElementById('nuName').value.trim(),
      email,
      role: document.getElementById('nuRole').value,
      password: pass
    });
    await OptiStore.save('Utilisateur créé');
    toast('Utilisateur ajouté');
    renderSettings();
  }
  async function resetUserPass(id) {
    const pass = prompt('Nouveau mot de passe (8 caractères minimum) :');
    if (!pass) return;
    if (pass.length < 8) return toast('Mot de passe trop court.');
    await OptiStore.setPassword(id, pass);
    await OptiStore.save('Mot de passe réinitialisé');
    toast('Mot de passe mis à jour');
  }
  function backup() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db(), null, 2)]));
    a.download = 'optidz-sauvegarde.json'; a.click();
  }
  function restore(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      try {
        const data = JSON.parse(r.result);
        Object.keys(data).forEach((k) => db()[k] = data[k]);
        await OptiStore.save('Restauration');
        toast('Données restaurées'); route();
      } catch { toast('Fichier invalide'); }
    };
    r.readAsText(f);
  }
  async function reset() {
    if (!confirm('Effacer toutes les données de ce poste et recommencer à zéro ?')) return;
    try {
      localStorage.removeItem(OptiStore.KEY);
      localStorage.removeItem('optidz_ai_v1');
      localStorage.removeItem('optidz_ai_v3_demo');
      localStorage.removeItem('optidz_ai_v3_real');
      localStorage.removeItem('optidz_purged_v19');
      localStorage.removeItem('optidz_purged_v20');
    } catch {}
    await OptiStore.startRealShop({ shopName: 'Mon optique' });
    location.hash = '#/login';
    location.reload();
  }

  let custHist = [{ who: 'bot', text: 'Salam ! Horaires, lunettes, rendez-vous ou commande : je suis là. En français, arabe ou darija.' }];
  function fillCust() {
    const box = document.getElementById('custMsgs');
    if (!box) return;
    box.innerHTML = custHist.map((m) => `<div class="bubble ${m.who === 'me' ? 'me' : 'bot'}">${esc(m.text).replace(/\n/g, '<br>')}</div>`).join('');
    box.scrollTop = box.scrollHeight;
  }
  function toggleChat() { chatOpen = !chatOpen; const b = document.getElementById('custChat'); if (b) b.classList.toggle('open', chatOpen); fillCust(); }
  function sendCust() {
    const inp = document.getElementById('custIn');
    const q = inp.value.trim(); if (!q) return;
    inp.value = '';
    custHist.push({ who: 'me', text: q });
    if (/^\d{1,2}:\d{2}$/.test(q)) {
      db().appointments.push({ id: OptiStore.uid('r'), clientId: 1, date: OptiStore.todayISO(), time: q, reason: 'Prise en ligne', status: 'confirmé', notes: 'chatbot' });
      OptiStore.save('RDV chatbot');
      custHist.push({ who: 'bot', text: `Rendez-vous enregistré à ${q}. Confirmation locale créée.` });
    } else custHist.push({ who: 'bot', text: OptiAI.customer(q) });
    fillCust();
  }
  function toggleLang() { lang = lang === 'fr' ? 'ar' : 'fr'; localStorage.setItem('optidz_lang', lang); route(); }

  function formatChat(text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^[-•]\s/gm, '• ').replace(/\n/g, '<br>');
  }
  function claudeContext() {
    const d = db();
    const t = OptiStore.todayISO();
    const month = OptiAI.monthStart();
    const moneyN = (n) => OptiStore.money(n);
    const sales = d.sales || [];
    const products = d.products || [];
    return {
      logiciel: 'OptiDZ — caisse, stock, dossiers optiques, devis, commandes, achats, fournisseurs, agenda, finances, factures',
      magasin: { nom: d.shop?.name, ville: d.shop?.city, tel: d.shop?.mobile || d.shop?.phone, adresse: d.shop?.address },
      caisse: {
        session: OptiStore.openCashSession() ? 'ouverte' : 'fermée',
        caJour: moneyN(sales.filter((s) => s.date === t).reduce((a, s) => a + s.total, 0)),
        caMois: moneyN(sales.filter((s) => s.date >= month).reduce((a, s) => a + s.total, 0)),
        impayes: sales.filter((s) => s.status !== 'retour' && (s.paid + (s.coverAmount || 0)) < s.total).map((s) => ({
          id: s.id, client: OptiStore.clientName(s.clientId), reste: moneyN(s.total - (s.coverAmount || 0) - s.paid)
        })).slice(0, 8)
      },
      stock: {
        articles: products.length,
        ruptures: products.filter((p) => p.qty <= 0).map((p) => p.ref + ' ' + p.brand),
        faible: products.filter((p) => p.qty > 0 && p.qty <= p.min).map((p) => ({
          ref: p.ref, nom: p.brand + ' ' + (p.model || ''), qte: p.qty, min: p.min, type: p.type, prix: moneyN(p.sell)
        })),
        catalogue: products.slice(0, 20).map((p) => ({
          ref: p.ref, type: p.type, nom: p.brand + ' ' + (p.model || ''), qte: p.qty, prix: moneyN(p.sell), emplacement: p.location || ''
        }))
      },
      clients: (d.clients || []).slice(0, 15).map((c) => ({
        nom: c.firstName + ' ' + c.lastName, tel: c.phone, fidelite: c.loyalty
      })),
      ordonnances: (d.prescriptions || []).map((r) => ({
        client: OptiStore.clientName(r.clientId), date: r.date, medecin: r.doctor, type: r.type,
        perimee: OptiStore.isRxExpired(r), pd: r.pd,
        od: r.od, og: r.og
      })),
      commandes: (d.orders || []).map((o) => ({ id: o.id, client: OptiStore.clientName(o.clientId), produit: o.product, statut: o.status, reste: moneyN(o.remain), due: o.due })),
      devis: (d.quotes || []).map((q) => ({ id: q.id, client: OptiStore.clientName(q.clientId), total: moneyN(q.total), statut: q.status })),
      rdvAujourdhui: (d.appointments || []).filter((a) => a.date === t).map((a) => a.time + ' · ' + OptiStore.clientName(a.clientId) + ' · ' + (a.reason || '')),
      fournisseurs: (d.suppliers || []).map((s) => ({ nom: s.name, dette: moneyN(s.debt) }))
    };
  }
  function claudeSystem() {
    return `Tu es l’assistant du logiciel OptiDZ, pour un opticien en Algérie.
Tu connais TOUT le logiciel : tableau de bord, clients, dossiers/ordonnances, produits, stock, caisse, devis, commandes lunettes, achats, fournisseurs, agenda, finances, factures.
Réponds en français, clair, comme un collègue de magasin. Utilise les données fournies. Montants en dinars (DA).
Si on t’envoie une PHOTO :
- ordonnance : extraire OD/OG (sphère, cylindre, axe, addition), PD, médecin, date, type (loin/près/progressif). Si un champ est illisible, écris « illisible » — n’invente jamais une valeur.
- monture/verre/lentille : décris et propose des articles du stock qui correspondent.
- ticket/facture : lis montants et références.
Tu ne poses pas de diagnostic médical et tu ne modifies jamais une ordonnance. Tu aides à lire, classer et relier au stock / client / caisse.
Données actuelles du magasin :
${JSON.stringify(claudeContext())}`;
  }
  function paintClaude() {
    const box = document.getElementById('claudeMsgs');
    if (!box) return;
    box.innerHTML = claudeHist.map((m) => {
      const img = m.preview ? `<img class="claude-pic" src="${m.preview}" alt="photo">` : '';
      if (m.think) return `<div class="bubble bot claude-think"><span></span><span></span><span></span></div>`;
      return `<div class="bubble ${m.role === 'user' ? 'me' : 'bot'}">${img}${m.html || formatChat(m.text || '')}${m.caret ? '<i class="caret"></i>' : ''}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  }
  function setClaudeStatus(s) {
    const el = document.getElementById('claudeStatus');
    if (!el) return;
    const live = /en ligne/i.test(s);
    el.innerHTML = (live ? '<i class="dot-on"></i> ' : '') + esc(s);
  }
  function typeClaude(msg, full) {
    return new Promise((resolve) => {
      let i = 0;
      msg.caret = true;
      msg.text = '';
      const tick = () => {
        if (i >= full.length) {
          msg.caret = false;
          msg.text = full;
          msg.html = formatChat(full);
          paintClaude();
          resolve();
          return;
        }
        i += 1;
        msg.text = full.slice(0, i);
        msg.html = formatChat(msg.text);
        paintClaude();
        const ch = full[i - 1];
        const delay = /\n/.test(ch) ? 28 : /[.]/.test(ch) ? 42 : /[,;:]/.test(ch) ? 22 : 11;
        setTimeout(tick, delay);
      };
      tick();
    });
  }
  function localShopReply(q, photo) {
    const d = db();
    const s = String(q || '').toLowerCase().trim();
    const ctx = claudeContext();
    if (photo) {
      return 'Photo reçue. L’analyse intelligente de l’ordonnance n’est pas disponible pour le moment. Ouvrez le menu Scanner pour une lecture locale, ou posez une question sur le stock, la caisse ou les dossiers.';
    }
    if (/^(salut|bonjour|bonsoir|salam|hello|hi|ça va|ca va)\b/.test(s) || s.length < 3) {
      return `Salam ! Je suis l’assistant de ${d.shop?.name || 'OptiDZ'}.\nAujourd’hui : caisse ${ctx.caisse.caJour}, ${ctx.stock.faible.length} article(s) en stock faible, ${ctx.rdvAujourdhui.length} RDV.\nDemandez stock, caisse, dossiers, commandes…`;
    }
    if (/stock|rupture|faible|rayon/.test(s)) {
      const low = ctx.stock.faible.slice(0, 8).map((p) => `• ${p.nom} — ${p.qte} (min ${p.min})`).join('\n');
      const out = ctx.stock.ruptures.slice(0, 6).map((r) => `• ${r}`).join('\n');
      return `Stock : ${ctx.stock.articles} articles.\n${out ? 'Ruptures :\n' + out + '\n' : ''}${low ? 'Stock faible :\n' + low : 'Rien sous le seuil.'}`;
    }
    if (/caisse|impay|vente|ca\b|chiffre/.test(s)) {
      const unpaid = (ctx.caisse.impayes || []).slice(0, 6).map((x) => `• ${x.id} — ${x.client} — reste ${x.reste}`).join('\n');
      return `Caisse ${ctx.caisse.session}.\nCA jour : ${ctx.caisse.caJour}\nCA mois : ${ctx.caisse.caMois}\n${unpaid ? 'Impayés :\n' + unpaid : 'Aucun impayé listé.'}`;
    }
    if (/dossier|ordonnan|périm|perim|rx|prescription/.test(s)) {
      const rx = (ctx.ordonnances || []).filter((r) => r.perimee).slice(0, 8);
      if (!rx.length) return `Aucune ordonnance périmée parmi ${(ctx.ordonnances || []).length} dossier(s).`;
      return 'Ordonnances à revoir :\n' + rx.map((r) => `• ${r.client} — ${r.date} — ${r.medecin || 'médecin ?'}`).join('\n');
    }
    if (/commande|devis/.test(s)) {
      const o = (ctx.commandes || []).slice(0, 8).map((x) => `• ${x.id} — ${x.client} — ${x.statut} — reste ${x.reste}`).join('\n');
      const qts = (ctx.devis || []).filter((x) => /ouvert|en attente|brouillon/i.test(x.statut || '')).slice(0, 6)
        .map((x) => `• ${x.id} — ${x.client} — ${x.total}`).join('\n');
      return `${o ? 'Commandes :\n' + o : 'Pas de commande.'}${qts ? '\n\nDevis :\n' + qts : ''}`;
    }
    if (/client|rdv|agenda/.test(s)) {
      const rdv = (ctx.rdvAujourdhui || []).map((x) => `• ${x}`).join('\n');
      return `${(ctx.clients || []).length} clients suivis.\nRDV aujourd’hui :\n${rdv || '• aucun'}`;
    }
    const a = OptiAI.intern(q || 'stock');
    return (a && a.text) || `Je peux répondre sur le stock, la caisse, les dossiers, les commandes et les RDV de ${d.shop?.name || 'votre optique'}.`;
  }

  function ensureClaudeDock() {
    const dock = document.getElementById('claudeDock');
    if (!dock) return null;
    if (!dock.dataset.ready) {
      dock.innerHTML = `<div class="claude-head">
          <span class="claude-av" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none"><path d="M16 5v4M10 16.5h12" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="12.5" cy="16.5" r="2.5" fill="#fff"/><circle cx="19.5" cy="16.5" r="2.5" fill="#fff"/><path d="M11 22.5c1.4 1.2 2.9 1.8 5 1.8s3.6-.6 5-1.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="4.2" r="1.6" fill="#fff"/></svg>
          </span>
          <div class="claude-title"><strong>Assistant OptiDZ</strong><small id="claudeStatus">Prêt</small></div>
          <button type="button" class="claude-x" onclick="OptiApp.toggleClaude()" aria-label="Fermer">×</button>
        </div>
        <div class="chat-msgs" id="claudeMsgs"></div>
        <div class="claude-sug">
          <button type="button" onclick="OptiApp.askClaude('Quel stock est faible ou en rupture ?')">Stock</button>
          <button type="button" onclick="OptiApp.askClaude('Résume la caisse et les impayés.')">Caisse</button>
          <button type="button" onclick="OptiApp.askClaude('Quelles ordonnances sont périmées ?')">Dossiers</button>
          <button type="button" onclick="OptiApp.askClaude('Commandes en cours et devis ouverts.')">Commandes</button>
          <button type="button" onclick="OptiApp.go('#/app/ocr')">Scanner</button>
        </div>
        <div class="claude-attach hide" id="claudeAttach"><img id="claudeThumb" alt=""><button type="button" class="btn sm" onclick="OptiApp.clearClaudePhoto()">Retirer</button></div>
        <div class="chat-in">
          <label class="claude-cam" title="Photo d’ordonnance ou produit">
            <input id="claudeFile" type="file" accept="image/*" hidden onchange="OptiApp.attachClaude(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>
          </label>
          <input id="claudeIn" placeholder="Question, ou joignez une photo…" onkeydown="if(event.key==='Enter')OptiApp.sendClaude()">
          <button type="button" class="btn gold sm claude-send" onclick="OptiApp.sendClaude()">Envoyer</button>
        </div>`;
      dock.addEventListener('dragover', (e) => { e.preventDefault(); dock.classList.add('drop'); });
      dock.addEventListener('dragleave', () => dock.classList.remove('drop'));
      dock.addEventListener('drop', (e) => {
        e.preventDefault();
        dock.classList.remove('drop');
        const f = e.dataTransfer?.files?.[0];
        if (f && f.type.startsWith('image/')) OptiApp.attachClaude({ files: [f] });
      });
      dock.dataset.ready = '1';
    }
    paintClaude();
    return dock;
  }
  async function refreshClaudeStatus() {
    try {
      if (window.optidzDesktop?.claudeStatus) {
        const st = await window.optidzDesktop.claudeStatus();
        setClaudeStatus(st?.ready ? 'En ligne' : 'Mode magasin');
        return;
      }
    } catch {}
    setClaudeStatus('Mode magasin');
  }
  function toggleClaude() {
    const dock = ensureClaudeDock();
    if (!dock) return;
    claudeOpen = !claudeOpen;
    dock.hidden = !claudeOpen;
    dock.classList.toggle('open', claudeOpen);
    document.querySelector('.chat-btn')?.classList.toggle('on', claudeOpen);
    if (claudeOpen) {
      refreshClaudeStatus();
      setTimeout(() => document.getElementById('claudeIn')?.focus(), 40);
    }
  }
  function askClaude(q) {
    ensureClaudeDock();
    if (!claudeOpen) toggleClaude();
    const inp = document.getElementById('claudeIn');
    if (inp) inp.value = q;
    sendClaude();
  }
  function clearClaudePhoto() {
    claudePhoto = null;
    document.getElementById('claudeAttach')?.classList.add('hide');
    const f = document.getElementById('claudeFile');
    if (f) f.value = '';
  }
  function attachClaude(input) {
    const file = input?.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1600;
      let w = img.width, h = img.height;
      if (Math.max(w, h) > max) {
        const r = max / Math.max(w, h);
        w = Math.round(w * r); h = Math.round(h * r);
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const preview = c.toDataURL('image/jpeg', 0.82);
      claudePhoto = { mime: 'image/jpeg', b64: preview.split(',')[1], preview, name: file.name };
      const bar = document.getElementById('claudeAttach');
      const th = document.getElementById('claudeThumb');
      if (th) th.src = preview;
      bar?.classList.remove('hide');
      if (!claudeOpen) toggleClaude();
    };
    img.onerror = () => toast('Image illisible.');
    img.src = url;
  }
  function throwClaudeFriendly(err) {
    const raw = String(err?.message || err || '');
    if (/clé|absent|claude\.key|api key|authentication|401/i.test(raw)) {
      const e = new Error('Assistant photo indisponible sur ce poste.');
      e.code = 'NO_KEY';
      throw e;
    }
    throw err;
  }
  async function callClaude(messages) {
    const payload = { system: claudeSystem(), messages, model: 'claude-sonnet-4-5', max_tokens: 2048 };
    if (window.optidzDesktop?.claude) {
      try {
        return await window.optidzDesktop.claude(payload);
      } catch (err) {
        throwClaudeFriendly(err);
      }
    }
    const post = async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || 'Erreur assistant ' + res.status);
        err.status = res.status;
        throwClaudeFriendly(err);
      }
      return data.text;
    };
    try {
      return await post('http://127.0.0.1:8787/api/chat');
    } catch (err) {
      if (err.code === 'NO_KEY') throw err;
      if (err.status && err.status !== 404) throw err;
      return post('/api/chat');
    }
  }
  async function sendClaude() {
    const inp = document.getElementById('claudeIn');
    const q = (inp?.value || '').trim();
    if (claudeBusy) return;
    if (!q && !claudePhoto) return;
    if (inp) inp.value = '';
    const photo = claudePhoto;
    const userText = q || (photo ? 'Lis et analyse cette photo (ordonnance, produit, ticket…). Relie-la au stock et aux dossiers si possible.' : '');
    claudeHist.push({ role: 'user', text: userText, preview: photo?.preview || '' });
    clearClaudePhoto();
    const think = { role: 'assistant', think: true, text: '' };
    claudeHist.push(think);
    paintClaude();
    claudeBusy = true;
    setClaudeStatus(photo ? 'Analyse de la photo…' : 'Rédige…');
    try {
      const prior = claudeHist.filter((m) => !m.think && m !== think).slice(-10);
      const messages = [];
      prior.forEach((m, idx) => {
        if (m.role === 'user' && idx === prior.length - 1 && photo) {
          messages.push({
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: photo.mime, data: photo.b64 } },
              { type: 'text', text: userText }
            ]
          });
        } else if (m.role === 'user' || m.role === 'assistant') {
          messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text || '' });
        }
      });
      while (messages.length && messages[0].role !== 'user') messages.shift();
      const text = await callClaude(messages);
      claudeHist.pop();
      const msg = { role: 'assistant', text: '' };
      claudeHist.push(msg);
      await typeClaude(msg, text || 'Pas de réponse.');
    } catch (err) {
      claudeHist.pop();
      const raw = String(err.message || err);
      const useLocal = /clé|absent|indisponible|fetch|Failed|ECONNREFUSED|NetworkError|assistant|NO_KEY/i.test(raw);
      const reply = useLocal ? localShopReply(q, photo) : raw;
      const msg = { role: 'assistant', text: '' };
      claudeHist.push(msg);
      setClaudeStatus('Mode magasin');
      await typeClaude(msg, reply);
    }
    claudeBusy = false;
    setClaudeStatus('En ligne');
  }

  function route() {
    const h = (location.hash || '#/').replace(/^#/, '');
    const parts = h.split('/').filter(Boolean);
    const a = parts[0] || '';
    if (a === 'owner') {
      // Admin est un site séparé : /admin/
      location.replace('admin/');
      return;
    }
    if (a === 'setup') {
      authMode = 'trial';
      return renderAuth();
    }
    if (a === 'app') {
      if (!db().session) {
        authMode = 'welcome';
        return renderAuth();
      }
      if (!guardAccess()) return;
      const p = parts[1] || 'dashboard';
      if (p === 'about') return renderAbout();
      if (!OptiStore.can(p) && db().session.role !== 'admin') { toast('Permission refusée'); return renderDashboard(); }
      const map = {
        dashboard: renderDashboard, clients: renderClients, rx: renderRx, products: renderProducts, stock: renderStock,
        atelier: () => OptiAtelier.renderAtelier(), caisse: () => OptiAtelier.renderCaisseJour(), tables: () => OptiAtelier.renderTables(),
        sales: renderSales, quotes: OptiOps.renderQuotes, orders: renderOrders, purchases: OptiOps.renderPurchases,
        suppliers: renderSuppliers, rdv: renderRdv, finance: renderFinance, reports: renderReports,
        notifications: renderNotif, ai: renderAI, ocr: renderOCR, settings: renderSettings, about: renderAbout
      };
      try { return (map[p] || renderDashboard)(); } catch (err) { console.error(err); toast(String(err.message || err)); return; }
    }
    if (db().session) {
      if (!guardAccess()) return;
      return renderDashboard();
    }
    if (a === 'signup') authMode = OptiLicense.getPending() ? 'signup' : 'trial';
    else if (a === 'login') authMode = 'login';
    else if (a === 'trial') authMode = 'trial';
    else if (a === 'paid' || a === 'achat') authMode = 'paidkey';
    else authMode = 'welcome';
    return renderAuth();
  }

  async function init() {
    try { localStorage.removeItem('optidz_claude_key'); } catch {}
    await OptiStore.load();
    await OptiLicense.ensureVault();
    if (db().users?.length) OptiLicense.registerShopFromDb(db());
    if ('serviceWorker' in navigator) {
      try { await navigator.serviceWorker.register('sw.js'); } catch {}
    }
    window.addEventListener('online', () => { if (db().session) route(); });
    window.addEventListener('offline', () => { toast('Mode hors ligne'); if (db().session) route(); });
    OptiOps.installWedgeScanner();
    window.addEventListener('hashchange', route);
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('omniWrap')?.classList.add('focus');
        document.getElementById('omni')?.focus();
        OptiApp.omniFocus();
      }
    });
    document.addEventListener('mousedown', (e) => {
      const wrap = document.getElementById('omniWrap');
      if (wrap && !wrap.contains(e.target)) OptiApp.omniClose();
    });
    setInterval(() => OptiStore.maybeBackup(), 15 * 60 * 1000);
    setTimeout(() => OptiStore.maybeBackup(), 8000);
    // Vérifie toutes les 30 s si l'essai vient d'expirer pendant l'usage
    setInterval(() => {
      if (!db().session) return;
      OptiLicense.syncShopLicenseFromVault(db());
      if (!OptiStore.licenseAllowed() || OptiStore.isBlocked()) {
        toast('Essai terminé — activez une licence');
        route();
      }
    }, 30000);
    if (!db().session) {
      const h = String(location.hash || '');
      if (h.includes('owner')) {
        location.replace('admin/');
        return;
      }
      if (!hasOnboarded() && !h.includes('login') && !h.includes('signup') && !h.includes('setup') && !h.includes('trial') && !h.includes('achat') && !h.includes('paid')) {
        authMode = 'welcome';
        location.hash = '#/welcome';
        return renderAuth();
      }
      if (h.includes('signup')) authMode = OptiLicense.getPending() ? 'signup' : 'trial';
      else if (h.includes('trial')) authMode = 'trial';
      else if (h.includes('achat') || h.includes('paid')) authMode = 'paidkey';
      else if (h.includes('login')) authMode = 'login';
      else authMode = 'welcome';
      if (!h.includes('login') && !h.includes('signup') && !h.includes('setup') && !h.includes('welcome') && !h.includes('trial') && !h.includes('paid') && !h.includes('achat') && !h.includes('owner')) {
        location.hash = '#/welcome';
      }
      return renderAuth();
    }
    if (!OptiStore.licenseAllowed() || OptiStore.isBlocked()) {
      if (OptiStore.isBlocked()) return renderBlocked();
      return renderLicenseLock();
    }
    if (!String(location.hash).startsWith('#/app')) location.hash = '#/app/dashboard';
    route();
  }

  return {
    init, go, toggleLang, toggleChat, sendCust, esc, toast, shell, openModal, closeModal, db, money,
    doLogin, doSetup, doSignup, setAuthMode, logout, fillDemo, togglePass, renderAbout,
    goOnboard, finishOnboard, submitTrialKey, submitPaidKey, activatePaidKey, clearPendingTrial,
    renderClients, editClient, saveClient, viewClient, delClient, printClient,
    renderRx, editRx, saveRx, renderProducts, setProdTab, editProduct, saveProduct,
    renderStock, setStockTab, stockMove, saveMove, scanStock,
    renderSales, addCart, addBarcode, renderCart, dropCart, clearCart, checkout, receipt, returnSale,
    renderOrders, editOrder, saveOrder, nextOrder,
    renderSuppliers, editSupplier, saveSupplier,
    renderRdv, shiftCal, editRdv, saveRdv, cancelRdv,
    renderFinance, addExp, saveExp, renderReports, exportCSV,
    askIA, quickIA, gen, runOCR, saveOCR, saveShop, setSettingsTab, setRole, addUser, resetUserPass, toggleUserActive, removeUser, clearAudit, backup, restore, reset,
    toggleClaude, sendClaude, askClaude, attachClaude, clearClaudePhoto
  };
})();

if (window.OptiOps) Object.assign(window.OptiApp, window.OptiOps);
document.addEventListener('DOMContentLoaded', () => OptiApp.init());
