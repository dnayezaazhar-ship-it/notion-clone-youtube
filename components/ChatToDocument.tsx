"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { MessageCircleCode, BotIcon } from "lucide-react";

import { BlockNoteEditor } from "@blocknote/core";
import Markdown from "react-markdown";

type ChatToDocumentProps = {
  editor: BlockNoteEditor;
};

function ChatToDocument({ editor }: ChatToDocumentProps) {
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const currentQuestion = input;

    setQuestion(currentQuestion);
    setInput("");
    setAnswer("");

    startTransition(async () => {
      try {
        // Get current document data from BlockNote
        const documentData = JSON.stringify(editor.document);

        const response = await fetch("/chatToDocument", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentData,
            question: currentQuestion,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Something went wrong"
          );
        }

        setAnswer(data.message || "No answer received.");
      } catch (error) {
        console.error("Chat error:", error);

        setAnswer(
          error instanceof Error
            ? error.message
            : "Failed to get an answer."
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Chat to Document">
          <MessageCircleCode className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Chat to Document</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Chat to Document</DialogTitle>

          <DialogDescription>
            Ask a question and chat with your document using AI.
          </DialogDescription>
        </DialogHeader>

        <hr />

        {/* Question */}
        {question && (
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Q:</span> {question}
            </p>
          </div>
        )}

        {/* GPT Answer */}
        {(answer || isPending) && (
          <div className="flex max-h-96 gap-3 overflow-y-auto rounded-md bg-gray-100 p-5">
            <BotIcon className="h-6 w-6 shrink-0" />

            <div className="flex-1">
              <p className="font-bold">
                GPT {isPending ? "is thinking..." : "Says:"}
              </p>

              <div className="mt-2 text-sm">
                {isPending ? (
                  <p>Thinking...</p>
                ) : (
                  <Markdown>{answer}</Markdown>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Form */}
        <form
          className="flex min-w-0 flex-col gap-2 sm:flex-row"
          onSubmit={handleAskQuestion}
        >
          <Input
            type="text"
            placeholder="e.g. What is this document about?"
            className="w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isPending}
          />

          <Button
            type="submit"
            disabled={!input.trim() || isPending}
          >
            {isPending ? "Asking..." : "Ask"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChatToDocument;
