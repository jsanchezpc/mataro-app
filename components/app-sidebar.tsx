// import { Briefcase, HousePlus, Handshake, BookImage, Store, Brain, Home, Map, BusFront } from "lucide-react"
// import { Briefcase, HousePlus, Handshake, BookImage, Store, Brain, Home, Map, BusFront } from "lucide-react"
import { Home, Handshake } from "lucide-react"

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
  // {
  //   title: "Prensa",
  //   url: "/newspaper",
  //   icon: Newspaper,
  // },
  {
    title: "Rastro",
    url: "/market",
    icon: Handshake,
  },
  // {
  //   title: "Trabajos",
  //   url: "/jobs",
  //   icon: Briefcase,
  // },
  // {
  //   title: "Transporte",
  //   url: "#",
  //   icon: BusFront,
  // },

  // {
  //   title: "Vivienda",
  //   url: "#",
  //   icon: HousePlus,
  // },
  // {
  //   title: "Galeria",
  //   url: "#",
  //   icon: BookImage,
  // }
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