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
  signInWithRedirect,
  getRedirectResult,
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
  collection, query, where, getDocs, limit,
  orderBy,
  startAfter,
  addDoc,
  arrayUnion
} from "firebase/firestore"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics";
import { Post } from "@/types/post"
import { MarketItem } from "@/types/market-item"
import { getDbId } from "@/lib/db"

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
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const dbId = getDbId()
const db = getFirestore(app, dbId)
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
  } catch {
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
      } else {
      }
    })

  } catch {
  }
}

// 🚀 Métodos de auth
async function logInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider)
  } catch (error) {
    throw error
  }
}

// Manejar el resultado del redireccionamiento cuando la página carga
if (typeof window !== "undefined") {
  getRedirectResult(auth)
    .then(async (result) => {
      if (result) {
        await createUserIfNotExists(result.user)
      }
    })
    .catch((error) => {
      console.error("Error en getRedirectResult:", error)
    })
}

async function logOut() {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
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
    throw error
  }
}

// ✅ Función para subir una imagen de post
async function uploadPostImage(file: File): Promise<string | null> {
  if (!file) return null

  try {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    // Guardar en images/posts con nombre único
    const imageRef = ref(storage, `images/posts/${timestamp}_${random}_${file.name}`)

    await uploadBytes(imageRef, file)
    const downloadURL = await getDownloadURL(imageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading post image:", error)
    return null
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
    } catch {
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

  } catch (error) {
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
      return null
    }
  } catch (error) {
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
      return null
    }
  } catch (error) {
    throw error
  }
}



// ✅ Obtener TODOS los posts paginados (feed principal)
async function getAllPostsPaginated(
  lastSnapshot?: unknown,
  pageSize = 5,
  currentUserId?: string
): Promise<{ posts: Post[]; lastVisible: unknown | null; snapshotSize: number }> {
  try {
    const postsRef = collection(db, "posts")
    let q = query(
        postsRef, 
        orderBy("timestamp", "desc"), 
        limit(pageSize)
    )

    if (lastSnapshot) {
      q = query(
            postsRef,
            orderBy("timestamp", "desc"), 
            startAfter(lastSnapshot), 
            limit(pageSize)
        )
    }

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
        const postData = doc.data() as Post
        // Filter if reported by current user
        if (currentUserId && postData.reportedBy?.includes(currentUserId)) {
            return
        }
        
        posts.push({ ...postData, id: doc.id } as Post)
    })

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null

    return { posts, lastVisible, snapshotSize: querySnapshot.size }
  } catch (e) {
    console.error("Error fetching paginated posts:", e)
    return { posts: [], lastVisible: null, snapshotSize: 0 }
  }
}

// Nueva función para obtener publicaciones paginadas por ID de usuario
// ✅ Obtener posts de un usuario con paginación real
async function getPostsByUserIdPaginated(
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
  } catch {
    return { posts: [], lastVisible: null }
  }
}


// async function getCommentsByPostId(postId: string): Promise<Post[]> {
//   try {
//     const postsRef = collection(db, "posts");
//     const q = query(
//       postsRef,
//       where("father", "==", postId),
//       where("isChild", "==", true),
//       orderBy("createdAt", "desc")
//     );
// 
//     const querySnapshot = await getDocs(q);
// 
//     const comments: Post[] = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Post[];
//     return comments;
//   } catch (error) {
//     return [];
//   }
// }


async function getCommentsByPostId(postId: string): Promise<Post[]> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("isChild", "==", true),
      where("father", "==", postId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
  } catch {
    return [];
  }
}


// ✅ Obtener un post por ID
async function getPostById(postId: string): Promise<Post | null> {
  if (!postId) return null;
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      return { id: postSnap.id, ...postSnap.data() } as Post;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}




// ✅ Seguir a un usuario
async function followUser(currentUserId: string, targetUserId: string) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return

  const currentUserRef = doc(db, "users", currentUserId)
  const targetUserRef = doc(db, "users", targetUserId)

  try {
    await runTransaction(db, async (transaction) => {
      const currentUserDoc = await transaction.get(currentUserRef)
      const targetUserDoc = await transaction.get(targetUserRef)

      if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
        throw new Error("User does not exist!")
      }

      const currentUserData = currentUserDoc.data()
      const targetUserData = targetUserDoc.data()

      const currentFollowing = currentUserData.following || []
      const targetFollowers = targetUserData.followers || []

      if (!currentFollowing.includes(targetUserId)) {
        transaction.update(currentUserRef, {
          following: [...currentFollowing, targetUserId]
        })
        transaction.update(targetUserRef, {
          followers: [...targetFollowers, currentUserId]
        })
      }
    })
  } catch (e) {
    console.error("Error following user: ", e)
    throw e
  }
}

