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
import { useAuth } from "@/app/context/AuthContext"

export function BreadcrumbWithCustomSeparator() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Función para capitalizar la primera letra
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1)

  const { user } = useAuth()
  const userId = user?.uid

  // Quitamos el uid de los segments
  const filteredSegments = segments.filter(
    (segment) => segment !== userId
  )

  return (
    <Breadcrumb className="flex content-center">
      <BreadcrumbList>
        {/* Caso especial: solo "/" → Inicio */}
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