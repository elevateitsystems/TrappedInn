"use client";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string;
  aspect: number;
  shape: "round" | "rect";
  title: string;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
}

export function ImageCropperModal({ imageSrc, title, onCancel, onSave }: ImageCropperModalProps) {
  const [loading, setLoading] = useState(false);

  // A very basic "cropper" that just returns the original image as a blob
  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      onSave(blob);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-full h-64 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-border">
            <img src={imageSrc} alt="Crop preview" className="max-w-full max-h-full object-contain" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            (Image cropping is currently simplified for the Next.js migration)
          </p>
        </div>
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : (
              <>
                <Check className="w-4 h-4" /> Save Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
