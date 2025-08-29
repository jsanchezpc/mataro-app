"use client"
import { useIsMobile } from "@/hooks/use-mobile"
import { Droplet } from "lucide-react"
// UI components
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function CreatePostLg() {

    return (
        <div className="max-w-full">
            <Textarea  placeholder="Dile a Mataró lo que pasa" className="resize-none bg-accent min-h-20 h-auto max-h-50 w-full" />
            <div className="flex w-full justify-end mt-2">
                <Button className="text-white cursor-pointer">Riera-ho</Button>
            </div>
        </div>
    )
}
function CreatePostSm() {

    return (
        <div>
            <AlertDialog>
                <AlertDialogTrigger>
                    <div className="fixed bottom-8 right-8">
                        <div className="rounded-full bg-blue-600/70 w-14 h-14 flex items-center justify-center">
                            <Droplet className="w-10 text-slate-50" />
                        </div>
                        <div className="fixed bottom-8 right-8">
                            <div className="rounded-full bg-blue-600/70 w-14 h-14 flex items-center justify-center">
                                <Droplet className="w-10 text-slate-50" />
                            </div>
                        </div>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Crear post</AlertDialogTitle>
                        <AlertDialogDescription className="max-w-max">
                            <CreatePostLg />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>


    )
}
export default function CreatePost() {
    const isMobile = useIsMobile()

    if (isMobile) {
        return <CreatePostSm />
    } else {
        return <CreatePostLg />
    }
}