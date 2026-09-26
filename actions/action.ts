"use server";

import { adminDb } from "@/firebase-admin";
import { auth, currentUser } from "@clerk/nextjs/server";
import liveblocks from "@/lib/liveblocks";

async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("A verified email address is required");
  }

  return { userId, user, email };
}

async function findRoomMembership(email: string, roomId: string) {
  const memberships = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", roomId)
    .get();

  return memberships.docs.find(
    (membership) =>
      typeof membership.data().userId === "string" &&
      membership.data().userId.trim().toLowerCase() === email
  );
}

export async function getDocument(roomId: string) {
  const { email } = await getAuthenticatedUser();
  const membership = await findRoomMembership(email, roomId);

  if (
    !membership ||
    (membership.data().role !== "owner" &&
      membership.data().role !== "editor")
  ) {
    throw new Error("You do not have access to this document");
  }

  const document = await adminDb.collection("documents").doc(roomId).get();

  if (!document.exists) {
    throw new Error("Document not found");
  }

  const title = document.data()?.title;

  return {
    title: typeof title === "string" ? title : "Untitled",
    role: membership.data().role as "owner" | "editor",
  };
}

export async function getMyDocuments() {
  const { email } = await getAuthenticatedUser();
  const memberships = await adminDb
    .collection("users")
    .doc(email)
    .collection("rooms")
    .get();

  const documents = await Promise.all(
    memberships.docs.map(async (membership) => {
      const roomId = membership.id;
      const roomData = membership.data();

      if (roomData.role !== "owner" && roomData.role !== "editor") {
        return null;
      }

      const document = await adminDb
        .collection("documents")
        .doc(roomId)
        .get();

      if (!document.exists) {
        return null;
      }

      const title = document.data()?.title;

      return {
        id: roomId,
        role: roomData.role,
        title: typeof title === "string" ? title : "Untitled",
      };
    })
  );

  return documents.filter((document) => document !== null);
}

export async function getDocumentMembers(roomId: string) {
  const { email } = await getAuthenticatedUser();
  const currentMembership = await findRoomMembership(email, roomId);

  if (!currentMembership) {
    throw new Error("You do not have access to this document");
  }

  const memberships = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", roomId)
    .get();

  return {
    isOwner: currentMembership.data().role === "owner",
    members: memberships.docs.flatMap((membership) => {
      const data = membership.data();

      if (
        typeof data.userId !== "string" ||
        (data.role !== "owner" && data.role !== "editor")
      ) {
        return [];
      }

      return [{ email: data.userId.trim().toLowerCase(), role: data.role }];
    }),
  };
}

export async function updateDocumentTitle(roomId: string, title: string) {
  const { email } = await getAuthenticatedUser();
  const membership = await findRoomMembership(email, roomId);

  if (!membership) {
    throw new Error("You do not have access to this document");
  }

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("A document title is required");
  }

  await adminDb.collection("documents").doc(roomId).update({
    title: trimmedTitle,
  });

  return { title: trimmedTitle };
}

export async function getDocumentMembership(roomId: string) {
  const { email } = await getAuthenticatedUser();
  const membership = await findRoomMembership(email, roomId);

  if (!membership) {
    throw new Error("You do not have access to this document");
  }

  return { role: membership.data().role };
}

export async function createNewDocument() {
  const { email } = await getAuthenticatedUser();
  const documentRef = adminDb.collection("documents").doc();
  const membershipRef = adminDb
    .collection("users")
    .doc(email)
    .collection("rooms")
    .doc(documentRef.id);
  const batch = adminDb.batch();

  batch.set(documentRef, { title: "New Doc" });
  batch.set(membershipRef, {
    userId: email,
    role: "owner",
    createdAt: new Date(),
    roomId: documentRef.id,
  });

  await batch.commit();

  return { docId: documentRef.id };
}

export async function deleteDocument(roomId: string) {
  try {
    const { email } = await getAuthenticatedUser();
    const membership = await findRoomMembership(email, roomId);

    if (!membership || membership.data().role !== "owner") {
      throw new Error("Only the document owner can delete it");
    }

    const documentRef = adminDb.collection("documents").doc(roomId);
    const document = await documentRef.get();

    if (!document.exists) {
      throw new Error("Document not found");
    }

    await liveblocks.deleteRoom(roomId);

    const memberships = await adminDb
      .collectionGroup("rooms")
      .where("roomId", "==", roomId)
      .get();
    const batch = adminDb.batch();

    memberships.docs.forEach((room) => batch.delete(room.ref));
    batch.delete(documentRef);
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false };
  }
}

export async function inviteUserToDocument(
  roomId: string,
  email: string
) {
  try {
    const { email: currentUserEmail } = await getAuthenticatedUser();
    const currentMembership = await findRoomMembership(
      currentUserEmail,
      roomId
    );

    if (!currentMembership || currentMembership.data().role !== "owner") {
      throw new Error("Only the document owner can invite users");
    }

    const invitedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedEmail)) {
      throw new Error("A valid email address is required");
    }

    if (invitedEmail === currentUserEmail) {
      throw new Error("The document owner already has access");
    }

    const existingMembership = await findRoomMembership(
      invitedEmail,
      roomId
    );

    if (existingMembership) {
      return { success: true };
    }

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

    return { success: true };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { success: false };
  }
}

export async function removeUserFromDocument(
  roomId: string,
  email: string
) {
  try {
    const { email: currentUserEmail } = await getAuthenticatedUser();
    const currentMembership = await findRoomMembership(
      currentUserEmail,
      roomId
    );

    if (!currentMembership || currentMembership.data().role !== "owner") {
      throw new Error("Only the document owner can remove users");
    }

    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail || targetEmail === currentUserEmail) {
      throw new Error("The document owner cannot be removed");
    }

    const targetMembership = await findRoomMembership(targetEmail, roomId);

    if (!targetMembership || targetMembership.data().role === "owner") {
      throw new Error("The document owner cannot be removed");
    }

    await targetMembership.ref.delete();

    return { success: true };
  } catch (error) {
    console.error("Error removing user:", error);
    return { success: false };
  }
}
