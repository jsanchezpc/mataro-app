"use client"

import { updateUserProfile } from "@/lib/firebase"
import { useAuth } from "@/app/context/AuthContext"
import { useParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { z } from "zod"

// UI components
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    username: z.string().optional(),
    description: z.string().optional(),
    avatarURL: z.string().optional()
})


type ProfileActionProps = {
    profile?: {
        username?: string
        description?: string
        avatarURL?: string
    }
    onUpdated?: () => void
}

export default function ProfileAction({ profile, onUpdated }: ProfileActionProps) {
    const params = useParams()
    const { user } = useAuth()
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: profile?.username ?? "",
            description: profile?.description ?? "",
            avatarURL: profile?.avatarURL ?? "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("jaja")
        if (!user?.uid) return
        await updateUserProfile(user.uid, {
            username: values.username ?? "",
            description: values.description ?? "",
            avatarURL: values.avatarURL ?? "",
        })
        toast("Perfil actualizado")
        setOpen(false)
        onUpdated?.()
    }

    // Resetear cuando cambien los datos del perfil
    useEffect(() => {
        if (profile) {
            form.reset({
                username: profile.username || "",
                description: profile.description || "",
            })
        }
    }, [profile, form])

    return (
        <>
            {user?.uid === params?.userId ? (
                <div>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline">Editar</Button>
                        </SheetTrigger>

                        <SheetContent side={isMobile ? "bottom" : "right"} className="h-full">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <SheetHeader>
                                        <SheetTitle>Editar perfil</SheetTitle>
                                        <SheetDescription>
                                            Cambia tu nombre, descripción o avatar
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="grid flex-1 auto-rows-min gap-6 px-4 py-2 scroll-auto">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre de usuario</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="¿Cómo quieres que te llamen?"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Este es tu nombre público
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descripción</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Escribe tu descripción"
                                                            className="resize-none bg-accent"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <SheetFooter className="absolute w-full bottom-0">
                                        <Button
                                            type="submit"
                                            className="text-slate-100 cursor-pointer"
                                        >
                                            Guardar
                                        </Button>
                                        <SheetClose asChild>
                                            <Button variant="outline">Cerrar</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </form>
                            </Form>
                        </SheetContent>
                    </Sheet>
                </div>
            ) : (
                <Button variant="outline">Seguir</Button>
            )}
        </>
    )
}
