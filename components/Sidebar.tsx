"use client";

import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import {
  collectionGroup,
  query,
  where,
  DocumentData,
} from "firebase/firestore";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import NewDocumentButton from "./NewDocumentButton";
import SidebarOption from "./SidebarOption";
import { db } from "@/firebase";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
  id: string;
}

export default function Sidebar() {
  const { user } = useUser();

  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });

  const [data, loading, error] = useCollection(
    user
      ? query(
          collectionGroup(db, "rooms"),
          where(
            "userId",
            "==",
            user.emailAddresses[0]?.emailAddress
          )
        )
      : null
  );

  useEffect(() => {
    if (!data) return;

    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;

        const document: RoomDocument = {
          ...roomData,
          id: curr.id,
        };

        if (roomData.role === "owner") {
          acc.owner.push(document);
        } else {
          acc.editor.push(document);
        }

        return acc;
      },
      {
        owner: [],
        editor: [],
      }
    );

    setGroupedData(grouped);
  }, [data]);

  const menuOptions = (
    <>
      <div className="flex w-full flex-col items-center px-4 py-1">
        <NewDocumentButton />

        {groupedData.owner.length === 0 ? (
          <h2 className="mt-2 text-sm font-semibold text-gray-500">
            No documents found
          </h2>
        ) : (
          <div className="mt-2 w-full">
            <h2 className="mb-1 text-center text-sm font-semibold text-gray-500">
              My Documents
            </h2>

            <div className="w-full">
              {groupedData.owner.map((doc) => (
                <SidebarOption
                  key={doc.id}
                  id={doc.id}
                  href={`/doc/${doc.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {groupedData.editor.length > 0 && (
        <div className="mt-2 px-4">
          <h2 className="text-sm font-semibold text-gray-500">
            Shared with Me
          </h2>

          {groupedData.editor.map((doc) => (
            <SidebarOption
              key={doc.id}
              id={doc.id}
              href={`/doc/${doc.id}`}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="relative bg-gray-200 p-2 md:p-5">
      {/* Mobile */}
      <Sheet>
        <SheetTrigger>
          <MenuIcon
            className="rounded-lg p-2 hover:opacity-30"
            size={40}
          />
        </SheetTrigger>

        <SheetContent side="left">
          <SheetHeader className="flex flex-col items-center justify-center py-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="mt-1 flex flex-col space-y-1">
            {menuOptions}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <div className="hidden md:inline">
        {menuOptions}
      </div>
    </div>
  );
}