// =============================================================================
// QUINIELA MUNDIAL 2026 — data.js
// Datos oficiales / proyectados del Mundial FIFA 2026 (USA · México · Canadá)
// 48 equipos · 12 grupos (A–L) · 4 equipos por grupo
// =============================================================================

// ---------------------------------------------------------------------------
// TEAMS — Sorteo oficial FIFA World Cup 2026
// ---------------------------------------------------------------------------
const TEAMS = [
  // GRUPO A
  { id: 'MEX',  name: 'México',          group: 'A', flag: '🇲🇽', color: '#006847' },
  { id: 'KOR',  name: 'Corea del Sur',   group: 'A', flag: '🇰🇷', color: '#CD2E3A' },
  { id: 'RSA',  name: 'Sudáfrica',       group: 'A', flag: '🇿🇦', color: '#007A4D' },
  { id: 'CZE',  name: 'Rep. Checa',      group: 'A', flag: '🇨🇿', color: '#D7141A' },

  // GRUPO B
  { id: 'CAN',  name: 'Canadá',          group: 'B', flag: '🇨🇦', color: '#FF0000' },
  { id: 'SUI',  name: 'Suiza',           group: 'B', flag: '🇨🇭', color: '#D52B1E' },
  { id: 'QAT',  name: 'Catar',           group: 'B', flag: '🇶🇦', color: '#8D1B3D' },
  { id: 'BIH',  name: 'Bosnia-Herzegovina', group: 'B', flag: '🇧🇦', color: '#002395' },

  // GRUPO C
  { id: 'BRA',  name: 'Brasil',          group: 'C', flag: '🇧🇷', color: '#009C3B' },
  { id: 'MAR',  name: 'Marruecos',       group: 'C', flag: '🇲🇦', color: '#C1272D' },
  { id: 'SCO',  name: 'Escocia',         group: 'C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003366' },
  { id: 'HAI',  name: 'Haití',           group: 'C', flag: '🇭🇹', color: '#00209F' },

  // GRUPO D
  { id: 'USA',  name: 'Estados Unidos',  group: 'D', flag: '🇺🇸', color: '#B22234' },
  { id: 'AUS',  name: 'Australia',       group: 'D', flag: '🇦🇺', color: '#FFCD00' },
  { id: 'PAR',  name: 'Paraguay',        group: 'D', flag: '🇵🇾', color: '#D52B1E' },
  { id: 'TUR',  name: 'Turquía',         group: 'D', flag: '🇹🇷', color: '#E30A17' },

  // GRUPO E
  { id: 'GER',  name: 'Alemania',        group: 'E', flag: '🇩🇪', color: '#000000' },
  { id: 'ECU',  name: 'Ecuador',         group: 'E', flag: '🇪🇨', color: '#FFD100' },
  { id: 'IVK',  name: 'Costa de Marfil', group: 'E', flag: '🇨🇮', color: '#F77F00' },
  { id: 'CUW',  name: 'Curazao',         group: 'E', flag: '🇨🇼', color: '#002B7F' },

  // GRUPO F
  { id: 'NED',  name: 'Países Bajos',    group: 'F', flag: '🇳🇱', color: '#FF6600' },
  { id: 'JPN',  name: 'Japón',           group: 'F', flag: '🇯🇵', color: '#BC002D' },
  { id: 'TUN',  name: 'Túnez',           group: 'F', flag: '🇹🇳', color: '#E70013' },
  { id: 'SWE',  name: 'Suecia',           group: 'F', flag: '🇸🇪', color: '#006AA7' },

  // GRUPO G
  { id: 'BEL',  name: 'Bélgica',         group: 'G', flag: '🇧🇪', color: '#EF3340' },
  { id: 'IRN',  name: 'Irán',            group: 'G', flag: '🇮🇷', color: '#239F40' },
  { id: 'EGY',  name: 'Egipto',          group: 'G', flag: '🇪🇬', color: '#CE1126' },
  { id: 'NZL',  name: 'Nueva Zelanda',   group: 'G', flag: '🇳🇿', color: '#00247D' },

  // GRUPO H
  { id: 'ESP',  name: 'España',          group: 'H', flag: '🇪🇸', color: '#AA151B' },
  { id: 'URU',  name: 'Uruguay',         group: 'H', flag: '🇺🇾', color: '#75AADB' },
  { id: 'KSA',  name: 'Arabia Saudí',    group: 'H', flag: '🇸🇦', color: '#006C35' },
  { id: 'CPV',  name: 'Cabo Verde',      group: 'H', flag: '🇨🇻', color: '#003893' },

  // GRUPO I
  { id: 'FRA',  name: 'Francia',         group: 'I', flag: '🇫🇷', color: '#002395' },
  { id: 'SEN',  name: 'Senegal',         group: 'I', flag: '🇸🇳', color: '#00853F' },
  { id: 'NOR',  name: 'Noruega',         group: 'I', flag: '🇳🇴', color: '#EF2B2D' },
  { id: 'IRQ',  name: 'Iraq',            group: 'I', flag: '🇮🇶', color: '#007A3D' },

  // GRUPO J
  { id: 'ARG',  name: 'Argentina',       group: 'J', flag: '🇦🇷', color: '#75AADB' },
  { id: 'AUT',  name: 'Austria',         group: 'J', flag: '🇦🇹', color: '#ED2939' },
  { id: 'ALG',  name: 'Argelia',         group: 'J', flag: '🇩🇿', color: '#006233' },
  { id: 'JOR',  name: 'Jordania',        group: 'J', flag: '🇯🇴', color: '#007A3D' },

  // GRUPO K
  { id: 'POR',  name: 'Portugal',        group: 'K', flag: '🇵🇹', color: '#006600' },
  { id: 'COL',  name: 'Colombia',        group: 'K', flag: '🇨🇴', color: '#FCD116' },
  { id: 'UZB',  name: 'Uzbekistán',      group: 'K', flag: '🇺🇿', color: '#1EB53A' },
  { id: 'RDC',  name: 'R.D. Congo',      group: 'K', flag: '🇨🇩', color: '#007FFF' },

  // GRUPO L
  { id: 'ENG',  name: 'Inglaterra',      group: 'L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF081F' },
  { id: 'CRO',  name: 'Croacia',         group: 'L', flag: '🇭🇷', color: '#FF0000' },
  { id: 'PAN',  name: 'Panamá',          group: 'L', flag: '🇵🇦', color: '#D21034' },
  { id: 'GHA',  name: 'Ghana',           group: 'L', flag: '🇬🇭', color: '#006B3F' },
];

