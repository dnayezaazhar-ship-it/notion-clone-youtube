"use client";

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";

function SidebarOption({ href, id }: { href: string; id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname !== "/";

  if (!data) return null;

  return (
    <Link
      href={href}
      className={`block w-11/12 my-3 mx-auto border py-1.5 px-3 rounded-mt ${
  
        isActive ? "bg-gray-300 font-bold border-black" : "border-gray-400"
      }`}
    >
      <p className="truncate text-center">{data.title}</p>
    </Link>
  );
}

export default SidebarOption;