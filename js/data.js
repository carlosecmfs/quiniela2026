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
  { id: 'ITA',  name: 'Italia',          group: 'B', flag: '🇮🇹', color: '#009246' },

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
  { id: 'UKR',  name: 'Ucrania',         group: 'F', flag: '🇺🇦', color: '#005BBB' },

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
// Los slots se rellenan con TBD hasta que los grupos terminen.
// id convenio: R32-XX, R16-XX, QF-XX, SF-XX, F-01
// ---------------------------------------------------------------------------

// Ronda de 32 (32 equipos, 16 partidos)
// Los mejores 2 de cada grupo + los 8 mejores terceros clasificados
const ROUND_OF_32 = Array.from({ length: 16 }, (_, i) => ({
  id: `R32-${String(i + 1).padStart(2, '0')}`,
  phase: 'round32',
  group: null,
  team1: 'TBD',
  team2: 'TBD',
  score1: null,
  score2: null,
  date: '2026-07-04',
  played: false,
}));

// Octavos de final (16 equipos, 8 partidos)
const ROUND_OF_16 = Array.from({ length: 8 }, (_, i) => ({
  id: `R16-${String(i + 1).padStart(2, '0')}`,
  phase: 'round16',
  group: null,
  team1: 'TBD',
  team2: 'TBD',
  score1: null,
  score2: null,
  date: '2026-07-11',
  played: false,
}));

// Cuartos de final (8 equipos, 4 partidos)
const QUARTER_FINALS = Array.from({ length: 4 }, (_, i) => ({
  id: `QF-${String(i + 1).padStart(2, '0')}`,
  phase: 'quarterfinals',
  group: null,
  team1: 'TBD',
  team2: 'TBD',
  score1: null,
  score2: null,
  date: '2026-07-17',
  played: false,
}));

// Semifinales (4 equipos, 2 partidos)
const SEMI_FINALS = Array.from({ length: 2 }, (_, i) => ({
  id: `SF-${String(i + 1).padStart(2, '0')}`,
  phase: 'semifinals',
  group: null,
  team1: 'TBD',
  team2: 'TBD',
  score1: null,
  score2: null,
  date: '2026-07-21',
  played: false,
}));

// Final
const FINAL = [{
  id: 'F-01',
  phase: 'final',
  group: null,
  team1: 'TBD',
  team2: 'TBD',
  score1: null,
  score2: null,
  date: '2026-07-19',
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
];

// ---------------------------------------------------------------------------
// PHASES metadata
// ---------------------------------------------------------------------------
const PHASES = [
  { id: 'groups',       name: 'Fase de Grupos',     matchCount: 72 },
  { id: 'round32',      name: 'Ronda de 32',         matchCount: 16 },
  { id: 'round16',      name: 'Octavos de Final',    matchCount: 8  },
  { id: 'quarterfinals',name: 'Cuartos de Final',    matchCount: 4  },
  { id: 'semifinals',   name: 'Semifinales',         matchCount: 2  },
  { id: 'final',        name: 'Final',               matchCount: 1  },
];

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
