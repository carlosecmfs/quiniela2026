// =============================================================================
// QUINIELA MUNDIAL 2026 — admin.js
// =============================================================================
// Depende de (cargados antes en el mismo scope global):
//   data.js  → TEAMS, GROUP_IDS, LS_KEYS, getTeam, loadMatches, saveMatches,
//               loadParticipants, saveParticipants
//   app.js   → STATE, saveState, calcGroupStandings, getGroupStatus,
//               esc, formatMatchDate, ROUTES
// =============================================================================

const ADMIN_PASSWORD = 'quiniela2026';

// Intentos de login — se resetean al recargar la página (intencional)
let _loginAttempts = 0;
let _lockoutEnd    = 0;

// Tab activo en el panel admin (persiste mientras la vista está montada)
let _activeAdminTab = 'grupos';

// =============================================================================
// 1. Auth helpers
// =============================================================================

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    _loginAttempts = 0;
    STATE.adminLogged = true;
    localStorage.setItem(LS_KEYS.ADMIN, 'true');
    return true;
  }
  _loginAttempts++;
  return false;
}

function adminLogout(container) {
  STATE.adminLogged = false;
  localStorage.removeItem(LS_KEYS.ADMIN);
  _activeAdminTab = 'grupos';
  renderAdminView(container);
}

// =============================================================================
// 2. renderAdminView — entrada desde app.js
// =============================================================================

function renderAdminView(container) {
  container.innerHTML = '';
  if (!STATE.adminLogged) {
    container.appendChild(buildLoginScreen(container));
  } else {
    container.appendChild(buildAdminPanel(container));
  }
}

// =============================================================================
// 3. Login screen
// =============================================================================

function buildLoginScreen(container) {
  const screen = document.createElement('div');
  screen.className = 'admin-login-screen';

  const isLocked  = Date.now() < _lockoutEnd;
  const remaining = Math.ceil((_lockoutEnd - Date.now()) / 1000);

  const form = document.createElement('form');
  form.className = 'login-form';
  form.noValidate = true;
  form.id = 'admin-login-form';

  form.innerHTML = `
    <h2>Panel Admin</h2>
    <p class="login-form__subtitle">Contraseña de administrador</p>

    <label for="admin-pwd">Contraseña</label>
    <div class="pwd-wrap">
      <input
        type="password"
        id="admin-pwd"
        autocomplete="current-password"
        placeholder="••••••••••••"
        ${isLocked ? 'disabled' : ''}
        required
      />
      <button type="button" class="pwd-toggle" id="pwd-toggle"
        aria-label="Mostrar u ocultar contraseña"
        tabindex="-1"
        ${isLocked ? 'disabled' : ''}>👁</button>
    </div>

    ${_loginAttempts > 0 && !isLocked
      ? `<p class="error-msg" role="alert">Contraseña incorrecta — intento ${_loginAttempts}/3.</p>`
      : ''}
    ${isLocked
      ? `<p class="error-msg" id="lockout-msg" role="alert">
           Demasiados intentos. Espera&nbsp;<strong id="lockout-count">${remaining}</strong>&nbsp;s.
         </p>`
      : ''}

    <button type="submit" class="btn btn-primary"
      id="login-submit" ${isLocked ? 'disabled' : ''}>
      Entrar
    </button>
  `;

  // Toggle visibilidad contraseña
  const pwdInput  = form.querySelector('#admin-pwd');
  const toggle    = form.querySelector('#pwd-toggle');
  toggle.addEventListener('click', () => {
    const show = pwdInput.type === 'password';
    pwdInput.type   = show ? 'text' : 'password';
    toggle.textContent = show ? '🙈' : '👁';
  });

  // Countdown si bloqueado
  if (isLocked) {
    const countEl = form.querySelector('#lockout-count');
    const tick = setInterval(() => {
      const left = Math.ceil((_lockoutEnd - Date.now()) / 1000);
      if (left <= 0) { clearInterval(tick); renderAdminView(container); return; }
      if (countEl) countEl.textContent = left;
    }, 1000);
  }

  // Submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (Date.now() < _lockoutEnd) return;

    if (adminLogin(pwdInput.value)) {
      renderAdminView(container);
    } else {
      if (_loginAttempts >= 3) _lockoutEnd = Date.now() + 30_000;
      renderAdminView(container);
    }
  });

  screen.appendChild(form);
  return screen;
}

