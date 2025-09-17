// types/post.ts
// import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
export type Post = {
    id: string;
    author: string;
    content: string;
    uid: string;
    // Firestore Timestamp se serializa a un objeto con _seconds y _nanoseconds
    // o a una cadena ISO si se configura un serializador.
    timestamp: number | { _seconds: number; _nanoseconds: number } | Date | string; // Ajustado
    rt: number;
    likes: number;
    comments: number; 
};