// ✅ Dejar de seguir a un usuario
async function unfollowUser(currentUserId: string, targetUserId: string) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return

  const currentUserRef = doc(db, "users", currentUserId)
  const targetUserRef = doc(db, "users", targetUserId)

  try {
    await runTransaction(db, async (transaction) => {
      const currentUserDoc = await transaction.get(currentUserRef)
      const targetUserDoc = await transaction.get(targetUserRef)

      if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
        throw new Error("User does not exist!")
      }

      const currentUserData = currentUserDoc.data()
      const targetUserData = targetUserDoc.data()

      const currentFollowing = currentUserData.following || []
      const targetFollowers = targetUserData.followers || []

      if (currentFollowing.includes(targetUserId)) {
        transaction.update(currentUserRef, {
          following: currentFollowing.filter((id: string) => id !== targetUserId)
        })
        transaction.update(targetUserRef, {
          followers: targetFollowers.filter((id: string) => id !== currentUserId)
        })
      }
    })
  } catch (e) {
    console.error("Error unfollowing user: ", e)
    throw e
  }
}

// ✅ Comprobar si sigue al usuario
async function checkIsFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId) return false

  try {
    const currentUserRef = doc(db, "users", currentUserId)
    const currentUserSnap = await getDoc(currentUserRef)

    if (currentUserSnap.exists()) {
      const following = currentUserSnap.data().following || []
      return following.includes(targetUserId)
    }
    return false
  } catch {
    return false
  }
}


// ✅ Obtener posts de las cuentas que sigo
async function getFollowingPostsPaginated(
  currentUserId: string,
  lastSnapshot?: unknown,
  pageSize = 5
): Promise<{ posts: Post[]; lastVisible: unknown | null; snapshotSize: number }> {
  if (!currentUserId) return { posts: [], lastVisible: null, snapshotSize: 0 }

  try {
    // 1. Get following list
    const userRef = doc(db, "users", currentUserId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return { posts: [], lastVisible: null, snapshotSize: 0 }

    const following = userSnap.data().following || []
    if (following.length === 0) return { posts: [], lastVisible: null, snapshotSize: 0 }
    
    // Firestore 'in' limit is 30. We'll take the first 30 for now.
    const limitedFollowing = following.slice(0, 30);

    const postsRef = collection(db, "posts")
    let q = query(
        postsRef,
        where("uid", "in", limitedFollowing),
        orderBy("timestamp", "desc"),
        limit(pageSize)
    )

    if (lastSnapshot) {
       q = query(
            postsRef,
            where("uid", "in", limitedFollowing),
            orderBy("timestamp", "desc"),
            startAfter(lastSnapshot),
            limit(pageSize)
       )
    }

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
        const postData = doc.data() as Post
        // Filter if reported by current user
        if (postData.reportedBy?.includes(currentUserId)) {
            return
        }
        
        posts.push({ ...postData, id: doc.id } as Post)
    })

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null

    return { posts, lastVisible, snapshotSize: querySnapshot.size }

  } catch (e) {
    console.error("Error fetching following posts:", e)
    return { posts: [], lastVisible: null, snapshotSize: 0 }
  }
}

// ✅ Reportar un post
async function reportPost(postId: string, reportedBy: string, reason: string) {
  if (!postId || !reportedBy || !reason) return

  try {
    // 1. Crear el reporte
    await addDoc(collection(db, "reports"), {
      postId,
      reportedBy,
      reason,
      createdAt: serverTimestamp(),
      status: "pending"
    })

    // 2. Actualizar el post para añadir al usuario que reportó
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
        reportedBy: arrayUnion(reportedBy)
    })

  } catch (e) {
    console.error("Error reporting post: ", e)
    throw e
  }
}

async function hidePost(userId: string, postId: string) {
    if (!userId || !postId) return

    const userRef = doc(db, "users", userId)
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef)
            if (!userDoc.exists()) return

            const currentHidden = userDoc.data().hiddenPosts || []
            if (!currentHidden.includes(postId)) {
                transaction.update(userRef, {
                    hiddenPosts: [...currentHidden, postId]
                })
            }
        })
    } catch (e) {
        console.error("Error hiding post: ", e)
        throw e
    }
}




async function getUserMarketItems(userId: string): Promise<MarketItem[]> {
    if (!userId) return []
    try {
        const itemsRef = collection(db, "market_items")
        const q = query(itemsRef, where("sellerId", "==", userId), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketItem))
    } catch (e) {
        console.error("Error getting user market items:", e)
        return []
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
  getUserByUsername,
  getCommentsByPostId,
  getPostById,
  analytics,
  followUser,
  unfollowUser,
  checkIsFollowing,
  uploadPostImage,
  getPostsByUserIdPaginated,
  getAllPostsPaginated,
  getFollowingPostsPaginated,
  reportPost,
  hidePost,
  getUserMarketItems
}

