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
import { PostAction } from "@/components/post-action";

import { Post } from "@/types/post";


type PostComponentProps = {
    post: Post;
    isPreview?: boolean;
    onDeleted?: (id: string) => void;
};


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
                        <PostAction
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