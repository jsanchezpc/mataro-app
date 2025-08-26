// UI components
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
// APP components
import Riera from "@/components/riera";

export default function Home() {
  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <div>
          <Textarea placeholder="Dile a Mataró lo que pasa" className="resize-none min-h-20 h-auto max-h-50 w-full" />
          <div className="flex w-full justify-end mt-2">
            <Button className="text-white cursor-pointer">Riera-ho</Button>
          </div>
        </div>

        <div className="mt-20">
          <Riera />
          <Riera />
          <Riera />
          <Riera />
          <Riera />
        </div>



      </div>
    </div>
  );
}
