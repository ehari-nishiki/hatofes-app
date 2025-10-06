// React のフックを読み込み
import { useEffect, useRef, useState } from 'react'
// CSS を読み込み
import './App.css'

// 半円メーターのコンポーネントを読み込み
import SemiCircleMeter from "./components/SemiCircleMeter/SemiCircleMeter";

// Firebase 初期化用
import { initializeApp } from 'firebase/app'
// Firebase 認証関連の関数を読み込み
import {
  getAuth,               // 認証オブジェクト取得
  GoogleAuthProvider,    // Googleログイン用プロバイダー
  signInWithPopup,       // ポップアップでサインイン
  signOut,               // サインアウト
  onAuthStateChanged,    // ログイン状態の監視
  setPersistence,        // 認証の永続化設定
  browserLocalPersistence, // ローカルに永続化
} from 'firebase/auth'

// 認証ユーザーの型定義を読み込み
import type { User } from 'firebase/auth'

// Firebase の設定を環境変数から取得
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

// Googleログイン用のプロバイダーを作成
const provider = new GoogleAuthProvider()
// アカウント選択を強制する設定
provider.setCustomParameters({ prompt: 'select_account' })

// Reactコンポーネント App
export default function App() {
  // 認証ユーザー情報
  const [user, setUser] = useState<User | null>(null)
  // 認証の読み込み中フラグ
  const [loadingAuth, setLoadingAuth] = useState(true)
  // Firebase初期化エラーの保存
  const [initError, setInitError] = useState<string | null>(null)

  // 仮ポイントの状態（後でDBに置き換える想定）
  const [points, setPoints] = useState<number>(65)

  // 認証インスタンスを保持するためのref
  const authRef = useRef<any>(null)

  // コンポーネント初期化時にFirebaseを初期化する
  useEffect(() => {
    // 環境変数が揃っているか確認
    const missing = Object.entries(firebaseConfig)
      .filter(([_, v]) => !v) // 値が未定義のものを抽出
      .map(([k]) => k)        // キー名だけ取り出す

    // 不足があればエラーメッセージ表示
    if (missing.length > 0) {
      setInitError(`Missing Firebase env: ${missing.join(', ')}\nMake sure you have a .env with VITE_FIREBASE_* values.`)
      setLoadingAuth(false)
      return
    }

    try {
      // Firebaseアプリを初期化
      const app = initializeApp(firebaseConfig as any)
      // 認証インスタンスを取得
      const auth = getAuth(app)
      // 認証をブラウザローカルに保存（ログイン状態維持）
      setPersistence(auth, browserLocalPersistence).catch((e) => console.warn('setPersistence failed', e))
      // refに保持
      authRef.current = auth

      // 認証状態が変わったらコールバック
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)             // ユーザー情報を更新
        setLoadingAuth(false)  // ローディング解除
      })

      // クリーンアップで監視解除
      return () => unsub()
    } catch (e: any) {
      console.error('Firebase init error', e)
      setInitError(String(e?.message || e))
      setLoadingAuth(false)
    }
  }, [])

  // Googleログイン関数
  const login = async () => {
    if (!authRef.current) {
      alert('Auth not initialized. Check console or .env settings.')
      return
    }
    try {
      await signInWithPopup(authRef.current, provider) // ポップアップでログイン
    } catch (e) {
      console.error(e)
      alert('ログインに失敗しました')
    }
  }

  // ログアウト関数
  const logout = async () => {
    if (!authRef.current) return
    await signOut(authRef.current)
  }

  // コンポーネントの描画
  return (
    <div style={{ padding: 15}}>


      {/* Firebase 初期化エラーを表示 */}
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
          {/* ポイントメーター */}
          <SemiCircleMeter value={points} max={100} />

          {/* ポイント操作ボタン */}
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setPoints(p => Math.max(0, p - 5))}>-5</button>
            <button onClick={() => setPoints(p => Math.min(100, p + 5))}>+5</button>
            <button onClick={() => setPoints(0)}>Reset</button>
          </div>

          <hr style={{ margin: '24px 0' }} />

          <h2>管理ログイン</h2>

          {/* 認証UI */}
          {loadingAuth ? (
            <p>Loading...</p>  // ローディング中
          ) : user ? (
            // ログイン済みの場合
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
            // 未ログインの場合
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