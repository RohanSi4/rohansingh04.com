"use client";

import { useRef, useState } from "react";

interface Props {
  folder: string;
  onUploaded: (url: string) => void;
}

export default function PhotoUpload({ folder, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/admin/photos", { method: "POST", body: form });
    if (res.ok) {
      const { url } = await res.json();
      onUploaded(url);
    }
    setUploading(false);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(upload);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`border border-dashed rounded p-3 text-center cursor-pointer transition-colors text-xs font-mono ${
        dragging ? "border-accent text-accent" : "border-border text-muted hover:border-accent/50"
      }`}
    >
      {uploading ? "uploading..." : "drop photos or click to add"}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
