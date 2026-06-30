(function() {
  const DATA_VERSION = "2026-oficial-v4";
  const stored = localStorage.getItem("qm2026_version");
  if (stored !== DATA_VERSION) {
    localStorage.removeItem("qm2026_matches");
    localStorage.removeItem("qm2026_participants");
    localStorage.removeItem("qm2026_admin");
    localStorage.setItem("qm2026_version", DATA_VERSION);
  }
})();

// =============================================================================
// QUINIELA MUNDIAL 2026 — app.js
// =============================================================================
//  1.  STATE & helpers de localStorage
//  2.  Helpers generales (getMatch, updateMatch, getTeamOwner, format, escape)
//  3.  Router hash-based
//  4.  calcGroupStandings(groupId) → array ordenado
//  5.  getGroupStatus(groupId) → 'pending' | 'active' | 'finished'
//  6.  renderGrupos(container)
//  7.  buildGroupCard(groupId)
//  8.  buildStandingsTable(standings)
//  9.  buildMatchList(matches)
//  10. Vistas placeholder: renderBracket, renderParticipantes, renderNotFound
//  11. renderParticipantes funcional (usa STATE.participants)
//  12. Página de registro: initRegistroPage, handleRegistroSubmit
//  13. Init DOMContentLoaded
// =============================================================================

// ---------------------------------------------------------------------------
// 1. STATE — fuente de verdad en memoria, espeja localStorage
// ---------------------------------------------------------------------------

const STATE = {
  matches:      [],
  participants: [],
  adminLogged:  false,
};

async function loadState() {
  if (typeof fbGetMatches === 'function') {
    try {
      const [matches, participants] = await Promise.all([
        fbGetMatches(),
        fbGetParticipants(),
      ]);
      STATE.matches      = matches.length ? matches : loadMatches();
      STATE.participants = participants;
    } catch (e) {
      console.error('Firebase load error, usando localStorage:', e);
      STATE.matches      = loadMatches();
      STATE.participants = loadParticipants();
    }
  } else {
    STATE.matches      = loadMatches();
    STATE.participants = loadParticipants();
  }
  STATE.adminLogged = localStorage.getItem(LS_KEYS.ADMIN) === 'true';
}

// Shim — las escrituras individuales llaman a sus contrapartes Firebase directamente.
// Se conserva para compatibilidad con llamadas existentes (p.ej. handleReset).
function saveState() {
  saveMatches(STATE.matches);
  saveParticipants(STATE.participants);
}

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------

function getMatch(id) {
  return STATE.matches.find(m => m.id === id) || null;
}

function updateMatch(id, score1, score2) {
  const m = getMatch(id);
  if (!m) return;
  m.score1  = Number(score1);
  m.score2  = Number(score2);
  m.played  = true;
  saveState();
  if (typeof fbUpdateMatch === 'function') {
    fbUpdateMatch(m).catch(e => console.error('fbUpdateMatch error:', e));
  }
}

// Participant schema helpers — handle both old { nombre, equipo } and new { name, teams }
function getParticipantName(p) { return p.name ?? p.nombre ?? '?'; }
function getParticipantTeams(p) {
  if (Array.isArray(p.teams) && p.teams.length) return p.teams;
  if (p.equipo) return [p.equipo];
  return [];
}

// Team status in the knockout bracket
function getTeamStatus(teamId) {
  const finalM = STATE.matches.find(m => m.phase === 'final' && m.played);
  if (finalM) {
    // m.winner handles ET/pens draws; fallback to score
    const champ = finalM.winner
      || (Number(finalM.score1) > Number(finalM.score2) ? finalM.team1 : finalM.team2);
    if (champ === teamId) return 'champion';
  }
  const koPhases = ['r32', 'r16', 'qf', 'sf', 'final'];
  const lost = STATE.matches.find(m =>
    koPhases.includes(m.phase) && m.played &&
    (m.team1 === teamId || m.team2 === teamId) &&
    (m.winner
      ? m.winner !== teamId
      : ((m.team1 === teamId && Number(m.score1) < Number(m.score2)) ||
         (m.team2 === teamId && Number(m.score2) < Number(m.score1))))
  );
  return lost ? 'eliminated' : 'active';
}

