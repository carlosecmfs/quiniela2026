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
// Seed matches collection on first ever load (collection is empty).
// If Grupo B still has Italy (stale data), wipes and reinitializes.
// ---------------------------------------------------------------------------
async function fbInitMatches(matches) {
  console.log('📝 Verificando matches en Firestore...');
  const snap = await db.collection("matches").limit(1).get();
  console.log('📊 Documentos existentes:', snap.size);
  if (!snap.empty) {
    let forceReinit = false;

    const italySnap = await db.collection("matches")
      .where("group", "==", "B")
      .where("team1", "==", "ITA")
      .limit(1).get();
    if (!italySnap.empty) forceReinit = true;

    if (!forceReinit) {
      const italySnap2 = await db.collection("matches")
        .where("group", "==", "B")
        .where("team2", "==", "ITA")
        .limit(1).get();
      if (!italySnap2.empty) forceReinit = true;
    }

    if (!forceReinit) {
      const checkUkraine = await db.collection("matches")
        .where("group", "==", "F")
        .where("team1", "==", "UKR")
        .limit(1).get();
      if (!checkUkraine.empty) forceReinit = true;
    }

    if (!forceReinit) {
      const checkUkraine2 = await db.collection("matches")
        .where("group", "==", "F")
        .where("team2", "==", "UKR")
        .limit(1).get();
      if (!checkUkraine2.empty) forceReinit = true;
    }

    if (!forceReinit) {
      console.log('✅ Matches ya existen con datos correctos');
      return;
    }

    console.log('🔄 Detectado datos viejos (Italia/Ucrania), reinicializando...');
    const allSnap = await db.collection("matches").get();
    const delBatch = db.batch();
    allSnap.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
  }
  console.log('⚡ Inicializando', matches.length, 'matches con datos correctos...');
  const batch = db.batch();
  matches.forEach(m => {
    const ref = db.collection("matches").doc(String(m.id));
    batch.set(ref, m);
  });
  await batch.commit();
  console.log('🎉 Firestore actualizado con grupos oficiales');
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
