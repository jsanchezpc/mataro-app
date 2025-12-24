// types/post.ts
// import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
export type Post = {
  id: string
  uid: string
  content: string
  timestamp: number,
  isPrivate: boolean,
  likes: number
  likedBy: string[]
  comments: string[]
  commentsCount: number,
  isChild: boolean,
  father: string
  imageURL?: string
  images?: string[]
  reportedBy?: string[]
}