"use server";

import { adminDb } from "@/firebase-admin";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function createNewDocument() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();

  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found");
  }

  const docCollectionRef = adminDb.collection("documents");

  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  await adminDb
    .collection("users")
    .doc(email)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId: email,
      role: "owner",
      createdAt: new Date(),
      roomId: docRef.id,
    });

  return {
    docId: docRef.id,
  };
}