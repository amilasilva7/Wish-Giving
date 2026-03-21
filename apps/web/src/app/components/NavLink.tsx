"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "./LoadingProvider";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function NavLink({ href, className, children, onClick }: Props) {
  const { showLoading } = useLoading();
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  function handleClick() {
    if (pathname !== href) {
      showLoading("Loading…");
    }
    onClick?.();
  }

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? "!text-orange-500 font-semibold" : ""}`}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
