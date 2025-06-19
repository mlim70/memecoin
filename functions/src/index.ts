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

  // 3. Fetch eligible users
  const snapshot = await db.collection("users")
    .where("eligible", "==", true)
    .get();

  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (users.length < numWinners) {
    throw new functions.https.HttpsError("failed-precondition", "Not enough eligible users.");
  }

  // 4. Securely pick random winners (prevents duplicates within same drop)
  const winners: typeof users = [];
  const usedIndexes = new Set<number>();
  while (winners.length < numWinners) {
    const idx = randomInt(users.length); // cryptographically secure
    if (!usedIndexes.has(idx)) {
      winners.push(users[idx]);
      usedIndexes.add(idx);
    }
  }

  // 5. Log the drop event (no user updates needed)
  const dropLogRef = db.collection("drops").doc(dropId);
  await dropLogRef.set({
    dropId,
    winners: winners.map(w => w.id),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    numWinners,
  });

  return { dropId, winners: winners.map(w => ({ ...w, id: w.id })) };
}); 