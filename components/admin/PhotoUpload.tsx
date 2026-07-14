"use client";

import { useRef, useState } from "react";

interface Props {
  folder: string;
  onUploaded: (url: string) => void | Promise<void>;
  label?: string;
}

export default function PhotoUpload({
  folder,
  onUploaded,
  label = "drop photos or click to add",
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/admin/photos", { method: "POST", body: form });
    if (!res.ok) throw new Error(`upload failed (${res.status})`);
    const { url } = await res.json();
    return url;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const url = await upload(file);
        await onUploaded(url);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded p-3 text-center cursor-pointer transition-colors text-xs font-mono ${
          dragging ? "border-accent text-accent" : "border-border text-muted hover:border-accent/50"
        }`}
      >
        {uploading ? "adding photos..." : label}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-mono mt-1">{error}</p>}
    </div>
  );
}
