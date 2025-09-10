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


interface PostComponentProps {
    post: Post
    isPreview: boolean
    onDeleted?: (postId: string) => void
}

export default function PostComponent({ post, isPreview, onDeleted }: PostComponentProps) {
    const { author, content } = post

    return (
        <Card
            className={`${isPreview
                    ? "rounded-2xl"
                    : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                }`}
        >
            <CardHeader>
                <CardTitle>{author}</CardTitle>
                {!isPreview && (
                    <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1">
                        <DeletePost
                            postId={post.id}
                            authorId={post.uid}
                            onDeleted={() => onDeleted?.(post.id)}
                        />
                    </CardAction>
                )}
            </CardHeader>

            <CardContent>
                <p>{content}</p>
            </CardContent>

            <CardFooter className="gap-4">
                <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
                    <MessageCircle />
                </Button>
                <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
                    <Repeat2 />
                </Button>
                <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
                    <ThumbsUp />
                </Button>
            </CardFooter>
        </Card>
    )
}