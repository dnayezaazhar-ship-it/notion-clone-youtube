"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { getDocument, updateDocumentTitle } from "@/actions/action";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Editor from "./Editor";
import DeleteDocument from "./DeleteDocument";
import InviteUser from "./InviteUser";
import ManageUsers from "./ManageUsers";
import Avatars from "./Avatars";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "sonner";

type DocumentData = {
  title: string;
  role: "owner" | "editor";
};

function Document({ id }: { id: string }) {
  const [result, setResult] = useState<{
    id: string;
    data?: DocumentData;
    error?: boolean;
  } | null>(null);
  const [titleDraft, setTitleDraft] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [isUpdating, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    getDocument(id)
      .then((document) => {
        if (!cancelled) {
          setResult({ id, data: document });
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load document:", error);
        if (!cancelled) {
          setResult({ id, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const currentResult = result?.id === id ? result : null;
  const data = currentResult?.data;
  const loading = !currentResult;
  const loadError = currentResult?.error ?? false;
  const input =
    titleDraft?.id === id ? titleDraft.value : data?.title ?? "";

  const updateTitle = (event: FormEvent) => {
    event.preventDefault();

    const title = input.trim();

    if (!title) {
      toast.error("A document title is required.");
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updateDocumentTitle(id, title);
        setResult((current) =>
          current?.id === id && current.data
            ? {
                id,
                data: { ...current.data, title: updated.title },
              }
            : current
        );
        setTitleDraft(null);
        toast.success("Document title updated.");
      } catch (error) {
        console.error("Error updating document title:", error);
        toast.error("Could not update the document title.");
      }
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (loadError || !data) {
    return (
      <p role="alert" className="p-5 text-center text-destructive">
        Could not load this document. It may not exist, or your account may not
        have access.
      </p>
    );
  }

  return (
    <div className="h-full min-w-0 flex-1 bg-white p-3 sm:p-5">
      <div className="mx-auto flex max-w-6xl justify-between pb-5">
        <form
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-1"
          onSubmit={updateTitle}
        >
          <Input
            aria-label="Document title"
            className="min-w-0"
            value={input}
            onChange={(event) =>
              setTitleDraft({ id, value: event.target.value })
            }
          />
          <Button disabled={isUpdating} type="submit">
            {isUpdating ? "Updating..." : "Update"}
          </Button>
          {data.role === "owner" && (
            <div className="col-span-2 flex min-w-0 gap-2 sm:contents">
              <InviteUser />
              <DeleteDocument />
            </div>
          )}
        </form>
      </div>

      <div className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <ManageUsers />
        <Avatars />
      </div>
      <hr className="pb-10" />
      <Editor />
    </div>
  );
}

export default Document;
