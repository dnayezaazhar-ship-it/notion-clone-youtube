"use client";

import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyDocuments } from "@/actions/action";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NewDocumentButton from "./NewDocumentButton";
import SidebarOption from "./SidebarOption";

type UserDocument = {
  id: string;
  role: "owner" | "editor";
  title: string;
};

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress
    .trim()
    .toLowerCase();
  const [result, setResult] = useState<{
    email: string;
    documents: UserDocument[];
    error?: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded || !email) {
      return () => {
        cancelled = true;
      };
    }

    getMyDocuments()
      .then((documents) => {
        if (!cancelled) {
          setResult({ email, documents });
        }
      })
      .catch((loadError: unknown) => {
        console.error("Could not load the user's documents:", loadError);
        if (!cancelled) {
          setResult({ email, documents: [], error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [email, isLoaded]);

  const userResult =
    result && result.email === email ? result : null;
  const documents = userResult?.documents ?? [];
  const loading = !isLoaded || (Boolean(email) && !userResult);
  const error = userResult?.error ?? false;
  const menuOptions = (
    <>
      {user && (
        <div className="flex w-full flex-col items-center px-4 py-1">
          <NewDocumentButton />
        </div>
      )}

      {!isLoaded || loading ? (
        <p role="status" className="mt-2 text-center text-sm text-gray-500">
          Loading documents...
        </p>
      ) : error ? (
        <p role="alert" className="mt-2 text-center text-sm text-destructive">
          Could not load your documents.
        </p>
      ) : !user ? (
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to view your documents.
        </p>
      ) : (
        <>
          {documents.filter((document) => document.role === "owner").length ===
          0 ? (
            <h2 className="mt-2 text-sm font-semibold text-gray-500">
              No documents found
            </h2>
          ) : (
            <div className="mt-2 w-full">
              <h2 className="mb-1 text-center text-sm font-semibold text-gray-500">
                My Documents
              </h2>
              {documents
                .filter((document) => document.role === "owner")
                .map((document) => (
                  <SidebarOption
                    key={document.id}
                    title={document.title}
                    href={`/doc/${document.id}`}
                  />
                ))}
            </div>
          )}

          {documents.some((document) => document.role === "editor") && (
            <div className="mt-2 px-4">
              <h2 className="text-center text-sm font-semibold text-gray-500">
                Shared with Me
              </h2>
              {documents
                .filter((document) => document.role === "editor")
                .map((document) => (
                  <SidebarOption
                    key={document.id}
                    title={document.title}
                    href={`/doc/${document.id}`}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="relative bg-gray-200 p-2 md:p-5">
      <Sheet>
        <SheetTrigger aria-label="Open navigation menu">
          <MenuIcon
            className="rounded-lg p-2 hover:opacity-30"
            size={40}
          />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="flex flex-col items-center justify-center py-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-1 flex flex-col space-y-1">{menuOptions}</div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:inline">{menuOptions}</div>
    </div>
  );
}
