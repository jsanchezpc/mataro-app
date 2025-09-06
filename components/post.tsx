"use client"

// UI components
import { Repeat2, ThumbsUp, MessageCircle } from "lucide-react"
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DeletePost } from "@/components/delete-post";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

type Post = {
    id: string;
    author: string;
    content: string;
    uid: string;
    timestamp: Timestamp;
    rt: number;
    likes: number;
    comments: Array<0>;
};


interface RieraProps {
    post: Post;
    isPreview: boolean;
}

export default function PostComponent({ post, isPreview }: RieraProps) {
    const { author, content, id, uid} = post;
    return (
        <Card
            className={`${isPreview ? "rounded-2xl" : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"}`}
        >
            <CardHeader>
                <CardTitle>{author}</CardTitle>
                {isPreview ? null :
                    <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1">
                        <DeletePost postId={id} authorId={uid} />
                    </CardAction>
                }
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