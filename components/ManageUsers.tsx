/*"use client";

import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import useOwner from "@/lib/useOwner";
import { useCollection } from "react-firebase-hooks/firestore";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { deleteUser, removeUserFromDocument } from "@/actions/action";
import { toast } from "sonner";

function ManageUsers() {
  const { user } = useUser();
  const { isOwner } = useOwner();

  const pathname = usePathname();
  const roomId = pathname.split("/").pop();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [usersInRoom] = useCollection(
    user && roomId
      ? query(
          collectionGroup(db, "rooms"),
          where("roomId", "==", roomId)
        )
      : undefined
  );

 const handleDelete = (userId: string) => {
  startTransition(async () => {
    if (!user) return;

    const { success } = await removeUserFromDocument(room.id, userId);

    if (success) {
      toast.success("User removed from room successfully!");
    } else {
      toast.error("Failed to remove user from room!");
    }
  });
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Users ({usersInRoom?.docs.length || 0})
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>

          <DialogDescription>
            Below is a list of users who have access to this document.
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="space-y-3">
          {usersInRoom?.docs.map((doc) => {
            const data = doc.data();

            return (
              <div
                key={data.userId}
                className="flex items-center justify-between"
              >
                <p className="font-light">
                  {data.userId === user?.primaryEmailAddress?.emailAddress
                    ? `You (${data.userId})`
                    : data.userId}
                </p>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    {data.role}
                  </Button>

                  {isOwner &&
                    data.userId !==
                      user?.primaryEmailAddress?.emailAddress && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(data.userId)}
                        disabled={isPending}
                        size="sm"
                      >
                        {isPending ? "Removing..." : "X"}
                      </Button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;*/

"use client";

import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCollection } from "react-firebase-hooks/firestore";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { removeUserFromDocument } from "@/actions/action";
import { toast } from "sonner";

function ManageUsers() {
  const { user } = useUser();

  const pathname = usePathname();
  const roomId = pathname.split("/").pop();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [usersInRoom] = useCollection(
    user && roomId
      ? query(
          collectionGroup(db, "rooms"),
          where("roomId", "==", roomId)
        )
      : undefined
  );

  // Current user's email
  const currentUserEmail =
    user?.primaryEmailAddress?.emailAddress;

  // Find current user's room data
  const currentUserRoom = usersInRoom?.docs.find(
    (doc) => doc.data().userId === currentUserEmail
  );

  // Check if current user is owner
  const isCurrentUserOwner =
    currentUserRoom?.data().role === "owner";

  const handleDelete = (email: string) => {
    if (!roomId) {
      toast.error("Room ID not found");
      return;
    }

    startTransition(async () => {
      const { success } = await removeUserFromDocument(
        roomId,
        email
      );

      if (success) {
        toast.success("User removed from room successfully!");
      } else {
        toast.error("Failed to remove user from room!");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Users ({usersInRoom?.docs.length || 0})
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>

          <DialogDescription>
            Below is a list of users who have access to this document.
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="space-y-3">
          {usersInRoom?.docs.map((doc) => {
            const data = doc.data();

            return (
              <div
                key={data.userId}
                className="flex items-center justify-between"
              >
                <p className="font-light">
                  {data.userId === currentUserEmail
                    ? `You (${data.userId})`
                    : data.userId}
                </p>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    {data.role}
                  </Button>

                  {isCurrentUserOwner &&
                    data.userId !== currentUserEmail && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(data.userId)}
                        disabled={isPending}
                        size="sm"
                      >
                        {isPending ? "Removing..." : "X"}
                      </Button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
