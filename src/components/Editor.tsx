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
    setReadingTime(Math.ceil(wordList.length / 200));
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
        setSaveStatus("unsaved");
      }
    }, 2000);

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

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    title, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    title: string; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`p-1.5 border-2 border-black transition-all nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 hover:nb-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs ${isActive ? "bg-[var(--color-nb-yellow)]" : "bg-white hover:bg-neutral-100"}`}
      title={title}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-5 bg-black/30 mx-0.5 shrink-0" />
  );

  return (
    <div className={`flex flex-col border-4 border-black bg-white nb-shadow-lg ${focusMode ? "fixed inset-4 z-50" : ""}`}>
      {/* Editor Title Banner */}
      <div className="border-b-4 border-black px-4 py-2 bg-[var(--color-nb-cyan)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="bg-transparent border-none outline-none font-display font-black text-lg text-black placeholder-neutral-700 min-w-0 flex-1"
            placeholder="Untitled Chapter"
          />
        </div>
        
        {/* Autosave Status / Focus Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase nb-shadow-xs">
            {saveStatus === "saved" && (
              <>
                <CheckCircle className="w-3 h-3 text-[var(--color-nb-green)]" />
                <span className="text-neutral-600">Saved</span>
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="w-3 h-3 text-[var(--color-nb-pink)] animate-spin" />
                <span className="text-neutral-600">Saving</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <CloudLightning className="w-3 h-3 text-[var(--color-nb-yellow)]" />
                <span className="text-neutral-600">Draft</span>
              </>
            )}
          </div>

          <button
            onClick={toggleFocusMode}
            className="nb-btn-xs bg-white flex items-center gap-1"
            title="Toggle Focus Mode"
          >
            {focusMode ? (
              <><EyeOff className="w-3 h-3" /><span>Exit Focus</span></>
            ) : (
              <><Eye className="w-3 h-3" /><span>Focus</span></>
            )}
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="border-b-4 border-black bg-neutral-50 px-2.5 py-2 flex flex-wrap gap-1 items-center">
        {/* Text Style */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Headings */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
            <Heading1 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Lists & Quote */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Blockquote">
            <Quote className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* Links */}
        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Insert Link">
            <Link className="w-3.5 h-3.5" />
          </ToolbarButton>
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-all nb-shadow-xs"
            title="Remove Link"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex gap-0.5 items-center">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 hover:nb-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs transition-all"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 hover:nb-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs transition-all"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] md:max-h-[65vh]">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer (Counts) */}
      <div className="border-t-4 border-black bg-neutral-50 px-4 py-2.5 flex justify-between items-center text-[10px] font-black uppercase text-neutral-500">
        <div className="flex items-center gap-2">
          <span>{words.toLocaleString()} <span className="text-neutral-400 font-bold">words</span></span>
          <span className="text-neutral-300">|</span>
          <span>{readingTime} min <span className="text-neutral-400 font-bold">read</span></span>
        </div>
        <div className="text-neutral-400 font-bold">
          Ctrl + Enter to save
        </div>
      </div>
    </div>
  );
}