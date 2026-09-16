(function () {
  let tab = 'optics';
  const root = () => document.getElementById('root');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (s) => {
    const el = document.getElementById('toast');
    el.textContent = s;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2400);
  };

  const brand = () => `<div class="brand"><img src="../assets/logo-mark.png" alt=""><span>Opti<i>DZ</i> Admin</span></div>`;

  async function render() {
    await OptiLicense.ensureVault();
    if (!OptiLicense.isOwnerSession()) return renderLogin();
    return renderDash();
  }

  function renderLogin() {
    root().innerHTML = `<div class="login-wrap">
      <div class="login-card">
        ${brand()}
        <h1>Admin éditeur</h1>
        <p class="lead">Contrôle des opticiens, clés, blocages et problèmes.</p>
        <form onsubmit="AdminApp.login(event);return false">
          <div class="field"><label>Mot de passe</label><input id="pass" type="password" required autocomplete="current-password"></div>
          <p class="error hide" id="err">Mot de passe incorrect.</p>
          <button class="btn gold" type="submit">Entrer</button>
        </form>
        <p class="hint">Par défaut : <code>OptiAdmin#2026</code></p>
      </div>
    </div>`;
    setTimeout(() => document.getElementById('pass')?.focus(), 50);
  }

  function renderDash() {
    const st = OptiLicense.stats();
    const ctrl = OptiLicense.getControl();
    let body = '';

    if (tab === 'create') {
      body = `<div class="license-pair">
        <article class="lic-card essai">
          <span class="st available">Licence 1</span>
          <h3>Essai 7 jours</h3>
          <p>Le client entre la clé ESSAI, crée son optique, puis l’app se ferme après 7 jours.</p>
        </article>
        <article class="lic-card achat">
          <span class="st active">Licence 2</span>
          <h3>Achat illimité</h3>
          <p>Vous envoyez la clé PRO. Le client la saisit comme l’essai — l’app s’ouvre sans limite.</p>
        </article>
      </div>
      <form class="create" onsubmit="AdminApp.createKey(event);return false">
        <div class="formgrid">
          <div class="field"><label>Type de licence</label>
            <select id="type">
              <option value="trial">Licence 1 — Essai 7 jours (ESSAI)</option>
              <option value="paid">Licence 2 — Achat illimité (PRO)</option>
            </select>
          </div>
          <div class="field"><label>Client</label><input id="client" placeholder="Nom optique / contact"></div>
        </div>
        <div class="formgrid">
          <div class="field"><label>Téléphone</label><input id="phone" placeholder="05xx…"></div>
          <div class="field"><label>Note</label><input id="note" placeholder="Telegram, ville…"></div>
        </div>
        <button class="btn gold" type="submit" style="width:auto;min-width:220px">Générer et copier la clé</button>
      </form>`;
    } else if (tab === 'keys') {
      const list = OptiLicense.listLicenses();
      body = `<div class="table-wrap"><table>
        <thead><tr><th>Clé</th><th>Type</th><th>Statut</th><th>Client</th><th>Activation</th><th>Expire</th><th></th></tr></thead>
        <tbody>
          ${list.map((l) => {
            const expired = l.type === 'trial' && l.expiresAt && l.expiresAt < Date.now();
            const status = expired && l.status === 'active' ? 'expired' : l.status;
            return `<tr>
              <td><code class="lic-code">${esc(OptiLicense.normalizeCode(l.code))}</code>
                <button type="button" class="btn sm" onclick="AdminApp.copy('${esc(l.code)}')">Copier</button></td>
              <td>${l.type === 'trial' ? 'Essai 7j' : 'Achat'}</td>
              <td><span class="st ${status}">${esc(status)}</span></td>
              <td>${esc(l.clientName || l.shopName || '—')}<br><small class="muted">${esc(l.shopEmail || l.clientPhone || l.note || '')}</small></td>
              <td>${esc(OptiLicense.formatDate(l.activatedAt))}</td>
              <td>${l.type === 'paid' ? '∞' : esc(OptiLicense.formatDate(l.expiresAt))}</td>
              <td class="actions">
                ${l.type === 'trial' && (status === 'active' || status === 'expired') ? `<button type="button" class="btn sm" onclick="AdminApp.extend('${l.id}')">+7 j</button>` : ''}
                ${status !== 'revoked' ? `<button type="button" class="btn sm warn" onclick="AdminApp.revoke('${l.id}')">Révoquer</button>` : ''}
                ${status === 'available' || status === 'revoked' ? `<button type="button" class="btn sm" onclick="AdminApp.del('${l.id}')">Suppr.</button>` : ''}
              </td>
            </tr>`;
          }).join('') || '<tr><td colspan="7" class="muted">Aucune clé.</td></tr>'}
        </tbody>
      </table></div>`;
    } else if (tab === 'users') {
      const users = OptiLicense.listAppUsers();
      body = `<div class="table-wrap"><table>
        <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Optique</th><th>Statut</th><th>Vu</th><th></th></tr></thead>
        <tbody>
          ${users.map((u) => `<tr>
            <td>${esc(u.name || '—')}</td>
            <td>${esc(u.email)}</td>
            <td>${esc(u.role)}</td>
            <td>${esc(u.shopName || '—')}</td>
            <td><span class="st ${u.blocked ? 'expired' : 'active'}">${u.blocked ? 'bloqué' : 'ok'}</span></td>
            <td>${esc(OptiLicense.formatDate(u.lastSeen))}</td>
            <td class="actions">
              ${u.blocked
                ? `<button type="button" class="btn sm" onclick="AdminApp.unblockUser('${u.id}')">Débloquer</button>`
                : `<button type="button" class="btn sm warn" onclick="AdminApp.blockUser('${u.id}')">Bloquer</button>`}
            </td>
          </tr>`).join('') || '<tr><td colspan="7" class="muted">Aucun utilisateur encore — ils apparaissent après connexion / inscription client.</td></tr>'}
        </tbody>
      </table></div>`;
    } else if (tab === 'control') {
      body = `<div class="create">
        <h3 style="margin:0 0 8px;font-family:var(--display)">Blocage global</h3>
        <p class="muted">Si activé, <b>toute</b> l’application OptiDZ sur ce poste est bloquée.</p>
        <div class="field"><label>Message affiché aux clients</label>
          <input id="gMsg" value="${esc(ctrl.globalMessage || '')}" placeholder="Ex : Maintenance / impayé / litige…">
        </div>
        <div class="actions" style="justify-content:flex-start;margin-top:8px">
          ${ctrl.globalBlock
            ? `<button type="button" class="btn gold" style="width:auto" onclick="AdminApp.globalBlock(false)">Débloquer l’application</button>`
            : `<button type="button" class="btn warn" onclick="AdminApp.globalBlock(true)">Bloquer toute l’application</button>`}
        </div>
        <p class="muted" style="margin-top:18px;font-size:13px">Statut actuel : <b>${ctrl.globalBlock ? 'BLOQUÉ' : 'Ouvert'}</b></p>
      </div>`;
    } else if (tab === 'settings') {
      body = `<form class="create" onsubmit="AdminApp.changePass(event);return false">
        <div class="field"><label>Mot de passe actuel</label><input id="cur" type="password" required></div>
        <div class="field"><label>Nouveau (8 car. min.)</label><input id="neu" type="password" required minlength="8"></div>
        <button class="btn gold" type="submit" style="width:auto">Changer le mot de passe</button>
      </form>
      <p class="muted" style="margin-top:16px;font-size:13px">Admin séparé de l’app client. Fonctionne hors ligne sur ce poste.</p>`;
    } else {
      // optics
      const shops = OptiLicense.listShops();
      body = `<div class="table-wrap"><table>
        <thead><tr><th>Optique</th><th>Contact</th><th>Licence</th><th>Users</th><th>Problème</th><th>Statut</th><th></th></tr></thead>
        <tbody>
          ${shops.map((s) => `<tr>
            <td><b>${esc(s.shopName)}</b><br><small class="muted">${esc(s.city || '')}</small></td>
            <td>${esc(s.ownerName || '—')}<br><small class="muted">${esc(s.email)} · ${esc(s.phone || '')}</small></td>
            <td>${esc(s.licenseType || '—')}<br><code class="lic-code">${esc(s.licenseCode ? OptiLicense.normalizeCode(s.licenseCode) : '—')}</code></td>
            <td>${s.userCount || 0}</td>
            <td>${esc(s.problemNote || '—')}</td>
            <td><span class="st ${s.blocked ? 'expired' : 'active'}">${s.blocked ? 'bloqué' : 'actif'}</span></td>
            <td class="actions">
              <button type="button" class="btn sm" onclick="AdminApp.problem('${s.id}')">Problème</button>
              ${s.blocked
                ? `<button type="button" class="btn sm" onclick="AdminApp.unblockShop('${s.id}')">Débloquer</button>`
                : `<button type="button" class="btn sm warn" onclick="AdminApp.blockShop('${s.id}')">Bloquer app</button>`}
            </td>
          </tr>`).join('') || '<tr><td colspan="7" class="muted">Aucun opticien enregistré. Dès qu’un client s’inscrit ou se connecte, il apparaît ici.</td></tr>'}
        </tbody>
      </table></div>`;
    }

    root().innerHTML = `<div class="page">
      <header class="top">
        <div>
          ${brand()}
          <h1>Pilotage OptiDZ</h1>
          <p>Opticiens · utilisateurs · clés · blocages</p>
        </div>
        <div class="top-actions">
          ${ctrl.globalBlock ? '<span class="st expired">App globale bloquée</span>' : ''}
          <button type="button" class="btn" onclick="AdminApp.logout()">Déconnexion</button>
        </div>
      </header>
      <section class="kpis">
        <div class="kpi"><div class="label">Optiques</div><div class="n">${st.shops || 0}</div></div>
        <div class="kpi"><div class="label">Utilisateurs</div><div class="n">${st.users || 0}</div></div>
        <div class="kpi"><div class="label">Bloqués</div><div class="n">${st.blockedShops || 0}</div></div>
        <div class="kpi"><div class="label">Essais actifs</div><div class="n">${st.activeTrial}</div></div>
        <div class="kpi"><div class="label">Licences PRO</div><div class="n">${st.paid}</div></div>
      </section>
      <div class="tabs">
        <button type="button" class="${tab === 'optics' ? 'on' : ''}" onclick="AdminApp.setTab('optics')">Opticiens</button>
        <button type="button" class="${tab === 'users' ? 'on' : ''}" onclick="AdminApp.setTab('users')">Utilisateurs</button>
        <button type="button" class="${tab === 'keys' ? 'on' : ''}" onclick="AdminApp.setTab('keys')">Clés</button>
        <button type="button" class="${tab === 'create' ? 'on' : ''}" onclick="AdminApp.setTab('create')">Créer clé</button>
        <button type="button" class="${tab === 'control' ? 'on' : ''}" onclick="AdminApp.setTab('control')">Contrôle</button>
        <button type="button" class="${tab === 'settings' ? 'on' : ''}" onclick="AdminApp.setTab('settings')">Réglages</button>
      </div>
      <section class="body">${body}</section>
    </div>`;
  }

  async function login(e) {
    e.preventDefault();
    const ok = await OptiLicense.ownerLogin(document.getElementById('pass')?.value || '');
    if (!ok) {
      document.getElementById('err')?.classList.remove('hide');
      return toast('Mot de passe incorrect');
    }
    toast('Connecté');
    render();
  }

  function logout() {
    OptiLicense.ownerLogout();
    toast('Déconnecté');
    render();
  }

  function setTab(t) {
    tab = t || 'optics';
    render();
  }

  async function createKey(e) {
    e.preventDefault();
    const lic = await OptiLicense.createLicense({
      type: document.getElementById('type')?.value || 'trial',
      clientName: document.getElementById('client')?.value || '',
      clientPhone: document.getElementById('phone')?.value || '',
      note: document.getElementById('note')?.value || ''
    });
    const code = OptiLicense.normalizeCode(lic.code);
    try { await navigator.clipboard.writeText(code); toast('Clé créée et copiée : ' + code); }
    catch { toast('Clé créée : ' + code); }
    tab = 'keys';
    render();
  }

  function revoke(id) {
    if (!confirm('Révoquer cette clé ?')) return;
    OptiLicense.revokeLicense(id);
    toast('Révoquée');
    render();
  }

  function del(id) {
    if (!confirm('Supprimer définitivement ?')) return;
    OptiLicense.deleteLicense(id);
    toast('Supprimée');
    render();
  }

  function extend(id) {
    OptiLicense.extendLicense(id, 7);
    toast('+7 jours');
    render();
  }

  async function copy(code) {
    try {
      await navigator.clipboard.writeText(OptiLicense.normalizeCode(code));
      toast('Copiée');
    } catch {
      toast(OptiLicense.normalizeCode(code));
    }
  }

  function blockShop(id) {
    const reason = prompt('Raison du blocage (affichée dans l’app) :', 'Compte suspendu — contactez OptiDZ.');
    if (reason === null) return;
    OptiLicense.blockShop(id, reason);
    toast('Optique bloquée — l’app affiche le message');
    render();
  }

  function unblockShop(id) {
    OptiLicense.unblockShop(id);
    toast('Optique débloquée');
    render();
  }

  function problem(id) {
    const shop = OptiLicense.findShop(id);
    const note = prompt('Note / problème affiché dans l’app (vide = effacer) :', shop?.problemNote || '');
    if (note === null) return;
    OptiLicense.setShopProblem(id, note.trim());
    toast(note.trim() ? 'Problème enregistré' : 'Note effacée');
    render();
  }

  function blockUser(id) {
    const reason = prompt('Raison du blocage utilisateur :', 'Utilisateur bloqué par OptiDZ.');
    if (reason === null) return;
    OptiLicense.blockUser(id, reason);
    toast('Utilisateur bloqué');
    render();
  }

  function unblockUser(id) {
    OptiLicense.unblockUser(id);
    toast('Utilisateur débloqué');
    render();
  }

  function globalBlock(on) {
    const msg = on
      ? (document.getElementById('gMsg')?.value || prompt('Message de blocage global :', 'Application suspendue par OptiDZ.') || 'Application suspendue par OptiDZ.')
      : '';
    if (on && msg === null) return;
    OptiLicense.setGlobalBlock(!!on, msg);
    toast(on ? 'Application bloquée globalement' : 'Blocage global levé');
    render();
  }

  async function changePass(e) {
    e.preventDefault();
    const res = await OptiLicense.changeOwnerPassword(
      document.getElementById('cur')?.value || '',
      document.getElementById('neu')?.value || ''
    );
    if (!res.ok) return toast(res.error);
    toast('Mot de passe modifié');
    e.target.reset();
  }

  window.AdminApp = {
    login, logout, setTab, createKey, revoke, del, extend, copy, changePass,
    blockShop, unblockShop, problem, blockUser, unblockUser, globalBlock
  };
  document.addEventListener('DOMContentLoaded', render);
})();
