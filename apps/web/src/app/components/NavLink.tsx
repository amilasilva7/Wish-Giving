"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "./LoadingProvider";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function NavLink({ href, className, children }: Props) {
  const { showLoading } = useLoading();
  const pathname = usePathname();

  function handleClick() {
    if (pathname !== href) {
      showLoading("Loading…");
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
