/* ── Data ── */
const CALLS = [
  { id: 1,  name: 'Buck Grunt',      cat: 'grunt',  duration: 180 },
  { id: 2,  name: 'Tending Grunt',   cat: 'grunt',  duration: 240 },
  { id: 3,  name: 'Trailing Grunt',  cat: 'grunt',  duration: 150 },
  { id: 4,  name: 'Contact Grunt',   cat: 'grunt',  duration: 120 },
  { id: 5,  name: 'Doe Bleat',       cat: 'bleat',  duration: 200 },
  { id: 6,  name: 'Estrus Bleat',    cat: 'bleat',  duration: 160 },
  { id: 7,  name: 'Social Bleat',    cat: 'bleat',  duration: 130 },
  { id: 8,  name: 'Fawn Bleat',      cat: 'fawn',   duration: 90  },
  { id: 9,  name: 'Fawn Distress',   cat: 'fawn',   duration: 110 },
  { id: 10, name: 'Light Tickle',    cat: 'rattle', duration: 300 },
  { id: 11, name: 'Medium Rattle',   cat: 'rattle', duration: 360 },
  { id: 12, name: 'Full Clash',      cat: 'rattle', duration: 420 },
  { id: 13, name: 'Buck Snort',      cat: 'snort',  duration: 60  },
  { id: 14, name: 'Snort-Wheeze',    cat: 'snort',  duration: 75  },
  { id: 15, name: 'Alarm Snort',     cat: 'snort',  duration: 45  },
];

/* ── State ── */
const state = {
  currentId:  null,
  isPlaying:  false,
  repeat:     false,
  filter:     'all',
  search:     '',
  favOnly:    false,
  elapsed:    0,
  progress:   0,
  favourites: new Set(JSON.parse(localStorage.getItem('dc_favs') || '[]')),
  timerLeft:  0,
  _tick:      null,
  _timer:     null,
};

/* ── Utils ── */
const $  = id => document.getElementById(id);
const fmt = s  => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const saveFavs = () => localStorage.setItem('dc_favs', JSON.stringify([...state.favourites]));
const call = () => CALLS.find(c => c.id === state.currentId) || null;

function visible() {
  let list = CALLS;
  if (state.favOnly)         list = list.filter(c => state.favourites.has(c.id));
  if (state.filter !== 'all') list = list.filter(c => c.cat === state.filter);
  if (state.search)           list = list.filter(c => c.name.toLowerCase().includes(state.search));
  return list;
}

/* ── Playback ── */
function play(id) {
  stop();
  state.currentId = id;
  state.isPlaying = true;
  state.elapsed   = 0;
  state.progress  = 0;
  const dur = call().duration;

  state._tick = setInterval(() => {
    state.elapsed++;
    state.progress = (state.elapsed / dur) * 100;
    updateProgress();
    if (state.elapsed >= dur) {
      if (state.repeat) { state.elapsed = 0; }
      else { stop(); advance(); }
    }
  }, 1000);

  render();
}

function stop() {
  clearInterval(state._tick);
  state._tick    = null;
  state.isPlaying = false;
  render();
}

function toggle() {
  if (!state.currentId) { if (CALLS.length) play(CALLS[0].id); return; }
  if (state.isPlaying) {
    state.isPlaying = false;
    clearInterval(state._tick); state._tick = null;
    syncPlayBtn(); syncWave(); syncRows();
  } else {
    if (state.elapsed >= call().duration) state.elapsed = 0;
    play(state.currentId);
  }
}

function advance() {
  const idx = CALLS.findIndex(c => c.id === state.currentId);
  if (idx !== -1 && idx < CALLS.length - 1) play(CALLS[idx + 1].id);
}

function prev() {
  const idx = CALLS.findIndex(c => c.id === state.currentId);
  if (idx > 0) play(CALLS[idx - 1].id);
  else { state.elapsed = 0; updateProgress(); }
}

function next() {
  const idx = CALLS.findIndex(c => c.id === state.currentId);
  if (idx !== -1 && idx < CALLS.length - 1) play(CALLS[idx + 1].id);
}

