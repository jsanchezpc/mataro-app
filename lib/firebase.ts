// lib/firebase.ts
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
  runTransaction,
  serverTimestamp,
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
const db = getFirestore(app) // ✅ Firestore inicializado

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
          createdAt: serverTimestamp(),
        })
        console.log("✅ Usuario guardado")
      } else {
        console.log("ℹ️ Ya existe")
      }
    })
  } catch (error) {
    console.error("❌ Error en transacción al crear usuario:", error)
  }
}

// 🚀 Métodos de auth
async function logInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    await createUserIfNotExists(result.user) // 👈
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
  await createUserIfNotExists(result.user) // 👈
  return result
}

async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await createUserIfNotExists(result.user) // 👈
  return result
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
}
