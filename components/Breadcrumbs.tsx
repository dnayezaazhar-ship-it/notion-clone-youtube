"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className="min-w-0 max-w-full">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator />}

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          const label =
            segment === "doc" && segments[index + 1]
              ? "Document"
              : segment;

          return (
            <div key={`${segment}-${index}`} className="flex min-w-0 items-center space-x-1">
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbLink
                  className="max-w-[min(45vw,12rem)] truncate md:max-w-none"
                  href={href}
                >
                  {label}
                </BreadcrumbLink>
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;