"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { getDocumentMembers, removeUserFromDocument } from "@/actions/action";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Member = {
  email: string;
  role: "owner" | "editor";
};

function ManageUsers() {
  const pathname = usePathname();
  const roomId = pathname.split("/").pop() ?? "";
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    roomId: string;
    isOwner: boolean;
    members: Member[];
  } | null>(null);
  const [error, setError] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!roomId) return;

    try {
      const data = await getDocumentMembers(roomId);
      setResult({ roomId, ...data });
      setError(false);
    } catch (loadError) {
      console.error("Could not load document members:", loadError);
      setError(true);
    }
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;

    if (!roomId) return;

    getDocumentMembers(roomId)
      .then((data) => {
        if (!cancelled) {
          setResult({ roomId, ...data });
          setError(false);
        }
      })
      .catch((loadError: unknown) => {
        console.error("Could not load document members:", loadError);
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const currentResult = result?.roomId === roomId ? result : null;

  const handleDelete = (email: string) => {
    startTransition(async () => {
      const response = await removeUserFromDocument(roomId, email);

      if (response.success) {
        toast.success("User removed from document.");
        await loadMembers();
      } else {
        toast.error("Could not remove this user.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Users ({currentResult?.members.length ?? 0})
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
          {!currentResult && !error && (
            <p role="status">Loading document members...</p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              Could not load document members.
            </p>
          )}
          {currentResult?.members.length === 0 && (
            <p>No collaborators found.</p>
          )}
          {currentResult?.members.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between"
            >
              <p className="font-light">{member.email}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  {member.role}
                </Button>
                {currentResult.isOwner && member.role !== "owner" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(member.email)}
                    disabled={isPending}
                    size="sm"
                  >
                    {isPending ? "Removing..." : "X"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
