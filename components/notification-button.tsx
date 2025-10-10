"use client"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Repeat2, ThumbsUp, MessageCircle } from "lucide-react";

export function NotificationButton() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg">
                    <Bell />
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Alert>
                        <ThumbsUp />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                            You can add components and dependencies to your app using the cli.
                        </AlertDescription>
                    </Alert>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
