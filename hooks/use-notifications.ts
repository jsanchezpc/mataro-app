"use client"

import { useEffect, useState, useCallback } from "react"
import { db } from "@/lib/firebase"
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    where,
} from "firebase/firestore"
import { useAuth } from "@/app/context/AuthContext"
import { Notification } from "@/types/notification"

export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "notifications"),
            where("toUserId", "==", user.uid),
            orderBy("createdAt", "desc")
        )

        const unsub = onSnapshot(q, snapshot => {
            setNotifications(
                snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[]
            )
        })

        return () => unsub()
    }, [user])

    const addNotification = useCallback(
        async (n: Omit<Notification, "id" | "createdAt" | "read">) => {
            await addDoc(collection(db, "notifications"), {
                ...n,
                createdAt: Date.now(),
                read: false,
            })
        },
        []
    )

    const markAsRead = useCallback(async (id: string) => {
        const ref = doc(db, "notifications", id)
        await updateDoc(ref, { read: true })
    }, [])

    return { notifications, addNotification, markAsRead }
}
