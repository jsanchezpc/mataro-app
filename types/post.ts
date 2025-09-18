// types/post.ts
// import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
export type Post = {
  id: string
  uid: string
  author: string
  content: string
  timestamp: number
  rt: number
  likes: number
  likedBy: string[]
  comments: { id: string; text: string; author: string }[]
}