// Points earned by a single team
function calcTeamPts(teamId) {
  if (!teamId) return 0;
  let pts = 0;
  STATE.matches
    .filter(m => m.played && (m.team1 === teamId || m.team2 === teamId))
    .forEach(m => {
      const s1 = Number(m.score1), s2 = Number(m.score2);
      // m.winner handles ET/pens draws in KO; fallback to score comparison
      const isWin = m.winner
        ? m.winner === teamId
        : ((m.team1 === teamId && s1 > s2) || (m.team2 === teamId && s2 > s1));
      const isDraw = !m.winner && s1 === s2;
      if (isWin) pts += 3;
      else if (isDraw) pts += 1;
    });
  const inPhase = ph =>
    STATE.matches.some(m => m.phase === ph && (m.team1 === teamId || m.team2 === teamId));
  if (inPhase('r32'))   pts += 2;
  if (inPhase('r16'))   pts += 2;
  if (inPhase('qf'))    pts += 2;
  if (inPhase('sf'))    pts += 5;
  if (inPhase('final')) pts += 10;
  const fm = STATE.matches.find(m => m.phase === 'final' && m.played);
  if (fm) {
    const champ = fm.winner || (Number(fm.score1) > Number(fm.score2) ? fm.team1 : fm.team2);
    if (champ === teamId) pts += 20;
  }
  return pts;
}

// Total points for a participant (sum across all their teams)
function calcParticipantPts(p) {
  return getParticipantTeams(p).reduce((sum, tid) => sum + calcTeamPts(tid), 0);
}

// Participant who "owns" a team
function getTeamOwner(teamId) {
  return STATE.participants.find(p => getParticipantTeams(p).includes(teamId)) || null;
}

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

// XSS-safe: escapa texto antes de insertar en innerHTML
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// 3. Router
// ---------------------------------------------------------------------------

const ROUTES = {
  '#grupos':        renderGrupos,
  '#bracket':       renderBracket,
  '#participantes': renderParticipantes,
};

// ---------------------------------------------------------------------------
// Global toast notification
// ---------------------------------------------------------------------------

