"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error) && typeof error.response?.data === "string" && error.response.data
    ? error.response.data
    : "Couldn't save your changes. Please try again.";

/** PATCH helper for setup forms: toast feedback + server refresh. Returns true on success. */
export const useSave = (url: string) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const save = async (values: Record<string, unknown>, successMessage = "Changes saved") => {
    try {
      setIsSaving(true);
      await axios.patch(url, values);
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { save, isSaving };
};

export { errorMessage };
