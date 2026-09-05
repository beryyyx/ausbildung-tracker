import type { ProfileFile } from "@/db/schema";
import { formatDateTime } from "@/lib/dates";
import { formatFileSize } from "@/lib/file-size";

import { deleteFile, uploadFile } from "../actions";
import { PROFILE_TEXTS, SECTION_TITLES } from "../labels";

import { FileUploadForm } from "./file-upload-form";
import { RowDeleteButton } from "./row-delete-button";

/** Адрес, по которому обработчик src/app/profile/files/[id]/route.ts отдаёт PDF. */
export function fileUrl(id: number): string {
  return `/profile/files/${id}`;
}

export function FilesSection({ files }: { files: ProfileFile[] }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{SECTION_TITLES.files}</h2>

      {files.length === 0 ? (
        <p className="text-sm text-zinc-500">{PROFILE_TEXTS.emptyFiles}</p>
      ) : (
        <ul className="divide-y divide-zinc-100 text-sm">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <a
                  href={fileUrl(file.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                >
                  {file.fileName}
                </a>
                <p className="text-xs text-zinc-500">
                  {formatFileSize(file.sizeBytes)}, {formatDateTime(file.createdAt)}
                </p>
              </div>
              <RowDeleteButton
                action={deleteFile.bind(null, file.id)}
                confirmText={PROFILE_TEXTS.confirmDeleteFile}
                ariaLabel={`${PROFILE_TEXTS.delete}: ${file.fileName}`}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-zinc-200 pt-4">
        <FileUploadForm action={uploadFile} />
      </div>
    </section>
  );
}
