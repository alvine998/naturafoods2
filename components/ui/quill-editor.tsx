"use client";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export default function QuillEditor({ value, onChange, placeholder, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<InstanceType<typeof import("quill").default> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let quill: InstanceType<typeof import("quill").default> | null = null;
    let disposed = false;
    (async () => {
      const [{ default: Quill }] = await Promise.all([
        import("quill"),
        import("quill/dist/quill.snow.css"),
      ]);
      if (disposed || !containerRef.current) return;
      const editor = document.createElement("div");
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(editor);
      quill = new Quill(editor, {
        theme: "snow",
        placeholder: placeholder ?? "Write content…",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
          ],
        },
      });
      if (value) quill.root.innerHTML = value;
      quill.on("text-change", () => {
        const html = quill!.root.innerHTML;
        // quill empty = "<p><br></p>"
        onChangeRef.current(html === "<p><br></p>" ? "" : html);
      });
      quillRef.current = quill;
    })();
    return () => {
      disposed = true;
      quillRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync external value when not focused (e.g. switching edited article)
  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const current = q.root.innerHTML;
    const next = value || "<p><br></p>";
    if (current !== value && current !== next && document.activeElement !== q.root) {
      const sel = q.getSelection();
      q.root.innerHTML = value || "";
      if (sel) setTimeout(() => q.setSelection(sel), 0);
    }
  }, [value]);

  return (
    <div className={className}>
      <div ref={containerRef} className="quill-wrap [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-[#2D4A22]/15 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-[#2D4A22]/15 [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-[13px] [&_.ql-editor]:leading-6" />
    </div>
  );
}
