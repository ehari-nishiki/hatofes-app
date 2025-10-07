// src/mocks/userLevels.ts
import { mockPoints } from './points';

// レベルの閾値定義
export const LEVEL_THRESHOLDS = [
  { level: 0, min: 0, max: 999 },
  { level: 1, min: 1000, max: 1499 },
  { level: 2, min: 1500, max: 2499 },
  { level: 3, min: 2500, max: 4999 },
  { level: 4, min: 5000, max: 9999 },
  { level: 5, min: 10000, max: Infinity }
];

// ユーザーレベル情報の型定義
export type UserLevelInfo = {
  userId: string;
  points: number;
  level: number;
  nextLevelPoints: number;
  remainingPoints: number;
  rank: number;
  totalParticipants: number;
  updatedAt: string;
};

// 参加者総数（実際のアプリではFirestoreから取得）
const TOTAL_PARTICIPANTS = 1020;

/**
 * ポイントからレベルを計算する関数
 */
export function calculateLevel(points: number): number {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (points >= threshold.min && points <= threshold.max) {
      return threshold.level;
    }
  }
  return 0; // デフォルト
}

/**
 * 次のレベルまでに必要なポイントを計算する関数
 */
export function calculateNextLevelPoints(points: number): { nextLevel: number, remainingPoints: number } {
  const currentLevel = calculateLevel(points);
  const nextLevelThreshold = LEVEL_THRESHOLDS.find(t => t.level > currentLevel);
  
  if (!nextLevelThreshold) {
    // 最大レベルの場合
    return { nextLevel: currentLevel + 1, remainingPoints: 0 };
  }
  
  return {
    nextLevel: nextLevelThreshold.level,
    remainingPoints: nextLevelThreshold.min - points
  };
}

/**
 * ユーザーIDからレベル情報を取得する関数（Firestoreの代わり）
 */
export function getUserLevelInfo(userId: string): UserLevelInfo | null {
  // ユーザーを検索
  const user = mockPoints.find(u => u.id === userId);
  if (!user) return null;
  
  // ポイントでソートして順位を計算
  const sortedUsers = [...mockPoints].sort((a, b) => b.points - a.points);
  const rank = sortedUsers.findIndex(u => u.id === userId) + 1;
  
  // レベル情報を計算
  const level = calculateLevel(user.points);
  const { nextLevel, remainingPoints } = calculateNextLevelPoints(user.points);
  
  return {
    userId: user.id,
    points: user.points,
    level,
    nextLevelPoints: nextLevel,
    remainingPoints,
    rank,
    totalParticipants: TOTAL_PARTICIPANTS,
    updatedAt: user.updatedAt
  };
}