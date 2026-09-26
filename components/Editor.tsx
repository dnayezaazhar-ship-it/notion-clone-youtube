"use client";

import { useState } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatToDocument from "./ChatToDocument";
import TranslateDocument from "./TranslateDocument";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

function Editor() {
  const [darkMode, setDarkMode] = useState(false);
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      collaborationMode: "liveblocks",
      field: "document",
      offlineSupport_experimental: true,
    }
  );

  if (!editor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p role="status" className="text-sm text-gray-500">
          Loading document...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-0 sm:px-4">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2 sm:mb-6">
        <TranslateDocument editor={editor} />
        <ChatToDocument editor={editor} />

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={darkMode ? "Use light theme" : "Use dark theme"}
          onClick={() => setDarkMode((previous) => !previous)}
        >
          {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </Button>
      </div>

      <BlockNoteView
        className="min-h-screen"
        editor={editor}
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default Editor;
