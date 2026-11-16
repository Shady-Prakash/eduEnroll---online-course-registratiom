import { Heading } from "@/components/ui/typography";
interface AuthHeadingProps {
  title: string;
  subtitle: string;
}

export const AuthHeading = ({ title, subtitle }: AuthHeadingProps) => (
  <div className="space-y-2 text-center lg:text-left">
    <Heading>{title}</Heading>
    <p className="text-sm text-ink-500 sm:text-base">{subtitle}</p>
  </div>
);
