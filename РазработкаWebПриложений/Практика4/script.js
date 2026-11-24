//  хранилища (try/catch нужен, если браузер их блокирует) 
function makeBox(name) {
  const backup = {};
  return {
    get(k, def) { try { const v = window[name].getItem(k); return v === null ? def : v; } catch (e) { return k in backup ? backup[k] : def; } },
    set(k, v) { try { window[name].setItem(k, v); } catch (e) { backup[k] = v; } }
  };
}
const S = makeBox('sessionStorage'); // XP и трафик
const L = makeBox('localStorage');   // тема и имя

//  переменные 
const game = document.getElementById('game');
let id = 0, delay = 2000, spawnTimer, active = true, captchaOn = false, captchaCode = '';

//  перерисовка счётчиков 
function render() {
  document.getElementById('xp').textContent = S.get('xp', 100);
  document.getElementById('traffic').textContent = S.get('traffic', 0);
  document.getElementById('vip').textContent = isVip() ? 'да' : 'нет';
}

//  Cookie: VIP 
function isVip() { return document.cookie.includes('vip=1'); }
document.getElementById('vipBtn').onclick = () => {
  try { document.cookie = 'vip=1; max-age=300; path=/'; } catch (e) {}
  render();
};

//  LocalStorage: настройки 
function applySettings() {
  const theme = L.get('theme', 'light');
  const name = L.get('name', 'Аноним');
  document.body.className = theme;            // меняем класс на <body>
  document.getElementById('theme').value = theme;
  document.getElementById('nameView').textContent = name;
  document.getElementById('nameInput').value = name;
}
document.getElementById('theme').onchange = e => { L.set('theme', e.target.value); applySettings(); };
document.getElementById('nameInput').oninput = e => { L.set('name', e.target.value); applySettings(); };

//  IndexedDB: threat_logs 
let db;
try {
  const req = indexedDB.open('webdozor', 1);
  req.onupgradeneeded = e => e.target.result.createObjectStore('threat_logs', { autoIncrement: true });
  req.onsuccess = e => { db = e.target.result; showLogs(); };
} catch (e) {}

function addLog(type) {
  if (!db) return;
  const tx = db.transaction('threat_logs', 'readwrite');
  tx.objectStore('threat_logs').add({ type: type, time: new Date().toLocaleTimeString() });
  tx.oncomplete = showLogs;
}
function showLogs() {
  const r = db.transaction('threat_logs').objectStore('threat_logs').getAll();
  r.onsuccess = () => {
    const all = r.result;
    document.getElementById('count').textContent = all.length;
    const last = all.slice(-5).map(x => x.time + ' — ' + x.type);
    document.getElementById('logs').textContent = 'Последние угрозы: ' + last.join(' | ');
  };
}

//  урон 
function damage(n) {
  if (!active || isVip()) return;            // VIP не получает урон
  S.set('xp', Number(S.get('xp', 100)) - n);
  render();
  if (Number(S.get('xp', 100)) <= 0) gameOver();
}
function gameOver() {
  active = false;
  clearInterval(spawnTimer);
  document.getElementById('over').style.display = 'flex';
}

