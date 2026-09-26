"use client";

import { getDocumentMembership } from "@/actions/action";
import { useRoom } from "@liveblocks/react/suspense";
import { useEffect, useState } from "react";

function useOwner() {
  const room = useRoom();
  const [owner, setOwner] = useState<{ roomId: string; value: boolean } | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    getDocumentMembership(room.id)
      .then(({ role }) => {
        if (!cancelled) {
          setOwner({ roomId: room.id, value: role === "owner" });
        }
      })
      .catch((error: unknown) => {
        console.error("Could not verify document ownership:", error);
        if (!cancelled) {
          setOwner({ roomId: room.id, value: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [room.id]);

  return owner?.roomId === room.id && owner.value;
}

export default useOwner;
