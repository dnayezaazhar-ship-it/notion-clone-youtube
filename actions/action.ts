"use server";

import { adminDb } from "@/firebase-admin";
import { auth, currentUser } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";

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

export async function deleteDocument(roomId: string) {
  // Check authentication
  await auth.protect();

  console.log("deleteDocument", roomId);

  try {
    // Delete the document itself
    await adminDb.collection("documents").doc(roomId).delete();

    // Find all room references for this document
    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();

    // Delete room references from all users
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Delete the Liveblocks room
    await liveblocks.deleteRoom(roomId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting document:", error);

    return {
      success: false,
    };
  }
}
