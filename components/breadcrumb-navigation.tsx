"use client"

import Link from "next/link"
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

  // Función para capitalizar la primera letra
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <Breadcrumb className="flex content-center">
      <BreadcrumbList>
        {/* Caso especial: solo "/" → Dashboard */}
        {segments.length === 0 && (
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        )}

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
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
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}