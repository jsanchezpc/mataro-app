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
  collection, query, where, getDocs, limit
} from "firebase/firestore"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"
import { Post } from "@/types/post"

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
const storage = getStorage(app)

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

function generateRandomUsername() {
  const adjectives = ["brave", "calm", "clever", "swift", "quiet", "bright", "wild", "kind"]
  const nouns = ["fox", "wolf", "hawk", "otter", "tiger", "owl", "bear", "lynx"]

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]

  // timestamp base36: corto, único y ordenable
  const ts = Date.now().toString(36).slice(-5)

  // un toque de aleatoriedad adicional
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0")

  return `${adj}_${noun}_${ts}${rand}`
}

// ✅ Crear usuario en Firestore solo si no existe (transacción)
async function createUserIfNotExists(user: User) {
  if (!user) return

  const userRef = doc(db, "users", user.uid)

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists()) {
        const randomUsername = generateRandomUsername()

        transaction.set(userRef, {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || null,
          username: randomUsername, 
          photoURL: user.photoURL || null,
          avatarURL: null,
          createdAt: serverTimestamp(),
        })
        console.log(`✅ Usuario creado con username: ${randomUsername}`)
      } else {
        console.log("ℹ️ Usuario ya existe")
      }
    })

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

// ✅ Función para subir un archivo de avatar
async function uploadAvatar(uid: string, file: File): Promise<string | null> {
  if (!uid || !file) {
    console.error("❌ UID o archivo no proporcionados para subir avatar.")
    return null
  }

  try {
    // Crea una referencia al lugar donde se guardará el avatar en Storage
    // Por ejemplo: 'avatars/UID_del_usuario.jpg'
    const avatarRef = ref(storage, `avatars/${uid}/${file.name}`)

    // Sube el archivo
    await uploadBytes(avatarRef, file)

    // Obtiene la URL de descarga del archivo
    const downloadURL = await getDownloadURL(avatarRef)
    return downloadURL
  } catch (error) {
    console.error("❌ Error al subir el avatar:", error)
    throw error
  }
}

// ✅ Actualizar username, description y avatar de un usuario
async function updateUserProfile(
  uid: string,
  data: { username?: string; description?: string; avatarFile?: File } // Cambiamos avatarURL por avatarFile
) {
  if (!uid) return

  let avatarURL: string | undefined = undefined;
  if (data.avatarFile) {
    try {
      const uploaded = await uploadAvatar(uid, data.avatarFile)
      avatarURL = uploaded ?? undefined
    } catch (error) {
      console.error("❌ No se pudo subir el nuevo avatar, se procederá sin actualizarlo.", error);
    }
  }

  try {
    const userRef = doc(db, "users", uid)
    const updateData: Partial<{
      username: string;
      description: string;
      photoURL: string;
      avatarURL: string;
    }> = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.description !== undefined) updateData.description = data.description;
    if (avatarURL !== undefined) {
      updateData.photoURL = avatarURL;
      updateData.avatarURL = avatarURL;
    }

    await updateDoc(userRef, updateData)

    console.log("✅ Perfil de usuario actualizado.")

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

// ✅ Obtener usuario por username
async function getUserByUsername(username: string) {
  if (!username) return null

  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username), limit(1))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0]
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      console.log("ℹ️ Usuario no encontrado por username")
      return null
    }
  } catch (error) {
    console.error("❌ Error obteniendo usuario por username:", error)
    throw error
  }
}



// Nueva función para obtener publicaciones paginadas por ID de usuario
// ✅ Obtener posts de un usuario con paginación real
export async function getPostsByUserIdPaginated(
  userId: string,
  lastIndex?: number,
  pageSize = 20
): Promise<{ posts: Post[]; lastVisible: number | null }> {
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
    const posts: Post[] = []
    for (const postId of paginatedIds) {
      const postRef = doc(db, "posts", postId)
      const postSnap = await getDoc(postRef)
      if (postSnap.exists()) {
        posts.push({ id: postSnap.id, ...postSnap.data() } as Post)
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
  storage,
  logInWithGoogle,
  logOut,
  logInWithEmail,
  signUpWithEmail,
  getAppCheckToken,
  createUserIfNotExists,
  updateUserProfile,
  getUserById,
  getUserByUsername
}