// ---------------------------------------------------------------------------
// Helper: equipo por id
// ---------------------------------------------------------------------------
function getTeam(id) {
  return TEAMS.find(t => t.id === id) || null;
}

// ---------------------------------------------------------------------------
// GROUPS  (generados dinámicamente desde TEAMS)
// ---------------------------------------------------------------------------
const GROUP_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

const GROUPS = GROUP_IDS.map(gid => ({
  id: gid,
  name: `Grupo ${gid}`,
  teams: TEAMS.filter(t => t.group === gid).map(t => t.id),
}));

// ---------------------------------------------------------------------------
// MATCHES — Fase de Grupos
// Cada grupo tiene 6 partidos (combinaciones de 4 equipos de 2 en 2)
// Formato de fecha: ISO 8601 (YYYY-MM-DD). Fechas aproximadas Jun–Jul 2026.
// ---------------------------------------------------------------------------

// Genera los 6 partidos de un grupo
function generateGroupMatches(groupId, startMatchId, startDate) {
  const teamIds = TEAMS.filter(t => t.group === groupId).map(t => t.id);
  const pairs = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs.map((pair, idx) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + idx * 2);
    return {
      id: `GRP-${startMatchId + idx}`,
      phase: 'groups',
      group: groupId,
      team1: pair[0],
      team2: pair[1],
      score1: null,
      score2: null,
      date: d.toISOString().slice(0, 10),
      played: false,
    };
  });
}

const GROUP_MATCHES = [];
// Fechas de inicio aproximadas por grupo (Jun 11–Jul 1 2026)
const groupStartDates = {
  A: '2026-06-11', B: '2026-06-12', C: '2026-06-13', D: '2026-06-14',
  E: '2026-06-15', F: '2026-06-16', G: '2026-06-17', H: '2026-06-18',
  I: '2026-06-19', J: '2026-06-20', K: '2026-06-21', L: '2026-06-22',
};
let matchCounter = 1;
GROUP_IDS.forEach(gid => {
  const matches = generateGroupMatches(gid, matchCounter, groupStartDates[gid]);
  GROUP_MATCHES.push(...matches);
  matchCounter += 6;
});

// ---------------------------------------------------------------------------
// MATCHES — Fase Eliminatoria
// id convenio: r32_L1..r32_L8 / r32_R1..r32_R8, r16_L*, r16_R*, qf_L*, qf_R*, sf_L, sf_R, final
// ---------------------------------------------------------------------------

