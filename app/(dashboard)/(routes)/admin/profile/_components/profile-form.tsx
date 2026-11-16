"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { Field, SaveBar, fieldClass } from "../../_components/form-bits";
import { errorMessage } from "../../_components/use-save";

type Values = { headline: string; bio: string; website: string; linkedin: string };

export const ProfileForm = ({ initial }: { initial: Values }) => {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Values, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          setSaving(true);
          await axios.patch("/api/teacher-profile", values);
          toast.success("Profile saved");
          setSaved(values);
          router.refresh();
        } catch (error) {
          toast.error(errorMessage(error));
        } finally {
          setSaving(false);
        }
      }}
    >
      <Field label="Headline" htmlFor="headline" optional hint="Shown under your name, e.g. “Lecturer in Cyber Security · KOI”." counter={{ value: values.headline.length, max: 80 }}>
        <input id="headline" maxLength={80} value={values.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Lecturer in Information Technology" className={fieldClass} />
      </Field>
      <Field label="About you" htmlFor="bio" optional hint="Your background, expertise and teaching style. Line breaks are kept." counter={{ value: values.bio.length, max: 2000 }}>
        <textarea
          id="bio"
          rows={7}
          maxLength={2000}
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="I've taught networking and security at KOI since…"
          className="w-full rounded-lg border border-ink-200 bg-white p-3 text-sm shadow-sm placeholder:text-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
        />
      </Field>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Website" htmlFor="website" optional>
          <input id="website" type="url" inputMode="url" value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" className={fieldClass} />
        </Field>
        <Field label="LinkedIn" htmlFor="linkedin" optional>
          <input id="linkedin" type="url" inputMode="url" value={values.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://www.linkedin.com/in/…" className={fieldClass} />
        </Field>
      </div>
      <SaveBar dirty={dirty} saving={saving} onReset={() => setValues(saved)} />
    </form>
  );
};
