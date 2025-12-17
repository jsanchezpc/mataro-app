import MarketItem from "@/components/market-item"



export default function MarketPage() {
  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <div className="w-full p-4">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">Rastro</h1>
          <p className="text-xl text-center font-light text-dark/70 dark:text-gray-300/50 leading-7 [&:not(:first-child)]:mt-6">Compraventa de productos y servicios en la comunidad de Mataró.</p>
        </div>
        <div className="w-full p-4 flex justify-center">
          <MarketItem />
        </div>
      </div>
    </div>
  )
}