// =============================================================================
// 4. Admin panel — estructura con 3 sub-tabs
// =============================================================================

function buildAdminPanel(container) {
  const panel = document.createElement('div');
  panel.className = 'admin-panel';

  // ── Encabezado ─────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.className = 'admin-toolbar';

  const titleGroup = document.createElement('div');
  titleGroup.style.cssText = 'display:flex;align-items:center;gap:.75rem;flex-wrap:wrap';
  titleGroup.innerHTML = `
    <h2 class="section-title" style="margin-bottom:0">Panel Admin</h2>
    <span class="badge badge-green">Sesión activa</span>
  `;
  toolbar.appendChild(titleGroup);

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-outline btn-sm';
  logoutBtn.textContent = 'Cerrar sesión';
  logoutBtn.addEventListener('click', () => adminLogout(container));
  toolbar.appendChild(logoutBtn);
  panel.appendChild(toolbar);

  // ── Sub-tabs ────────────────────────────────────────────────────────────────
  const tabsNav = document.createElement('div');
  tabsNav.className = 'admin-tabs';
  tabsNav.setAttribute('role', 'tablist');

  const TABS = [
    { id: 'grupos',        label: 'Fase de Grupos' },
    { id: 'eliminatorias', label: 'Eliminatorias'  },
    { id: 'participantes', label: 'Participantes'  },
  ];

  const contentEl = document.createElement('div');
  contentEl.className = 'admin-tab-content';

  TABS.forEach(t => {
    const btn = document.createElement('button');
    btn.className   = 'tab-btn' + (t.id === _activeAdminTab ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(t.id === _activeAdminTab));
    btn.dataset.tab = t.id;
    btn.textContent = t.label;
    btn.addEventListener('click', () => {
      _activeAdminTab = t.id;
      tabsNav.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === t.id);
        b.setAttribute('aria-selected', String(b.dataset.tab === t.id));
      });
      renderAdminTabContent(contentEl, t.id);
    });
    tabsNav.appendChild(btn);
  });
  panel.appendChild(tabsNav);

  renderAdminTabContent(contentEl, _activeAdminTab);
  panel.appendChild(contentEl);

  // ── Reset button ────────────────────────────────────────────────────────────
  const resetSection = document.createElement('div');
  resetSection.className = 'admin-reset-section';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-danger';
  resetBtn.innerHTML = '⚠️&nbsp; Resetear todos los resultados';
  resetBtn.addEventListener('click', () => handleReset(container, contentEl));
  resetSection.appendChild(resetBtn);
  panel.appendChild(resetSection);

  return panel;
}

// =============================================================================
// 5. renderAdminTabContent — delega al constructor de cada tab
// =============================================================================

function renderAdminTabContent(el, tabId) {
  el.innerHTML = '';
  el.style.animation = 'fadeInUp 0.22s ease both';
  if      (tabId === 'grupos')        el.appendChild(buildGruposTab());
  else if (tabId === 'eliminatorias') el.appendChild(buildEliminatoriasTab());
  else if (tabId === 'participantes') el.appendChild(buildParticipantesTab());
}

// =============================================================================
// 6. Tab: Fase de Grupos — acordeón A–L
// =============================================================================

function buildGruposTab() {
  const wrap = document.createElement('div');
  wrap.insertAdjacentHTML('beforeend',
    `<p class="section-subtitle">Ingresa resultados de los 72 partidos de la fase de grupos.</p>`
  );

  const accordion = document.createElement('div');
  accordion.className = 'admin-accordion';

  GROUP_IDS.forEach(gid => accordion.appendChild(buildGroupAccordionItem(gid)));
  wrap.appendChild(accordion);
  return wrap;
}

// ---------------------------------------------------------------------------
// 6a. Accordion item por grupo
// ---------------------------------------------------------------------------

