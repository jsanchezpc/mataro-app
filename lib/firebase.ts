import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"

console.log("Firebase env:", process.env.NEXT_PUBLIC_API_KEY)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

// Auth
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

async function logInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log("Usuario logueado:", user)
    return user
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error)
    throw error
  }
}

async function logOut() {
  try {
    await signOut(auth)
    console.log("Sesión cerrada")
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
  }
}

export { app, auth, logInWithGoogle, logOut }
