// src/components/SemiCircleMeter/SemiCircleMeter.tsx
import React, { useId } from "react";
import "./SemiCircleMeter.css";
import { getUserLevelInfo } from "../../mocks/userLevels";

// Props の型定義: userId と points を受け取る
type Props = {
  userId: string;
  points: number;
};

// レベル計算関数
function calculateLevel(points: number): { level: number; minPoints: number; maxPoints: number; nextLevel: number; remainingPoints: number } {
  const levels = [
    { level: 1, minPoints: 0, maxPoints: 99 },
    { level: 2, minPoints: 100, maxPoints: 199 },
    { level: 3, minPoints: 200, maxPoints: 299 },
    { level: 4, minPoints: 300, maxPoints: 399 },
    { level: 5, minPoints: 400, maxPoints: 499 },
    { level: 6, minPoints: 500, maxPoints: 599 },
    { level: 7, minPoints: 600, maxPoints: 699 },
    { level: 8, minPoints: 700, maxPoints: 799 },
    { level: 9, minPoints: 800, maxPoints: 899 },
    { level: 10, minPoints: 900, maxPoints: 999 },
  ];

  const currentLevel = levels.find(l => points >= l.minPoints && points <= l.maxPoints) || levels[levels.length - 1];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const remainingPoints = nextLevel ? nextLevel.minPoints - points : 0;

  return {
    level: currentLevel.level,
    minPoints: currentLevel.minPoints,
    maxPoints: currentLevel.maxPoints,
    nextLevel: nextLevel ? nextLevel.level : currentLevel.level,
    remainingPoints: Math.max(0, remainingPoints)
  };
}

const SemiCircleMeter: React.FC<Props> = ({ userId, points }) => {
  const radius = 120;
  const strokeWidth = 16; // より太いストローク
  // 半円の円周の長さを計算（πr）
  const circumference = Math.PI * radius;
  
  // レベル情報を取得
  const levelInfo = calculateLevel(points);
  const userInfo = getUserLevelInfo(userId);
  
  // 進捗に応じた弧の長さを計算（現在のレベル内での進捗）
  const levelProgress = (points - levelInfo.minPoints) / (levelInfo.maxPoints - levelInfo.minPoints);
  const progress = levelProgress * circumference;
  const id = useId();

  return (
    <div className="semi-meter">
        <div className="title-row">
            <div className="Hato-point-title">
                <span className="grad-dot" aria-hidden="true"></span>
                <h1>鳩ポイント</h1>
            </div>
        </div>

        <div className="point-number">
            <span>{points}</span>
            <p>pt</p>
        </div>

      <div className="svg-container">
        <svg className="svg"
        width={radius * 2 + 100}
        height={radius + 60}
        viewBox={`0 0 ${radius * 2 + 40} ${radius + 40}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`鳩ポイント: ${points}`}
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

        {/* 背景の弧（進捗していない部分） - 黒色で太い線 */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#000000"
          strokeWidth={strokeWidth + 4} // 背景を少し太く
          strokeLinecap="round"
        />
        
        {/* 白い枠線 */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2} // 細い白い枠線
          strokeLinecap="round"
        />
        
        {/* 内側の白い枠線 */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
          style={{
            strokeDasharray: `${strokeWidth - 4} ${strokeWidth - 4}`,
            strokeDashoffset: strokeWidth - 4
          }}
        />

        {/* 進捗の弧（グラデーション） */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: Math.max(0, circumference - progress),
            transition: "stroke-dashoffset 400ms ease",
          }}
        />
        
        {/* 進捗バーの先端に白い円を追加 */}
        {progress > 0 && (
          <circle
            cx={20 + radius + Math.cos(Math.PI * (1 - progress / circumference)) * radius}
            cy={radius + 20 - Math.sin(Math.PI * (1 - progress / circumference)) * radius}
            r={strokeWidth / 2}
            fill="white"
            className="progress-indicator"
            style={{
              transition: "cx 400ms ease, cy 400ms ease",
            }}
          />
        )}

        {/* レベル表示をメーターの内側に配置 */}
        <text
          x={radius + 20}
          y={radius + 5}
          textAnchor="middle"
          className="level-display"
          fill="white"
        >
          <tspan className="level-prefix-inside">Lv.</tspan>
          <tspan className="level-value-inside">{levelInfo.level.toString().padStart(2, '0')}</tspan>
        </text>
        
        {/* レベル表示と次レベル情報の間の線 */}
        <line
          x1={radius - 50}
          y1={radius + 18}
          x2={radius + 90}
          y2={radius + 18}
          stroke="white"
          strokeWidth="1"
        />
        
        {/* 次のレベルまでの情報 */}
        <text
          x={radius + 20}
          y={radius + 35}
          textAnchor="middle"
          className="next-level-info"
          fill="white"
        >
          Lv.{levelInfo.nextLevel.toString().padStart(2, '0')}まであと{levelInfo.remainingPoints}pt
        </text>
        
        {/* レベル範囲をプログレスバーの両端に配置 */}
        <text
          x={20}
          y={radius + 60}
          textAnchor="start"
          className="range-start"
          fill="white"
        >
          {levelInfo.minPoints}pt
        </text>
        
        <text
          x={radius * 2 + 20}
          y={radius + 60}
          textAnchor="end"
          className="range-end"
          fill="white"
        >
          {levelInfo.maxPoints}pt
        </text>
      </svg>
      </div>

      {/* 順位表示をメーターの下に移動 */}
      {userInfo && (
        <div className="stats-container">
          <div className="stat-box">
            <span className="rank-label">校内順位</span>
            <div className="rank-number-bottom">
              <span className="rank-value-bottom">{userInfo.rank.toString().padStart(4, '0')}</span>
              <span className="rank-suffix-bottom">th</span>
            </div>
          </div>
          <div className="stat-box">
            <span className="participants-label">参加者</span>
            <div className="participants-number">
              <span className="participants-value">{userInfo.totalParticipants}</span>
              <span className="participants-suffix">人中</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemiCircleMeter;