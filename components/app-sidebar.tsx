import { Briefcase, BookImage, Store, Brain, Home, Map, BusFront, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Link from "next/link"
import MataroCalendar from "@/components/mataro-calendar"
import { NavUser } from "@/components/nav-user"

// Menu items.
const items = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Mapa",
    url: "/mapa",
    icon: Map,
  },
  {
    title: "Ocio y cultura",
    url: "#",
    icon: Brain,
  },
  {
    title: "Comercio local",
    url: "#",
    icon: Store,
  },
  {
    title: "Transporte",
    url: "#",
    icon: BusFront,
  },
  {
    title: "Trabajos",
    url: "#",
    icon: Briefcase,
  },
  {
    title: "Galeria",
    url: "#",
    icon: BookImage,
  },
  {
    title: "Ajustes",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Mataró</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <hr className="my-4" />

            <MataroCalendar />

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}