// Ronda de 32 — cruces oficiales FIFA 2026
const ROUND_OF_32 = [
  // LADO IZQUIERDO
  { id: 'r32_L1', phase: 'r32', group: null, team1: 'RSA', team2: 'CAN', score1: null, score2: null, date: '2026-06-27', played: false },
  { id: 'r32_L2', phase: 'r32', group: null, team1: 'NED', team2: 'MAR', score1: null, score2: null, date: '2026-06-27', played: false },
  { id: 'r32_L3', phase: 'r32', group: null, team1: 'GER', team2: 'PAR', score1: null, score2: null, date: '2026-06-28', played: false },
  { id: 'r32_L4', phase: 'r32', group: null, team1: 'FRA', team2: 'SWE', score1: null, score2: null, date: '2026-06-28', played: false },
  { id: 'r32_L5', phase: 'r32', group: null, team1: 'BEL', team2: 'SEN', score1: null, score2: null, date: '2026-06-29', played: false },
  { id: 'r32_L6', phase: 'r32', group: null, team1: 'USA', team2: 'BIH', score1: null, score2: null, date: '2026-06-29', played: false },
  { id: 'r32_L7', phase: 'r32', group: null, team1: 'ESP', team2: 'AUT', score1: null, score2: null, date: '2026-06-30', played: false },
  { id: 'r32_L8', phase: 'r32', group: null, team1: 'POR', team2: 'CRO', score1: null, score2: null, date: '2026-06-30', played: false },
  // LADO DERECHO
  { id: 'r32_R1', phase: 'r32', group: null, team1: 'BRA', team2: 'JPN', score1: null, score2: null, date: '2026-06-27', played: false },
  { id: 'r32_R2', phase: 'r32', group: null, team1: 'IVK', team2: 'NOR', score1: null, score2: null, date: '2026-06-27', played: false },
  { id: 'r32_R3', phase: 'r32', group: null, team1: 'MEX', team2: 'ECU', score1: null, score2: null, date: '2026-06-28', played: false },
  { id: 'r32_R4', phase: 'r32', group: null, team1: 'ENG', team2: 'RDC', score1: null, score2: null, date: '2026-06-28', played: false },
  { id: 'r32_R5', phase: 'r32', group: null, team1: 'SUI', team2: 'ALG', score1: null, score2: null, date: '2026-06-29', played: false },
  { id: 'r32_R6', phase: 'r32', group: null, team1: 'COL', team2: 'GHA', score1: null, score2: null, date: '2026-06-29', played: false },
  { id: 'r32_R7', phase: 'r32', group: null, team1: 'AUS', team2: 'EGY', score1: null, score2: null, date: '2026-06-30', played: false },
  { id: 'r32_R8', phase: 'r32', group: null, team1: 'ARG', team2: 'CPV', score1: null, score2: null, date: '2026-06-30', played: false },
];

