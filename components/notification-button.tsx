"use client"

import { Bell, ThumbsUp, MessageCircle, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

export function NotificationButton() {
    const { notifications, markAsRead } = useNotifications()

    const getIcon = (type: string) => {
        switch (type) {
            case "like":
                return <ThumbsUp className="text-blue-500" />
            case "comment":
                return <MessageCircle className="text-green-500" />
            case "follow":
                return <User className="text-purple-500" />
            case "system":
                return <AlertCircle className="text-gray-500" />
            default:
                return <Bell />
        }
    }

    const handleOpen = () => {
        notifications.forEach(n => {
            if (!n.read) markAsRead(n.id)
        })
    }

    return (
        <DropdownMenu onOpenChange={open => open && handleOpen()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="relative">
                    <Bell />
                    {notifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                    <DropdownMenuItem disabled>
                        <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                    </DropdownMenuItem>
                )}

                {notifications.map(n => (
                    <DropdownMenuItem key={n.id} className="cursor-default w-full">
                        <Link href={`/post/${n.postId}`} className="w-full">
                        <Alert className="p-3">
                            {getIcon(n.type)}
                            <div className="w-full">
                                <AlertTitle className="w-fit line-clamp-none">
                                    {n.type === "like"
                                        ? "Nuevo like"
                                        : n.type === "comment"
                                            ? "Nuevo comentario"
                                            : n.type === "follow"
                                                ? "Nuevo seguidor"
                                                : "Mataró"}
                                </AlertTitle>
                                <AlertDescription className="text-sm text-muted-foreground w-full">
                                    {n.message}
                                </AlertDescription>
                            </div>
                        </Alert></Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
