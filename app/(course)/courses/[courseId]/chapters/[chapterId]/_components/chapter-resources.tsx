import { Attachment } from "@prisma/client";
import {
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FileAudio,
  LucideIcon,
} from "lucide-react";
import { Heading } from "@/components/ui/typography";

const typeByExtension: Record<string, { icon: LucideIcon; label: string; tone: string }> = {
  pdf: { icon: FileText, label: "PDF", tone: "bg-danger-50 text-danger-600" },
  doc: { icon: FileText, label: "Word", tone: "bg-info-50 text-info-600" },
  docx: { icon: FileText, label: "Word", tone: "bg-info-50 text-info-600" },
  txt: { icon: FileText, label: "Text", tone: "bg-ink-100 text-ink-600" },
  ppt: { icon: FileText, label: "Slides", tone: "bg-warning-50 text-warning-600" },
  pptx: { icon: FileText, label: "Slides", tone: "bg-warning-50 text-warning-600" },
  xls: { icon: FileSpreadsheet, label: "Sheet", tone: "bg-success-50 text-success-600" },
  xlsx: { icon: FileSpreadsheet, label: "Sheet", tone: "bg-success-50 text-success-600" },
  csv: { icon: FileSpreadsheet, label: "CSV", tone: "bg-success-50 text-success-600" },
  png: { icon: FileImage, label: "Image", tone: "bg-highlight-50 text-highlight-600" },
  jpg: { icon: FileImage, label: "Image", tone: "bg-highlight-50 text-highlight-600" },
  jpeg: { icon: FileImage, label: "Image", tone: "bg-highlight-50 text-highlight-600" },
  gif: { icon: FileImage, label: "Image", tone: "bg-highlight-50 text-highlight-600" },
  webp: { icon: FileImage, label: "Image", tone: "bg-highlight-50 text-highlight-600" },
  mp4: { icon: FileVideo, label: "Video", tone: "bg-brand-50 text-brand-600" },
  mov: { icon: FileVideo, label: "Video", tone: "bg-brand-50 text-brand-600" },
  mp3: { icon: FileAudio, label: "Audio", tone: "bg-warning-50 text-warning-600" },
  wav: { icon: FileAudio, label: "Audio", tone: "bg-warning-50 text-warning-600" },
  zip: { icon: FileArchive, label: "Archive", tone: "bg-ink-100 text-ink-600" },
};

const fileType = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return typeByExtension[ext] ?? { icon: File, label: ext ? ext.toUpperCase() : "File", tone: "bg-ink-100 text-ink-600" };
};

/** Downloadable course resources as a responsive grid of file tiles. */
export const ChapterResources = ({ attachments }: { attachments: Attachment[] }) => {
  if (!attachments.length) return null;

  return (
    <section aria-labelledby="resources-heading" className="space-y-3">
      <Heading as="h2" id="resources-heading" size="sub">
        Resources
        <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600 tabular-nums">
          {attachments.length}
        </span>
      </Heading>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attachments.map((attachment) => {
          const { icon: Icon, label, tone } = fileType(attachment.name);
          return (
            <li key={attachment.id}>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-x-3 rounded-xl border border-ink-200 bg-white p-3 transition hover:border-brand-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-900" title={attachment.name}>
                    {attachment.name}
                  </span>
                  <span className="text-xs text-ink-500">{label}</span>
                </span>
                <Download
                  className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:text-brand-700"
                  aria-label="Open"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
