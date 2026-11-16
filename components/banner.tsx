import { AlertTriangle, CheckCircleIcon, Info } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const bannerVariants = cva("flex w-full items-center justify-center gap-x-2 border-b px-4 py-3 text-sm",
  {
    variants: {
      variant:{
        warning: "border-warning-200 bg-warning-50 text-warning-900",
        success: "border-success-200 bg-success-50 text-success-900",
        info: "border-brand-200 bg-brand-50 text-brand-900",
      }
    },
    defaultVariants: {
      variant: "warning",
    }
  }
);

interface BannerProps extends VariantProps<typeof bannerVariants> {
  label: string;
};

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
  info: Info,
}

export const Banner = ({
  label,
  variant,
}: BannerProps) => {
  const Icon = iconMap[variant || "warning"];

  return (
    <div role="status" className={cn(bannerVariants({ variant }))}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  )
}
