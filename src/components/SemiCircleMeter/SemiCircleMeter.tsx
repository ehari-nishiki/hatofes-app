// src/components/SemiCircleMeter/SemiCircleMeter.tsx
import React, { useId } from "react";
import "./SemiCircleMeter.css";
import { getUserLevelInfo, LEVEL_THRESHOLDS } from "../../mocks/points";

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

// Props の型定義: userId と points を受け取る
type Props = {
  userId: string;
  points: number;
};

// 統一されたレベル計算関数
function calculateLevel(points: number): { level: number; minPoints: number; maxPoints: number; nextLevel: number; remainingPoints: number } {
  // 現在のレベルを特定
  const currentThreshold = LEVEL_THRESHOLDS.find(t => points >= t.min && points <= t.max) || LEVEL_THRESHOLDS[0];
  
  // 次のレベルを特定
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level > currentThreshold.level);
  
  return {
    level: currentThreshold.level,
    minPoints: currentThreshold.min,
    maxPoints: currentThreshold.max,
    nextLevel: nextThreshold ? nextThreshold.level : currentThreshold.level + 1,
    remainingPoints: nextThreshold ? nextThreshold.min - points : 0
  };
}

const SemiCircleMeter: React.FC<Props> = ({ userId, points }) => {
  const radius = 120;
  const strokeWidth = 20; // より太いストロークで画像に近づける
  // 半円の円周の長さを計算（πr）
  const circumference = Math.PI * radius;
  
  // レベル情報を取得
  const levelInfo = calculateLevel(points);
  const userInfo = getUserLevelInfo(userId);
  
  // 最終同期時間を取得
  const lastSyncText = userInfo ? formatLastSync(userInfo.updatedAt) : "最終同期 不明";
  
  // 進捗に応じた弧の長さを計算（ユーザーの要求に基づいた計算）
  // メーターの表示ポイント範囲 = 次のレベルに達するポイント - 現在のレベルに達するポイント
  const meterRange = levelInfo.maxPoints - levelInfo.minPoints;
  
  // 現在のポイントから現在のレベルになるために必要なポイントを引く
  const currentProgressInLevel = points - levelInfo.minPoints;
  
  // それをメーターの表示ポイント範囲で割って達成率を算出
  const levelProgress = Math.max(0, Math.min(1, currentProgressInLevel / meterRange));
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
            <span>{points.toString().padStart(5, '0')}</span>
            <p>pt</p>
        </div>

      <div className="svg-container">
        {/* 最終同期表示をSVGの外、右上端に配置 */}
        <div className="last-updated-outside">
          {lastSyncText}
        </div>
        
        <svg className="svg"
        width={radius * 2 + 100}
        height={radius + 60}
        viewBox={`0 0 ${radius * 2 + 40} ${radius + 40}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`鳩ポイント: ${points}`}
      >
        <defs>
          {/* メインのグラデーション - 画像に合わせた鮮やかな青紫 */}
          <linearGradient
            id={`${id}-main`}
            gradientUnits="userSpaceOnUse"
            x1="20"
            y1={radius + 10}
            x2={radius * 2 + 10}
            y2={radius + 10}
          >
            <stop offset="0%" stopColor="#4A00FF" />
            <stop offset="50%" stopColor="#6B46C1" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          
          {/* 3D効果用のシャドウグラデーション */}
          <linearGradient
            id={`${id}-shadow`}
            gradientUnits="userSpaceOnUse"
            x1="20"
            y1={radius + 10}
            x2={radius * 2 + 10}
            y2={radius + 10}
          >
            <stop offset="0%" stopColor="#1A0040" />
            <stop offset="50%" stopColor="#2D1B69" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          
          {/* ハイライト用のグラデーション */}
          <linearGradient
            id={`${id}-highlight`}
            gradientUnits="userSpaceOnUse"
            x1="20"
            y1={radius + 10}
            x2={radius * 2 + 10}
            y2={radius + 10}
          >
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          
          {/* インジケーター用のドロップシャドウフィルター */}
          <filter id={`${id}-drop-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* 背景の弧（進捗していない部分） - より明るい色で見やすく */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke="#444444"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          className="track"
        />
        
        {/* シャドウレイヤー（3D効果） */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke={`url(#${id}-shadow)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - progress,
            transition: "stroke-dashoffset 400ms ease",
            opacity: 0.8
          }}
        />
        
        {/* メインの進捗弧 */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke={`url(#${id}-main)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - progress,
            transition: "stroke-dashoffset 400ms ease",
          }}
        />
        
        {/* ハイライトレイヤー（3D効果） */}
        <path
          d={`M20 ${radius + 20} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 20}`}
          fill="none"
          stroke={`url(#${id}-highlight)`}
          strokeWidth={strokeWidth * 0.5}
          strokeLinecap="round"
          className="progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - progress,
            transition: "stroke-dashoffset 400ms ease",
            opacity: 0.9
          }}
        />
        
        
        {/* 進捗バーの先端に改良された白い円インジケーター */}
        {progress > 0 && (
          <g>
            {/* インジケーターのシャドウ */}
            <circle
              cx={20 + radius + Math.cos(Math.PI * (1 - progress / circumference)) * radius}
              cy={radius + 22 - Math.sin(Math.PI * (1 - progress / circumference)) * radius}
              r={strokeWidth / 2 + 2}
              fill="#000000"
              opacity="0.2"
            />
            {/* メインのインジケーター */}
            <circle
              cx={20 + radius + Math.cos(Math.PI * (1 - progress / circumference)) * radius}
              cy={radius + 20 - Math.sin(Math.PI * (1 - progress / circumference)) * radius}
              r={strokeWidth / 2 + 1}
              fill="white"
              filter={`url(#${id}-drop-shadow)`}
              className="progress-indicator"
              style={{
                transition: "cx 400ms ease, cy 400ms ease",
              }}
            />
            {/* インジケーターのハイライト */}
            <circle
              cx={20 + radius + Math.cos(Math.PI * (1 - progress / circumference)) * radius - 2}
              cy={radius + 18 - Math.sin(Math.PI * (1 - progress / circumference)) * radius}
              r={strokeWidth / 4}
              fill="rgba(255, 255, 255, 0.8)"
              style={{
                transition: "cx 400ms ease, cy 400ms ease",
              }}
            />
          </g>
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
          x1={radius + 20 - 40}
          y1={radius + 17}
          x2={radius + 20 + 40}
          y2={radius + 17}
          stroke="white"
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* 次のレベルまでの情報 */}
        <text
          x={radius + 20}
          y={radius + 30}
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