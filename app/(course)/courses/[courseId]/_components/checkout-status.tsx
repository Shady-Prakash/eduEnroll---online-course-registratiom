"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useConfettiStore } from "@/hooks/use-confetti-store";

interface CheckoutStatusProps {
  /** Whether the server confirmed access on this request. */
  enrolled: boolean;
}

/**
 * Feedback after returning from Stripe Checkout, then cleans the URL so a
 * refresh or shared link doesn't repeat the message.
 */
export const CheckoutStatus = ({ enrolled }: CheckoutStatusProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const confetti = useConfettiStore();
  const handled = useRef(false);

  const status = searchParams.get("checkout");
  const pass = searchParams.get("pass");

  useEffect(() => {
    if ((!status && !pass) || handled.current) return;
    handled.current = true;

    if (pass === "success") {
      confetti.onOpen();
      toast.success("Welcome to eduEnroll Pass! Every course is now unlocked.", { duration: 6000 });
    } else if (pass === "canceled") {
      toast("Subscription not started. You haven't been charged.", { icon: "↩️" });
    }

    if (status === "success" && enrolled) {
      confetti.onOpen();
      toast.success("You're enrolled! Enjoy the course.", { duration: 5000 });
    } else if (status === "success") {
      // Paid, but the payment is still being confirmed (e.g. delayed bank payments).
      toast("Payment received. Your access will unlock in a moment.", { icon: "⏳", duration: 6000 });
      setTimeout(() => router.refresh(), 4000);
    } else if (status === "canceled") {
      toast("Checkout canceled. You haven't been charged.", { icon: "↩️" });
    }

    router.replace(pathname, { scroll: false });
  }, [status, pass, enrolled, confetti, router, pathname]);

  return null;
};
