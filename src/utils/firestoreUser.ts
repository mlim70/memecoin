// src/utils/firestoreUser.ts
// Utility to store user info in Firestore

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface UserData {
  name: string;
  email: string;
  address?: string;
  // Add more fields as needed
  createdAt?: Date;
  updatedAt?: Date;
}

export async function saveUserToFirestore(user: any) {
  if (!user || !user.sub) {
    return;
  }
  
  const userData: UserData = {
    name: user.name,
    email: user.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Only add address if it exists and is not undefined
  if (user.address) {
    userData.address = user.address;
  }

  try {
    const userRef = doc(db, "users", user.sub);
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

// Function to update user address when wallet is connected
export async function updateUserAddress(userId: string, address: string) {
  if (!userId || !address) return;
  
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    address,
    updatedAt: new Date(),
  }, { merge: true });
} 