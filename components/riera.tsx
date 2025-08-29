import { Repeat2, ThumbsUp, MessageCircle } from "lucide-react"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Riera() {
    return (
        <Card className="rounded-none md:rounded-4xl">
            <CardHeader>
                <CardTitle>Jorge</CardTitle>
                <CardDescription>@admin</CardDescription>

                <CardAction>Reportar</CardAction>

            </CardHeader>
            <CardContent>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio facere ab voluptatum enim. Quibusdam, ut. Architecto ex libero aperiam ratione temporibus velit corporis ducimus dolor necessitatibus odio, blanditiis illo est.</p>
            </CardContent>
            <CardFooter className="gap-4">
                <Button variant={"outline"} className="cursor-pointer">
                    <MessageCircle />
                </Button>
                <Button variant={"outline"} className="cursor-pointer">
                    <Repeat2 />
                </Button>
                <Button variant={"outline"} className="cursor-pointer">
                    <ThumbsUp />
                </Button>
            </CardFooter>
        </Card>
    )
}