// ===== Работа с сервером (api.php + SQLite) =====
let db = { mechanics: [], orders: [], garages: [] };

async function api(action, data = {}) {
  const res = await fetch('api.php?action=' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Ошибка сервера');
  db = json;
  render();
}

// ===== Интерфейс =====
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money = n => Number(n).toLocaleString('ru-RU') + ' ₽';
const dateFmt = d => new Date(d).toLocaleDateString('ru-RU');
const STATUS = { active: 'активен', done: 'завершён', cancelled: 'отменён' };

function say(text, bad) { const m = $('#msg'); m.textContent = text; m.style.color = bad ? 'var(--bad)' : 'var(--ok)'; }
async function run(action, data, okText) {
  try { await api(action, data); if (okText) say(okText); return true; } catch (e) { say(e.message, true); return false; }
}

function render() {
  const active = db.orders.filter(o => o.status === 'active').length;
  const total = db.garages.reduce((s, g) => s + Number(g.places), 0);
  const free = db.mechanics.filter(m => m.order_id === null);
  const revenue = db.orders.filter(o => o.status === 'done').reduce((s, o) => s + Number(o.price), 0);

  $('#stats').innerHTML =
    `<div><b>${db.orders.length}</b>заказов</div>
     <div><b>${db.mechanics.length}</b>механиков (свободно ${free.length})</div>
     <div><b>${active} / ${total}</b>мест занято</div>
     <div><b>${money(revenue)}</b>выручка</div>`;

  $('#mechTable').innerHTML = '<tr><th>ID</th><th>Имя</th><th>Опыт</th><th>Статус</th><th>Заказ</th><th></th></tr>' +
    db.mechanics.map(m => `<tr><td>${m.id}</td><td>${esc(m.name)}</td><td>${m.exp} лет</td>
      <td class="${m.order_id === null ? 'free' : 'busy'}">${m.order_id === null ? 'свободен' : 'занят'}</td>
      <td>${m.order_id === null ? '—' : '#' + m.order_id}</td>
      <td><button class="ghost" data-del="${m.id}">Удалить</button></td></tr>`).join('');

  const f = $('#filter').value;
  const freeOpts = free.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('');
  $('#orderTable').innerHTML = '<tr><th>ID</th><th>Название</th><th>Машина</th><th>Дата</th><th>Цена</th><th>Статус</th><th>Механик</th><th></th></tr>' +
    db.orders.filter(o => f === 'all' || o.status === f).map(o => {
      const m = db.mechanics.find(m => m.id == o.mechanic_id);
      const who = m ? esc(m.name) : (o.status === 'active'
        ? `<select data-pick="${o.id}"><option value="">назначить…</option>${freeOpts}</select>` : '—');
      const btns = o.status === 'active'
        ? `<button data-done="${o.id}">Закрыть</button><button class="ghost" data-cancel="${o.id}">Отменить</button>` : '';
      return `<tr><td>${o.id}</td><td>${esc(o.title)}</td><td>${esc(o.car)}</td><td>${dateFmt(o.date)}</td>
        <td>${money(o.price)}</td><td class="${o.status}">${STATUS[o.status]}</td><td>${who}</td><td>${btns}</td></tr>`;
    }).join('');

  let left = active;
  $('#garages').innerHTML = db.garages.map(g => {
    let boxes = '';
    for (let i = 0; i < g.places; i++) { const occ = left > 0; if (occ) left--; boxes += `<div class="box ${occ ? 'o' : 'f'}">${occ ? 'занят' : 'свободен'}</div>`; }
    return `<h3>${esc(g.name)} (${g.places} мест)</h3><div class="boxes">${boxes}</div>`;
  }).join('');
}

// ===== События =====
document.addEventListener('click', e => {
  const d = e.target.dataset;
  if (d.del) run('delete_mechanic', { id: +d.del }, 'Механик удалён');
  if (d.done) run('finish', { id: +d.done, status: 'done' }, 'Заказ закрыт');
  if (d.cancel) run('finish', { id: +d.cancel, status: 'cancelled' }, 'Заказ отменён');
});
document.addEventListener('change', e => {
  if (e.target.dataset.pick && e.target.value)
    run('assign', { orderId: +e.target.dataset.pick, mechanicId: +e.target.value }, 'Механик назначен');
});
$('#filter').onchange = render;
$('#reset').onclick = () => { if (confirm('Сбросить все данные?')) run('reset', {}, 'Данные сброшены'); };

function bind(id, action, okText) {
  $(id).onsubmit = async e => {
    e.preventDefault();
    const form = e.target;
    if (await run(action, Object.fromEntries(new FormData(form)), okText)) form.reset();
  };
}
bind('#mechForm', 'add_mechanic', 'Механик добавлен');
bind('#orderForm', 'create_order', 'Заказ создан');
bind('#garageForm', 'add_garage', 'Гараж добавлен');

run('state');
