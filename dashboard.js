/* ===== CRM MÉDINOVA — logique démo (front-end) ===== */
const login = document.getElementById('login');
const app = document.getElementById('app');
const KEY = 'medinova_auth';

/* --- Session --- */
const showApp = () => { login.hidden = true; app.hidden = false; };
const showLogin = () => { login.hidden = false; app.hidden = true; };
if (sessionStorage.getItem(KEY) === '1') showApp();

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  sessionStorage.setItem(KEY, '1'); // démo : toute saisie est acceptée
  showApp();
});
document.getElementById('logout').addEventListener('click', () => {
  sessionStorage.removeItem(KEY);
  showLogin();
});

/* --- Date du jour --- */
const dateEl = document.getElementById('viewDate');
try {
  dateEl.textContent = new Date().toLocaleDateString('fr-CA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
} catch (e) { dateEl.textContent = ''; }

/* --- Navigation entre les vues --- */
const titles = {
  dashboard: 'Tableau de bord', clients: 'Clients', rdv: 'Rendez-vous',
  soins: 'Soins', ventes: 'Ventes', revenus: 'Revenus', marketing: 'Marketing', parametres: 'Paramètres'
};
const navLinks = document.querySelectorAll('#sideNav a');
const setView = (view) => {
  document.querySelectorAll('.view').forEach(v => v.hidden = (v.id !== 'view-' + view));
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.view === view));
  document.getElementById('viewTitle').textContent = titles[view] || '';
  if (view === 'ventes' && window.renderVentes) window.renderVentes();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
navLinks.forEach(a => a.addEventListener('click', () => setView(a.dataset.view)));
// liens "Tout voir / Agenda" dans les cartes
document.querySelectorAll('.goto').forEach(a => a.addEventListener('click', () => setView(a.dataset.view)));

/* --- Recherche dans la table des clients --- */
const search = document.getElementById('globalSearch');
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  if (q) setView('clients');
  const table = document.getElementById('clientsTable');
  if (!table) return;
  table.querySelectorAll('tbody tr').forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* --- Interrupteurs (paramètres) --- */
document.querySelectorAll('[data-switch]').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('off'));
});

/* ===== VENTES : système de vente manuel (sauvegarde locale) ===== */
(function () {
  const SKEY = 'medinova_sales';
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const fmt = (n) => Math.round(n).toLocaleString('fr-CA') + ' $';
  const today = (() => { try { return new Date().toISOString().slice(0, 10); } catch (e) { return '2026-06-15'; } })();

  const seed = [
    { id: 's1', date: '2026-06-14', client: 'Camille Roy', machine: 'B-Freeze Yura', amount: 150 },
    { id: 's2', date: '2026-06-13', client: 'Sofia Mercier', machine: 'Madérothérapie', amount: 85 },
    { id: 's3', date: '2026-06-12', client: 'Maude Lavoie', machine: 'Extensions de cils', amount: 120 },
    { id: 's4', date: '2026-06-10', client: 'Annie Poulin', machine: 'B-Freeze Yura', amount: 300 },
    { id: 's5', date: '2026-06-08', client: 'Julie Tremblay', machine: 'B-Pulse', amount: 90 }
  ];
  let sales;
  try { sales = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { sales = null; }
  const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(sales)); } catch (e) {} };
  if (!Array.isArray(sales)) { sales = seed.slice(); save(); }

  const monthFilter = document.getElementById('monthFilter');
  const tbody = document.getElementById('salesTbody');
  const bars = document.getElementById('vMachineBars');
  if (!monthFilter) return;

  const fillMonths = () => {
    const cur = today.slice(0, 7);
    let opts = '<option value="all">Tous les temps</option>';
    for (let m = 11; m >= 0; m--) {
      const key = '2026-' + String(m + 1).padStart(2, '0');
      const label = MONTHS[m].charAt(0).toUpperCase() + MONTHS[m].slice(1) + ' 2026';
      opts += '<option value="' + key + '"' + (key === cur ? ' selected' : '') + '>' + label + '</option>';
    }
    monthFilter.innerHTML = opts;
  };

  const filtered = () => {
    const f = monthFilter.value;
    return f === 'all' ? sales : sales.filter(s => s.date.slice(0, 7) === f);
  };

  window.renderVentes = function () {
    const list = filtered().slice().sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((s, x) => s + Number(x.amount), 0);
    document.getElementById('vRevenue').textContent = fmt(total);
    document.getElementById('vCount').textContent = list.length;
    document.getElementById('vAvg').textContent = list.length ? fmt(total / list.length) : '0 $';

    const byM = {};
    list.forEach(s => { byM[s.machine] = (byM[s.machine] || 0) + Number(s.amount); });
    const entries = Object.entries(byM).sort((a, b) => b[1] - a[1]);
    document.getElementById('vTop').textContent = entries.length ? entries[0][0] : '—';
    const max = entries.length ? entries[0][1] : 1;
    bars.innerHTML = entries.length ? entries.map(([m, v]) =>
      '<div class="bar-row"><div class="lbl"><b>' + m + '</b><span>' + fmt(v) + '</span></div>' +
      '<div class="track"><div class="fill" style="width:' + Math.max(6, (v / max) * 100) + '%"></div></div></div>'
    ).join('') : '<p class="empty">Aucune vente pour cette période.</p>';

    tbody.innerHTML = list.length ? list.map(s => {
      const d = s.date.split('-');
      const dl = d[2] + ' ' + MONTHS[+d[1] - 1].slice(0, 3);
      return '<tr><td>' + dl + '</td><td>' + s.client + '</td><td>' + s.machine +
        '</td><td class="money">' + fmt(s.amount) + '</td>' +
        '<td><button class="del-btn" data-del="' + s.id + '" title="Supprimer">🗑</button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="empty">Aucune vente enregistrée.</td></tr>';
  };

  monthFilter.addEventListener('change', window.renderVentes);
  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    sales = sales.filter(s => s.id !== b.dataset.del);
    save();
    window.renderVentes();
  });

  /* Modale "Nouvelle vente" */
  const modal = document.getElementById('saleModal');
  const openM = () => { document.getElementById('sDate').value = today; modal.hidden = false; document.getElementById('sName').focus(); };
  const closeM = () => { modal.hidden = true; };
  document.getElementById('addSaleBtn').addEventListener('click', openM);
  modal.querySelectorAll('[data-sale-close]').forEach(el => el.addEventListener('click', closeM));
  document.getElementById('saleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('sDate').value;
    sales.push({
      id: 's' + Date.now(),
      date: date,
      client: document.getElementById('sName').value.trim(),
      machine: document.getElementById('sMachine').value,
      amount: Number(document.getElementById('sAmount').value)
    });
    save();
    const mk = date.slice(0, 7);
    if ([...monthFilter.options].some(o => o.value === mk)) monthFilter.value = mk;
    e.target.reset();
    closeM();
    window.renderVentes();
  });

  fillMonths();
})();