// Octavos de final — 8 partidos
const ROUND_OF_16 = [
  { id: 'r16_L1', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-03', played: false },
  { id: 'r16_L2', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-03', played: false },
  { id: 'r16_L3', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-04', played: false },
  { id: 'r16_L4', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-04', played: false },
  { id: 'r16_R1', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-05', played: false },
  { id: 'r16_R2', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-05', played: false },
  { id: 'r16_R3', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-06', played: false },
  { id: 'r16_R4', phase: 'r16', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-06', played: false },
];

// Cuartos de final — 4 partidos
const QUARTER_FINALS = [
  { id: 'qf_L1', phase: 'qf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-10', played: false },
  { id: 'qf_L2', phase: 'qf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-10', played: false },
  { id: 'qf_R1', phase: 'qf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-11', played: false },
  { id: 'qf_R2', phase: 'qf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-11', played: false },
];

// Semifinales — 2 partidos
const SEMI_FINALS = [
  { id: 'sf_L', phase: 'sf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-14', played: false },
  { id: 'sf_R', phase: 'sf', group: null, team1: null, team2: null, score1: null, score2: null, date: '2026-07-15', played: false },
];

// Final
const FINAL = [{
  id: 'final',
  phase: 'final',
  group: null,
  team1: null,
  team2: null,
  score1: null,
  score2: null,
  date: '2026-07-19',
  played: false,
}];

// Partido por el tercer puesto
const THIRD_PLACE = [{
  id: 'third_place',
  phase: 'third',
  group: null,
  team1: null,
  team2: null,
  score1: null,
  score2: null,
  date: '2026-07-18',
  played: false,
}];

// ---------------------------------------------------------------------------
// MATCHES — colección completa
// ---------------------------------------------------------------------------
const MATCHES = [
  ...GROUP_MATCHES,
  ...ROUND_OF_32,
  ...ROUND_OF_16,
  ...QUARTER_FINALS,
  ...SEMI_FINALS,
  ...FINAL,
  ...THIRD_PLACE,
];

// ---------------------------------------------------------------------------
// PHASES metadata
// ---------------------------------------------------------------------------
const PHASES = [
  { id: 'groups', name: 'Fase de Grupos',   matchCount: 72 },
  { id: 'r32',    name: 'Ronda de 32',      matchCount: 16 },
  { id: 'r16',    name: 'Octavos de Final', matchCount: 8  },
  { id: 'qf',     name: 'Cuartos de Final', matchCount: 4  },
  { id: 'sf',     name: 'Semifinales',      matchCount: 2  },
  { id: 'final',  name: 'Final',            matchCount: 1  },
];

// ---------------------------------------------------------------------------
// ADVANCE_MAP — mapeo de avance automático de ganadores por fase
// Cada entrada: qué partido (next) y qué slot (team1|team2) recibe al ganador
// ---------------------------------------------------------------------------
const ADVANCE_MAP = {
  // Ronda de 32 → Octavos (R16)
  'r32_L1': { next: 'r16_L1', slot: 'team1' },
  'r32_L2': { next: 'r16_L1', slot: 'team2' },
  'r32_L3': { next: 'r16_L2', slot: 'team1' },
  'r32_L4': { next: 'r16_L2', slot: 'team2' },
  'r32_L5': { next: 'r16_L3', slot: 'team1' },
  'r32_L6': { next: 'r16_L3', slot: 'team2' },
  'r32_L7': { next: 'r16_L4', slot: 'team1' },
  'r32_L8': { next: 'r16_L4', slot: 'team2' },
  'r32_R1': { next: 'r16_R1', slot: 'team1' },
  'r32_R2': { next: 'r16_R1', slot: 'team2' },
  'r32_R3': { next: 'r16_R2', slot: 'team1' },
  'r32_R4': { next: 'r16_R2', slot: 'team2' },
  'r32_R5': { next: 'r16_R3', slot: 'team1' },
  'r32_R6': { next: 'r16_R3', slot: 'team2' },
  'r32_R7': { next: 'r16_R4', slot: 'team1' },
  'r32_R8': { next: 'r16_R4', slot: 'team2' },
  // Octavos (R16) → Cuartos (QF)
  'r16_L1': { next: 'qf_L1', slot: 'team1' },
  'r16_L2': { next: 'qf_L1', slot: 'team2' },
  'r16_L3': { next: 'qf_L2', slot: 'team1' },
  'r16_L4': { next: 'qf_L2', slot: 'team2' },
  'r16_R1': { next: 'qf_R1', slot: 'team1' },
  'r16_R2': { next: 'qf_R1', slot: 'team2' },
  'r16_R3': { next: 'qf_R2', slot: 'team1' },
  'r16_R4': { next: 'qf_R2', slot: 'team2' },
  // Cuartos (QF) → Semifinales (SF)
  'qf_L1': { next: 'sf_L', slot: 'team1' },
  'qf_L2': { next: 'sf_L', slot: 'team2' },
  'qf_R1': { next: 'sf_R', slot: 'team1' },
  'qf_R2': { next: 'sf_R', slot: 'team2' },
  // Semifinales → Final
  'sf_L': { next: 'final', slot: 'team1' },
  'sf_R': { next: 'final', slot: 'team2' },
  // final: no tiene siguiente ronda
};

// ---------------------------------------------------------------------------
// LocalStorage keys
// ---------------------------------------------------------------------------
const LS_KEYS = {
  PARTICIPANTS: 'qm2026_participants',
  MATCHES:      'qm2026_matches',
  ADMIN:        'qm2026_admin',
};

// ---------------------------------------------------------------------------
// Persistencia: carga matches desde localStorage si existen, si no usa los
// datos base definidos arriba.
// ---------------------------------------------------------------------------
function loadMatches() {
  const stored = localStorage.getItem(LS_KEYS.MATCHES);
  return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(MATCHES));
}

function saveMatches(matchesArray) {
  localStorage.setItem(LS_KEYS.MATCHES, JSON.stringify(matchesArray));
}

function loadParticipants() {
  const stored = localStorage.getItem(LS_KEYS.PARTICIPANTS);
  return stored ? JSON.parse(stored) : [];
}

function saveParticipants(participants) {
  localStorage.setItem(LS_KEYS.PARTICIPANTS, JSON.stringify(participants));
}
