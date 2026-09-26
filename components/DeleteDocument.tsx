"use client";

import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePathname, useRouter } from "next/navigation";
import { deleteDocument } from "@/actions/action";
import { toast } from "sonner";

function DeleteDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const router = useRouter();

  const handleDelete = () => {
    const roomId = pathname.split("/").pop();

    if (!roomId) return;

    startTransition(async () => {
      try {
        const { success } = await deleteDocument(roomId);

        if (success) {
          setIsOpen(false);
          router.replace("/");
          toast.success("Document deleted.");
        } else {
          toast.error("Could not delete the document. Only its owner can delete it.");
        }
      } catch (deleteError) {
        console.error("Failed to delete document:", deleteError);
        toast.error("Could not delete the document.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">Delete</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>

          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            document and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>

          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDocument;
