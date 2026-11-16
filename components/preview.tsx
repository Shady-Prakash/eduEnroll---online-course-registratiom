"use client";

import dynamic from "next/dynamic";

import "react-quill/dist/quill.bubble.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse rounded-md bg-ink-100" />,
});

interface PreviewProps {
  value: string;
};

export const Preview = ({
  value,
}: PreviewProps) => {
  return(
    <ReactQuill
      theme="bubble"
      value={value}
      readOnly
    />
  );
};
