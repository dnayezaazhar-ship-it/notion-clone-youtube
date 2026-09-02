/*"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import TranslateDocument from "./TranslateDocument";

function Editor() {
  const [darkMode, setDarkMode] = useState(false);

  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      field: "document-store",
    }
  );

  const buttonStyle = darkMode
    ? "text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white"
    : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-black";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-10 flex items-center justify-end gap-2">
        <TranslateDocument doc={doc}/>

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

      <div className="relative mx-auto w-full max-w-6xl">
        <BlockNoteView
          className="min-h-screen"
          editor={editor}
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </div>
  );
}

export default Editor;*/






/*"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import TranslateDocument from "./TranslateDocument";
import ChatToDocument from "./ChatToDocument";

function Editor() {
  const [darkMode, setDarkMode] = useState(false);

  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      collaborationMode: "liveblocks",
      field: "document",
    }
  );

  if (!editor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading document...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-6 flex items-center justify-end gap-2">
        <TranslateDocument editor={editor} />

        <ChatToDocument editor={editor} />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? (
            <SunIcon size={18} />
          ) : (
            <MoonIcon size={18} />
          )}
        </Button>
      </div>

      <div className="w-full">
        <BlockNoteView
          editor={editor}
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </div>
  );
}

export default Editor;*/

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import TranslateDocument from "./TranslateDocument";
import ChatToDocument from "./ChatToDocument";

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
        <p className="text-sm text-gray-500">
          Loading document...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-6 flex items-center justify-end gap-2">
        <TranslateDocument editor={editor} />

        <ChatToDocument editor={editor} />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? (
            <SunIcon size={18} />
          ) : (
            <MoonIcon size={18} />
          )}
        </Button>
      </div>

      <div className="w-full">
        <BlockNoteView
          editor={editor}
          theme={darkMode ? "dark" : "light"}
        />
      </div>
    </div>
  );
}

export default Editor;