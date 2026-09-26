//orignal vedio code 
/*import adminDb from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  auth().protect(); // Ensure the user is authenticated

  const { sessionClaims } = await auth();
  const { room } = await req.json();

  const session = liveblocks.prepareSession(sessionClaims?.email!, {
    userInfo: {
      name: sessionClaims?.fullName!,
      email: sessionClaims?.email!,
      avatar: sessionClaims?.image!,
    },
  });

  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", sessionClaims?.email)
    .get();

  const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);
  if (userInRoom?.exists) {
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();

    return new Response(body, { status });
} else {
    return NextResponse.json(
        { message: "You are not in this room" },
        { status: 403 }
    );
}*/


//updated gpt code 

/*import {adminDb} from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sessionClaims, userId } = await auth();

  // Ensure user is authenticated
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { room } = await req.json();

  const email = sessionClaims?.email as string;
  const fullName = sessionClaims?.fullName as string;
  const image = sessionClaims?.image as string;

  const session = liveblocks.prepareSession(email, {
    userInfo: {
      name: fullName,
      email: email,
      avatar: image,
    },
  });

  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", email)
    .get();

  const userInRoom = usersInRoom.docs.find(
    (doc) => doc.id === room
  );

  if (userInRoom?.exists) {
    session.allow(room, session.FULL_ACCESS);

    const { body, status } = await session.authorize();

    return new Response(body, { status });
  }

  return NextResponse.json(
    { message: "You are not in this room" },
    { status: 403 }
  );
}*/



import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("room" in body) ||
    typeof body.room !== "string" ||
    !body.room.trim()
  ) {
    return NextResponse.json({ message: "Room ID is required" }, { status: 400 });
  }

  const roomId = body.room.trim();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const email = user.primaryEmailAddress?.emailAddress.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { message: "An account email is required" },
      { status: 403 }
    );
  }

  const memberships = await adminDb
    .collectionGroup("rooms")
    .where("roomId", "==", roomId)
    .get();
  const membership = memberships.docs.find(
    (document) =>
      typeof document.data().userId === "string" &&
      document.data().userId.trim().toLowerCase() === email
  );
  const role = membership?.data().role;

  if (!membership || (role !== "owner" && role !== "editor")) {
    return NextResponse.json(
      { message: "You are not a member of this room" },
      { status: 403 }
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || email;
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: fullName,
      email,
      avatar: user.imageUrl,
    },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const authorization = await session.authorize();
  return new Response(authorization.body, { status: authorization.status });
}