function buildGroupAccordionItem(groupId) {
  const matches     = STATE.matches.filter(m => m.phase === 'groups' && m.group === groupId);
  const playedCount = matches.filter(m => m.played).length;

  const item = document.createElement('div');
  item.className = 'accordion-item';
  item.dataset.group = groupId;

  // Header button
  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'accordion-header';
  header.setAttribute('aria-expanded', 'false');

  const badgeClass = playedCount === 6 ? 'badge-green' : playedCount > 0 ? 'badge-gold' : 'badge-gray';
  header.innerHTML = `
    <span class="accordion-title">Grupo ${groupId}</span>
    <span class="badge ${badgeClass} accordion-badge">${playedCount}/6 jugados</span>
  `;

  // "Marcar completo" — en el header pero detiene la propagación
  const markBtn = document.createElement('button');
  markBtn.type = 'button';
  markBtn.className = 'btn btn-sm btn-outline accordion-action';
  markBtn.textContent = 'Marcar completo';
  markBtn.addEventListener('click', ev => {
    ev.stopPropagation();
    matches.forEach(m => {
      m.score1 = m.score1 ?? 0;
      m.score2 = m.score2 ?? 0;
      m.played = true;
      m.live   = false;
    });
    saveState();
    // Reconstruir este acordeón
    const wasOpen = !body.hidden;
    const newItem = buildGroupAccordionItem(groupId);
    item.replaceWith(newItem);
    if (wasOpen) newItem.querySelector('.accordion-header').click();
  });
  header.appendChild(markBtn);

  const arrow = document.createElement('span');
  arrow.className = 'accordion-arrow';
  arrow.textContent = '▼';
  arrow.setAttribute('aria-hidden', 'true');
  header.appendChild(arrow);

  // Body
  const body = document.createElement('div');
  body.className = 'accordion-body';
  body.hidden = true;
  body.appendChild(buildMatchesTable(matches, false));

  // Toggle
  header.addEventListener('click', () => {
    const open = !body.hidden;
    body.hidden = open;
    header.setAttribute('aria-expanded', String(!open));
    arrow.textContent = open ? '▼' : '▲';
  });

  item.appendChild(header);
  item.appendChild(body);
  return item;
}

// =============================================================================
// 7. Tab: Eliminatorias — acordeón por fase
// =============================================================================

function buildEliminatoriasTab() {
  const wrap = document.createElement('div');
  wrap.insertAdjacentHTML('beforeend',
    `<p class="section-subtitle">Completa los cruces y resultados de las fases KO. Los inputs se habilitan cuando los equipos estén definidos.</p>`
  );

  const PHASES = [
    { phase: 'round32',        label: 'Ronda de 32',     total: 16 },
    { phase: 'round16',        label: 'Octavos de Final', total: 8  },
    { phase: 'quarterfinals',  label: 'Cuartos de Final', total: 4  },
    { phase: 'semifinals',     label: 'Semifinales',      total: 2  },
    { phase: 'final',          label: 'Final',            total: 1  },
  ];

  const accordion = document.createElement('div');
  accordion.className = 'admin-accordion';

  PHASES.forEach(({ phase, label, total }) => {
    const matches     = STATE.matches.filter(m => m.phase === phase);
    const playedCount = matches.filter(m => m.played).length;

    const item   = document.createElement('div');
    item.className = 'accordion-item';

    const header = document.createElement('button');
    header.type  = 'button';
    header.className = 'accordion-header';
    header.setAttribute('aria-expanded', 'false');

    const badgeClass = playedCount === total ? 'badge-green' : playedCount > 0 ? 'badge-gold' : 'badge-gray';
    header.innerHTML = `
      <span class="accordion-title">${label}</span>
      <span class="badge ${badgeClass}">${playedCount}/${total} jugados</span>
      <span class="accordion-arrow" aria-hidden="true">▼</span>
    `;

    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.hidden = true;
    body.appendChild(buildMatchesTable(matches, true));

    header.addEventListener('click', () => {
      const open = !body.hidden;
      body.hidden = open;
      header.setAttribute('aria-expanded', String(!open));
      header.querySelector('.accordion-arrow').textContent = open ? '▼' : '▲';
    });

    item.appendChild(header);
    item.appendChild(body);
    accordion.appendChild(item);
  });

  wrap.appendChild(accordion);
  return wrap;
}

// =============================================================================
// 8. buildMatchesTable(matches, isKnockout) — tabla editable compartida
// =============================================================================