//  создание угроз 
function spawn() {
  if (!active || captchaOn) return;
  S.set('traffic', Number(S.get('traffic', 0)) + 2);
  render();

  const r = Math.random();
  const el = document.createElement('div');
  el.id = 'ad' + (++id);
  el.className = 'ad';
  el.style.left = Math.random() * (game.clientWidth - 220) + 'px';
  el.style.top = Math.random() * (game.clientHeight - 170) + 'px';

  if (r < 0.4) {
    // pop-up: настоящий крестик "X" и фальшивый "x"
    el.dataset.type = 'popup';
    const real = '<button class="close">X</button>';
    const fake = '<button class="close fake" data-fake="1">x</button>';
    el.innerHTML = (Math.random() < 0.5 ? real + fake : fake + real) +
      '<b>ВЫ ВЫИГРАЛИ!</b><p>Получите приз сейчас</p><button class="bad">Скачать бесплатно</button>';
    setTimeout(() => { if (el.parentNode) { el.remove(); damage(5); } }, 12000);
  } else if (r < 0.6) {
    // toast-уведомление
    el.dataset.type = 'toast';
    el.className = 'ad toast';
    el.innerHTML = '<b>Сайт хочет слать уведомления</b><br><button class="block">Блокировать</button> <button class="allow">Разрешить</button>';
    setTimeout(() => el.remove(), 6000);
  } else if (r < 0.8) {
    // видео, которое растёт
    el.dataset.type = 'video';
    el.className = 'ad video';
    el.innerHTML = '<button class="close vclose">закрыть</button>▶';
    setTimeout(() => el.classList.add('grow'), 50);
    setTimeout(() => { if (el.parentNode) { el.remove(); damage(20); } }, 8000);
  } else {
    // файл-троян: без крестика, только перетаскивание
    el.dataset.type = 'trojan';
    el.className = 'ad trojan';
    el.draggable = true;
    el.innerHTML = '📄<br>config.sys.exe';
    el.style.top = '0px';
    setTimeout(() => { el.style.top = (game.clientHeight - 70) + 'px'; }, 50); // падает вниз
    setTimeout(() => { if (el.parentNode) { el.remove(); damage(15); } }, 8000);
  }

  game.appendChild(el);
  setTimeout(() => el.classList.add('visible'), 20);
}

// успешное закрытие: удалить + записать в IndexedDB
function catchThreat(el, type) {
  el.remove();
  addLog(type);
}

function startSpawn() {
  clearInterval(spawnTimer);
  spawnTimer = setInterval(spawn, delay);
}

//  делегирование событий: один обработчик на весь #game 
game.addEventListener('click', e => {
  if (!active || captchaOn) return;           // при капче баннеры неуязвимы
  const ad = e.target.closest('.ad');
  if (!ad) return;                            // клик мимо баннера
  const t = e.target;

  if (t.classList.contains('vclose')) {
    catchThreat(ad, 'video');
  } else if (t.classList.contains('close')) {
    if (t.dataset.fake) damage(10);           // фальшивый крестик
    else catchThreat(ad, 'popup');
  } else if (t.classList.contains('block')) {
    catchThreat(ad, 'toast');
  } else if (t.classList.contains('allow')) {
    ad.remove();
    delay = Math.max(300, delay / 2);         // реклама появляется в 2 раза быстрее
    startSpawn();
  } else {
    damage(10);                               // тело баннера, "Скачать бесплатно", троян
  }
});

//  Drag-and-Drop в карантин 
game.addEventListener('dragstart', e => e.dataTransfer.setData('text', e.target.id));
const q = document.getElementById('quarantine');
q.addEventListener('dragover', e => e.preventDefault());
q.addEventListener('drop', e => {
  e.preventDefault();
  if (captchaOn) return;
  const el = document.getElementById(e.dataTransfer.getData('text'));
  if (el && el.dataset.type === 'trojan') catchThreat(el, 'trojan');
});

//  капча раз в минуту 
setInterval(() => {
  if (!active) return;
  captchaCode = '';
  for (let i = 0; i < 5; i++) captchaCode += 'ABCDEFGHKLMNPRSTUVXYZ'[Math.floor(Math.random() * 21)];
  document.getElementById('captchaText').textContent = captchaCode;
  document.getElementById('captchaInput').value = '';
  document.getElementById('captchaMsg').textContent = '';
  document.getElementById('captcha').style.display = 'flex';
  captchaOn = true;
}, 60000);

document.getElementById('captchaBtn').onclick = () => {
  const typed = document.getElementById('captchaInput').value.toUpperCase();
  if (typed === captchaCode) {
    captchaOn = false;
    document.getElementById('captcha').style.display = 'none';
  } else {
    document.getElementById('captchaMsg').textContent = 'Неверно!';
  }
};

// пока висит капча — трафик растёт
setInterval(() => {
  if (captchaOn && active) {
    S.set('traffic', Number(S.get('traffic', 0)) + 5);
    render();
  }
}, 500);

// обновляем VIP-статус (
setInterval(render, 1000);

// рестарт 
document.getElementById('restart').onclick = () => {
  S.set('xp', 100);
  S.set('traffic', 0);
  game.querySelectorAll('.ad').forEach(a => a.remove());
  delay = 2000;
  active = true;
  document.getElementById('over').style.display = 'none';
  render();
  startSpawn();
};

// старт 
applySettings();
render();
startSpawn();
