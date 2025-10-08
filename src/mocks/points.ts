// src/mocks/points.ts

// ユーザーポイントの型定義
export type UserPoint = { 
  id: string; 
  name: string; 
  points: number; 
  updatedAt: string; 
};

// レベル閾値の定義
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
  name: string;
  points: number;
  level: number;
  nextLevelPoints: number;
  remainingPoints: number;
  rank: number;
  totalParticipants: number;
  updatedAt: string;
};

// 擬似データベース：ユーザーポイントデータ
export const mockPoints: UserPoint[] = [
  { id: "u1", name: "田中", points: 120, updatedAt: "2025-09-30T12:00:00Z" },
  { id: "u2", name: "佐藤", points: 805, updatedAt: "2025-09-29T20:00:00Z" },
  { id: "u3", name: "森", points: 2640, updatedAt: "2025-09-29T20:00:00Z" },
  { id: "aaa", name: "松橋", points: 810, updatedAt: "2025-09-29T20:00:00Z" },
];

// 参加者総数（実際のアプリではFirestoreから取得）
const TOTAL_PARTICIPANTS = 1020;

/**
 * データベース風API：ユーザーIDからユーザー情報を取得
 */
export function getUserById(userId: string): UserPoint | null {
  return mockPoints.find(user => user.id === userId) || null;
}

/**
 * データベース風API：全ユーザーを取得
 */
export function getAllUsers(): UserPoint[] {
  return [...mockPoints];
}

/**
 * データベース風API：ポイント順でソートされたユーザーリストを取得
 */
export function getUsersByPointsDesc(): UserPoint[] {
  return [...mockPoints].sort((a, b) => b.points - a.points);
}

/**
 * データベース風API：ユーザーの順位を取得
 */
export function getUserRank(userId: string): number {
  const sortedUsers = getUsersByPointsDesc();
  const rank = sortedUsers.findIndex(user => user.id === userId) + 1;
  return rank > 0 ? rank : -1; // 見つからない場合は-1
}

/**
 * レベル計算：ポイントからレベルを計算
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
 * 次のレベル計算：次のレベルまでに必要なポイントを計算
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
 * メインAPI：ユーザーIDから完全なレベル情報を取得（Firestoreの代わり）
 */
export function getUserLevelInfo(userId: string): UserLevelInfo | null {
  // ユーザーを検索
  const user = getUserById(userId);
  if (!user) return null;
  
  // 順位を計算
  const rank = getUserRank(userId);
  
  // レベル情報を計算
  const level = calculateLevel(user.points);
  const { nextLevel, remainingPoints } = calculateNextLevelPoints(user.points);
  
  return {
    userId: user.id,
    name: user.name,
    points: user.points,
    level,
    nextLevelPoints: nextLevel,
    remainingPoints,
    rank,
    totalParticipants: TOTAL_PARTICIPANTS,
    updatedAt: user.updatedAt
  };
}

/**
 * データベース風API：ユーザーポイントを更新（実際のアプリではFirestoreに保存）
 */
export function updateUserPoints(userId: string, newPoints: number): boolean {
  const userIndex = mockPoints.findIndex(user => user.id === userId);
  if (userIndex === -1) return false;
  
  mockPoints[userIndex].points = newPoints;
  mockPoints[userIndex].updatedAt = new Date().toISOString();
  return true;
}

/**
 * データベース風API：新しいユーザーを追加
 */
export function addUser(id: string, name: string, points: number = 0): boolean {
  // 既存ユーザーチェック
  if (getUserById(id)) return false;
  
  mockPoints.push({
    id,
    name,
    points,
    updatedAt: new Date().toISOString()
  });
  return true;
}