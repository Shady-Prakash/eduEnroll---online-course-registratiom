"use client";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

import type { ourFileRouter } from "@/app/api/uploadthing/core";

// The UploadThing dropzone is only needed once a teacher clicks "Add/Edit":
// load it on demand instead of with every course-setup page.
const UploadDropzone = dynamic(
  () => import("@/lib/uploadthing").then((m) => m.UploadDropzone),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-md border-2 border-dashed border-ink-300 text-sm text-ink-500">
        Loading uploader…
      </div>
    ),
  }
);

interface FileUploadProps {
  onChange: (url?: string, name?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({
  onChange,
  endpoint
}: FileUploadProps) => {
  const { getToken } = useAuth();

  return(
    <UploadDropzone
      endpoint={endpoint}
      // Send a freshly minted Clerk session token with every upload request.
      // Without it, Clerk's middleware answers 401 when the __session cookie
      // has expired (e.g. the tab sat idle while choosing a file).
      headers={async (): Promise<Record<string, string>> => {
        const token = await getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      }}
      onClientUploadComplete={(res) => {
        onChange(res[0]?.url, res[0]?.name);
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  )
}
