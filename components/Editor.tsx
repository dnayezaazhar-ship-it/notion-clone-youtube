"use client";

import { useRoom, useSelf } from "@liveblocks/react/suspense";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";

import { LiveblocksYjsProvider } from "@liveblocks/yjs";

import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkMode: boolean;
  userName: string;
};

function BlockNoteEditor({
  doc,
  provider,
  darkMode,
  userName,
}: EditorProps) {
  const collaborationConfig = useMemo(
    () => ({
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userName,
        color: "#F5E6D3",
      },
      showCursorLabels: "activity" as const,
    }),
    [doc, provider, userName]
  );

  const editor = useCreateBlockNote(
    {
      collaboration: collaborationConfig,
    },
    [collaborationConfig]
  );

  useEffect(() => {
    provider.connect();

    return () => {
      provider.disconnect();
    };
  }, [provider]);

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

function Editor() {
  const room = useRoom();

  const userInfo = useSelf((me) => me.info);

  const [darkMode, setDarkMode] = useState(false);

  /*
   * Create Y.Doc only once for this room.
   */
  const doc = useMemo(() => {
    return new Y.Doc();
  }, [room]);

  /*
   * Create Liveblocks Yjs provider only once.
   */
  const provider = useMemo(() => {
    return new LiveblocksYjsProvider(room, doc);
  }, [room, doc]);

  /*
   * Cleanup when room changes/unmounts.
   */
  useEffect(() => {
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [provider, doc]);

  const userName = userInfo?.name ?? "Anonymous";

  const buttonStyle = darkMode
    ? "text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white"
    : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-black";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-center justify-end gap-2">
        <Button
          type="button"
          className={buttonStyle}
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? (
            <SunIcon size={18} />
          ) : (
            <MoonIcon size={18} />
          )}
        </Button>
      </div>

      <BlockNoteEditor
        doc={doc}
        provider={provider}
        darkMode={darkMode}
        userName={userName}
      />
    </div>
  );
}

export default Editor;
