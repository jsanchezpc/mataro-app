"use client"

import { useAuth } from "@/app/context/AuthContext"
import { getUserById, uploadPostImage } from "@/lib/firebase"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { Image as ImageIcon, X, ShoppingBag } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// UI components
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input" 
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
// import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    title: z.string().min(3, "El título es muy corto").max(50),
    description: z.string().min(10, "La descripción es muy corta").max(500),
    price: z.coerce.number().min(0),
    createPost: z.boolean().default(false)
})

type FormValues = z.infer<typeof formSchema>

type CreateMarketItemProps = {
    onCreated?: () => void
    children?: React.ReactNode
}

export default function CreateMarketItem({ onCreated, children }: CreateMarketItemProps) {
    const { user } = useAuth()
    const isMobile = useIsMobile()
    const [open, setOpen] = useState(false)
    const [profile, setProfile] = useState<{ id: string; username?: string; description?: string } | null>(null)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!user?.uid) return
        getUserById(user.uid).then((data) => setProfile(data)).catch(() => toast("Error al obtener perfil"))
    }, [user])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            createPost: false
        },
    })


    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newFiles = Array.from(files)
            if (selectedImages.length + newFiles.length > 4) {
                toast("Máximo 4 imágenes")
                return
            }
            
            setSelectedImages(prev => [...prev, ...newFiles])
            
            newFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user?.uid) {
            toast("Error: Inicia sesión para vender")
            return
        }

        setIsUploading(true)

        try {
            // Upload images first
             const uploadedUrls = await Promise.all(
                selectedImages.map(img => uploadPostImage(img))
            )
            const validUrls = uploadedUrls.filter((url): url is string => url !== null)

            // Create Market Item (and optional Post) via API
            const res = await fetch("/api/market", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    images: validUrls,
                    sellerId: user.uid,
                    sellerName: profile?.username || "Usuario",
                    createPost: values.createPost
                }),
            })

            if (!res.ok) throw new Error("Error al crear oferta")

            toast("✅ ¡Oferta publicada!")
            form.reset()
            setSelectedImages([])
            setImagePreviews([])
            setOpen(false)
            onCreated?.()

        } catch (error) {
            console.error(error)
            toast("Error al publicar oferta")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button className="gap-2 dark:text-white">
                        <ShoppingBag size={16} /> Vender algo
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side={isMobile ? "bottom" : "right"} className="flex flex-col h-full sm:max-w-md w-full overflow-y-auto p-4">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <SheetHeader>
                            <SheetTitle>Vender artículo</SheetTitle>
                            <SheetDescription>Publica un artículo en el mercadilo de Mataró.</SheetDescription>
                        </SheetHeader>

                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Bicicleta de montaña" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price */}
                         <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio (€)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Ej: 50" {...field} value={field.value as number || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Estado, detalles, zona de entrega..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Images */}
                        <div className="space-y-2">
                            <FormLabel>Imágenes</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                                        <Image src={preview} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length < 4 && (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-accent/50"
                                    >
                                        <ImageIcon className="text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                            />
                        </div>

                         {/* Create Post Toggle */}
                         <FormField
                            control={form.control}
                            name="createPost"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Crear publicación</FormLabel>
                                        <FormDescription>
                                            Comparte esto también en el feed principal
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox"
                                                id="createPost"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            {/* <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            /> */}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <SheetFooter >
                            <Button type="submit" disabled={isUploading} className="w-full text-white">
                                {isUploading ? "Publicando..." : "Publicar oferta"}
                            </Button>
                        </SheetFooter>
                    </form>
                 </Form>
            </SheetContent>
        </Sheet>
    )
}
