// React の StrictMode を読み込み（開発用の厳格チェック）
import { StrictMode } from 'react'
// React 18 の createRoot API
import { createRoot } from 'react-dom/client'
// グローバルCSS読み込み
import './index.css'
// App コンポーネントを読み込み
import App from './App.tsx'

// index.html の #root にReactアプリを描画
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* Appコンポーネントをルートとして描画 */}
  </StrictMode>,
)