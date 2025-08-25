import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="font-sans my-4 rounded p-8 px-20">
      <div>
        <Textarea placeholder="Dile a Mataró lo que pasa" className="resize-none min-h-20 h-auto max-h-50" />
        <div className="flex w-full justify-end mt-2">
          <Button className="text-white cursor-pointer">Publicar</Button>
        </div>
      </div>

    </div>
  );
}
