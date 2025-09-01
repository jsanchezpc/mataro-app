"use client"

import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
// APP components
import CreatePost from "@/components/create-post"
import Riera from "@/components/riera"

type Post = {
  author: string
  authorAt: string
  content: string
}

const postContent: Post = {
  author: "Mataró",
  authorAt: "@mataro",
  content: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint aut, suscipit dolores doloribus voluptatum tempora voluptate odio eligendi cupiditate eos vel id saepe sequi, aperiam, laboriosam quibusdam dolor fuga a."
}

const posts: Post[] = [postContent, postContent, postContent]

// Función para subir el post
function uploadPost(post: Post) {
  toast("Post creado", {
    description: post.content
  })
}

export default function Home() {
  return (
    <div className="font-sans rounded md:p-8">
      <Toaster />
      <div className="max-w-200 mx-auto">
        <CreatePost sendPost={uploadPost} />

        <div className="pt-0 pb-20 flex flex-col md:gap-4">
          {posts.map((post, index) => (
            <Riera key={index} post={post} isPreview={false} />
          ))}
        </div>
      </div>
    </div>
  )
}