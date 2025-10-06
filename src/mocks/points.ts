// src/mocks/points.ts
export type UserPoint = { id: string; name: string; points: number; updatedAt: string };

export const mockPoints: UserPoint[] = [
  { id: "u1", name: "田中", points: 120, updatedAt: "2025-09-30T12:00:00Z" },
  { id: "u2", name: "佐藤", points: 805, updatedAt: "2025-09-29T20:00:00Z" },
  { id: "u3", name: "森", points: 2640, updatedAt: "2025-09-29T20:00:00Z" },
  { id: "aaa", name: "松橋", points: 810, updatedAt: "2025-09-29T20:00:00Z" },
];