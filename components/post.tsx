"use client";

import { useState, useEffect } from "react";
import { Repeat2, ThumbsUp } from "lucide-react";
import CommentButton from "@/components/comment-button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostAction } from "@/components/post-action";
import { Post } from "@/types/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";

import { getAuth } from "firebase/auth";
import { getUserById, getPostById } from "@/lib/firebase";

type PostComponentProps = {
  post: Post;
  isPreview?: boolean;
  onDeleted?: (id: string) => void;
  isEmbedded?: boolean;
};

export default function PostComponent({
  post,
  isPreview,
  onDeleted,
  isEmbedded = false,
}: PostComponentProps) {
  const { id, uid, content } = post;
  const [likes, setLikes] = useState<number>(post.likes ?? 0);
  const [liked, setLiked] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>("Mataroní/nesa");
  const [profilePic, setProfilePic] = useState<string>("");

  const [parentPost, setParentPost] = useState<Post | null>(null);
  const [showParent, setShowParent] = useState<boolean>(false);
  const [loadingParent, setLoadingParent] = useState<boolean>(false);

  const handleShowParent = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (showParent) {
      setShowParent(false);
      return;
    }
    
    // Si ya lo tenemos, solo mostramos
    if (parentPost) {
      setShowParent(true);
      return;
    }

    // Si no, cargamos
    setLoadingParent(true);
    setShowParent(true); // Mostrar contenedor de carga
    try {
      const fetched = await getPostById(post.father);
      if (fetched) {
        setParentPost(fetched);
      }
    } catch (error) {
      console.error("Error cargando post padre:", error);
    } finally {
      setLoadingParent(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getUserById(uid).then((user) => {
      if (isMounted && user) {
        setAuthorName((user as { username?: string }).username ?? "Mataroní/nesa");
        setProfilePic((user as { avatarURL?: string }).avatarURL ?? "");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [uid]);

  // 🔹 Estado de like
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && post.likedBy) {
      setLiked(post.likedBy.includes(user.uid));
    }
  }, [post.likedBy]);

  // 🔹 Acción de like
  async function handleLike() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const newLiked = !liked;

      setLiked(newLiked);
      setLikes((prev) => prev + (newLiked ? 1 : -1));

      const res = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setLiked(!newLiked);
        setLikes((prev) => prev + (newLiked ? -1 : 1));
      }
    } catch (err) {
      console.error("Error en like:", err);
      setLiked((prev) => !prev);
      setLikes((prev) => prev + (liked ? -1 : 1));
    }
  }

  return (
    <Card
      className={`${isPreview
        ? "rounded-2xl"
        : "rounded-none first:rounded-t-2xl last:rounded-b-2xl"
        }`}
    >
      <CardHeader>
        {post.father !== "none" && !isPreview && (
          <div className="flex flex-col gap-2 w-full mb-2">
            <p className="bg-accent/80 w-fit px-2 text-sm rounded-md">
              En respuesta a{" "}
              {isEmbedded ? (
                <Link className="text-blue-400/80 hover:underline" href={`/post/${post.father}`}>
                  este post
                </Link>
              ) : (
                <button
                  className="text-blue-400/80 hover:underline cursor-pointer"
                  onClick={handleShowParent}
                >
                  este post
                </button>
              )}
            </p>

            {!isEmbedded && showParent && (
              <div className="pl-4 border-l-2 border-accent/50 my-2">
                {loadingParent ? (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    Cargando post original...
                  </div>
                ) : parentPost ? (
                  <PostComponent post={parentPost} isPreview={false} isEmbedded={true} />
                ) : (
                  <div className="text-sm text-red-400">
                    No se pudo cargar el post original (quizás fue eliminado).
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <CardTitle className="flex flex-row items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src={profilePic}
              className="object-contain w-full h-full"
            />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>

          <Link className="hover:underline" href={`/profile/${authorName}`}>
            {authorName}
          </Link>
        </CardTitle>

        {!isPreview && (
          <CardAction className="hover:bg-accent cursor-pointer rounded-full p-1">
            <PostAction
              postId={id}
              authorId={uid}
              onDeleted={() => onDeleted?.(id)}
            />
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <p>{content}</p>
      </CardContent>

      <CardFooter
        className={`${isPreview ? "hidden" : "flex gap-4"}`}
      >
        {/* 🔹 Ahora pasas los comentarios directamente */}
        <CommentButton key={id} postId={id} comments={post.comments} />
{/* 
        <Button variant="outline" className="cursor-pointer" disabled={isPreview}>
          <Repeat2  />
        </Button> */}

        <Button
          variant={liked ? "default" : "outline"}
          className={`${liked
            ? "cursor-pointer flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20"
            : "cursor-pointer"
            }`}
          disabled={isPreview}
          onClick={handleLike}
        >
          <ThumbsUp
            className={`h-4 w-4 ${liked
              ? "text-blue-500 dark:text-white"
              : "text-foreground dark:text-white"
              }`}
          />
          <span
            className={`${liked ? "dark:text-white text-accent-foreground" : ""
              }`}
          >
            {likes}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
