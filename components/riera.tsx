"use client"

// UI components
import { Repeat2, ThumbsUp, MessageCircle, EllipsisVertical } from "lucide-react"
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Post = {
    author: string;
    content: string;
};

interface RieraProps {
    post: Post;
    isPreview: boolean;
}

export default function Riera({ post, isPreview }: RieraProps) {
    const { author, content } = post;
    return (
        <Card
            className={`${isPreview ? "rounded-2xl" : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                }`}
        >
            <CardHeader>
                <CardTitle>{author}</CardTitle>
                {isPreview ? null : <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1"><EllipsisVertical /></CardAction>}
            </CardHeader>

            <CardContent>
                <p>{content}</p>
            </CardContent>

            {isPreview ?
                <CardFooter className="gap-4">
                    <Button disabled variant={"outline"} className="cursor-pointer">
                        <MessageCircle />
                    </Button>
                    <Button disabled variant={"outline"} className="cursor-pointer">
                        <Repeat2 />
                    </Button>
                    <Button disabled variant={"outline"} className="cursor-pointer">
                        <ThumbsUp />
                    </Button>
                </CardFooter> :
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
            }
        </Card>
    )
}