"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dropzone } from "@/components/widgets/Dropzone";
import { useUnattachedMedia } from "@/hooks/queries/useMediaQueries";
import { Media, MediaType, StagedMediaFile } from "@/lib/types";

const MEDIA_TYPES: MediaType[] = ["COVER", "VIDEO", "TRAILER", "SUBTITLE"];

export interface MediaManagerValue {
  existingMedia: Media[];
  newMedia: StagedMediaFile[];
  removedMediaIds: string[];
}

interface MediaManagerProps {
  value: MediaManagerValue;
  onChange: (value: MediaManagerValue) => void;
}

interface PreviewFile extends StagedMediaFile {
  previewUrl: string;
}

export function MediaManager({ value, onChange }: MediaManagerProps) {
  const { existingMedia, newMedia, removedMediaIds } = value;
  const [uploadType, setUploadType] = useState<MediaType>("COVER");
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: unattachedMedia } = useUnattachedMedia();

  useEffect(() => {
    const urls = newMedia.map((item) => ({
      ...item,
      previewUrl: item.type === "COVER" ? URL.createObjectURL(item.file) : "",
    }));
    setPreviews(urls);
    return () => urls.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMedia]);

  const attachedIds = new Set([
    ...existingMedia.map((m) => m.id),
    ...removedMediaIds,
  ]);
  const availableMedia = (unattachedMedia ?? []).filter(
    (media) => !attachedIds.has(media.id),
  );

  const handleFilesSelected = (files: File[]) => {
    const staged = files.map((file) => ({ file, type: uploadType }));
    onChange({ ...value, newMedia: [...newMedia, ...staged] });
  };

  const handleChooseExisting = (media: Media) => {
    onChange({ ...value, existingMedia: [...existingMedia, media] });
    setPickerOpen(false);
  };

  const removeExisting = (media: Media) => {
    onChange({
      ...value,
      existingMedia: existingMedia.filter((m) => m.id !== media.id),
      removedMediaIds: [...removedMediaIds, media.id],
    });
  };

  const removeNew = (index: number) => {
    onChange({ ...value, newMedia: newMedia.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={uploadType} onValueChange={(v) => setUploadType(v as MediaType)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" disabled={!availableMedia.length}>
              Choose Existing
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Choose Existing Media</SheetTitle>
            </SheetHeader>
            {availableMedia.length ? (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {availableMedia.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => handleChooseExisting(media)}
                    className="flex flex-col gap-1 rounded-md border p-2 text-left hover:border-primary"
                  >
                    {media.type === "COVER" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.url} alt="" className="h-24 w-full rounded object-cover" />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                        {media.type}
                      </div>
                    )}
                    <span className="truncate text-xs text-muted-foreground">
                      {media.url.split("/").pop()}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No existing media</p>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <Dropzone
        multiple
        accept="image/*,video/*"
        label={`Drag & drop a ${uploadType.toLowerCase()} file here, or click to browse`}
        onFilesSelected={handleFilesSelected}
      />

      {(existingMedia.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingMedia.map((media) => (
            <div key={media.id} className="group relative flex flex-col gap-1 rounded-md border p-2">
              <button
                type="button"
                onClick={() => removeExisting(media)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {media.type === "COVER" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt="" className="h-24 w-full rounded object-cover" />
              ) : (
                <div className="flex h-24 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  {media.type}
                </div>
              )}
              <span className="truncate text-xs text-muted-foreground">
                {media.url.split("/").pop()}
              </span>
            </div>
          ))}

          {previews.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="group relative flex flex-col gap-1 rounded-md border border-dashed p-2">
              <button
                type="button"
                onClick={() => removeNew(index)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt="" className="h-24 w-full rounded object-cover" />
              ) : (
                <div className="flex h-24 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  {item.type}
                </div>
              )}
              <span className="truncate text-xs text-muted-foreground">
                {item.file.name} (pending)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