function buildMatchesTable(matches, isKnockout) {
  const wrap = document.createElement('div');
  wrap.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.className = 'admin-matches-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Equipo 1</th>
        <th style="text-align:center">Marcador</th>
        <th>Equipo 2</th>
        <th>Estado</th>
        <th></th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  matches.forEach(m => tbody.appendChild(buildMatchRow(m, isKnockout)));
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

// =============================================================================
// 9. buildMatchRow — fila editable de un partido
// =============================================================================

function buildMatchRow(match, isKnockout) {
  const t1 = match.team1 && match.team1 !== 'TBD' ? getTeam(match.team1) : null;
  const t2 = match.team2 && match.team2 !== 'TBD' ? getTeam(match.team2) : null;
  const tbdDisabled = isKnockout && (!t1 || !t2);

  const tr = document.createElement('tr');
  tr.className = [
    match.played ? 'row-played' : '',
    match.live   ? 'row-live'   : '',
  ].filter(Boolean).join(' ');
  tr.dataset.matchId = match.id;

  const teamHtml = t =>
    t ? `<span class="match-team-cell">${t.flag} ${esc(t.name)}</span>`
      : `<span class="tbd-cell">Por definir</span>`;

  const disAttr = tbdDisabled ? 'disabled title="Espera a que se definan los equipos"' : '';
  const disChk  = tbdDisabled ? 'disabled' : '';

  // KO draw: winner selector (hidden until scores are tied and match is played)
  const isDraw = match.played
    && match.score1 != null && match.score2 != null
    && Number(match.score1) === Number(match.score2);
  const koWinnerHtml = (isKnockout && t1 && t2) ? `
    <div class="ko-winner-wrap" id="winner-wrap-${match.id}"${!isDraw ? ' hidden' : ''}>
      <span class="ko-winner-label">Avanza:</span>
      <select class="ko-winner-select" id="winner-${match.id}">
        <option value="">—</option>
        <option value="${t1.id}"${match.winner === t1.id ? ' selected' : ''}>${t1.flag} ${esc(t1.name)}</option>
        <option value="${t2.id}"${match.winner === t2.id ? ' selected' : ''}>${t2.flag} ${esc(t2.name)}</option>
      </select>
    </div>` : '';

  tr.innerHTML = `
    <td class="match-date-cell">${formatMatchDate(match.date)}</td>
    <td>${teamHtml(t1)}</td>
    <td style="text-align:center;white-space:nowrap">
      <input type="number" class="score-input" id="s1-${match.id}"
        value="${match.score1 ?? ''}" min="0" max="20" ${disAttr} />
      <span class="score-separator">–</span>
      <input type="number" class="score-input" id="s2-${match.id}"
        value="${match.score2 ?? ''}" min="0" max="20" ${disAttr} />
    </td>
    <td>${teamHtml(t2)}</td>
    <td>
      <label class="admin-check-label">
        <input type="checkbox" class="chk-played" ${match.played ? 'checked' : ''} ${disChk} />
        <span>Jugado</span>
      </label>
      <label class="admin-check-label">
        <input type="checkbox" class="chk-live" ${match.live ? 'checked' : ''} ${disChk} />
        <span>En curso</span>
      </label>
      ${koWinnerHtml}
    </td>
    <td style="white-space:nowrap">
      <button class="btn btn-gold btn-sm btn-save" ${tbdDisabled ? 'disabled' : ''}>💾</button>
      <span class="save-feedback" hidden></span>
    </td>
  `;

  // "En curso" → solo uno a la vez
  const liveChk = tr.querySelector('.chk-live');
  liveChk.addEventListener('change', () => {
    if (liveChk.checked) {
      STATE.matches.forEach(m => { if (m.id !== match.id) m.live = false; });
      document.querySelectorAll('.chk-live').forEach(c => {
        if (c !== liveChk) c.checked = false;
      });
      // Si está en curso, desmarca "Jugado"
      tr.querySelector('.chk-played').checked = false;
    }
  });

  // Guardar
  const feedbackEl = tr.querySelector('.save-feedback');
  tr.querySelector('.btn-save').addEventListener('click', () =>
    saveMatchRow(tr, match.id, feedbackEl)
  );

  return tr;
}

// =============================================================================
// 10. saveMatchRow — persiste una fila y actualiza feedback
// =============================================================================

function saveMatchRow(tr, matchId, feedbackEl) {
  const m = STATE.matches.find(x => x.id === matchId);
  if (!m) return;

  const s1Raw = tr.querySelector(`#s1-${matchId}`).value;
  const s2Raw = tr.querySelector(`#s2-${matchId}`).value;

  m.score1 = s1Raw !== '' ? Number(s1Raw) : null;
  m.score2 = s2Raw !== '' ? Number(s2Raw) : null;
  m.played = tr.querySelector('.chk-played').checked;
  m.live   = tr.querySelector('.chk-live').checked;
  if (m.live) m.played = false;

  // KO draw: capture winner and toggle selector visibility
  const isKO     = m.phase !== 'groups';
  const isDraw   = m.played && m.score1 !== null && m.score2 !== null && m.score1 === m.score2;
  const winWrap  = tr.querySelector(`#winner-wrap-${matchId}`);
  const winSel   = tr.querySelector(`#winner-${matchId}`);
  if (isKO) {
    m.winner = (isDraw && winSel) ? (winSel.value || null) : null;
    if (winWrap) winWrap.hidden = !isDraw;
  }

  saveState();

  tr.className = [m.played ? 'row-played' : '', m.live ? 'row-live' : ''].filter(Boolean).join(' ');

  // Toast feedback (showToast defined in app.js; fallback for standalone use)
  if (typeof showToast === 'function') {
    showToast('✓ Guardado', 'success');
  } else {
    feedbackEl.textContent = '✓';
    feedbackEl.hidden = false;
    setTimeout(() => { feedbackEl.hidden = true; }, 2000);
  }

  // Update accordion badge if group phase
  if (m.phase === 'groups' && m.group) {
    const accItem = tr.closest('.accordion-item[data-group]');
    const badge   = accItem?.querySelector('.accordion-badge');
    if (badge) {
      const groupMatches = STATE.matches.filter(x => x.phase === 'groups' && x.group === m.group);
      const played       = groupMatches.filter(x => x.played).length;
      badge.textContent  = `${played}/6 jugados`;
      badge.className    = `badge ${played === 6 ? 'badge-green' : played > 0 ? 'badge-gold' : 'badge-gray'} accordion-badge`;
    }
  }
}

// =============================================================================
// 11. calcParticipantPoints — sistema de puntuación
// =============================================================================

function calcParticipantPoints(participant) {
  // Support both old { equipo } and new { teams: [] } schemas
  const _teams = (typeof getParticipantTeams === 'function')
    ? getParticipantTeams(participant)
    : (Array.isArray(participant.teams) && participant.teams.length
        ? participant.teams
        : participant.equipo ? [participant.equipo] : []);

  return _teams.reduce((total, teamId) => {
    if (!teamId) return total;
    let pts = 0;

    STATE.matches
      .filter(m => m.played && (m.team1 === teamId || m.team2 === teamId))
      .forEach(m => {
        const s1 = Number(m.score1), s2 = Number(m.score2);
        const isWin = m.winner
          ? m.winner === teamId
          : ((m.team1 === teamId && s1 > s2) || (m.team2 === teamId && s2 > s1));
        if (isWin) pts += 1;
      });

    const inPhase = phase =>
      STATE.matches.some(m => m.phase === phase && (m.team1 === teamId || m.team2 === teamId));
    if (inPhase('round32'))       pts += 2;
    if (inPhase('round16'))       pts += 2;
    if (inPhase('quarterfinals')) pts += 2;
    if (inPhase('semifinals'))    pts += 5;
    if (inPhase('final'))         pts += 10;

    const finalM = STATE.matches.find(m => m.phase === 'final');
    if (finalM?.played) {
      const champ = finalM.winner
        || (Number(finalM.score1) > Number(finalM.score2) ? finalM.team1 : finalM.team2);
      if (champ === teamId) pts += 20;
    }

    return total + pts;
  }, 0);
}

// =============================================================================
// 12. Tab: Participantes (admin)
// =============================================================================

function buildParticipantesTab() {
  const wrap = document.createElement('div');

  // Cabecera con contador y botón añadir
  const hdr = document.createElement('div');
  hdr.className = 'participants-admin-header';
  const countP = document.createElement('p');
  countP.className = 'section-subtitle';
  countP.id = 'participants-count';
  countP.style.margin = '0';
  countP.textContent = `${STATE.participants.length} participante${STATE.participants.length !== 1 ? 's' : ''} registrado${STATE.participants.length !== 1 ? 's' : ''}`;
  hdr.appendChild(countP);

  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary btn-sm';
  addBtn.textContent = '+ Agregar participante';
  addBtn.addEventListener('click', () => toggleAddModal(wrap));
  hdr.appendChild(addBtn);
  wrap.appendChild(hdr);

  // Slot para el modal inline
  const modalSlot = document.createElement('div');
  modalSlot.id = 'add-modal-slot';
  wrap.appendChild(modalSlot);

  if (STATE.participants.length === 0) {
    wrap.insertAdjacentHTML('beforeend', `
      <div class="empty-state" style="padding:2.5rem 0">
        <div class="empty-state__icon">👥</div>
        <p class="empty-state__text">Ningún participante registrado.</p>
      </div>
    `);
    return wrap;
  }

  const tableWrap = document.createElement('div');
  tableWrap.style.overflowX = 'auto';
  tableWrap.id = 'participants-table-wrap';

  tableWrap.appendChild(buildParticipantsTable(wrap));
  wrap.appendChild(tableWrap);
  return wrap;
}

function buildParticipantsTable(tabWrap) {
  const table = document.createElement('table');
  table.className = 'admin-matches-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Equipo</th>
        <th style="text-align:center">Puntos</th>
        <th>Registrado</th>
        <th></th>
      </tr>
    </thead>
  `;

  // Ordena por puntos descendente
  const sorted = [...STATE.participants]
    .map(p => ({ ...p, _pts: calcParticipantPoints(p) }))
    .sort((a, b) => b._pts - a._pts);

  const tbody = document.createElement('tbody');

  sorted.forEach((p, idx) => {
    const pName  = p.name || p.nombre || '?';
    const pTeams = (typeof getParticipantTeams === 'function')
      ? getParticipantTeams(p)
      : (Array.isArray(p.teams) ? p.teams : p.equipo ? [p.equipo] : []);
    const teamsStr = pTeams.map(tid => {
      const t = getTeam(tid); return t ? `${t.flag} ${esc(t.name)}` : '';
    }).filter(Boolean).join(' · ') || '<span class="tbd-cell">—</span>';
    const regDate = (p.fechaRegistro || p.registeredAt)
      ? new Date(p.fechaRegistro || p.registeredAt).toLocaleDateString('es-MX',
          { month: 'short', day: 'numeric', year: 'numeric' })
      : '—';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="pos">${idx + 1}</td>
      <td><strong>${esc(pName)}</strong></td>
      <td style="font-size:.8rem">${teamsStr}</td>
      <td style="text-align:center">
        <span class="badge ${p._pts > 0 ? 'badge-gold' : 'badge-gray'}">${p._pts}</span>
      </td>
      <td style="color:var(--text-muted);font-size:0.78rem">${regDate}</td>
      <td>
        <button class="btn btn-danger btn-sm" data-pid="${p.id}">🗑️</button>
      </td>
    `;

    tr.querySelector('button[data-pid]').addEventListener('click', () => {
      if (!confirm(`¿Eliminar a "${pName}"?`)) return;
      STATE.participants = STATE.participants.filter(x => x.id !== p.id);
      saveParticipants(STATE.participants);
      // Rebuild table section
      const tw = tabWrap.querySelector('#participants-table-wrap');
      tw.innerHTML = '';
      tw.appendChild(buildParticipantsTable(tabWrap));
      const cp = tabWrap.querySelector('#participants-count');
      if (cp) cp.textContent = `${STATE.participants.length} participante${STATE.participants.length !== 1 ? 's' : ''} registrado${STATE.participants.length !== 1 ? 's' : ''}`;
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

// =============================================================================
// 13. Modal inline "Agregar participante"
// =============================================================================

function toggleAddModal(tabWrap) {
  const slot = tabWrap.querySelector('#add-modal-slot');
  if (!slot) return;
  if (slot.children.length > 0) { slot.innerHTML = ''; return; }

  const modal = document.createElement('div');
  modal.className = 'inline-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Agregar participante');

  modal.innerHTML = `
    <h3 class="inline-modal__title">Agregar participante</h3>
    <div class="form-group">
      <label for="mod-nombre">Nombre o apodo</label>
      <input type="text" id="mod-nombre" maxlength="50" placeholder="Nombre" autocomplete="off" />
      <span class="field-error" id="mod-err-nombre"></span>
    </div>
    <div class="form-group" style="margin-top:.75rem">
      <label for="mod-equipo">Equipo</label>
      <select id="mod-equipo">
        <option value="">— Selecciona un equipo —</option>
        ${[...TEAMS].sort((a,b) => a.name.localeCompare(b.name,'es'))
          .map(t => `<option value="${t.id}">${t.flag} ${esc(t.name)} (Gr.${t.group})</option>`)
          .join('')}
      </select>
      <span class="field-error" id="mod-err-equipo"></span>
    </div>
    <div class="inline-modal__actions">
      <button class="btn btn-primary btn-sm" id="mod-save">Agregar</button>
      <button class="btn btn-outline btn-sm"  id="mod-cancel">Cancelar</button>
    </div>
  `;

  modal.querySelector('#mod-cancel').addEventListener('click', () => { slot.innerHTML = ''; });

  modal.querySelector('#mod-save').addEventListener('click', () => {
    const nombre  = modal.querySelector('#mod-nombre').value.trim();
    const equipo  = modal.querySelector('#mod-equipo').value;
    const errN    = modal.querySelector('#mod-err-nombre');
    const errE    = modal.querySelector('#mod-err-equipo');
    errN.textContent = ''; errE.textContent = '';

    let ok = true;
    if (nombre.length < 2) { errN.textContent = 'Mínimo 2 caracteres.'; ok = false; }
    if (!equipo)            { errE.textContent = 'Selecciona un equipo.'; ok = false; }
    if (ok && STATE.participants.some(p => (p.name || p.nombre || '').toLowerCase() === nombre.toLowerCase())) {
      errN.textContent = 'Ya existe un participante con ese nombre.'; ok = false;
    }
    if (!ok) return;

    STATE.participants.push({
      id: Date.now(), name: nombre, nombre, equipo,
      teams: equipo ? [equipo] : [],
      registeredAt: new Date().toISOString(), fechaRegistro: new Date().toISOString(),
    });
    saveParticipants(STATE.participants);
    slot.innerHTML = '';

    const tw = tabWrap.querySelector('#participants-table-wrap');
    if (tw) { tw.innerHTML = ''; tw.appendChild(buildParticipantsTable(tabWrap)); }
    const cp = tabWrap.querySelector('#participants-count');
    if (cp) cp.textContent = `${STATE.participants.length} participante${STATE.participants.length !== 1 ? 's' : ''} registrado${STATE.participants.length !== 1 ? 's' : ''}`;
  });

  slot.appendChild(modal);
  modal.querySelector('#mod-nombre').focus();
}

// =============================================================================
// 14. handleReset — doble confirmación, resetea resultados
// =============================================================================

function handleReset(container, contentEl) {
  if (!confirm('⚠️ ¿Resetear TODOS los resultados del torneo?\n\nEsta acción no puede deshacerse. Los participantes NO se borrarán.')) return;

  const word = prompt('Para confirmar, escribe exactamente:\n\nRESETEAR');
  if (word !== 'RESETEAR') {
    if (typeof showToast === 'function') showToast('Cancelado — datos sin cambios', 'info');
    return;
  }

  STATE.matches.forEach(m => {
    m.score1 = null;
    m.score2 = null;
    m.played = false;
    m.live   = false;
  });
  saveState();

  // Actualiza el tab activo
  renderAdminTabContent(contentEl, _activeAdminTab);

  if (typeof showToast === 'function') {
    showToast('✓ Torneo reseteado — todos los resultados han sido borrados', 'success');
  }
}

// =============================================================================
// 15. Registro de ruta — añade #admin al router de app.js
// =============================================================================

if (typeof ROUTES !== 'undefined') {
  ROUTES['#admin'] = function(container) {
    renderAdminView(container);
  };
}
