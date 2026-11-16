import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export const Logo = () => {
  return (
    <Link href="/" aria-label="eduEnroll home" className="inline-flex">
      <BrandLogo />
    </Link>
  )
}
