import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import type { ProfileFile } from "@/db/schema";
import { formatDateTime } from "@/lib/dates";
import { formatFileSize } from "@/lib/file-size";
import { pluralize } from "@/lib/plural";

import { deleteFile, uploadFile } from "../actions";
import { PROFILE_TEXTS, SECTION_TITLES } from "../labels";

import { FileUploadForm } from "./file-upload-form";
import { RowDeleteButton } from "./row-delete-button";

/** Адрес, по которому обработчик src/app/profile/files/[id]/route.ts отдаёт PDF. */
export function fileUrl(id: number): string {
  return `/profile/files/${id}`;
}

export function FilesSection({ files }: { files: ProfileFile[] }) {
  const count = files.length;

  return (
    <Panel
      title={SECTION_TITLES.files}
      aside={count > 0 ? `${count} ${pluralize(count, PROFILE_TEXTS.count.files)}` : undefined}
    >
      <div className="space-y-5">
        {count === 0 ? (
          <EmptyState compact title={PROFILE_TEXTS.emptyFiles} hint={PROFILE_TEXTS.emptyFilesHint} />
        ) : (
          <ul className="divide-y divide-edge-muted text-sm">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-3 py-row">
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-danger-edge bg-danger-soft text-[10px] font-semibold text-danger"
                >
                  PDF
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={fileUrl(file.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate rounded-sm font-medium text-fg outline-none hover:text-accent-fg hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {file.fileName}
                  </a>
                  <p className="text-xs text-fg-subtle">
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

        <div className="border-t border-edge-muted pt-4">
          <FileUploadForm action={uploadFile} />
        </div>
      </div>
    </Panel>
  );
}
