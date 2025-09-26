import { useEffect, useRef, useState } from 'react'
import './App.css'

import SemiCircleMeter from "./components/SemiCircleMeter/SemiCircleMeter";

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'

import type { User } from 'firebase/auth'

// Firebase config は .env から読み込み（Vite なので VITE_ プレフィックス必須）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

// Google provider can be created without auth instance
const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  // demo: local points state (will be replaced by DB later)
  const [points, setPoints] = useState<number>(65)

  // auth instance stored in ref so functions can access it
  const authRef = useRef<any>(null)

  useEffect(() => {
    // Validate envs before initializing Firebase
    const missing = Object.entries(firebaseConfig)
      .filter(([_, v]) => !v)
      .map(([k]) => k)

    if (missing.length > 0) {
      setInitError(`Missing Firebase env: ${missing.join(', ')}\nMake sure you have a .env with VITE_FIREBASE_* values.`)
      setLoadingAuth(false)
      return
    }

    try {
      const app = initializeApp(firebaseConfig as any)
      const auth = getAuth(app)
      // ブラウザを閉じてもログイン維持（失敗しても警告）
      setPersistence(auth, browserLocalPersistence).catch((e) => console.warn('setPersistence failed', e))
      authRef.current = auth

      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoadingAuth(false)
      })

      return () => unsub()
    } catch (e: any) {
      console.error('Firebase init error', e)
      setInitError(String(e?.message || e))
      setLoadingAuth(false)
    }
  }, [])

  const login = async () => {
    if (!authRef.current) {
      alert('Auth not initialized. Check console or .env settings.')
      return
    }
    try {
      await signInWithPopup(authRef.current, provider)
    } catch (e) {
      console.error(e)
      alert('ログインに失敗しました')
    }
  }

  const logout = async () => {
    if (!authRef.current) return
    await signOut(authRef.current)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>鳩ポイント確認</h1>

      {/* show init error if present */}
      {initError ? (
        <div style={{ padding: 12, background: '#fee', border: '1px solid #fbb', borderRadius: 8 }}>
          <strong>Firebase 初期化エラー</strong>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{initError}</div>
          <div style={{ marginTop: 8 }}>
            例: プロジェクト直下に `.env` を作り、次のように書いてください：
            <pre style={{ background: '#fff', padding: 8 }}>VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id</pre>
          </div>
        </div>
      ) : (
        <>
          {/* Point meter (local state for now) */}
          <SemiCircleMeter value={points} max={100} />

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setPoints(p => Math.max(0, p - 5))}>-5</button>
            <button onClick={() => setPoints(p => Math.min(100, p + 5))}>+5</button>
            <button onClick={() => setPoints(0)}>Reset</button>
          </div>

          <hr style={{ margin: '24px 0' }} />

          <h2>管理ログイン</h2>

          {loadingAuth ? (
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
      )}
    </div>
  )
}
