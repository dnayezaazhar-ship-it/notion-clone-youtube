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
    <Breadcrumb> 
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
            <div key={segment} className="flex items-center space-x-1">
              <BreadcrumbItem>
                <BreadcrumbLink href={href}>
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