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
// Seed / reinit matches collection.
// Si existen docs con phase='r32' y id con prefijo 'r32_' → datos correctos.
// Cualquier otro caso (datos viejos o colección vacía) → borrar todo y reinit.
// ---------------------------------------------------------------------------
async function fbInitMatches(matches) {
  console.log('📝 Verificando esquema de matches en Firestore...');
  const snap = await db.collection("matches")
    .where("phase", "==", "r32").limit(1).get();

  if (!snap.empty && snap.docs[0].id.startsWith('r32_')) {
    console.log('✅ Matches ya tienen el esquema correcto (r32_L/R)');
    return;
  }

  // Datos no encontrados o IDs con formato viejo — reinicializar todo
  console.log('🔄 Reinicializando Firestore con cruces oficiales FIFA...');
  const allSnap = await db.collection("matches").get();
  if (!allSnap.empty) {
    const delBatch = db.batch();
    allSnap.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
    console.log(`🗑️ Eliminados ${allSnap.size} documentos con esquema viejo`);
  }

  const batch = db.batch();
  matches.forEach(m => {
    const ref = db.collection("matches").doc(String(m.id));
    batch.set(ref, m);
  });
  await batch.commit();
  console.log('✅ Firestore reinicializado con cruces oficiales');
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
