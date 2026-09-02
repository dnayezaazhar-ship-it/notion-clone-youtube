/*"use server";

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
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    console.log("deleteDocument", roomId);

    // Delete the document
    await adminDb.collection("documents").doc(roomId).delete();

    // Find all room references
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

    // Delete Liveblocks room
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

export async function inviteUserToDocument(
  roomId: string,
  email: string
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get current logged-in user
    const user = await currentUser();

    const currentUserEmail =
      user?.emailAddresses?.[0]?.emailAddress;

    if (!currentUserEmail) {
      throw new Error("Current user email not found");
    }

    console.log("inviteUserToDocument", roomId, email);

    // Check if current user has access to this room
    const currentUserRoom = await adminDb
      .collection("users")
      .doc(currentUserEmail)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!currentUserRoom.exists) {
      throw new Error("You don't have access to this document");
    }

    // Check invited email
    const invitedEmail = email.trim().toLowerCase();

    if (!invitedEmail) {
      throw new Error("Email is required");
    }

    // Add user to room as editor
    await adminDb
      .collection("users")
      .doc(invitedEmail)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: invitedEmail,
        role: "editor",
        createdAt: new Date(),
        roomId: roomId,
      });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error inviting user:", error);

    return {
      success: false,
    };
  }
}
export async function removeUserFromDocument(roomId: string, email: string) {
  auth().protect(); // Ensure the user is authenticated

  console.log("removeUserFromDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}*/



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
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();

    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

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

export async function inviteUserToDocument(
  roomId: string,
  email: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await currentUser();

    const currentUserEmail =
      user?.emailAddresses?.[0]?.emailAddress;

    if (!currentUserEmail) {
      throw new Error("Current user email not found");
    }

    const invitedEmail = email.trim().toLowerCase();

    if (!invitedEmail) {
      throw new Error("Email is required");
    }

    // Check current user's access
    const currentUserRoom = await adminDb
      .collection("users")
      .doc(currentUserEmail)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!currentUserRoom.exists) {
      throw new Error("You don't have access to this document");
    }

    // Add invited user as editor
    await adminDb
      .collection("users")
      .doc(invitedEmail)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: invitedEmail,
        role: "editor",
        createdAt: new Date(),
        roomId,
      });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error inviting user:", error);

    return {
      success: false,
    };
  }
}

export async function removeUserFromDocument(
  roomId: string,
  email: string
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get current user
    const user = await currentUser();

    const currentUserEmail =
      user?.emailAddresses?.[0]?.emailAddress;

    if (!currentUserEmail) {
      throw new Error("Current user email not found");
    }

    const targetEmail = email.trim().toLowerCase();

    // Check current user
    const currentUserRoom = await adminDb
      .collection("users")
      .doc(currentUserEmail)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!currentUserRoom.exists) {
      throw new Error("You don't have access to this document");
    }

    // Only owner can remove users
    if (currentUserRoom.data()?.role !== "owner") {
      throw new Error("Only the owner can remove users");
    }

    // Check target user's room
    const targetRoom = await adminDb
      .collection("users")
      .doc(targetEmail)
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!targetRoom.exists) {
      throw new Error("User is not a member of this document");
    }

    // Don't allow owner to remove themselves
    if (targetRoom.data()?.role === "owner") {
      throw new Error("Owner cannot be removed");
    }

    // Remove user
    await adminDb
      .collection("users")
      .doc(targetEmail)
      .collection("rooms")
      .doc(roomId)
      .delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error removing user:", error);

    return {
      success: false,
    };
  }
}