function showToast(message, type = 'success') {
  const existing = document.getElementById('global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'global-toast';
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ---------------------------------------------------------------------------
// Participant count badge on nav link
// ---------------------------------------------------------------------------

function updateParticipantBadge() {
  const count = STATE.participants.length;
  const link  = document.querySelector('.nav-link[href="#participantes"]');
  if (!link) return;
  let badge = link.querySelector('.nav-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'nav-badge';
    link.appendChild(badge);
  }
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? '' : 'none';
}

// ---------------------------------------------------------------------------
// Skeleton placeholder (shown briefly before render)
// ---------------------------------------------------------------------------

function buildSkeleton() {
  return `
    <div class="skeleton-wrap" aria-hidden="true" aria-label="Cargando...">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton-grid">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function renderCurrentView() {
  const hash = window.location.hash || '#grupos';
  const container = document.getElementById('app');
  if (!container) return;
  document.querySelectorAll('.nav-link[data-view]').forEach(l => {
    l.classList.toggle('active', '#' + l.dataset.view === hash);
  });
  updateParticipantBadge();
  const fn = ROUTES[hash];
  container.innerHTML = '';
  if (fn) fn(container);
  else renderNotFound(container);
  void container.offsetWidth;
  container.classList.add('anim-enter');
}

async function refreshFromFirestore() {
  const [matches, participants] = await Promise.all([
    fbGetMatches(),
    fbGetParticipants()
  ]);
  STATE.matches      = matches.length ? matches : STATE.matches;
  STATE.participants = participants;
}

function route() {
  renderCurrentView();
}

window.addEventListener('hashchange', () => {
  renderCurrentView();
});

// ---------------------------------------------------------------------------
// 4. calcGroupStandings(groupId) → array ordenado por Pts/GD/GF/Nombre
// ---------------------------------------------------------------------------

function calcGroupStandings(groupId) {
  const teamIds = TEAMS.filter(t => t.group === groupId).map(t => t.id);

  // Inicializa stats
  const stats = {};
  teamIds.forEach(id => {
    stats[id] = { id, PJ: 0, G: 0, E: 0, P: 0, GF: 0, GC: 0, Pts: 0 };
  });

  // Acumula resultados jugados
  STATE.matches
    .filter(m => m.phase === 'groups' && m.group === groupId && m.played)
    .forEach(m => {
      if (!stats[m.team1] || !stats[m.team2]) return;

      const s1 = Number(m.score1);
      const s2 = Number(m.score2);

      stats[m.team1].PJ++;  stats[m.team2].PJ++;
      stats[m.team1].GF += s1;  stats[m.team1].GC += s2;
      stats[m.team2].GF += s2;  stats[m.team2].GC += s1;

      if (s1 > s2) {
        stats[m.team1].G++;  stats[m.team1].Pts += 3;
        stats[m.team2].P++;
      } else if (s1 < s2) {
        stats[m.team2].G++;  stats[m.team2].Pts += 3;
        stats[m.team1].P++;
      } else {
        stats[m.team1].E++;  stats[m.team1].Pts++;
        stats[m.team2].E++;  stats[m.team2].Pts++;
      }
    });

  return Object.values(stats).sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    const gdA = a.GF - a.GC, gdB = b.GF - b.GC;
    if (gdB !== gdA) return gdB - gdA;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return (getTeam(a.id)?.name ?? '').localeCompare(getTeam(b.id)?.name ?? '');
  });
}

// ---------------------------------------------------------------------------
// 5. getGroupStatus
// ---------------------------------------------------------------------------

function getGroupStatus(groupId) {
  const ms = STATE.matches.filter(m => m.phase === 'groups' && m.group === groupId);
  const played = ms.filter(m => m.played).length;
  if (played === 0)        return 'pending';
  if (played >= ms.length) return 'finished';
  return 'active';
}

// ---------------------------------------------------------------------------
// 6. renderGrupos(container)
// ---------------------------------------------------------------------------

function renderGrupos(container) {
  const section = document.createElement('section');

  // Encabezado de sección
  const head = document.createElement('div');
  head.innerHTML = `
    <h2 class="section-title">Fase de Grupos</h2>
    <p class="section-subtitle">
      12 grupos · 48 equipos · 72 partidos
      &nbsp;—&nbsp; clasifican los 2 primeros de cada grupo + 8 mejores terceros
    </p>
  `;
  section.appendChild(head);

  // Grid de tarjetas (12 grupos)
  const grid = document.createElement('div');
  grid.className = 'groups-grid stagger-children';
  GROUP_IDS.forEach(gid => grid.appendChild(buildGroupCard(gid)));

  section.appendChild(grid);
  container.appendChild(section);
}

// ---------------------------------------------------------------------------
// 7. buildGroupCard(groupId)
// ---------------------------------------------------------------------------

function buildGroupCard(groupId) {
  const standings = calcGroupStandings(groupId);
  const allMatches = STATE.matches.filter(
    m => m.phase === 'groups' && m.group === groupId
  );
  const status = getGroupStatus(groupId);

  const STATUS_LABEL = { pending: 'Pendiente', active: 'En curso', finished: 'Finalizado' };
  const STATUS_CLASS = { pending: '', active: 'active', finished: '' };

  const card = document.createElement('div');
  card.className = 'group-card';

  // Cabecera de la tarjeta
  const cardHead = document.createElement('div');
  cardHead.className = 'group-card__header';
  cardHead.innerHTML = `
    <span class="group-card__title">Grupo ${groupId}</span>
    <span class="group-card__status ${STATUS_CLASS[status]}">${STATUS_LABEL[status]}</span>
  `;
  card.appendChild(cardHead);

  // Tabla de posiciones
  card.appendChild(buildStandingsTable(standings));

  // Separador
  const div = document.createElement('div');
  div.className = 'divider';
  div.style.margin = '0';
  card.appendChild(div);

  // Lista de partidos
  card.appendChild(buildMatchList(allMatches));

  return card;
}

// ---------------------------------------------------------------------------
// 8. buildStandingsTable(standings)
// ---------------------------------------------------------------------------

function buildStandingsTable(standings) {
  const wrap = document.createElement('div');
  wrap.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.className = 'group-table';
  table.setAttribute('aria-label', 'Tabla de posiciones');
  table.innerHTML = `
    <thead>
      <tr>
        <th aria-label="Posición">#</th>
        <th style="text-align:left">Equipo</th>
        <th title="Partidos jugados">PJ</th>
        <th title="Ganados">G</th>
        <th title="Empatados">E</th>
        <th title="Perdidos">P</th>
        <th title="Goles a favor">GF</th>
        <th title="Goles en contra">GC</th>
        <th title="Puntos" class="pts">Pts</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  standings.forEach((row, idx) => {
    const team  = getTeam(row.id);
    if (!team) return;

    const owner = getTeamOwner(row.id);
    const tr    = document.createElement('tr');

    if (idx < 2)                                tr.className = 'qualifies';
    else if (idx >= standings.length - 2)       tr.className = 'out';

    tr.innerHTML = `
      <td class="pos">${idx + 1}</td>
      <td>
        <div class="table-team">
          <span class="table-team__flag" aria-hidden="true">${team.flag}</span>
          <span class="table-team__name">${esc(team.name)}</span>
          ${owner ? `<span class="badge badge-gold">${esc(getParticipantName(owner))}</span>` : ''}
        </div>
      </td>
      <td>${row.PJ}</td>
      <td>${row.G}</td>
      <td>${row.E}</td>
      <td>${row.P}</td>
      <td>${row.GF}</td>
      <td>${row.GC}</td>
      <td class="pts">${row.Pts}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

// ---------------------------------------------------------------------------
// 9. buildMatchList(matches)
// ---------------------------------------------------------------------------

function buildMatchList(matches) {
  const wrap = document.createElement('div');
  wrap.className = 'match-list';

  matches.forEach(m => {
    const t1 = getTeam(m.team1);
    const t2 = getTeam(m.team2);
    if (!t1 || !t2) return;

    const dateStr = formatMatchDate(m.date);
    const row = document.createElement('div');

    if (m.played) {
      const w1 = Number(m.score1) > Number(m.score2);
      const w2 = Number(m.score2) > Number(m.score1);
      row.className = 'match-row match-row--played';
      row.innerHTML = `
        <span class="match-row__team${w1 ? ' match-winner' : ''}">${t1.flag} ${esc(t1.name)}</span>
        <span class="match-row__score">${m.score1}&thinsp;–&thinsp;${m.score2}</span>
        <span class="match-row__team match-row__team--right${w2 ? ' match-winner' : ''}">${esc(t2.name)} ${t2.flag}</span>
        <span class="match-row__date">${dateStr}</span>
      `;
    } else {
      row.className = 'match-row';
      row.innerHTML = `
        <span class="match-row__team">${t1.flag} ${esc(t1.name)}</span>
        <span class="match-row__score match-row__score--vs">vs</span>
        <span class="match-row__team match-row__team--right">${esc(t2.name)} ${t2.flag}</span>
        <span class="match-row__date">${dateStr}</span>
      `;
    }

    wrap.appendChild(row);
  });

  return wrap;
}

// ---------------------------------------------------------------------------
// buildTeamCardEl — construye un .team-card para usar dentro del bracket
// ---------------------------------------------------------------------------

function buildTeamCardEl(teamId, score, isWinner, isEliminated) {
  const card = document.createElement('div');
  card.className = 'team-card';
  if (isWinner)    card.classList.add('winner');
  if (isEliminated) card.classList.add('eliminated');

  if (!teamId || teamId === 'TBD') {
    card.classList.add('team-card--tbd');
    card.innerHTML = `
      <span class="team-card__flag" aria-hidden="true">🌐</span>
      <div class="team-card__info">
        <span class="team-card__name" style="color:var(--text-muted);font-style:italic">Por definir</span>
      </div>
    `;
    return card;
  }

  const team  = getTeam(teamId);
  if (!team) return card;

  card.style.setProperty('--team-color', team.color);
  const owner = getTeamOwner(teamId);

  card.innerHTML = `
    <span class="team-card__flag" aria-hidden="true">${team.flag}</span>
    <div class="team-card__info">
      <span class="team-card__name">${esc(team.name)}</span>
      ${owner ? `<span class="team-card__owner">${esc(getParticipantName(owner))}</span>` : ''}
    </div>
    ${score !== null && score !== undefined
      ? `<span class="team-card__score">${score}</span>`
      : ''}
  `;
  return card;
}

// ---------------------------------------------------------------------------
// buildMatchBox — construye un .match-box con dos team-cards
// t1Id / t2Id: string team id or null (TBD)
// matchObj: match object from STATE.matches (for score / date) or null
// showDate: boolean
// ---------------------------------------------------------------------------

function buildMatchBox(t1Id, t2Id, matchObj, showDate) {
  const box = document.createElement('div');
  box.className = 'match-box';

  const played = matchObj?.played ?? false;
  const s1 = played ? matchObj.score1 : null;
  const s2 = played ? matchObj.score2 : null;
  const n1 = Number(s1), n2 = Number(s2);
  // m.winner handles ET/pens draws; fallback to score
  const winner = matchObj?.winner || null;
  const w1 = played && (winner ? winner === t1Id : n1 > n2);
  const w2 = played && (winner ? winner === t2Id : n2 > n1);
  const e1 = played && !w1 && (winner ? true : n1 !== n2);
  const e2 = played && !w2 && (winner ? true : n1 !== n2);

  box.appendChild(buildTeamCardEl(t1Id, s1, w1, e1));
  box.appendChild(buildTeamCardEl(t2Id, s2, w2, e2));

  if (showDate && matchObj?.date) {
    const dateEl = document.createElement('div');
    dateEl.className = 'match-box__date';
    dateEl.textContent = formatMatchDate(matchObj.date);
    box.appendChild(dateEl);
  }

  return box;
}

// ---------------------------------------------------------------------------
// buildBracketRound — columna de una ronda
// label: string displayed above
// slotElements: array of match-box DOM elements
// roundKey: value for data-round attribute
// ---------------------------------------------------------------------------

function buildBracketRound(label, slotElements, roundKey) {
  const round = document.createElement('div');
  round.className = 'bracket-round';
  round.dataset.round = roundKey;

  const lbl = document.createElement('div');
  lbl.className = 'bracket-round__label';
  lbl.textContent = label;
  round.appendChild(lbl);

  const matchesWrap = document.createElement('div');
  matchesWrap.className = 'bracket-round__matches';

  slotElements.forEach(boxEl => {
    const slot = document.createElement('div');
    slot.className = 'bracket-slot';
    slot.appendChild(boxEl);
    matchesWrap.appendChild(slot);
  });

  round.appendChild(matchesWrap);
  return round;
}

// ---------------------------------------------------------------------------
// getPhaseMatches — devuelve matches de una fase ordenados por id
// ---------------------------------------------------------------------------

function getPhaseMatches(phase) {
  return STATE.matches
    .filter(m => m.phase === phase)
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// buildBracketMatchRow — fila horizontal compacta para el bracket
// [flag] Equipo1 [owner?]  ⚪ score ⚪  [owner?] Equipo2 [flag]
// ---------------------------------------------------------------------------

function buildBracketMatchRow(m) {
  const row = document.createElement('div');
  row.className = 'bk-row';

  const t1Id  = m?.team1 || null;
  const t2Id  = m?.team2 || null;
  const played = m?.played ?? false;
  const winnerField = m?.winner || null;
  const s1 = played ? m.score1 : null;
  const s2 = played ? m.score2 : null;
  const n1 = Number(s1), n2 = Number(s2);
  const w1 = played && (winnerField ? winnerField === t1Id : n1 > n2);
  const w2 = played && (winnerField ? winnerField === t2Id : n2 > n1);

  function teamHalf(teamId, isWinner, isLeft) {
    const half = document.createElement('div');
    half.className = 'bk-row__team' + (isLeft ? '' : ' bk-row__team--right');

    if (!teamId) {
      half.classList.add('bk-row__team--tbd');
      const globe = document.createElement('span');
      globe.className = 'bk-row__flag';
      globe.setAttribute('aria-hidden', 'true');
      globe.textContent = '🌐';
      const lbl = document.createElement('div');
      lbl.className = 'bk-row__info';
      lbl.innerHTML = `<span class="bk-row__name">Por definir</span>`;
      if (isLeft) { half.appendChild(globe); half.appendChild(lbl); }
      else        { half.appendChild(lbl);   half.appendChild(globe); }
      return half;
    }

    const team  = getTeam(teamId);
    if (!team) { half.textContent = teamId; return half; }

    const owner = getTeamOwner(teamId);
    if (played) half.classList.add(isWinner ? 'bk-row__team--winner' : 'bk-row__team--loser');

    const flag = document.createElement('span');
    flag.className = 'bk-row__flag';
    flag.setAttribute('aria-hidden', 'true');
    flag.textContent = team.flag;

    const info = document.createElement('div');
    info.className = 'bk-row__info';
    info.innerHTML = `<span class="bk-row__name">${esc(team.name)}</span>`
      + (owner ? `<span class="bk-row__owner">${esc(getParticipantName(owner))}</span>` : '');

    if (isLeft) { half.appendChild(flag); half.appendChild(info); }
    else        { half.appendChild(info); half.appendChild(flag); }
    return half;
  }

  const scoreEl = document.createElement('div');
  scoreEl.className = 'bk-row__score';
  if (played && s1 !== null && s2 !== null) {
    scoreEl.textContent = `${s1}-${s2}`;
  } else {
    scoreEl.textContent = '?';
    scoreEl.classList.add('bk-row__score--tbd');
  }

  row.appendChild(teamHalf(t1Id, w1, true));
  row.appendChild(scoreEl);
  row.appendChild(teamHalf(t2Id, w2, false));
  return row;
}

// ---------------------------------------------------------------------------
// 10. renderBracket — vista completa del bracket eliminatorio FIFA 2026
// Lee partidos directamente de STATE.matches por phase + id pattern.
// r32: r32_L1..r32_L8 (izq), r32_R1..r32_R8 (der)
// r16: r16_L* (izq), r16_R* (der) | qf: qf_L* / qf_R* | sf: sf_L / sf_R
// ---------------------------------------------------------------------------

function renderBracket(container) {
  const header = document.createElement('div');
  header.innerHTML = `
    <h2 class="section-title">Bracket Eliminatorio</h2>
    <p class="section-subtitle">
      32 equipos · 5 rondas · Ronda de 32 → Octavos → Cuartos → Semis → Final
    </p>
  `;
  container.appendChild(header);

  const hint = document.createElement('div');
  hint.className = 'bracket-scroll-hint';
  hint.textContent = '← Desliza para ver el bracket completo →';
  container.appendChild(hint);

  // ── Datos por fase y lado (LÓGICA IDÉNTICA, sin tocar) ────────────────────
  const byPhaseId = (phase, side) =>
    STATE.matches
      .filter(m => m.phase === phase && m.id.includes(side))
      .sort((a, b) => a.id.localeCompare(b.id));

  const r32Left  = byPhaseId('r32', '_L');
  const r32Right = byPhaseId('r32', '_R');
  const r16Left  = byPhaseId('r16', '_L');
  const r16Right = byPhaseId('r16', '_R');
  const qfLeft   = byPhaseId('qf',  '_L');
  const qfRight  = byPhaseId('qf',  '_R');
  const sfLeft   = STATE.matches.find(m => m.id === 'sf_L') || null;
  const sfRight  = STATE.matches.find(m => m.id === 'sf_R') || null;
  const finalM   = STATE.matches.find(m => m.phase === 'final') || null;
  const thirdM   = STATE.matches.find(m => m.phase === 'third') || null;

  // ── Helper: columna de ronda con filas compactas ──────────────────────────
  function buildCol(label, matchObjs, roundKey) {
    const round = document.createElement('div');
    round.className = 'bracket-round';
    round.dataset.round = roundKey;
    round.dataset.label = label;

    const wrap = document.createElement('div');
    wrap.className = 'bracket-round__matches';
    (matchObjs.length ? matchObjs : [null]).forEach(m => {
      const slot = document.createElement('div');
      slot.className = 'bracket-slot';
      slot.appendChild(buildBracketMatchRow(m));
      wrap.appendChild(slot);
    });
    round.appendChild(wrap);
    return round;
  }

  // ── Contenedor principal ──────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'bracket-wrapper';

  const bracketContainer = document.createElement('div');
  bracketContainer.className = 'bracket-container';
  wrapper.appendChild(bracketContainer);
  container.appendChild(wrapper);

  // ── LADO IZQUIERDO ────────────────────────────────────────────────────────
  const leftSide = document.createElement('div');
  leftSide.className = 'bracket-side bracket-side--left';
  leftSide.appendChild(buildCol('RONDA DE 32', r32Left,  'r32-left'));
  leftSide.appendChild(buildCol('OCTAVOS',     r16Left,  'r16-left'));
  leftSide.appendChild(buildCol('CUARTOS',     qfLeft,   'qf-left'));
  leftSide.appendChild(buildCol('SEMIFINAL',   sfLeft ? [sfLeft] : [], 'sf-left'));
  bracketContainer.appendChild(leftSide);

  // ── CENTRO — Final ────────────────────────────────────────────────────────
  const center = document.createElement('div');
  center.className = 'bracket-center';

  const trophy = document.createElement('div');
  trophy.className = 'bracket-trophy';
  trophy.textContent = '🏆';
  trophy.setAttribute('aria-hidden', 'true');
  center.appendChild(trophy);

  const finalRound = document.createElement('div');
  finalRound.className = 'bracket-round';
  finalRound.dataset.round = 'final';
  finalRound.dataset.label = 'FINAL';
  const finalWrap = document.createElement('div');
  finalWrap.className = 'bracket-round__matches';
  const finalSlot = document.createElement('div');
  finalSlot.className = 'bracket-slot';
  const finalRow = buildBracketMatchRow(finalM);
  finalRow.classList.add('bk-row--final');
  finalSlot.appendChild(finalRow);
  finalWrap.appendChild(finalSlot);
  finalRound.appendChild(finalWrap);
  center.appendChild(finalRound);

  const champEl = document.createElement('div');
  champEl.className = 'bracket-champion';
  if (finalM?.played) {
    const winId = finalM.winner
      || (Number(finalM.score1) >= Number(finalM.score2) ? finalM.team1 : finalM.team2);
    const winTeam = winId ? getTeam(winId) : null;
    champEl.textContent = winTeam ? `${winTeam.flag} ${winTeam.name}` : 'CAMPEÓN';
  } else {
    champEl.textContent = 'CAMPEÓN';
    champEl.style.color = 'var(--text-muted)';
  }
  center.appendChild(champEl);

  // Tercer puesto (debajo del bloque central)
  const thirdBlock = document.createElement('div');
  thirdBlock.className = 'bracket-third-place';
  const thirdLabel = document.createElement('div');
  thirdLabel.className = 'bracket-third-place__label';
  thirdLabel.textContent = 'PARTIDO POR EL TERCER PUESTO';
  thirdBlock.appendChild(thirdLabel);
  thirdBlock.appendChild(buildBracketMatchRow(thirdM));
  center.appendChild(thirdBlock);

  bracketContainer.appendChild(center);

  // ── LADO DERECHO (columnas en orden inverso con flex-direction: row-reverse) ─
  const rightSide = document.createElement('div');
  rightSide.className = 'bracket-side bracket-side--right';
  rightSide.appendChild(buildCol('SEMIFINAL',   sfRight ? [sfRight] : [], 'sf-right'));
  rightSide.appendChild(buildCol('CUARTOS',     qfRight,  'qf-right'));
  rightSide.appendChild(buildCol('OCTAVOS',     r16Right, 'r16-right'));
  rightSide.appendChild(buildCol('RONDA DE 32', r32Right, 'r32-right'));
  bracketContainer.appendChild(rightSide);
}

// ---------------------------------------------------------------------------
// 11. renderParticipantes — leaderboard + participant cards
// ---------------------------------------------------------------------------

function renderParticipantes(container) {
  const participants = STATE.participants;

  if (participants.length === 0) {
    container.innerHTML = `
      <h2 class="section-title">Participantes</h2>
      <div class="empty-state" style="padding-top:2rem">
        <div class="empty-state__icon">👥</div>
        <p class="empty-state__text">
          Nadie se ha registrado aún.<br>
          <a href="registro.html" class="btn btn-primary btn-sm" style="margin-top:.75rem;display:inline-flex">
            ¡Regístrate ahora!
          </a>
        </p>
      </div>
    `;
    return;
  }

  const sorted = [...participants]
    .map(p => ({ ...p, _pts: calcParticipantPts(p) }))
    .sort((a, b) => b._pts - a._pts);

  const count = participants.length;
  const wrap  = document.createElement('section');
  wrap.innerHTML = `
    <h2 class="section-title">Participantes</h2>
    <p class="section-subtitle">${count} participante${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}</p>
  `;

  // ── Leaderboard table ─────────────────────────────────────────────────────
  const tableSection = document.createElement('div');
  tableSection.className = 'leaderboard';
  tableSection.innerHTML = '<h3 class="leaderboard__title">Tabla de Posiciones</h3>';

  const table = document.createElement('table');
  table.className = 'leaderboard-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:3.5rem">#</th>
        <th>Nombre</th>
        <th>Equipos</th>
        <th style="width:5.5rem;text-align:center">Puntos</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');

  sorted.forEach((p, idx) => {
    const medal     = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
    const rankClass = idx === 0 ? 'rank-gold' : idx === 1 ? 'rank-silver' : idx === 2 ? 'rank-bronze' : '';
    const teams     = getParticipantTeams(p);

    const teamsHtml = teams.map(tid => {
      const t = getTeam(tid);
      if (!t) return '';
      const st = getTeamStatus(tid);
      return `<span class="lb-team lb-team--${st}" title="${esc(t.name)}">${t.flag} ${esc(t.name)}</span>`;
    }).join('');

    const tr = document.createElement('tr');
    tr.className    = `lb-row ${rankClass}`;
    tr.style.cursor = 'pointer';
    tr.setAttribute('title', 'Click para ver desglose');
    tr.innerHTML = `
      <td class="lb-rank">${medal}</td>
      <td class="lb-name"><strong>${esc(getParticipantName(p))}</strong></td>
      <td class="lb-teams">${teamsHtml}</td>
      <td class="lb-pts" style="text-align:center">
        <span class="badge ${p._pts > 0 ? 'badge-gold' : 'badge-gray'}">${p._pts}</span>
      </td>
    `;

    // Expandable breakdown row
    const trBreak = document.createElement('tr');
    trBreak.className    = 'lb-breakdown-row';
    trBreak.style.display = 'none';

    const breakdownHtml = teams.map(tid => {
      const t = getTeam(tid);
      if (!t) return '';
      const st  = getTeamStatus(tid);
      const stLabel = st === 'champion' ? '🏆 Campeón' : st === 'eliminated' ? '❌ Eliminado' : '✅ Activo';
      const wins = STATE.matches.filter(m =>
        m.played && (m.team1 === tid || m.team2 === tid) &&
        ((m.team1 === tid && Number(m.score1) > Number(m.score2)) ||
         (m.team2 === tid && Number(m.score2) > Number(m.score1)))
      ).length;
      const tPts = calcTeamPts(tid);
      return `
        <div class="lb-breakdown-team">
          <span class="lb-breakdown-team__flag">${t.flag}</span>
          <span class="lb-breakdown-team__name">${esc(t.name)}</span>
          <span class="lb-breakdown-team__status">${stLabel}</span>
          <span class="lb-breakdown-team__detail">${wins} victorias &nbsp;·&nbsp; ${tPts} pts</span>
        </div>`;
    }).join('');

    trBreak.innerHTML = `<td colspan="4"><div class="lb-breakdown">${breakdownHtml}</div></td>`;

    tr.addEventListener('click', () => {
      const open = trBreak.style.display !== 'none';
      trBreak.style.display = open ? 'none' : 'table-row';
      tr.classList.toggle('lb-row--open', !open);
    });

    tbody.appendChild(tr);
    tbody.appendChild(trBreak);
  });

  table.appendChild(tbody);
  tableSection.appendChild(table);
  wrap.appendChild(tableSection);

  // ── Participant cards ──────────────────────────────────────────────────────
  const cardsSection = document.createElement('div');
  cardsSection.className = 'participants-cards-section';
  cardsSection.innerHTML = '<h3 class="leaderboard__title" style="margin-top:2.5rem">Fichas</h3>';

  const grid = document.createElement('div');
  grid.className = 'participants-grid stagger-children';

  sorted.forEach((p, idx) => {
    const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
    const teams     = getParticipantTeams(p);

    const teamsCardHtml = teams.map(tid => {
      const t = getTeam(tid);
      if (!t) return '';
      const st  = getTeamStatus(tid);
      const tPts = calcTeamPts(tid);
      return `
        <div class="team-mini team-mini--${st}">
          <span class="team-mini__flag">${t.flag}</span>
          <span class="team-mini__name">${esc(t.name)}</span>
          <span class="team-mini__pts">${tPts}&nbsp;pts</span>
        </div>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'participant-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.innerHTML = `
      <div class="participant-card__rank ${rankClass}">${idx + 1}</div>
      <div class="participant-card__name">${esc(getParticipantName(p))}</div>
      <div class="participant-card__teams">${teamsCardHtml}</div>
      <div class="participant-card__points">${p._pts} pts</div>
    `;
    grid.appendChild(card);
  });

  cardsSection.appendChild(grid);
  wrap.appendChild(cardsSection);

  // ── Floating register button (when slots remain) ───────────────────────────
  if (participants.length < 8) {
    const floatBtn = document.createElement('a');
    floatBtn.href      = 'registro.html';
    floatBtn.className = 'register-float-btn';
    floatBtn.textContent = '⚽ Unirse';
    wrap.appendChild(floatBtn);
  }

  container.appendChild(wrap);
}

// ---------------------------------------------------------------------------
// _rerenderCurrent — re-render ligero sin skeleton (usado por listeners Firebase)
// ---------------------------------------------------------------------------

function _rerenderCurrent() {
  const app = document.getElementById('app');
  if (!app) return;
  const hash = window.location.hash || '#grupos';
  const renderFn = ROUTES[hash];
  if (!renderFn) return;
  app.innerHTML = '';
  renderFn(app);
  void app.offsetWidth;
  app.classList.add('anim-enter');
}

// ---------------------------------------------------------------------------
// renderNotFound — ruta desconocida
// ---------------------------------------------------------------------------

function renderNotFound(container) {
  container.innerHTML = `
    <div class="empty-state" style="padding-top:4rem">
      <div class="empty-state__icon">🔍</div>
      <p class="empty-state__text">Ruta no encontrada.</p>
      <a href="#grupos" class="btn btn-outline mt-2">Volver a Grupos</a>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 12. Init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 App iniciando...');
  try {
    console.log('📡 Conectando a Firestore...');
    await fbInitMatches(MATCHES);
    console.log('✅ Matches inicializados en Firestore');
    await refreshFromFirestore();
    console.log('✅ Estado cargado desde Firestore');
  } catch (err) {
    console.error('❌ Error Firestore:', err);
  }

  fbOnMatchesChange(matches => {
    STATE.matches = matches;
    renderCurrentView();
  });

  fbOnParticipantsChange(participants => {
    STATE.participants = participants;
  });

  renderCurrentView();
});
