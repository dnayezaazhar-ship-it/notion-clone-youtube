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
  try {
    // Get authenticated Clerk user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get Liveblocks room
    const { room } = await req.json();

    if (!room) {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    // Get current Clerk user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const email =
      user.emailAddresses[0]?.emailAddress ?? "";

    const fullName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      email;

    const image = user.imageUrl;

    // Check whether the user belongs to this room
    const usersInRoom = await adminDb
      .collectionGroup("rooms")
      .where("userId", "==", email)
      .get();

    const userInRoom = usersInRoom.docs.find(
      (doc) => doc.id === room
    );

    if (!userInRoom) {
      return NextResponse.json(
        { message: "You are not in this room" },
        { status: 403 }
      );
    }

    // Create Liveblocks session
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: fullName,
        email,
        avatar: image,
      },
    });

    // Give the user full access to the room
    session.allow(room, session.FULL_ACCESS);

    const { body, status } = await session.authorize();

    return new Response(body, { status });
  } catch (error) {
    console.error("LIVEBLOCKS AUTH ERROR:", error);

    return NextResponse.json(
      {
        message: "Liveblocks authentication failed",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

