import { useEffect, useState } from 'react'
import './App.css'

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  // signInWithRedirect, // ← Safari等で必要なら後で使う
} from 'firebase/auth'

import type { User } from 'firebase/auth'

// ── Firebase config は .env から読み込み（Vite なので VITE_ プレフィックス必須）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// ブラウザを閉じてもログイン維持
setPersistence(auth, browserLocalPersistence)

const provider = new GoogleAuthProvider()
// 毎回アカウント選択を出す
provider.setCustomParameters({ prompt: 'select_account' })

function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async () => {
    try {
      await signInWithPopup(auth, provider)
      // Safari等でポップアップブロックされる場合は下を利用
      // await signInWithRedirect(auth, provider)
    } catch (e) {
      console.error(e)
      alert('ログインに失敗しました')
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <>
      <h1>hatofes-app</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user.photoURL && (
              <img
                src={user.photoURL}
                width={36}
                height={36}
                style={{ borderRadius: '50%' }}
                alt=""
              />
            )}
            <div>
              <div>こんにちは、{user.displayName || user.email} さん</div>
              <small>{user.email}</small>
            </div>
          </div>
          <button onClick={logout}>ログアウト</button>
        </div>
      ) : (
        <div className="card" style={{ display: 'grid', gap: 8 }}>
          <p>管理ページを利用するには Google でログインしてください。</p>
          <button onClick={login}>Googleでログイン</button>
        </div>
      )}
    </>
  )
}

export default App
