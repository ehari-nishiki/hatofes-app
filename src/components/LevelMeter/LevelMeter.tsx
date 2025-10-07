// src/components/LevelMeter/LevelMeter.tsx
import React, { useId } from "react";
import "./LevelMeter.css";
import { getUserLevelInfo } from "../../mocks/userLevels";

// Props の型定義: userId がユーザーID
type Props = {
  userId: string;
};

// ポイント数からレベルを計算する関数
function calculateLevel(points: number): { level: number; minPoints: number; maxPoints: number; nextLevel: number; remainingPoints: number } {
  if (points < 1000) {
    return { level: 0, minPoints: 0, maxPoints: 999, nextLevel: 1, remainingPoints: 1000 - points };
  } else if (points < 1500) {
    return { level: 1, minPoints: 1000, maxPoints: 1499, nextLevel: 2, remainingPoints: 1500 - points };
  } else if (points < 2500) {
    return { level: 2, minPoints: 1500, maxPoints: 2499, nextLevel: 3, remainingPoints: 2500 - points };
  } else if (points < 5000) {
    return { level: 3, minPoints: 2500, maxPoints: 4999, nextLevel: 4, remainingPoints: 5000 - points };
  } else if (points < 10000) {
    return { level: 4, minPoints: 5000, maxPoints: 9999, nextLevel: 5, remainingPoints: 10000 - points };
  } else {
    return { level: 5, minPoints: 10000, maxPoints: 20000, nextLevel: 6, remainingPoints: 0 };
  }
}

// 最終同期時間を計算する関数
function formatLastSync(updatedAt: string): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "最終同期 今";
  } else if (diffMinutes < 60) {
    return `最終同期 ${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `最終同期 ${diffHours}時間前`;
  } else {
    return `最終同期 ${diffDays}日前`;
  }
}

const LevelMeter: React.FC<Props> = ({ userId }) => {
  const radius = 120;
  const strokeWidth = 10;
  // 半円の円周の長さを計算（πr）
  const circumference = Math.PI * radius;
  
  // ユーザー情報を取得
  const userInfo = getUserLevelInfo(userId);
  
  // ポイント数からレベル情報を計算
  const levelInfo = calculateLevel(userInfo?.points || 0);
  
  // 現在のレベル内での進捗を計算
  const levelProgress = (userInfo?.points || 0 - levelInfo.minPoints) / (levelInfo.maxPoints - levelInfo.minPoints);
  
  // 進捗に応じた弧の長さを計算
  const progress = levelProgress * circumference;
  const id = useId();

  // 最終同期時間を取得（現在時刻ベース）
  const lastSyncText = formatLastSync(new Date().toISOString());

  return (
    <div className="level-meter">
        {/* 鳩ポイント表示 */}
        <div className="points-section">
            <div className="title-row">
                <div className="Hato-point-title">
                    <span className="grad-dot" aria-hidden="true"></span>
                    <h1>鳩ポイント</h1>
                </div>
                <div className="last-updated">
                    {lastSyncText}
                </div>
            </div>
            <div className="points-value">
                {userInfo?.points || 0}pt
            </div>
            <div className="button-container">
                <button className="details-button">詳細を見る</button>
            </div>
        </div>

        {/* レベルシステム */}
        <div className="level-system">
            <div className="level-title">
                <div className="Hato-point-title">
                    <span className="grad-dot" aria-hidden="true"></span>
                    <h2>鳩レベル</h2>
                </div>
            </div>
            
            <div className="level-display">
                 <div className="level-number">
                     <span className="level-prefix">Lv.</span>
                     <span className="level-value">{levelInfo.level.toString().padStart(2, '0')}</span>
                 </div>
                 <div className="next-level-info">
                     Lv.{levelInfo.nextLevel.toString().padStart(2, '0')}まであと{levelInfo.remainingPoints}pt
                 </div>
             </div>

            <svg className="svg"
            width={radius * 2 + 100}
            height={radius + 60}
            viewBox={`0 0 ${radius * 2 + 40} ${radius + 40}`}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={`鳩レベル: ${levelInfo.level}`}
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
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#000000"
          strokeWidth={strokeWidth}
          className="track"
          strokeLinecap="round"
        />

        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth - 2}
          className="trackwhite"
          strokeLinecap="round"
        />

        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
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
        
        {/* 進捗バーの先端に白い円を追加 */}
        {progress > 0 && (
          <circle
            cx={20 + radius + Math.cos(Math.PI * (1 - progress / circumference)) * radius}
            cy={radius + 20 - Math.sin(Math.PI * (1 - progress / circumference)) * radius}
            r={strokeWidth}
            fill="white"
            className="progress-indicator"
            style={{
              transition: "cx 400ms ease, cy 400ms ease",
            }}
          />
        )}
        
        {/* レベル数をメーターの内側に配置 */}
        <text
          x={radius + 20}
          y={radius - 10}
          fill="#ffffff"
          fontSize="48"
          fontWeight="bold"
          textAnchor="middle"
          className="level-number-inside"
        >
          {levelInfo.level.toString().padStart(2, '0')}
        </text>
        <text
          x={radius + 20}
          y={radius - 25}
          fill="#ffffff"
          fontSize="16"
          textAnchor="middle"
          className="level-prefix-inside"
        >
          Lv.
        </text>

        {/* レベル範囲の数字をメーターの下端に配置 */}
        <text
          x="20"
          y={radius + 35}
          fill="#ffffff"
          fontSize="12"
          textAnchor="start"
          className="range-text"
        >
          {levelInfo.minPoints}pt
        </text>
        <text
          x={radius * 2 + 20}
          y={radius + 35}
          fill="#ffffff"
          fontSize="12"
          textAnchor="end"
          className="range-text"
        >
          {levelInfo.maxPoints}pt
        </text>
      </svg>
      
      <div className="rank-container">
        <div className="rank-display">
          <span className="rank-title">校内順位</span>
          <span className="rank-value">
            <span className="rank-number">{userInfo?.rank.toString().padStart(4, '0')}</span>
            <span className="rank-suffix">th</span>
            <span className="rank-divider">|</span>
            <span className="rank-participants">参加者</span>
            <span className="rank-total">{userInfo?.totalParticipants}人中</span>
          </span>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LevelMeter;