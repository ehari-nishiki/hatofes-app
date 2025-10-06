// src/components/SemiCircleMeter/SemiCircleMeter.tsx
import React, { useId } from "react";
import "./SemiCircleMeter.css";
// 拡張子 .ts を付けても動くけど普通は付けないことが多い
import { mockPoints } from "../../mocks/points";

type UserPoint = { id: string; name: string; points: number; updatedAt?: string };

// PointList として定義（呼び出し側と名前を合わせた）
const PointList: React.FC<{ points: UserPoint[] }> = ({ points }) => (
  <ul>
    {points.map((u) => (
      <li key={u.id}>
        {u.name}: {u.points} pt
      </li>
    ))}
  </ul>
);

// Props の型定義: value が現在値、max が最大値（省略時は 100）
type Props = {
  value: number;
  max?: number;
};

const SemiCircleMeter: React.FC<Props> = ({ value, max = 100 }) => {
  const radius = 120;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const safeValue = Math.max(0, Math.min(value, max));
  const progress = (safeValue / max) * circumference;
  const id = useId();

  function handleClick() {
  console.log("押された！");
}


  // デバッグ用
  console.log("mockPoints import:", mockPoints);

  return (
    <div className="semi-meter">
        <div className="title-row">
            <div className="Hato-point-title">
                <span className="grad-dot" aria-hidden="true"></span>
                <h1>鳩ポイント</h1>
            </div>
            <div className="detail-button">
                <button onClick={handleClick}>詳しく見る</button>
            </div>
        </div>
      <div>
         <div className="point-number">
    {(() => {
      const me = mockPoints.find(p => p.id === "u3"); // ← ログインユーザーIDに置き換え
      return me ? `${me.points} ` : "未登録";
    })()}
    <p>pt</p>
  </div>
      </div>


      <svg className="svg"
        width={radius * 2 + 80}
        height={radius + 45}
        viewBox={`0 0 ${radius * 2 + 20} ${radius + 20}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`鳩ポイント: ${safeValue} / ${max}`}
      >
        <defs>
          <linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            x1="20"
            y1={radius + 10}
            x2={radius * 2 + 10}
            y2={radius + 10}
          >
            <stop offset="0%" stopColor="#2600FF" />
            <stop offset="100%" stopColor="#8400FF" />
          </linearGradient>
        </defs>

        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          strokeWidth={strokeWidth}
          className="track"
          strokeLinecap="round"
        />

        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth - 2}
          className="trackwhite"
          strokeLinecap="round"
        />

        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          className="progress"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: Math.max(0, circumference - progress),
            transition: "stroke-dashoffset 400ms ease",
          }}
        />
      </svg>

      
    </div>
  );
};

export default SemiCircleMeter;