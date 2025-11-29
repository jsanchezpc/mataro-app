"use client"

import { usePathname } from "next/navigation"
import { SlashIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  // Expresión regular: posibles UID (Firebase o similares)
  const uidRegex = /^[A-Za-z0-9_-]{20,40}$/

  // Filtramos cualquier segmento que parezca un ID
  const filteredSegments = segments.filter(
    (segment) => !uidRegex.test(segment)
  )

  return (
    <Breadcrumb className="flex content-center">
      <BreadcrumbList>
        {filteredSegments.length === 0 && (
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        )}

        {filteredSegments.map((segment, index) => {
          const href = "/" + filteredSegments.slice(0, index + 1).join("/")
          const isLast = index === filteredSegments.length - 1
          const label = capitalize(decodeURIComponent(segment))

          return (
            <div key={href} className="flex items-center">
              {index > 0 && (
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              )}

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}