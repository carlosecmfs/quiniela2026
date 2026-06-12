// =============================================================================
// QUINIELA MUNDIAL 2026 — registro.js
// Página independiente: registro.html
// Depende únicamente de data.js (TEAMS, GROUP_IDS, getTeam, loadParticipants,
//                                  saveParticipants, LS_KEYS)
// =============================================================================

const ACCESS_CODE = 'mundial2026';

// Estado local de esta página
let regParticipants = loadParticipants();  // from data.js
let selectedTeams   = [];                  // max 3 team IDs

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function regEsc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Returns the participant object that "owns" a team (or undefined)
function teamOwner(teamId) {
  return regParticipants.find(p => {
    const teams = Array.isArray(p.teams) ? p.teams
                : p.equipo ? [p.equipo] : [];
    return teams.includes(teamId);
  });
}

// ---------------------------------------------------------------------------
// Render team picker grid (grouped by A–L)
// ---------------------------------------------------------------------------

function renderTeamPicker() {
  const container = document.getElementById('team-picker');
  if (!container) return;
  container.innerHTML = '';

  GROUP_IDS.forEach(gid => {
    const groupTeams = TEAMS.filter(t => t.group === gid);

    const section = document.createElement('div');
    section.className = 'team-picker__group';

    const title = document.createElement('div');
    title.className = 'team-picker__group-title';
    title.textContent = `GRUPO ${gid}`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'team-picker__grid';

    groupTeams.forEach(team => {
      const owner = teamOwner(team.id);
      const card  = document.createElement('div');
      card.className = 'tpc';
      card.dataset.teamId = team.id;

      if (owner) {
        const ownerName = owner.name || owner.nombre || '?';
        card.classList.add('tpc--taken');
        card.setAttribute('title', `Ya asignado a ${ownerName}`);
        card.setAttribute('aria-disabled', 'true');
      }

      card.innerHTML = `
        <span class="tpc__flag" aria-hidden="true">${team.flag}</span>
        <span class="tpc__name">${regEsc(team.name)}</span>
        <span class="tpc__check" aria-hidden="true">✓</span>
      `;

      if (!owner) {
        card.addEventListener('click', () => handleTeamClick(team.id, card));
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ---------------------------------------------------------------------------
// Handle team card click
// ---------------------------------------------------------------------------

function handleTeamClick(teamId, cardEl) {
  const alreadySelected = selectedTeams.includes(teamId);

  if (alreadySelected) {
    // Deselect
    selectedTeams = selectedTeams.filter(id => id !== teamId);
    cardEl.classList.remove('tpc--selected');
    cardEl.setAttribute('aria-pressed', 'false');
  } else if (selectedTeams.length >= 3) {
    // Max reached — shake and show message
    cardEl.classList.remove('tpc--shake');
    void cardEl.offsetWidth; // reflow to restart animation
    cardEl.classList.add('tpc--shake');
    showFieldError('err-equipos', 'Solo puedes elegir 3 equipos.');
    setTimeout(() => cardEl.classList.remove('tpc--shake'), 500);
  } else {
    // Select
    selectedTeams.push(teamId);
    cardEl.classList.add('tpc--selected');
    cardEl.setAttribute('aria-pressed', 'true');
    if (selectedTeams.length === 3) {
      document.getElementById('err-equipos').textContent = '';
    }
  }

  updateCounter();
  updateSubmitBtn();
}

function updateCounter() {
  const el = document.getElementById('team-counter');
  if (!el) return;
  el.textContent = `${selectedTeams.length} / 3 equipos`;
  el.classList.toggle('team-counter--complete', selectedTeams.length === 3);
}

// ---------------------------------------------------------------------------
// Form validation helpers
// ---------------------------------------------------------------------------

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ['err-nombre', 'err-equipos', 'err-codigo'].forEach(id => showFieldError(id, ''));
}

function canSubmit() {
  const nombre = (document.getElementById('reg-nombre')?.value ?? '').trim();
  const codigo = (document.getElementById('reg-codigo')?.value ?? '').trim();
  const codeOk = !codigo || codigo === ACCESS_CODE;
  return nombre.length >= 2 && selectedTeams.length === 3 && codeOk;
}

function updateSubmitBtn() {
  const btn = document.getElementById('reg-submit');
  if (btn) btn.disabled = !canSubmit();
}

// ---------------------------------------------------------------------------
// Form submit
// ---------------------------------------------------------------------------

async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const nombreEl = document.getElementById('reg-nombre');
  const codigoEl = document.getElementById('reg-codigo');
  const nombre   = nombreEl.value.trim();
  const codigo   = codigoEl.value.trim();
  let valid = true;

  if (nombre.length < 2) {
    showFieldError('err-nombre', nombre ? 'Mínimo 2 caracteres.' : 'Ingresa tu nombre o apodo.');
    valid = false;
  }

  // Nombre duplicado
  if (valid && regParticipants.some(
    p => (p.name || p.nombre || '').toLowerCase() === nombre.toLowerCase()
  )) {
    showFieldError('err-nombre', 'Este nombre ya está registrado.');
    valid = false;
  }

  if (selectedTeams.length !== 3) {
    showFieldError('err-equipos', 'Debes elegir exactamente 3 equipos.');
    valid = false;
  }

  if (codigo && codigo !== ACCESS_CODE) {
    showFieldError('err-codigo', 'Código incorrecto.');
    valid = false;
  }

  if (!valid) return;

  // Build participant object (dual-schema for backward compat with admin.js)
  const participant = {
    id:            Date.now(),
    name:          nombre,
    nombre:        nombre,
    teams:         [...selectedTeams],
    equipo:        selectedTeams[0],
    registeredAt:  new Date().toISOString(),
    fechaRegistro: new Date().toISOString(),
  };

  regParticipants.push(participant);
  saveParticipants(regParticipants);

  if (typeof fbSaveParticipant === 'function') {
    try {
      await fbSaveParticipant(participant);
    } catch (e) {
      console.error('fbSaveParticipant error:', e);
    }
  }

  showSuccess(participant);
}

// ---------------------------------------------------------------------------
// Success state — confetti + message
// ---------------------------------------------------------------------------

function showSuccess(participant) {
  const form     = document.getElementById('registro-form');
  const feedback = document.getElementById('reg-feedback');

  // Build teams string
  const teamsStr = participant.teams
    .map(id => { const t = getTeam(id); return t ? `${t.flag} ${t.name}` : id; })
    .join(' · ');

  feedback.innerHTML = `
    <strong>¡${regEsc(participant.name)} ya está en la quiniela! 🎉</strong><br>
    <span style="font-size:.85rem">Tus equipos: ${regEsc(teamsStr)}</span><br>
    <a href="index.html#participantes" class="btn btn-gold btn-sm" style="margin-top:.75rem;display:inline-flex">
      Ver la quiniela →
    </a>
  `;
  feedback.className = 'registro-feedback success';
  feedback.hidden = false;

  // Disable form
  form.querySelectorAll('input, button, .tpc').forEach(el => {
    el.disabled = true;
    if (el.classList.contains('tpc')) el.style.pointerEvents = 'none';
  });

  // Refresh participants list
  renderParticipantsList();

  // Confetti 🎊
  if (typeof confetti === 'function') {
    const duration = 2800;
    const end = Date.now() + duration;
    const colors = ['#00A550', '#FFD700', '#ffffff'];

    (function frame() {
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

// ---------------------------------------------------------------------------
// Participants preview list
// ---------------------------------------------------------------------------

function renderParticipantsList() {
  const listEl = document.getElementById('reg-participants-list');
  if (!listEl) return;
  regParticipants = loadParticipants(); // re-read in case updated
  listEl.innerHTML = '';

  if (regParticipants.length === 0) {
    listEl.innerHTML = '<li class="text-muted" style="padding:.5rem 0;font-size:.85rem">Ningún participante aún.</li>';
    return;
  }

  regParticipants.forEach((p, idx) => {
    const teams = Array.isArray(p.teams) ? p.teams : (p.equipo ? [p.equipo] : []);
    const teamsHtml = teams
      .map(id => { const t = getTeam(id); return t ? `${t.flag} <span>${regEsc(t.name)}</span>` : ''; })
      .join(' · ');

    const li = document.createElement('li');
    li.className = 'participant-item';
    li.innerHTML = `
      <span class="participant-item__num">${idx + 1}</span>
      <span class="participant-item__name">${regEsc(p.name || p.nombre || '?')}</span>
      <span class="participant-item__team" style="font-size:.72rem">${teamsHtml}</span>
    `;
    listEl.appendChild(li);
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Cargar participantes desde Firebase (con fallback a localStorage)
  if (typeof fbGetParticipants === 'function') {
    try {
      const fbParticipants = await fbGetParticipants();
      regParticipants = fbParticipants;
      saveParticipants(regParticipants);
    } catch (e) {
      console.error('Firebase participants load error:', e);
    }
  }

  // Render team picker
  renderTeamPicker();
  renderParticipantsList();

  // Live validation on name input
  const nombreInput = document.getElementById('reg-nombre');
  if (nombreInput) {
    nombreInput.addEventListener('input', () => {
      const v = nombreInput.value.trim();
      showFieldError('err-nombre',
        v.length > 0 && v.length < 2 ? 'Mínimo 2 caracteres.' : ''
      );
      updateSubmitBtn();
    });
  }

  // Code input also triggers submit button update
  const codigoInput = document.getElementById('reg-codigo');
  if (codigoInput) codigoInput.addEventListener('input', updateSubmitBtn);

  // Form submit
  const form = document.getElementById('registro-form');
  if (form) form.addEventListener('submit', handleSubmit);
});
