// types/post.ts
// import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
export type Post = {
  id: string
  uid: string
  content: string
  timestamp: number,
  isPrivate: boolean,
  rt: number
  likes: number
  likedBy: string[]
  comments: { id: string; text: string; uid: string }[]
}