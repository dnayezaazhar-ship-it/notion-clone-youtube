"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useTransition } from "react";
import { createNewDocument } from "@/actions/action";

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
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