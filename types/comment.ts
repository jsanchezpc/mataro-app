// types/comment.ts
import { Post } from "@/types/post";
export type PostComment = {
  id: string;
  uid: string;
  author?: string;
  content: string;
  createdAt?: number;
};

export type CommentButtonProps = {
    postId: string;
    comments: Post[];
};