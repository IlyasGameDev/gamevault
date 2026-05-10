'use client';
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface FileUploaderProps {
  slug: string;
  type: 'thumbnail' | 'cover' | 'game';
  accept?: string;
  label: string;
  onUploaded: (url: string) => void;
}

export default function FileUploader({ slug, type, accept = 'image/*', label, onUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!slug) { toast.error('Enter a slug first'); return; }
    setUploading(true);
    setProgress(10);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('slug', slug);
      fd.append('type', type);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      setProgress(80);
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      setUploadedUrl(data.url);
      onUploaded(data.url);
      setProgress(100);
      toast.success('Uploaded!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-6 cursor-pointer transition-colors text-center"
      >
        {uploadedUrl ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle size={20} /> Uploaded successfully
          </div>
        ) : uploading ? (
          <div className="space-y-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={24} className="mx-auto text-gray-600" />
            <p className="text-sm text-gray-500">Drop file here or click to upload</p>
            <p className="text-xs text-gray-600">{accept}</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
