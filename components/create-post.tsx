"use client"
import { useAuth } from "@/app/context/AuthContext"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile";

// APP components
import Riera from "@/components/riera";
// UI components
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function DropCreate() {
    return (
        <div className="fixed bottom-8 right-8 hover:cursor-pointer">
            <div className="rounded-full bg-blue-600/90 w-14 h-14 flex items-center justify-center">
                <Plus className="w-10 text-slate-50" />
            </div>
        </div>
    )
}

type CreatePostProps = {
  sendPost: (texto: string) => Promise<void> | void;
};


export default function CreatePost({ sendPost }: CreatePostProps) {
    const { user, loading } = useAuth()
    const isMobile = useIsMobile()
    const [content, setContent] = useState("")
    const postContent = {
        author: loading ? "Mataroní" : user?.displayName ? user.displayName : "Mataroní",
        authorAt: "@admin",
        content
    }

    return (
        <Sheet>
            <SheetTrigger>
                <DropCreate />
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className="h-full">
                <SheetHeader>
                    <SheetTitle>Crear post</SheetTitle>
                    <SheetDescription>
                        ¡Comparte lo que piensas con Mataró!
                    </SheetDescription>
                </SheetHeader>

                <div className="grid flex-1 auto-rows-min gap-6 px-4 py-2 scroll-auto overflow-y-scroll">
                    <div className="grid gap-3">
                        <Textarea placeholder="Escribe tu post" className="resize-none bg-accent" value={content}
                            onChange={(e) => setContent(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        Previsualización de tu post:
                        {loading ? <p>Espera...</p> : <Riera post={postContent} isPreview={true} />}
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={() => sendPost(content)} type="submit" className="text-slate-100 cursor-pointer">Postear</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                </SheetFooter>

            </SheetContent>
        </Sheet>
    )
}