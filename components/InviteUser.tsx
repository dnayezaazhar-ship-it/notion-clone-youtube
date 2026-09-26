"use client";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { inviteUserToDocument } from "@/actions/action";
import { toast } from "sonner";
import { Input } from "./ui/input";

function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    const roomId = pathname.split("/").pop();
    if (!roomId) {
      toast.error("Could not determine the document to share.");
      return;
    }

    startTransition(async () => {
      try {
        const { success } = await inviteUserToDocument(roomId, email);

        if (success) {
          setIsOpen(false);
          setEmail("");
          toast.success("User added to the document.");
        } else {
          toast.error("Could not invite this user. Check the email and your access.");
        }
      } catch (inviteError) {
        console.error("Failed to invite user:", inviteError);
        toast.error("Could not invite this user.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">Invite</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a User to collaborate!</DialogTitle>

          <DialogDescription>
            Enter the email of the user you want to invite.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-w-0 flex-col gap-2 sm:flex-row" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </form>

      </DialogContent>
    </Dialog>
  );
}

export default InviteUser;