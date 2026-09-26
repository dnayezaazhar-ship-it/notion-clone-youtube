"use client";

import { FormEvent, useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { BlockNoteEditor } from "@blocknote/core";

type Language =
  | "english"
  | "spanish"
  | "portuguese"
  | "french"
  | "german"
  | "chinese"
  | "arabic"
  | "hindi"
  | "russian"
  | "japanese";

const languages: Language[] = [
  "english",
  "spanish",
  "portuguese",
  "french",
  "german",
  "chinese",
  "arabic",
  "hindi",
  "russian",
  "japanese",
];

type TranslateDocumentProps = {
  editor: BlockNoteEditor;
};

function TranslateDocument({ editor }: TranslateDocumentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [translation, setTranslation] = useState("");
  const [language, setLanguage] = useState<Language | "">("");
  const [isPending, startTransition] = useTransition();

  const handleTranslate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!language) {
      toast.error("Please select a language");
      return;
    }

    if (!editor) {
      toast.error("Editor is not ready");
      return;
    }

    startTransition(async () => {
      try {
        const blocks = editor.document;

        if (!Array.isArray(blocks) || blocks.length === 0) {
          toast.error("There is no document content to translate.");
          return;
        }

        const textParts: string[] = [];

        for (const block of blocks) {
          if (!block) continue;

          const content = block.content;

          if (!Array.isArray(content)) continue;

          for (const item of content) {
            if (!item) continue;

            if (typeof item === "string") {
              textParts.push(item);
            } else if (
              typeof item === "object" &&
              "text" in item &&
              typeof item.text === "string"
            ) {
              textParts.push(item.text);
            }
          }
        }

        const documentData = textParts.join(" ").trim();

        if (!documentData) {
          toast.error("There is no text in the document to translate.");
          return;
        }

        const response = await fetch("/translateDocument", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentData,
            targetLang: language,
          }),
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Translation request failed: ${response.status} ${responseText}`
          );
        }

        let data: {
          translated_text?: string;
          error?: string;
          details?: string;
        };

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Invalid response received from translation server."
          );
        }

        if (!data.translated_text) {
          throw new Error(
            data.error ||
              data.details ||
              "No translated text was returned."
          );
        }

        setTranslation(data.translated_text);

        toast.success("Document translated successfully!");
      } catch (error) {
        console.error("Translation error:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Translation failed"
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <LanguagesIcon size={18} />
          Translate
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Translate the Document</DialogTitle>

          <DialogDescription>
            Select a language and AI will translate the document
            into the selected language.
          </DialogDescription>
        </DialogHeader>

        {/* GPT SAYS - MIDDLE */}
        {(isPending || translation) && (
          <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto rounded-md bg-gray-100 p-5">
            <div className="flex items-center gap-2">
              <BotIcon className="h-8 w-8 shrink-0" />

              <p className="font-bold">
                GPT Says:
              </p>
            </div>

            {isPending ? (
              <p className="text-sm text-gray-600">
                GPT is thinking...
              </p>
            ) : (
              <div className="text-sm text-gray-700">
                <Markdown>{translation}</Markdown>
              </div>
            )}
          </div>
        )}

        {/* LANGUAGE FORM - BOTTOM */}
        <form
          onSubmit={handleTranslate}
          className="mt-2 flex items-center gap-2"
        >
          <Select
            value={language}
            onValueChange={(value) =>
              setLanguage(value as Language)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Language" />
            </SelectTrigger>

            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  <span className="capitalize">
                    {lang}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={!language || isPending}
          >
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TranslateDocument;
