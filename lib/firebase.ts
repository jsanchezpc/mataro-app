"use client"
declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean
  }
}

import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth"
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken,
  AppCheck,
} from "firebase/app-check"
import {

  getFirestore,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter
} from "firebase/firestore"

// Configuración desde .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

// Guardar instancia de AppCheck
let appCheck: AppCheck | null = null

// ✅ Inicializar AppCheck solo en cliente
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV !== "production") {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  }

  const recaptchaKey =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_PROD_RECAPTCHA_KEY
      : process.env.NEXT_PUBLIC_RECAPTCHA_KEY

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaKey as string),
    isTokenAutoRefreshEnabled: true,
  })
}

// 🔑 Helpers
async function getAppCheckToken(forceRefresh = false) {
  if (!appCheck) return null
  try {
    const token = await getToken(appCheck, forceRefresh)
    return token.token
  } catch (error) {
    console.error("Error obteniendo AppCheck token:", error)
    return null
  }
}

// ✅ Crear usuario en Firestore solo si no existe (transacción)
async function createUserIfNotExists(user: User) {
  if (!user) return

  const userRef = doc(db, "users", user.uid)

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists()) {
        transaction.set(userRef, {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          avatarURL: null,
          createdAt: serverTimestamp(),
        })
        console.log("✅ Usuario creado en Firestore")
      } else {
        console.log("ℹ️ Usuario ya existe en Firestore")
      }
    })

    // 👇 una vez terminada la transacción, lee siempre el doc actualizado
    const freshDoc = await getDoc(userRef)
    if (freshDoc.exists()) {
      sessionStorage.setItem("user", JSON.stringify(freshDoc.data()))
      console.log("💾 Usuario guardado en sessionStorage")
    }

  } catch (error) {
    console.error("❌ Error en transacción al crear/leer usuario:", error)
  }
}

// 🚀 Métodos de auth
async function logInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    await createUserIfNotExists(result.user)
    return result.user
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error)
    throw error
  }
}

async function logOut() {
  try {
    await signOut(auth)
    sessionStorage.clear()
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}

async function logInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await createUserIfNotExists(result.user)
  return result
}

async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await createUserIfNotExists(result.user)
  return result
}

// ✅ Actualizar username y description de un usuario
async function updateUserProfile(
  uid: string,
  data: { username: string; description: string }
) {
  if (!uid) return

  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      username: data.username,
      description: data.description,
    })

    console.log("✅ Usuario actualizado")

    // Actualizar también en sessionStorage (opcional)
    const storedUser = sessionStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      sessionStorage.setItem(
        "user",
        JSON.stringify({ ...parsed, ...data })
      )
      console.log("💾 Usuario actualizado")
    }
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error)
    throw error
  }
}

// ✅ Obtener todos los datos de un usuario por su ID
async function getUserById(uid: string) {
  if (!uid) return null

  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    } else {
      console.log("ℹ️ Usuario no encontrado")
      return null
    }
  } catch (error) {
    console.error("❌ Error obteniendo usuario:", error)
    throw error
  }
}

// Nueva función para obtener publicaciones paginadas por ID de usuario
// ✅ Obtener posts de un usuario con paginación real
export async function getPostsByUserIdPaginated(
  userId: string,
  lastIndex?: number,
  pageSize = 20
) {
  if (!userId) return { posts: [], lastVisible: null }

  try {
    // 1. Obtener el documento del usuario
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return { posts: [], lastVisible: null }

    const userPosts: string[] = userSnap.data().userPosts || []
    if (userPosts.length === 0) return { posts: [], lastVisible: null }

    // 2. Paginar los IDs
    const start = lastIndex ?? 0
    const end = start + pageSize
    const paginatedIds = userPosts.slice(start, end)

    // 3. Obtener los posts por ID
    const posts: any[] = []
    for (const postId of paginatedIds) {
      const postRef = doc(db, "posts", postId)
      const postSnap = await getDoc(postRef)
      if (postSnap.exists()) {
        posts.push({ id: postSnap.id, ...postSnap.data() })
      }
    }

    // 4. El nuevo cursor es el índice final
    const newLastVisible = end < userPosts.length ? end : null

    return { posts, lastVisible: newLastVisible }
  } catch (error) {
    console.error("❌ Error obteniendo posts paginados por array:", error)
    return { posts: [], lastVisible: null }
  }
}


export {
  app,
  auth,
  db,
  logInWithGoogle,
  logOut,
  logInWithEmail,
  signUpWithEmail,
  getAppCheckToken,
  createUserIfNotExists,
  updateUserProfile,
  getUserById
}
