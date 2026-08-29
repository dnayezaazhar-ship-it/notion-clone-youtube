// vedio code"use client";

/*import { useRoom } from "@liveblocks/react/suspense";
import { useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);

  const style = `hover:text-white ${
    darkMode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-"
  }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 justify-end mb-10">
        {/* TranslateDocument AI */}
        {/* ChatToDocument AI */}

        {/* Dark Mode */}
        /*<Button className={style} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>

      */
//gpt code



"use client";

import { useRoom } from "@liveblocks/react/suspense";
import { useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

function Editor() {
  const room = useRoom();

  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkMode, setDarkMode] = useState(false);

  const style = darkMode
    ? "text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white"
    : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-black";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex items-center justify-end gap-2">
        {/* TranslateDocument AI */}
        {/* ChatToDocument AI */}

        {/* Dark Mode */}
        <Button
          className={style}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </Button>
      </div>

      {/* BlockNote */}
    </div>
  );
}

export default Editor;
