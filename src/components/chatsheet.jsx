// src/components/ChatSheet.jsx
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import PersistentChat from "@/components/PersistentChat";

// Optional: You can pass props to control styling or initial chat state if needed
export default function ChatSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat with AI
        </Button>
      </SheetTrigger>

      {/* p-0 removes padding so PersistentChat can use full width/height */}
      <SheetContent
        side="right"
        className="p-0 flex flex-col overflow-hidden w-full max-w-md"
      >
        <div className="h-full max-h-screen overflow-hidden">
          <PersistentChat />
        </div>
      </SheetContent>
    </Sheet>
  );
}
