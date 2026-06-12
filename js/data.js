// =============================================================================
// QUINIELA MUNDIAL 2026 — data.js
// Datos oficiales / proyectados del Mundial FIFA 2026 (USA · México · Canadá)
// 48 equipos · 12 grupos (A–L) · 4 equipos por grupo
// =============================================================================

// ---------------------------------------------------------------------------
// TEAMS
// ---------------------------------------------------------------------------
const TEAMS = [
  // GRUPO A
  { id: 'USA',     name: 'Estados Unidos',  group: 'A', flag: '🇺🇸', color: '#B22234' },
  { id: 'MEX',     name: 'México',          group: 'A', flag: '🇲🇽', color: '#006847' },
  { id: 'CAN',     name: 'Canadá',          group: 'A', flag: '🇨🇦', color: '#FF0000' },
  { id: 'PAN',     name: 'Panamá',          group: 'A', flag: '🇵🇦', color: '#D21034' },

  // GRUPO B
  { id: 'ARG',     name: 'Argentina',       group: 'B', flag: '🇦🇷', color: '#75AADB' },
  { id: 'CHI',     name: 'Chile',           group: 'B', flag: '🇨🇱', color: '#D52B1E' },
  { id: 'MAR',     name: 'Marruecos',       group: 'B', flag: '🇲🇦', color: '#C1272D' },
  { id: 'IVK',     name: 'Costa de Marfil', group: 'B', flag: '🇨🇮', color: '#F77F00' },

  // GRUPO C
  { id: 'ENG',     name: 'Inglaterra',      group: 'C', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF081F' },
  { id: 'SEN',     name: 'Senegal',         group: 'C', flag: '🇸🇳', color: '#00853F' },
  { id: 'AUS',     name: 'Australia',       group: 'C', flag: '🇦🇺', color: '#FFCD00' },
  { id: 'ALG',     name: 'Argelia',         group: 'C', flag: '🇩🇿', color: '#006233' },

  // GRUPO D
  { id: 'FRA',     name: 'Francia',         group: 'D', flag: '🇫🇷', color: '#002395' },
  { id: 'TUN',     name: 'Túnez',           group: 'D', flag: '🇹🇳', color: '#E70013' },
  { id: 'COL',     name: 'Colombia',        group: 'D', flag: '🇨🇴', color: '#FCD116' },
  { id: 'NOR',     name: 'Noruega',         group: 'D', flag: '🇳🇴', color: '#EF2B2D' },

  // GRUPO E
  { id: 'BRA',     name: 'Brasil',          group: 'E', flag: '🇧🇷', color: '#009C3B' },
  { id: 'PAR',     name: 'Paraguay',        group: 'E', flag: '🇵🇾', color: '#D52B1E' },
  { id: 'JPN',     name: 'Japón',           group: 'E', flag: '🇯🇵', color: '#BC002D' },
  { id: 'GHA',     name: 'Ghana',           group: 'E', flag: '🇬🇭', color: '#006B3F' },

  // GRUPO F
  { id: 'ESP',     name: 'España',          group: 'F', flag: '🇪🇸', color: '#AA151B' },
  { id: 'URU',     name: 'Uruguay',         group: 'F', flag: '🇺🇾', color: '#75AADB' },
  { id: 'NGA',     name: 'Nigeria',         group: 'F', flag: '🇳🇬', color: '#008751' },
  { id: 'THA',     name: 'Tailandia',       group: 'F', flag: '🇹🇭', color: '#A51931' },

  // GRUPO G
  { id: 'GER',     name: 'Alemania',        group: 'G', flag: '🇩🇪', color: '#000000' },
  { id: 'SRB',     name: 'Serbia',          group: 'G', flag: '🇷🇸', color: '#C6363C' },
  { id: 'CRI',     name: 'Costa Rica',      group: 'G', flag: '🇨🇷', color: '#002B7F' },
  { id: 'NZL',     name: 'Nueva Zelanda',   group: 'G', flag: '🇳🇿', color: '#00247D' },

  // GRUPO H
  { id: 'POR',     name: 'Portugal',        group: 'H', flag: '🇵🇹', color: '#006600' },
  { id: 'TUR',     name: 'Turquía',         group: 'H', flag: '🇹🇷', color: '#E30A17' },
  { id: 'ECU',     name: 'Ecuador',         group: 'H', flag: '🇪🇨', color: '#FFD100' },
  { id: 'RDC',     name: 'R. D. Congo',     group: 'H', flag: '🇨🇩', color: '#007FFF' },

  // GRUPO I
  { id: 'NED',     name: 'Países Bajos',    group: 'I', flag: '🇳🇱', color: '#FF6600' },
  { id: 'GRE',     name: 'Grecia',          group: 'I', flag: '🇬🇷', color: '#0D5EAF' },
  { id: 'EGY',     name: 'Egipto',          group: 'I', flag: '🇪🇬', color: '#CE1126' },
  { id: 'BOL',     name: 'Bolivia',         group: 'I', flag: '🇧🇴', color: '#D52B1E' },

  // GRUPO J
  { id: 'BEL',     name: 'Bélgica',         group: 'J', flag: '🇧🇪', color: '#EF3340' },
  { id: 'UKR',     name: 'Ucrania',         group: 'J', flag: '🇺🇦', color: '#005BBB' },
  { id: 'MEQ',     name: 'México (alt.)',   group: 'J', flag: '🇲🇽', color: '#006847' }, // placeholder equipo CAF
  { id: 'VEN',     name: 'Venezuela',       group: 'J', flag: '🇻🇪', color: '#CF142B' },

  // GRUPO K
  { id: 'KOR',     name: 'Corea del Sur',   group: 'K', flag: '🇰🇷', color: '#CD2E3A' },
  { id: 'IRN',     name: 'Irán',            group: 'K', flag: '🇮🇷', color: '#239F40' },
  { id: 'PER',     name: 'Perú',            group: 'K', flag: '🇵🇪', color: '#D91023' },
  { id: 'RSA',     name: 'Sudáfrica',       group: 'K', flag: '🇿🇦', color: '#007A4D' },

  // GRUPO L
  { id: 'CRO',     name: 'Croacia',         group: 'L', flag: '🇭🇷', color: '#FF0000' },
  { id: 'SUI',     name: 'Suiza',           group: 'L', flag: '🇨🇭', color: '#FF0000' },
  { id: 'HND',     name: 'Honduras',        group: 'L', flag: '🇭🇳', color: '#0073CF' },
  { id: 'CMR',     name: 'Camerún',         group: 'L', flag: '🇨🇲', color: '#007A5E' },
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
