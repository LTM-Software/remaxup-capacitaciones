"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";

import "react-quill/dist/quill.snow.css";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
  const quillRef = useRef<any>(null);

  // next/dynamic no reenvía refs por defecto; se envuelve para poder
  // acceder a la instancia de Quill (getEditor) desde el handler de imagen.
  const ReactQuill = useMemo(
    () =>
      dynamic(
        async () => {
          const { default: RQ } = await import("react-quill");
          const Wrapped = ({ forwardedRef, ...props }: any) => (
            <RQ ref={forwardedRef} {...props} />
          );
          return Wrapped;
        },
        { ssr: false }
      ),
    []
  );

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const toastId = toast.loading("Subiendo imagen...");
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("upload failed");
        const { url } = await res.json();

        const editor = quillRef.current?.getEditor?.();
        if (editor) {
          const range = editor.getSelection(true);
          editor.insertEmbed(
            range ? range.index : 0,
            "image",
            url
          );
          editor.setSelection((range ? range.index : 0) + 1);
        }
        toast.success("Imagen insertada", { id: toastId });
      } catch {
        toast.error("No se pudo subir la imagen", {
          id: toastId,
        });
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  return (
    <div className="bg-white">
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
};
