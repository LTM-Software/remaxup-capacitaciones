"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import toast from "react-hot-toast";
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
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  Undo2,
  Redo2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { VideoNode, FileNode } from "./nodes";

async function uploadToMinio(
  file: File
): Promise<{ url: string; name: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("upload failed");
  return res.json();
}

const Btn = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "h-8 w-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 transition",
      active && "bg-slate-900 text-white hover:bg-slate-900"
    )}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }: { editor: Editor }) => {
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const onImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const id = toast.loading("Subiendo imagen...");
    try {
      const { url } = await uploadToMinio(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Imagen insertada", { id });
    } catch {
      toast.error("No se pudo subir la imagen", { id });
    }
  };

  const onFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const id = toast.loading("Subiendo archivo...");
    try {
      const { url, name } = await uploadToMinio(file);
      (editor.chain().focus() as any)
        .setFileEmbed({ url, name: name || file.name })
        .run();
      toast.success("Archivo insertado", { id });
    } catch {
      toast.error("No se pudo subir el archivo", { id });
    }
  };

  const onVideoFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const id = toast.loading("Subiendo video...");
    try {
      const { url } = await uploadToMinio(file);
      (editor.chain().focus() as any)
        .setVideo({ src: url })
        .run();
      toast.success("Video insertado", { id });
    } catch {
      toast.error("No se pudo subir el video", { id });
    }
  };

  const insertVideoUrl = () => {
    const url = window.prompt(
      "Pegá la URL del video (YouTube o .mp4). Dejalo vacío para subir un archivo:"
    );
    if (url === null) return;
    if (url.trim() === "") {
      videoInput.current?.click();
      return;
    }
    (editor.chain().focus() as any)
      .setVideo({ src: url.trim() })
      .run();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt(
      "URL del enlace:",
      prev || "https://"
    );
    if (url === null) return;
    if (url === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50 p-1.5 sticky top-0 z-10 rounded-t-lg">
      <Btn
        title="Deshacer"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Rehacer"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <Btn
        title="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn
        title="Itálica"
        active={editor.isActive("italic")}
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
      >
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn
        title="Tachado"
        active={editor.isActive("strike")}
        onClick={() =>
          editor.chain().focus().toggleStrike().run()
        }
      >
        <Strikethrough className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <Btn
        title="Título 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 1 })
            .run()
        }
      >
        <Heading1 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Título 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 2 })
            .run()
        }
      >
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Título 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: 3 })
            .run()
        }
      >
        <Heading3 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Lista"
        active={editor.isActive("bulletList")}
        onClick={() =>
          editor.chain().focus().toggleBulletList().run()
        }
      >
        <List className="h-4 w-4" />
      </Btn>
      <Btn
        title="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
      >
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn
        title="Cita"
        active={editor.isActive("blockquote")}
        onClick={() =>
          editor.chain().focus().toggleBlockquote().run()
        }
      >
        <Quote className="h-4 w-4" />
      </Btn>
      <Btn
        title="Código"
        active={editor.isActive("codeBlock")}
        onClick={() =>
          editor.chain().focus().toggleCodeBlock().run()
        }
      >
        <Code2 className="h-4 w-4" />
      </Btn>
      <Btn
        title="Enlace"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <Btn
        title="Insertar imagen"
        onClick={() => imageInput.current?.click()}
      >
        <ImageIcon className="h-4 w-4" />
      </Btn>
      <Btn title="Insertar video" onClick={insertVideoUrl}>
        <VideoIcon className="h-4 w-4" />
      </Btn>
      <Btn
        title="Insertar archivo"
        onClick={() => fileInput.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
      </Btn>

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImage}
      />
      <input
        ref={fileInput}
        type="file"
        className="hidden"
        onChange={onFile}
      />
      <input
        ref={videoInput}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoFile}
      />
    </div>
  );
};

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEditor({
  value,
  onChange,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      VideoNode,
      FileNode,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "rich-content min-h-[320px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const handleContainerClick = useCallback(() => {
    editor?.chain().focus().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg bg-white min-h-[360px] animate-pulse" />
    );
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <Toolbar editor={editor} />
      <div onClick={handleContainerClick}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
