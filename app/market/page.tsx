// Don't modify the imports above if they are correct, but we need to add/remove some.
// Actually, this file has NO "use client", so it IS a Server Component.
// We can use async/await.

import MarketItem from "@/components/market-item"
import CreateMarketItem from "@/components/create-market-item"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"

// Import Server Function
import { getAllMarketItemsServer } from "@/lib/firebaseAdmin"

export const dynamic = "force-dynamic" // Ensure it refetches on refresh

export default async function MarketPage() {
  const items = await getAllMarketItemsServer()

  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="w-full p-4 flex flex-col items-center">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Rastro</h1>
          <p className="text-xl text-center font-light text-dark/70 dark:text-gray-300/50 leading-7 mt-6">Compraventa de productos y servicios en la comunidad de Mataró.</p>
          
          <div className="w-full max-w-md mt-6 gap-4 flex flex-col">
               <InputGroup>
                <InputGroupInput placeholder="Camisetas, muebles, etc." />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
              
              <div className="flex justify-center">
                 <CreateMarketItem />
              </div>
          </div>
        </div>

        <div className="w-full p-4">
             {items.length === 0 ? (
                 <div className="text-center py-10 text-muted-foreground">
                     No hay artículos en venta todavía. ¡Sé el primero!
                 </div>
             ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                        <MarketItem key={item.id} item={item} priority={index < 4} /> 
                    ))}
                 </div>
             )}
        </div>
      </div>
    </div>
  )
}