/* ── Render ── */
function renderList() {
  const list  = visible();
  const el    = $('callsList');
  const empty = $('emptyState');

  $('sectionCount').textContent = `${list.length} sound${list.length !== 1 ? 's' : ''}`;

  if (!list.length) { el.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  el.innerHTML = list.map((c, i) => {
    const playing = c.id === state.currentId;
    const fav     = state.favourites.has(c.id);
    const playIco = playing && state.isPlaying
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    return `
    <div class="call-row ${playing ? 'playing' : ''}" data-id="${c.id}">
      <span class="row-num">${i + 1}</span>
      <div class="row-play-ico">${playIco}</div>
      <div class="row-info">
        <div class="row-name">${c.name}</div>
        <div class="row-tag">${c.cat}</div>
      </div>
      <button class="row-fav ${fav ? 'active' : ''}" data-fav="${c.id}" title="Favourite">
        <svg viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <span class="row-dur">${fmt(c.duration)}</span>
      <span class="row-dot"></span>
    </div>`;
  }).join('');
}

function syncRows() {
  document.querySelectorAll('.call-row').forEach(row => {
    const id      = +row.dataset.id;
    const playing = id === state.currentId;
    row.classList.toggle('playing', playing);
    const ico = row.querySelector('.row-play-ico');
    if (!ico) return;
    ico.innerHTML = playing && state.isPlaying
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  });
}

function syncPlayBtn() {
  $('mainPlayBtn').querySelector('.ico-play').style.display  = state.isPlaying ? 'none' : '';
  $('mainPlayBtn').querySelector('.ico-pause').style.display = state.isPlaying ? '' : 'none';
}

function syncWave() {
  $('waveform').classList.toggle('active', state.isPlaying);
}

function updateProgress() {
  const pct = Math.min(state.progress, 100);
  $('progressFill').style.width      = pct + '%';
  $('timeElapsed').textContent       = fmt(state.elapsed);
  const c = call();
  $('timeDuration').textContent      = c ? fmt(c.duration) : '0:00';
}

function updatePlayerBar() {
  const c = call();
  $('playerName').textContent = c ? c.name : 'Select a call to play';
  $('playerCat').textContent  = c ? c.cat  : '';
  $('timeDuration').textContent = c ? fmt(c.duration) : '0:00';
}

function render() {
  renderList();
  updatePlayerBar();
  updateProgress();
  syncPlayBtn();
  syncWave();
}

/* ── Timer ── */
function startTimer(min) {
  clearInterval(state._timer);
  state.timerLeft = min * 60;
  if (!min) {
    $('timerInfo').style.display = 'none';
    $('timerBtn').classList.remove('active');
    $('timerLabel').textContent = 'Sleep Timer';
    return;
  }
  $('timerInfo').style.display = 'block';
  $('timerBtn').classList.add('active');
  $('timerCountdown').textContent = fmt(state.timerLeft);
  state._timer = setInterval(() => {
    state.timerLeft--;
    $('timerCountdown').textContent = fmt(state.timerLeft);
    if (state.timerLeft <= 0) {
      clearInterval(state._timer);
      stop();
      $('timerInfo').style.display = 'none';
      $('timerBtn').classList.remove('active');
      $('timerLabel').textContent = 'Sleep Timer';
    }
  }, 1000);
}

/* ── Events ── */
document.addEventListener('DOMContentLoaded', () => {
  render();

  /* List clicks */
  $('callsList').addEventListener('click', e => {
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      e.stopPropagation();
      const id = +favBtn.dataset.fav;
      state.favourites.has(id) ? state.favourites.delete(id) : state.favourites.add(id);
      saveFavs();
      renderList();
      return;
    }
    const row = e.target.closest('.call-row');
    if (!row) return;
    const id = +row.dataset.id;
    if (id === state.currentId && state.isPlaying) stop();
    else play(id);
  });

  /* Player controls */
  $('mainPlayBtn').addEventListener('click', toggle);
  $('prevBtn').addEventListener('click', prev);
  $('nextBtn').addEventListener('click', next);

  $('repeatBtn').addEventListener('click', () => {
    state.repeat = !state.repeat;
    $('repeatBtn').classList.toggle('active', state.repeat);
  });

  $('volumeSlider').addEventListener('input', e => { /* volume hook for real audio */ });

  $('progressBar').addEventListener('click', e => {
    const c = call(); if (!c) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.elapsed  = pct * c.duration;
    state.progress = pct * 100;
    updateProgress();
  });

  /* Sidebar nav */
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.cat;
      const labels = { all:'All Calls', grunt:'Grunt', bleat:'Bleat', rattle:'Rattle', snort:'Snort', fawn:'Fawn' };
      $('sectionTitle').textContent = labels[state.filter] || 'All Calls';
      renderList();
    });
  });

  /* Search */
  $('searchInput').addEventListener('input', e => {
    state.search = e.target.value.toLowerCase().trim();
    $('searchClear').style.display = state.search ? '' : 'none';
    renderList();
  });
  $('searchClear').addEventListener('click', () => {
    $('searchInput').value = '';
    state.search = '';
    $('searchClear').style.display = 'none';
    renderList();
  });

  /* Favourites toggle */
  $('favToggle').addEventListener('click', () => {
    state.favOnly = !state.favOnly;
    $('favToggle').classList.toggle('active', state.favOnly);
    $('sectionTitle').textContent = state.favOnly ? 'Favourites' : 'All Calls';
    renderList();
  });

  /* Timer */
  $('timerBtn').addEventListener('click', () => $('timerModal').classList.add('open'));
  $('timerClose').addEventListener('click', () => $('timerModal').classList.remove('open'));
  $('timerModal').addEventListener('click', e => { if (e.target === $('timerModal')) $('timerModal').classList.remove('open'); });

  document.querySelectorAll('.t-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.t-opt').forEach(b => b.classList.remove('active'));
      const min = +btn.dataset.min;
      if (min) btn.classList.add('active');
      startTimer(min);
      setTimeout(() => $('timerModal').classList.remove('open'), 300);
    });
  });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space')      { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') next();
    if (e.code === 'ArrowLeft')  prev();
    if (e.code === 'KeyR')       $('repeatBtn').click();
  });
});
