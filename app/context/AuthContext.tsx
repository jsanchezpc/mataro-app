"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, getUserById } from "@/lib/firebase"

export type UserProfile = {
  id: string
  username?: string
  description?: string
  avatarURL?: string
  hiddenPosts?: string[]
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loadingUser: boolean
  refetchProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loadingUser: true,
  refetchProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingUser, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const data = await getUserById(uid)
      setProfile(data as UserProfile)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [fetchProfile])

  const refetchProfile = async () => {
    if (user?.uid) {
      await fetchProfile(user.uid)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loadingUser, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
