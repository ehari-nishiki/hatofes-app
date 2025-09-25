import React, { useId } from "react";
import "./SemiCircleMeter.css";

// Props の型定義: value が現在値、max が最大値（省略時は 100）
type Props = {
  value: number;  // 現在のポイント値
  max?: number;   // 最大値（オプション、デフォルト 100）
};

const SemiCircleMeter: React.FC<Props> = ({ value, max = 100 }) => {
  // 半円の半径（px）
  const radius = 80;
  // stroke の太さ（px）
  const strokeWidth = 10;

  // 半円の曲線長さ = π * r （円全周は 2πr、半円はその半分 = πr）
  const circumference = Math.PI * radius;

  // 安全対策: value が範囲外（負や max 超え）にならないようにする
  const safeValue = Math.max(0, Math.min(value, max));

  // 進捗を半円の長さに合わせてピクセル数で算出
  // 例: safeValue=50, max=100 のとき progress = 0.5 * circumference
  const progress = (safeValue / max) * circumference;

  // SVG 内で使う id をユニークに生成（複数インスタンスをページに置いても衝突しない）
  const id = useId();

  // デバッグ用ログ（必要な場合はコンソールで確認できる）
  // console.log({ radius, strokeWidth, circumference, safeValue, progress, id });

  return (
    <div className="semi-meter">
      {/* タイトル領域 */}
      <div className="Hato-point-title">
        <h1>鳩ポイント</h1>
      </div>

      {/* SVG 全体: 幅は (直径 + マージン)、高さは (半径 + マージン) */}
      <svg
        width={radius * 2 + 20}
        height={radius + 20}
        viewBox={`0 0 ${radius * 2 + 20} ${radius + 20}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`鳩ポイント: ${safeValue} / ${max}`}
      >
        <defs>
          {/* 線形グラデーション定義: 左端(10) → 右端(radius*2+10) に沿って色が変わる */}
          <linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            x1="10"
            y1={radius + 10}
            x2={radius * 2 + 10}
            y2={radius + 10}
          >
            <stop offset="0%" stopColor="#00c853" />
            <stop offset="50%" stopColor="#ffd600" />
            <stop offset="100%" stopColor="#2962ff" />
          </linearGradient>
        </defs>

        {/* 背景トラック（薄いグレー）: 常に全長を表示 */}
        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          stroke="#eee"
          strokeWidth={strokeWidth}
          className="track"
          strokeLinecap="round"
        />

        {/* 白いトラック（オプションで見た目を微調整） */}
        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth - 2}
          className="trackwhite"
          strokeLinecap="round"
        />

        {/* 進捗パス: stroke にグラデーションを指定し、strokeDashoffset で描画長を調整 */}
        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          className="progress"
          strokeLinecap="round"
          style={{
            // strokeDasharray を circumference にすると、dash のパターンが円の長さに合う
            strokeDasharray: circumference,
            // 描画済み部分は circumference - progress のオフセットで表現
            strokeDashoffset: Math.max(0, circumference - progress),
            transition: "stroke-dashoffset 400ms ease",
          }}
        />
      </svg>

      {/* 値表示: テキストで現在値 / 最大値を表示 */}
      <div className="value">{safeValue} / {max}</div>
    </div>
  );
};

export default SemiCircleMeter;