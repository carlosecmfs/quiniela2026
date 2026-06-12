(function() {
  const DATA_VERSION = "2026-oficial-v2";
  const stored = localStorage.getItem("qm2026_version");
  if (stored !== DATA_VERSION) {
    localStorage.removeItem("qm2026_matches");
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

function loadState() {
  STATE.matches      = loadMatches();      // data.js
  STATE.participants = loadParticipants(); // data.js
  STATE.adminLogged  = localStorage.getItem(LS_KEYS.ADMIN) === 'true';
}

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
  const koPhases = ['round32', 'round16', 'quarterfinals', 'semifinals', 'final'];
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
      if (isWin) pts++;
    });
  const inPhase = ph =>
    STATE.matches.some(m => m.phase === ph && (m.team1 === teamId || m.team2 === teamId));
  if (inPhase('round32'))       pts += 2;
  if (inPhase('round16'))       pts += 2;
  if (inPhase('quarterfinals')) pts += 2;
  if (inPhase('semifinals'))    pts += 5;
  if (inPhase('final'))         pts += 10;
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

function route() {
  const app = document.getElementById('app');
  if (!app) return;

  const hash = window.location.hash || '#grupos';

  // Re-read localStorage so new registrations from registro.html are visible immediately
  loadState();

  // Mark active nav tab
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
  updateParticipantBadge();

  // Show skeleton, then render after 300 ms (prevents blank-content flash)
  app.innerHTML = buildSkeleton();
  app.classList.remove('anim-enter');

  const renderFn = ROUTES[hash];
  setTimeout(() => {
    app.innerHTML = '';
    if (renderFn) renderFn(app); else renderNotFound(app);
    void app.offsetWidth; // reflow for animation restart
    app.classList.add('anim-enter');
  }, 300);
}

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

// =============================================================================
// BRACKET — Round of 32 crossing definitions
// Each entry: [team1Source, team2Source]  where source = { group, pos }
// pos is 0-indexed: 0 = 1st place, 1 = 2nd place, 2 = 3rd place (best 3rds)
// Left side  → groups A–F  →  R32 matches index 0–7  (R32-01…R32-08)
// Right side → groups G–L  →  R32 matches index 8–15 (R32-09…R32-16)
// =============================================================================

const R32_CROSSINGS = {
  left: [
    [{ group:'A', pos:0 }, { group:'B', pos:1 }],  // 1A vs 2B
    [{ group:'C', pos:0 }, { group:'A', pos:1 }],  // 1C vs 2A
    [{ group:'D', pos:0 }, { group:'E', pos:1 }],  // 1D vs 2E
    [{ group:'F', pos:0 }, { group:'D', pos:1 }],  // 1F vs 2D
    [{ group:'B', pos:0 }, { group:'C', pos:1 }],  // 1B vs 2C
    [{ group:'E', pos:0 }, { group:'F', pos:1 }],  // 1E vs 2F
    [{ group:'A', pos:2 }, { group:'B', pos:2 }],  // 3A vs 3B (best 3rds)
    [{ group:'C', pos:2 }, { group:'D', pos:2 }],  // 3C vs 3D (best 3rds)
  ],
  right: [
    [{ group:'G', pos:0 }, { group:'H', pos:1 }],  // 1G vs 2H
    [{ group:'I', pos:0 }, { group:'G', pos:1 }],  // 1I vs 2G
    [{ group:'J', pos:0 }, { group:'K', pos:1 }],  // 1J vs 2K
    [{ group:'L', pos:0 }, { group:'J', pos:1 }],  // 1L vs 2J
    [{ group:'H', pos:0 }, { group:'I', pos:1 }],  // 1H vs 2I
    [{ group:'K', pos:0 }, { group:'L', pos:1 }],  // 1K vs 2L
    [{ group:'E', pos:2 }, { group:'F', pos:2 }],  // 3E vs 3F (best 3rds)
    [{ group:'G', pos:2 }, { group:'H', pos:2 }],  // 3G vs 3H (best 3rds)
  ],
};

// ---------------------------------------------------------------------------
// getBracketTeam — resuelve el equipo de un slot de grupo (o devuelve null)
// ---------------------------------------------------------------------------

function getBracketTeam(slotDef) {
  if (!slotDef) return null;
  const status = getGroupStatus(slotDef.group);
  if (status === 'pending') return null;  // grupo sin partidos → TBD
  const st = calcGroupStandings(slotDef.group);
  return st[slotDef.pos]?.id || null;
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
// 10. renderBracket — vista completa del bracket eliminatorio
// ---------------------------------------------------------------------------

function renderBracket(container) {
  // Section header
  const header = document.createElement('div');
  header.innerHTML = `
    <h2 class="section-title">Bracket Eliminatorio</h2>
    <p class="section-subtitle">
      32 equipos · 5 rondas · Ronda de 32 → Octavos → Cuartos → Semis → Final
    </p>
  `;
  container.appendChild(header);

  // Info note while groups are pending
  const allGroupsDone = GROUP_IDS.every(g => getGroupStatus(g) === 'finished');
  if (!allGroupsDone) {
    const note = document.createElement('p');
    note.className = 'bracket-note';
    note.innerHTML = `
      <span>ℹ️</span>
      Los cruces se actualizarán automáticamente conforme se registren
      resultados de la fase de grupos.
    `;
    container.appendChild(note);
  }

  // Scroll hint (mobile)
  const hint = document.createElement('div');
  hint.className = 'bracket-scroll-hint';
  hint.textContent = '← Desliza para ver el bracket completo →';
  container.appendChild(hint);

  // ── Wrapper ────────────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'bracket-wrapper';

  const bracketContainer = document.createElement('div');
  bracketContainer.className = 'bracket-container';
  wrapper.appendChild(bracketContainer);
  container.appendChild(wrapper);

  // ── Phase data ─────────────────────────────────────────────────────────────
  const r32All  = getPhaseMatches('round32');        // 16 matches
  const r16All  = getPhaseMatches('round16');        // 8 matches
  const qfAll   = getPhaseMatches('quarterfinals');  // 4 matches
  const sfAll   = getPhaseMatches('semifinals');     // 2 matches
  const finalM  = getPhaseMatches('final')[0];       // 1 match

  // R32 left = indices 0-7, right = 8-15
  const r32Left  = r32All.slice(0, 8);
  const r32Right = r32All.slice(8, 16);

  // R16 left = 0-3, right = 4-7
  const r16Left  = r16All.slice(0, 4);
  const r16Right = r16All.slice(4, 8);

  // QF left = 0-1, right = 2-3
  const qfLeft  = qfAll.slice(0, 2);
  const qfRight = qfAll.slice(2, 4);

  // ── Left side ──────────────────────────────────────────────────────────────
  const leftSide = document.createElement('div');
  leftSide.className = 'bracket-side bracket-side--left';

  // R32 left (8 matches)
  const r32LeftBoxes = r32Left.map((m, i) => {
    const crossing = R32_CROSSINGS.left[i];
    const t1 = getBracketTeam(crossing[0]) || m.team1;
    const t2 = getBracketTeam(crossing[1]) || m.team2;
    return buildMatchBox(
      t1 === 'TBD' ? null : t1,
      t2 === 'TBD' ? null : t2,
      m, true
    );
  });
  leftSide.appendChild(buildBracketRound('Ronda de 32', r32LeftBoxes, 'r32-left'));

  // R16 left (4 matches)
  const r16LeftBoxes = r16Left.map(m =>
    buildMatchBox(
      m.team1 === 'TBD' ? null : m.team1,
      m.team2 === 'TBD' ? null : m.team2,
      m, true
    )
  );
  leftSide.appendChild(buildBracketRound('Octavos', r16LeftBoxes, 'r16-left'));

  // QF left (2 matches)
  const qfLeftBoxes = qfLeft.map(m =>
    buildMatchBox(
      m.team1 === 'TBD' ? null : m.team1,
      m.team2 === 'TBD' ? null : m.team2,
      m, true
    )
  );
  leftSide.appendChild(buildBracketRound('Cuartos', qfLeftBoxes, 'qf-left'));

  // SF left (1 match)
  const sfLeftM = sfAll[0];
  const sfLeftBox = buildMatchBox(
    sfLeftM?.team1 === 'TBD' ? null : sfLeftM?.team1,
    sfLeftM?.team2 === 'TBD' ? null : sfLeftM?.team2,
    sfLeftM, true
  );
  leftSide.appendChild(buildBracketRound('Semifinal', [sfLeftBox], 'sf-left'));

  bracketContainer.appendChild(leftSide);

  // ── CENTER — Final ──────────────────────────────────────────────────────────
  const finalCenter = document.createElement('div');
  finalCenter.className = 'bracket-final';

  const finalLabel = document.createElement('div');
  finalLabel.className = 'bracket-round__label';
  finalLabel.textContent = 'FINAL';
  finalCenter.appendChild(finalLabel);

  const finalBox = buildMatchBox(
    finalM?.team1 === 'TBD' ? null : finalM?.team1,
    finalM?.team2 === 'TBD' ? null : finalM?.team2,
    finalM, true
  );
  finalBox.classList.add('match-box--final');
  finalCenter.appendChild(finalBox);

  const trophy = document.createElement('div');
  trophy.className = 'trophy-display';
  trophy.textContent = '🏆';
  trophy.setAttribute('aria-hidden', 'true');
  finalCenter.appendChild(trophy);

  // Champion display — show winner name if Final is played
  const champEl = document.createElement('div');
  champEl.className = 'champion-display';
  if (finalM?.played) {
    const winId = Number(finalM.score1) >= Number(finalM.score2)
      ? finalM.team1
      : finalM.team2;
    const winTeam = getTeam(winId);
    champEl.textContent = winTeam
      ? `${winTeam.flag} ${winTeam.name}`
      : 'CAMPEÓN';
  } else {
    champEl.textContent = 'CAMPEÓN';
    champEl.style.color = 'var(--text-muted)';
  }
  finalCenter.appendChild(champEl);

  bracketContainer.appendChild(finalCenter);

  // ── Right side ─────────────────────────────────────────────────────────────
  const rightSide = document.createElement('div');
  rightSide.className = 'bracket-side bracket-side--right';

  // SF right (1 match) — leftmost column of right side (visually outermost)
  const sfRightM = sfAll[1];
  const sfRightBox = buildMatchBox(
    sfRightM?.team1 === 'TBD' ? null : sfRightM?.team1,
    sfRightM?.team2 === 'TBD' ? null : sfRightM?.team2,
    sfRightM, true
  );
  rightSide.appendChild(buildBracketRound('Semifinal', [sfRightBox], 'sf-right'));

  // QF right (2 matches)
  const qfRightBoxes = qfRight.map(m =>
    buildMatchBox(
      m.team1 === 'TBD' ? null : m.team1,
      m.team2 === 'TBD' ? null : m.team2,
      m, true
    )
  );
  rightSide.appendChild(buildBracketRound('Cuartos', qfRightBoxes, 'qf-right'));

  // R16 right (4 matches)
  const r16RightBoxes = r16Right.map(m =>
    buildMatchBox(
      m.team1 === 'TBD' ? null : m.team1,
      m.team2 === 'TBD' ? null : m.team2,
      m, true
    )
  );
  rightSide.appendChild(buildBracketRound('Octavos', r16RightBoxes, 'r16-right'));

  // R32 right (8 matches)
  const r32RightBoxes = r32Right.map((m, i) => {
    const crossing = R32_CROSSINGS.right[i];
    const t1 = getBracketTeam(crossing[0]) || m.team1;
    const t2 = getBracketTeam(crossing[1]) || m.team2;
    return buildMatchBox(
      t1 === 'TBD' ? null : t1,
      t2 === 'TBD' ? null : t2,
      m, true
    );
  });
  rightSide.appendChild(buildBracketRound('Ronda de 32', r32RightBoxes, 'r32-right'));

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

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  loadState();

  const app = document.getElementById('app');
  if (!app) return;

  if (!window.location.hash || window.location.hash === '#') {
    history.replaceState(null, '', '#grupos');
  }
  window.addEventListener('hashchange', route);
  route();
});
