"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SidebarOption({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={`my-3 mx-auto block w-11/12 rounded-md border px-3 py-1.5 ${
        href === pathname
          ? "border-black bg-gray-300 font-bold"
          : "border-gray-400"
      }`}
    >
      <p className="truncate text-center">{title}</p>
    </Link>
  );
}

export default SidebarOption;
