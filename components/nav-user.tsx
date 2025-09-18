"use client"

import { useAuth } from "@/app/context/AuthContext"
import { logOut, getUserById } from "@/lib/firebase"
import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
    User,
    Settings,
    ChevronsUpDown,
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { user, loadingUser } = useAuth()
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)
    useEffect(() => {
        if (!user?.uid) return

        // 1. Intenta con sessionStorage primero
        const storedUser = sessionStorage.getItem("user")
        if (storedUser) {
            setProfile(JSON.parse(storedUser))
        }

        // 2. Trae la versión más reciente de la DB
        getUserById(user.uid).then((userDb) => {
            if (userDb) {
                setProfile(userDb)
                sessionStorage.setItem("user", JSON.stringify(userDb))
            }
        })
    }, [user])




    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {loadingUser ? (
                                    <Skeleton className="h-full w-full rounded-lg" />
                                ) : user?.photoURL ? (
                                    <AvatarImage
                                        src={user?.photoURL ?? undefined}
                                        alt={user?.displayName ?? "avatar"}
                                    />
                                ) : (
                                    <AvatarFallback className="rounded-lg">?</AvatarFallback>
                                )}
                            </Avatar>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                {loadingUser ? (
                                    <Skeleton className="h-4 w-24 rounded" />
                                ) : profile?.username ? (
                                    <span className="truncate font-medium">{profile.username}</span>
                                ) : user?.displayName ? (
                                    <span className="truncate font-medium">{user.displayName}</span>
                                ) : user ? (
                                    <div>Mataroní</div>
                                ) : (
                                    <Link className="hover:underline" href="/login">Entrar</Link>
                                )}
                            </div>

                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    {user && (
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={user?.photoURL ?? undefined}
                                            alt={user?.displayName ?? "avatar"}
                                        />
                                        <AvatarFallback className="rounded-lg">?</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {profile?.username ?? user?.displayName ?? ""}
                                        </span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <Link href={`/profile/${user.uid}`}>
                                    <DropdownMenuItem>
                                        <User />
                                        Perfil
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>

                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Settings />
                                    Ajustes
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logOut}>
                                <LogOut />
                                Salir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
