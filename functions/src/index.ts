import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomInt } from "crypto"; // Node.js 16+ for secure randomness

admin.initializeApp();
const db = admin.firestore();

export const runDrop = functions.https.onCall(async (data: any, context: any) => {
  // 1. Security: Only allow admins to run the drop
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can run drops.");
  }

  // 2. Get number of winners (default 1)
  const numWinners = data.numWinners || 1;
  const dropId = `drop_${Date.now()}`;

  // 3. Fetch eligible users who haven't won yet
  const snapshot = await db.collection("users")
    .where("eligible", "==", true)
    .where("hasWonDrop", "==", false)
    .get();

  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (users.length < numWinners) {
    throw new functions.https.HttpsError("failed-precondition", "Not enough eligible users.");
  }

  // 4. Securely pick random winners
  const winners: typeof users = [];
  const usedIndexes = new Set<number>();
  while (winners.length < numWinners) {
    const idx = randomInt(users.length); // cryptographically secure
    if (!usedIndexes.has(idx)) {
      winners.push(users[idx]);
      usedIndexes.add(idx);
    }
  }

  // 5. Update winners in Firestore and log the drop
  const batch = db.batch();
  winners.forEach(winner => {
    const ref = db.collection("users").doc(winner.id);
    batch.update(ref, {
      hasWonDrop: true,
      lastDropWon: dropId,
      dropTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Log the drop event
  const dropLogRef = db.collection("drops").doc(dropId);
  batch.set(dropLogRef, {
    dropId,
    winners: winners.map(w => w.id),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    numWinners,
  });

  await batch.commit();

  // Avoid overwriting 'id' property
  return { dropId, winners: winners.map(w => ({ ...w, id: w.id })) };
}); 