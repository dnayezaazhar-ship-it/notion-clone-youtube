"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { createNewDocument } from "@/actions/action";
import { toast } from "sonner";

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      try {
        const { docId } = await createNewDocument();
        router.push(`/doc/${docId}`);
      } catch (error) {
        console.error("Failed to create document:", error);
        toast.error("Could not create a document. Please sign in and try again.");
      }
    });
  };

  return (
  <Button
    onClick={handleCreateNewDocument}
    disabled={isPending}
    className="rounded-none"
  >
    {isPending ? "Creating..." : "New Document"}
  </Button>
);
}

export default NewDocumentButton;