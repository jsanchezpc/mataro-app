import { NextResponse } from "next/server"
import { createMarketItemServer, getAllMarketItemsServer, createPostServer } from "@/lib/firebaseAdmin"

// GET /api/market
export async function GET() {
  try {
    const items = await getAllMarketItemsServer()
    return NextResponse.json(items)
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Error obteniendo items", details: String(error) },
      { status: 500 }
    )
  }
}

// POST /api/market
export async function POST(req: Request) {
  try {
    const { 
        title, 
        description, 
        price, 
        images, 
        sellerId, 
        sellerName,
        createPost // boolean 
    } = await req.json()

    if (!title || !price || !sellerId) {
         return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    // 1. Create Market Item
    const newItem = await createMarketItemServer({
        title,
        description,
        price,
        images: images || [],
        sellerId,
        sellerName
    })

    // 2. If requested, create a Post
    if (createPost) {
        // Create a distinct post content
        const postContent = `📢 ¡Vendo ${title} por ${price}€!\n\n${description}`
        await createPostServer(
            sellerId, 
            postContent, 
            false, // isPrivate
            false, // isChild
            "none", // father
            images?.[0] || null, // imageURL (legacy)
            images || [] // images (new)
        )
    }

    // Revalidate market page
    // revalidatePath("/market") // Import it first if using next/cache

    return NextResponse.json(newItem, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Error creando item", details: String(error) },
      { status: 500 }
    )
  }
}
