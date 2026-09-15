"use client";
import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/app/lib/api";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

// Quill inlines pasted/dropped images as base64 data URIs. One screenshot becomes
// megabytes of content, and the API echoes every content* alias, so a single
// article can bloat the whole list response. Upload first, embed the URL instead.
const MAX_INLINE_FALLBACK_BYTES = 2 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function pickFile(accept: string, onPick: (f: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const f = input.files?.[0];
    if (f) onPick(f);
  };
  input.click();
}

export default function QuillEditor({ value, onChange, placeholder, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<InstanceType<typeof import("quill").default> | null>(null);
  const onChangeRef = useRef(onChange);
  const [notice, setNotice] = useState<string | null>(null);
  onChangeRef.current = onChange;

  useEffect(() => {
    let quill: InstanceType<typeof import("quill").default> | null = null;
    let disposed = false;
    let host: HTMLDivElement | null = null;

    // Upload a pasted/picked file and embed the returned URL at the cursor.
    const insertFile = async (file: File) => {
      const q = quillRef.current;
      if (!q) return;
      const type = file.type.startsWith("video/") ? "video" : "image";
      let src = "";
      try {
        src = await uploadFile(file, "articles");
        setNotice(null);
      } catch (e) {
        const status = (e as { status?: number })?.status;
        const code = (e as { code?: string })?.code;
        const offline = !status || status === 0 || code === "NETWORK_ERROR" || code === "UNAUTHORIZED";
        // Too big to inline safely — refuse rather than silently re-bloat the article
        if (!offline || file.size > MAX_INLINE_FALLBACK_BYTES) {
          setNotice(`Upload failed (${status ?? 0}${code ? ` ${code}` : ""}): ${(e as Error).message}`);
          return;
        }
        src = await fileToDataUrl(file).catch(() => "");
        if (!src) return;
        setNotice("API offline — media embedded locally only, not synced to server.");
      }
      const range = q.getSelection(true) ?? { index: q.getLength() - 1, length: 0 };
      q.insertEmbed(range.index, type, src, "user");
      q.setSelection(range.index + 1, 0, "user");
    };

    const filesFromItems = (items: DataTransferItemList | undefined) => {
      const out: File[] = [];
      for (const item of Array.from(items ?? [])) {
        if (item.kind !== "file") continue;
        if (!item.type.startsWith("image/") && !item.type.startsWith("video/")) continue;
        const f = item.getAsFile();
        if (f) out.push(f);
      }
      return out;
    };

    // Capture phase so Quill's own clipboard/drop handlers never see the file
    // (they would inline it as base64).
    const onPaste = (e: ClipboardEvent) => {
      const files = filesFromItems(e.clipboardData?.items);
      if (!files.length) return;
      e.preventDefault();
      e.stopPropagation();
      files.forEach((f) => void insertFile(f));
    };
    const onDrop = (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files ?? []).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
      if (!files.length) return;
      e.preventDefault();
      e.stopPropagation();
      files.forEach((f) => void insertFile(f));
    };

    (async () => {
      const [{ default: Quill }] = await Promise.all([
        import("quill"),
        import("quill/dist/quill.snow.css"),
      ]);
      if (disposed || !containerRef.current) return;
      const editor = document.createElement("div");
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(editor);
      host = editor;
      editor.addEventListener("paste", onPaste, true);
      editor.addEventListener("drop", onDrop, true);
      quill = new Quill(editor, {
        theme: "snow",
        placeholder: placeholder ?? "Write content…",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              ["link", "image", "video"],
              ["clean"],
            ],
            handlers: {
              image: () => pickFile("image/*", (f) => void insertFile(f)),
              video: () => pickFile("video/*", (f) => void insertFile(f)),
            },
          },
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
      host?.removeEventListener("paste", onPaste, true);
      host?.removeEventListener("drop", onDrop, true);
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
      {notice && <p className="mt-2 text-[11px] text-[#8B6F47]">{notice}</p>}
    </div>
  );
}
