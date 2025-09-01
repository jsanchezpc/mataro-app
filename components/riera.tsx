"use client"

// UI components
import { Repeat2, ThumbsUp, MessageCircle, EllipsisVertical } from "lucide-react"
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

type Post = {
    author: string;
    authorAt: string;
    content: string;
};

interface RieraProps {
    post: Post;
    isPreview: boolean;
}

export default function Riera({ post, isPreview }: RieraProps) {
    const { author, authorAt, content } = post;
    return (
        <Card
            className={`${isPreview ? "rounded-2xl" : "rounded-none md:rounded-4xl"
                }`}
        >
            <CardHeader>
                <CardTitle>{author}</CardTitle>
                <CardDescription>{authorAt}</CardDescription>
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