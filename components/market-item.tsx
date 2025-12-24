import Image from "next/image"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserIcon, MessageCircle } from "lucide-react"

// We use any here to avoid importing the type if it causes circular deps or just for speed, 
// strictly it should be MarketItem type.
// But let's define a local interface or use any for now.
import { MarketItem as MarketItemType } from "@/types/market-item"

type MarketItemProps = {
    item: MarketItemType
    priority?: boolean
}

export default function MarketItem({ item, priority = false }: MarketItemProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:opacity-95 transition-opacity">
                    <Item variant="outline" className="h-full flex flex-col items-stretch overflow-hidden text-left">
                        <div className="relative aspect-square w-full bg-secondary/20 border-b">
                            {item.images && item.images.length > 0 ? (
                                <Image
                                    src={item.images[0]}
                                    alt={item.title}
                                    fill
                                    priority={priority}
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    className="object-cover transition-transform hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    Sin imagen
                                </div>
                            )}
                             <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                                {item.price} €
                             </div>
                        </div>
                        <ItemContent className="p-4 flex flex-col gap-1.5 flex-1 w-full">
                            <ItemTitle className="text-lg font-semibold line-clamp-1 w-full">{item.title}</ItemTitle>
                            <ItemDescription className="line-clamp-2 w-full break-words">{item.description}</ItemDescription>
                            <div className="mt-auto flex items-center text-sm text-muted-foreground gap-2 pt-2">
                                <UserIcon size={14} /> <span className="truncate max-w-[120px]">{item.sellerName || "Vendedor"}</span>
                            </div>
                        </ItemContent>
                    </Item>
                </div>
            </DialogTrigger>
            
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{item.title}</DialogTitle>
                    <DialogDescription className="text-xl font-semibold text-primary">
                        {item.price} €
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Images Scroll/Grid */}
                    {item.images && item.images.length > 0 && (
                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                            {item.images.map((img, idx) => (
                                <div key={idx} className="relative flex-none w-full md:w-2/3 aspect-video rounded-lg overflow-hidden border snap-center">
                                    <Image 
                                        src={img} 
                                        alt={`${item.title} ${idx}`} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                        className="object-cover" 
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Descripción</h3>
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                         <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserIcon className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{item.sellerName || "Vendedor"}</p>
                                    <p className="text-xs text-muted-foreground">Vendedor</p>
                                </div>
                            </div>
                            <Button className="gap-2 dark:text-white">
                                <MessageCircle size={16} /> Contactar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
