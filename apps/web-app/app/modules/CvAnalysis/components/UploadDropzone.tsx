import { useId, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

type UploadDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasAcceptedExtension(file: File) {
  const name = file.name.toLowerCase();
  return ACCEPTED_DOCUMENT_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export function UploadDropzone({
  file,
  onFileChange,
  label,
  hint,
  disabled,
  className
}: UploadDropzoneProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;

    if (!hasAcceptedExtension(candidate)) {
      setError(t("cvAnalysis.upload.errors.type"));
      return;
    }

    if (candidate.size > MAX_DOCUMENT_SIZE_BYTES) {
      setError(t("cvAnalysis.upload.errors.size"));
      return;
    }

    setError(null);
    onFileChange(candidate);
  };

  if (file) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3",
          className
        )}
      >
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("cvAnalysis.upload.remove")}
          disabled={disabled}
          onClick={() => {
            onFileChange(null);
            setError(null);
          }}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          acceptFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
          disabled && "cursor-not-allowed opacity-60",
          error && "border-destructive/60"
        )}
      >
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {hint ?? t("cvAnalysis.upload.hint")}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={ACCEPTED_DOCUMENT_EXTENSIONS.join(",")}
          disabled={disabled}
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
