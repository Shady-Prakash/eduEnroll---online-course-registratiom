"use client";

import dynamic from "next/dynamic";

import { useConfettiStore } from "@/hooks/use-confetti-store";

// Mounted in the root layout, so keep it out of the shared bundle:
// the confetti library is only downloaded the first time it fires.
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

export const ConfettiProvider = () => {
  const confetti = useConfettiStore();

  if (!confetti.isOpen) return null;

  return (
    <ReactConfetti
      className="pointer-events-none z-[100]"
      numberOfPieces={500}
      recycle={false}
      onConfettiComplete={() => {
        confetti.onClose();
      }}
    />
  )
}
