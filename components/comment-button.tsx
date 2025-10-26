import { MessageCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext"
import { getUserById } from "@/lib/firebase"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    commentContent: z.string().min(2).max(280),
})


export default function CommentButton() {
    const isMobile = useIsMobile()


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            commentContent: "",
        },
    })


    async function postComment(values: z.infer<typeof formSchema>) {

    }



    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="outline" className="cursor-pointer" >
                    <MessageCircle />
                    <span>
                        {0}
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(postComment)} className="flex flex-col flex-1">
                        <SheetHeader>
                            <SheetTitle>Comentarios</SheetTitle>
                        </SheetHeader>
                        <FormField
                            control={form.control}
                            name="commentContent"
                            render={({ field }) => (
                                <FormItem className="p-4">
                                    <FormLabel>Añade un comentario antes de compartir</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="resize-none max-h-50 bg-accent"
                                            placeholder="Escribe aquí lo que quieras compartir con Mataró"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {280 - field.value.length} caracteres restantes
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                                        {"0 comentarios"}

                        <SheetFooter className="flex justify-between px-4 py-3 border-t">
                            <Button type="submit" className="text-slate-100">
                                Postear
                            </Button>

                            <SheetClose asChild>
                                <Button variant="outline">Cerrar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}