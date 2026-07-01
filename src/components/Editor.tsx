"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link, 
  Unlink, 
  Eye, 
  EyeOff,
  CloudLightning,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { updateChapter } from "@/lib/actions/chapterActions";

interface EditorProps {
  chapterId: string;
  initialContent: string;
  initialTitle: string;
  onSaveSuccess?: (wordCount: number) => void;
  onFocusModeToggle?: (isFocusMode: boolean) => void;
}

export function Editor({ 
  chapterId, 
  initialContent, 
  initialTitle, 
  onSaveSuccess,
  onFocusModeToggle 
}: EditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [focusMode, setFocusMode] = useState(false);
  const [words, setWords] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const isFirstRender = useRef(true);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your masterpiece here...",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[450px] font-sans prose prose-neutral max-w-none text-black",
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus("unsaved");
      calculateStats(editor.getText());
    },
  });

  // Calculate stats (Word Count and Reading Time)
  const calculateStats = (text: string) => {
    const cleanText = text.trim();
    const wordList = cleanText === "" ? [] : cleanText.split(/\s+/);
    setWords(wordList.length);
    setReadingTime(Math.ceil(wordList.length / 200)); // 200 wpm
  };

  // Reset editor content when chapterId changes
  useEffect(() => {
    if (editor && chapterId) {
      editor.commands.setContent(initialContent);
      setTitle(initialTitle);
      calculateStats(editor.getText());
      setSaveStatus("saved");
      isFirstRender.current = true;
    }
  }, [chapterId, initialContent, initialTitle, editor]);

  // Debounced Autosave Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (saveStatus !== "unsaved") return;

    setSaveStatus("saving");
    const saveTimeout = setTimeout(async () => {
      if (!editor) return;
      const htmlContent = editor.getHTML();
      
      try {
        await updateChapter(chapterId, {
          title,
          content: htmlContent,
          wordCount: words,
        });
        setSaveStatus("saved");
        if (onSaveSuccess) onSaveSuccess(words);
      } catch (err) {
        console.error("Autosave failed:", err);
        setSaveStatus("unsaved"); // Revert to unsaved so we try again
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(saveTimeout);
  }, [saveStatus, chapterId, title, words, editor, onSaveSuccess]);

  // Update chapter title immediately
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus("unsaved");
  };

  // Focus Mode Toggle
  const toggleFocusMode = () => {
    const nextMode = !focusMode;
    setFocusMode(nextMode);
    if (onFocusModeToggle) {
      onFocusModeToggle(nextMode);
    }
  };

  if (!editor) return null;

  // Insert Link Prompt
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={`flex flex-col border-4 border-black bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${focusMode ? "fixed inset-4 z-40" : ""}`}>
      {/* Editor Title Banner */}
      <div className="border-b-4 border-black p-4 bg-nb-cyan flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="bg-transparent border-none outline-none font-display font-black text-xl md:text-2xl text-black placeholder-neutral-700 w-2/3"
          placeholder="Untitled Chapter"
        />
        
        {/* Autosave Status / Focus Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-nb-green fill-nb-green" />
                <span className="text-neutral-700">Saved</span>
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-nb-pink animate-spin" />
                <span className="text-neutral-700">Saving</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <CloudLightning className="w-3.5 h-3.5 text-nb-yellow fill-nb-yellow" />
                <span className="text-neutral-700">Draft</span>
              </>
            )}
          </div>

          <button
            onClick={toggleFocusMode}
            className="nb-btn text-xs bg-white py-1 px-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
            title="Toggle Focus Mode"
          >
            {focusMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Focus Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="border-b-4 border-black bg-neutral-50 p-2.5 flex flex-wrap gap-1 items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {/* Text Style */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("bold") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("italic") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("strike") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Strike"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="h-6 w-0.5 bg-black mx-1" />

          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("heading", { level: 1 }) ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("heading", { level: 2 }) ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("heading", { level: 3 }) ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="h-6 w-0.5 bg-black mx-1" />

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("bulletList") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("orderedList") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("blockquote") ? "bg-nb-yellow font-black" : "bg-white"}`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="h-6 w-0.5 bg-black mx-1" />

          {/* Links */}
          <button
            onClick={setLink}
            className={`p-1.5 border-2 border-black hover:bg-neutral-200 ${editor.isActive("link") ? "bg-nb-yellow" : "bg-white"}`}
            title="Insert Link"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-200 disabled:opacity-50"
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-200"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-200"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] md:max-h-[65vh]">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer (Counts) */}
      <div className="border-t-4 border-black bg-neutral-50 px-4 py-3 flex justify-between items-center text-xs font-black uppercase text-neutral-600">
        <div>
          <span>Words: <strong className="text-black font-black">{words}</strong></span>
          <span className="mx-2 text-neutral-300">|</span>
          <span>Read Time: <strong className="text-black font-black">{readingTime} min{readingTime !== 1 && "s"}</strong></span>
        </div>
        <div className="text-neutral-400 font-bold text-[10px]">
          Press Ctrl + Enter to manually save
        </div>
      </div>
    </div>
  );
}
