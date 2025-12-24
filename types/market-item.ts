export type MarketItem = {
    id: string
    title: string
    description: string
    price: number
    images: string[]
    sellerId: string
    sellerName?: string // denormalized for ease
    sellerAvatar?: string // denormalized
    createdAt: number
    status: 'available' | 'sold' | 'reserved'
}
