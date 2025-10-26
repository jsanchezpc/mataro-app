// types/notification.ts
export type Notification = {
    id: string
    type: "like" | "comment" | "follow" | "system"
    fromUserId?: string,
    toUserId?: string,
    postId?: string,
    message: string
    createdAt: number
    read: boolean
}