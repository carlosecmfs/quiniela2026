// =============================================================================
// QUINIELA MUNDIAL 2026 — firebase.js
// Firebase v9 compat (CDN, no npm) — Firestore helpers
// Debe cargarse DESPUÉS de los CDN scripts y ANTES de data.js / app.js
// =============================================================================

const firebaseConfig = {
  apiKey:            "AIzaSyAtxGJcCj6UNL-yzAI_VhALUIm-zsT2wEk",
  authDomain:        "quiniela2026-8ed4c.firebaseapp.com",
  projectId:         "quiniela2026-8ed4c",
  storageBucket:     "quiniela2026-8ed4c.firebasestorage.app",
  messagingSenderId: "620007554081",
  appId:             "1:620007554081:web:b175937346eb604861f760",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------------------------------------------------------------------------
// Seed matches collection on first ever load (collection is empty)
// Splits into batches of 490 to respect Firestore's 500-op/batch limit
// ---------------------------------------------------------------------------
async function fbInitMatches(defaultMatches) {
  const snap = await db.collection('matches').limit(1).get();
  if (!snap.empty) return;

  const CHUNK = 490;
  for (let i = 0; i < defaultMatches.length; i += CHUNK) {
    const batch = db.batch();
    defaultMatches.slice(i, i + CHUNK).forEach(m => {
      batch.set(db.collection('matches').doc(String(m.id)), m);
    });
    await batch.commit();
  }
}

// ---------------------------------------------------------------------------
// Read all matches (one-time get)
// ---------------------------------------------------------------------------
async function fbGetMatches() {
  const snap = await db.collection('matches').get();
  return snap.docs.map(d => d.data());
}

// ---------------------------------------------------------------------------
// Write / update a single match document
// ---------------------------------------------------------------------------
async function fbUpdateMatch(match) {
  await db.collection('matches').doc(String(match.id)).set(match);
}

// ---------------------------------------------------------------------------
// Read all participants (one-time get)
// ---------------------------------------------------------------------------
async function fbGetParticipants() {
  const snap = await db.collection('participants').get();
  return snap.docs.map(d => d.data());
}

// ---------------------------------------------------------------------------
// Write / update a single participant document
// ---------------------------------------------------------------------------
async function fbSaveParticipant(participant) {
  await db.collection('participants').doc(String(participant.id)).set(participant);
}

// ---------------------------------------------------------------------------
// Delete a participant document
// ---------------------------------------------------------------------------
async function fbDeleteParticipant(id) {
  await db.collection('participants').doc(String(id)).delete();
}

// ---------------------------------------------------------------------------
// Real-time listener: matches collection
// Returns the unsubscribe function
// ---------------------------------------------------------------------------
function fbOnMatchesChange(callback) {
  return db.collection('matches').onSnapshot(
    snap => callback(snap.docs.map(d => d.data())),
    err  => console.error('fbOnMatchesChange error:', err)
  );
}

// ---------------------------------------------------------------------------
// Real-time listener: participants collection
// Returns the unsubscribe function
// ---------------------------------------------------------------------------
function fbOnParticipantsChange(callback) {
  return db.collection('participants').onSnapshot(
    snap => callback(snap.docs.map(d => d.data())),
    err  => console.error('fbOnParticipantsChange error:', err)
  );
}
