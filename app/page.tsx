import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="font-sans my-4 rounded p-8">
      <div className="w-200 mx-auto">
        <Textarea placeholder="Dile a Mataró lo que pasa" className="resize-none min-h-20 h-auto max-h-50 w-full" />
        <div className="flex w-full justify-end mt-2">
          <Button className="text-white cursor-pointer">Publicar</Button>
        </div>
      </div>

    </div>
  );
}
