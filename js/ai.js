window.OptiAI = (function () {
  const medical = /(malade|maladie|cataracte|glaucome|diagnos|prescri|ordonnance.*(changer|modifier)|douleur|migraine|ophtalmo|c'est grave|wach rani marid)/i;

  function db() { return OptiStore.get(); }
  function money(n) { return OptiStore.money(n); }
  function name(id) { return OptiStore.clientName(id); }
  function lowStock() { return db().products.filter((p) => p.qty <= p.min); }

  function ca(from, to) {
    return db().sales.filter((s) => {
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      return true;
    }).reduce((a, s) => a + s.total, 0);
  }

  function weekStart() {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d.toISOString().slice(0, 10);
  }
  function monthStart() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
  }

  function productScore(p) {
    let sold = 0;
    db().sales.forEach((s) => (s.items || []).forEach((i) => { if (i.productId === p.id) sold += i.q; }));
    return sold;
  }

  function topProducts(n) {
    return db().products.slice().sort((a, b) => productScore(b) - productScore(a) || b.qty - a.qty).slice(0, n || 5);
  }

  function forecast() {
    const monthly = ca(monthStart());
    return {
      nextMonth: Math.round(monthly * 1.08),
      strong: 'Septembre–octobre (rentrée scolaire)',
      weak: 'Ramadan / été selon historique local',
      demand: topProducts(3).map((p) => p.brand + ' ' + (p.model || ''))
    };
  }

  function anomalies() {
    const list = [];
    const m = ca(monthStart());
    if (m < 20000) list.push('Baisse inhabituelle des ventes ce mois-ci.');
    db().products.forEach((p) => {
      if (productScore(p) === 0 && p.qty > p.min * 3) list.push(p.ref + ' ne se vend plus alors que le stock est élevé.');
    });
    db().sales.forEach((s) => {
      if (s.total > 80000) list.push('Transaction élevée : ' + s.id + ' (' + money(s.total) + ').');
    });
    return list;
  }

  function commercialSummary() {
    const low = lowStock();
    const top = topProducts(2);
    const m = ca(monthStart());
    return `Les ventes du mois s’élèvent à ${money(m)}. ${top.length ? 'Les montures/produits les plus demandés : ' + top.map((p) => p.brand + ' ' + (p.model || '')).join(' et ') + '.' : ''} ${low.length ? 'Le stock de ' + low.map((p) => p.ref).join(', ') + ' doit être renouvelé.' : 'Le stock est globalement sous contrôle.'}`;
  }

  function stockAdvice() {
    return lowStock().slice(0, 5).map((p) => {
      const need = Math.max(p.min * 2 - p.qty, p.min);
      return { product: p, need, text: `${p.brand} ${p.model || p.ref} risque d’être en rupture. Réapprovisionner d’environ ${need} unité(s).` };
    });
  }

  function recommend({ type, budget, color, gender, sph }) {
    return db().products.filter((p) => {
      if (type && p.type !== type) return false;
      if (budget && p.sell > budget) return false;
      if (color && !(p.color || '').toLowerCase().includes(color.toLowerCase())) return false;
      if (gender && p.gender && p.gender !== 'unisexe' && p.gender !== gender) return false;
      if (sph && p.type === 'lentille' && p.power && !String(p.power).includes(String(sph))) return false;
      return p.qty > 0;
    }).slice(0, 6);
  }

  function parseSearch(q) {
    const budget = +(q.replace(/\s/g, '').match(/(\d+)\s*(da|dzd|دج|million)?/i) || [])[1] || 0;
    let b = budget;
    if (/million|mliyoun/i.test(q) && budget < 1000) b = budget * 10000;
    const color = (q.match(/noir|noire|écaille|or|bleu|gold|black|كحل|كحلا/i) || [])[0];
    const gender = /femme|woman|نتية|ولي|fille/i.test(q) ? 'femme' : /homme|man|راجل|ذكر/i.test(q) ? 'homme' : '';
    const type = /verre/i.test(q) ? 'verre' : /lentille/i.test(q) ? 'lentille' : /étui|chiffon|spray|access/i.test(q) ? 'accessoire' : 'monture';
    return recommend({ type, budget: b || 999999, color, gender });
  }

  function parseRxText(text) {
    const pick = (re) => {
      const m = text.match(re);
      return m ? m[1] : '';
    };
    const nums = [...text.matchAll(/([+-]?\d+[.,]\d{2})/g)].map((x) => x[1].replace(',', '.'));
    const axes = [...text.matchAll(/\b(\d{1,3})\s*°?/g)].map((x) => x[1]).filter((n) => +n <= 180);
    const od = { sph: nums[0] || '', cyl: nums[1] || '', axis: axes[0] || '', add: '', prism: '' };
    const og = { sph: nums[2] || nums[0] || '', cyl: nums[3] || nums[1] || '', axis: axes[1] || axes[0] || '', add: '', prism: '' };
    const add = pick(/add(?:ition)?\s*[:=]?\s*([+-]?\d+[.,]\d{2})/i);
    if (add) { od.add = add; og.add = add; }
    const pd = pick(/p(?:d|d)\s*[:=]?\s*(\d{2})/i) || pick(/écart[^0-9]*(\d{2})/i);
    const conf = {};
    ['sph', 'cyl', 'axis', 'add'].forEach((k) => {
      conf['od' + k] = od[k] ? (od[k] ? 'ok' : 'low') : 'low';
      conf['og' + k] = og[k] ? 'ok' : 'low';
    });
    if (!od.sph) od.sph = '';
    return { od, og, pd: pd || '', date: '', doctor: '', patient: '', raw: text, conf };
  }

  async function ocrImage(file) {
    let text = '';
    if (window.Tesseract) {
      try {
        const res = await Tesseract.recognize(file, 'eng+fra+ara');
        text = res?.data?.text || '';
      } catch (e) {
        text = '';
      }
    }
    if (!text) {
      return {
        od: { sph: '', cyl: '', axis: '', add: '', prism: '' },
        og: { sph: '', cyl: '', axis: '', add: '', prism: '' },
        pd: '', date: '', doctor: '', patient: '', raw: '',
        conf: { odsph: 'low', odcyl: 'low', odaxis: 'low', ogsph: 'low', ogcyl: 'low', ogaxis: 'low' },
        note: 'Aucun texte lisible. Tous les champs sont à vérifier. L’IA n’invente aucune valeur.'
      };
    }
    const parsed = parseRxText(text);
    parsed.note = 'Valeurs proposées à partir du document. Confirmez chaque champ avant enregistrement.';
    return parsed;
  }

  function generate(kind) {
    if (kind === 'sales') return commercialSummary();
    if (kind === 'order') {
      const o = db().orders.find((x) => x.status !== 'Livrée' && x.status !== 'Annulée');
      return o ? `Résumé ${o.id} : ${o.product}. Statut ${o.status}. Reste ${money(o.remain)}. Date prévue ${o.due}.` : 'Aucune commande active.';
    }
    if (kind === 'client') return 'Bonjour, votre commande OptiDZ est en préparation. Nous vous prévenons dès qu’elle est prête. À bientôt.';
    if (kind === 'product') {
      const p = db().products[0];
      return p ? `${p.brand} ${p.model || ''} — ${p.color || ''} ${p.size || ''}. Idéale au quotidien, disponible à ${money(p.sell)}.` : '';
    }
    return commercialSummary();
  }

  function intern(q) {
    const s = q.toLowerCase();
    if (medical.test(q)) return { type: 'text', text: 'Cette question nécessite l’avis d’un professionnel. Je ne pose pas de diagnostic et je ne modifie jamais une ordonnance.' };
    if (/semaine|week/.test(s)) return { type: 'text', text: `Cette semaine, le chiffre d’affaires enregistré est de ${money(ca(weekStart()))}.` };
    if (/aujourd|today|ajd/.test(s)) {
      const t = OptiStore.todayISO();
      const n = db().sales.filter((x) => x.date === t);
      return { type: 'text', text: `Aujourd’hui : ${n.length} vente(s), ${money(n.reduce((a, x) => a + x.total, 0))}.` };
    }
    if (/mois|month|ca|chiffre|gagn/.test(s)) return { type: 'text', text: `Ce mois-ci : ${money(ca(monthStart()))} de ventes. ${commercialSummary()}` };
    if (/rupture|stock|commander|réappro/.test(s)) {
      const a = stockAdvice();
      return { type: 'text', text: a.length ? 'Ces produits risquent d’être en rupture :\n' + a.map((x) => '• ' + x.text).join('\n') : 'Aucun produit sous le seuil.' };
    }
    if (/rentab|plus vend|top|10 produits/.test(s)) {
      return { type: 'text', text: 'Top produits : ' + topProducts(10).map((p) => p.ref + ' ' + p.brand + ' (' + money(p.sell) + ')').join(', ') };
    }
    if (/commande/.test(s) && /livr|pas encore|attente/.test(s)) {
      const o = db().orders.filter((x) => !['Livrée', 'Annulée'].includes(x.status));
      return { type: 'text', text: o.length ? o.map((x) => x.id + ' — ' + x.status + ' — ' + name(x.clientId)).join('\n') : 'Toutes les commandes sont livrées.' };
    }
    if (/fournisseur/.test(s)) return { type: 'text', text: db().suppliers.map((x) => x.name + ' (' + x.products + ') — dette ' + money(x.debt)).join('\n') };
    if (/client/.test(s)) return { type: 'text', text: `Vous avez ${db().clients.length} clients. Derniers : ` + db().clients.slice(-3).map((c) => c.firstName + ' ' + c.lastName).join(', ') };
    if (/prévision|forecast/.test(s)) {
      const f = forecast();
      return { type: 'text', text: `Estimation mois prochain : ${money(f.nextMonth)}. Période forte : ${f.strong}. Demande probable : ${f.demand.join(', ')}.` };
    }
    if (/anomal/.test(s)) return { type: 'text', text: anomalies().join('\n') || 'Aucune anomalie détectée.' };
    if (/monture|noir|femme|homme|moins|da|دج/.test(s)) {
      const r = parseSearch(q);
      return { type: 'products', text: r.length ? r.length + ' résultat(s) catalogue.' : 'Aucun produit ne correspond.', products: r };
    }
    return { type: 'text', text: commercialSummary() + '\n\nJe peux parler ventes, stock, commandes, fournisseurs, prévisions ou rechercher une monture.' };
  }

  function hours() { return db().shop.hours; }

  function customer(q) {
    const s = q.toLowerCase();
    if (medical.test(q)) return 'Cette question nécessite l’avis d’un professionnel. Je peux vous aider à prendre rendez-vous avec votre opticien.';
    if (/salam|salut|bonjour|bonsoir|سلام|عسلامة/.test(s)) return `Salam, bienvenue chez ${db().shop.name}. Wach nqder n3awnek ? Horaires : ${hours()}.`;
    if (/ouvert|horaire|wakt|وقت|ouverte/.test(s)) return `Oui, horaires : ${hours()}. Adresse : ${db().shop.address}. Tél : ${db().shop.mobile}.`;
    if (/rendez|rdv|mo3id|موعد|غدوة|ghodwa/.test(s)) {
      const slots = ['10:00', '11:30', '15:00'].filter((t) => !db().appointments.some((a) => a.date === OptiStore.todayISO() && a.time === t));
      return 'Créneaux disponibles : ' + (slots.join(' · ') || 'complet aujourd’hui') + '. Dites-moi l’heure choisie (ex. 10:00) et votre nom.';
    }
    if (/commande|cmd|بري|جاهز|prête|prete/.test(s)) {
      const ready = db().orders.filter((o) => o.status === 'Prête' || o.status === 'Livrée');
      if (ready.length) return `Commande ${ready[0].id} : statut ${ready[0].status}. Vous pouvez passer à l’optique ${db().shop.name}.`;
      const o = db().orders[0];
      return o ? `Commande ${o.id} — statut : ${o.status}. Date prévue : ${o.due}.` : 'Donnez-moi votre numéro de commande.';
    }
    if (/ray-?ban|monture|lunette|سوم|prix|chhal|بكم|moins/.test(s)) {
      const r = parseSearch(q);
      if (!r.length) return 'Je n’ai pas trouvé de modèle correspondant dans le stock actuel. Passez en magasin ou élargissez le budget.';
      return r.map((p, i) => `${i + 1}. ${p.brand} ${p.model || p.ref} — ${money(p.sell)} (${p.color || p.type})`).join('\n') + '\nLa décision finale se fait toujours avec l’opticien.';
    }
    if (/service|lentille|verre/.test(s)) return 'Nous faisons montures, verres, lentilles, examens de vue orientés optique, ajustements et suivi de commandes. Pour un avis médical, consultez un ophtalmologue.';
    return `Je peux vous aider pour les horaires, les rendez-vous, le catalogue, les prix en DA et le suivi de commande. Magasin : ${db().shop.address} — ${db().shop.mobile}.`;
  }

  return { intern, customer, ocrImage, parseRxText, parseSearch, recommend, stockAdvice, commercialSummary, forecast, anomalies, generate, topProducts, ca, monthStart, lowStock, medical };
})();
