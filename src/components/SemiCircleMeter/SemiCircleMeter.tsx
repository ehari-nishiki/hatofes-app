import React from "react";
import "./SemiCircleMeter.css";

type Props = {
  value: number;  // 現在のポイント
  max?: number;   // 最大値（デフォルト 100）
}; 

const SemiCircleMeter: React.FC<Props> = ({ value, max = 100 }) => {
  const radius = 80; // 半径(px)
  const circumference = Math.PI * radius; // 半円の長さ = πr

  const safeValue = Math.max(0, Math.min(value, max));
  const progress = (safeValue / max) * circumference;

  return (
    <div className="semi-meter">
      <svg
        width={radius * 2 + 20}
        height={radius + 20}
        viewBox={`0 0 ${radius * 2 + 20} ${radius + 20}`}
      >
        {/* 背景の半円 */}
        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          className="track"
        />
        {/* 進捗の半円 */}
        <path
          d={`M10 ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 10} ${radius + 10}`}
          className="progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - progress,
          }}
        />
      </svg>
      <div className="value">{safeValue} / {max}</div>
    </div>
  );
};

export default SemiCircleMeter;