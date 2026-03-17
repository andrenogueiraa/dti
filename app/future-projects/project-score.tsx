"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";

type ProjectScoreInput = {
  socialImpact: number | null;
  semarhImpact: number | null;
  complexity: string | null;
  estimatedWeeks: number | null;
};

const DEFAULT_SOCIAL_IMPACT = 5;
const DEFAULT_SEMARH_IMPACT = 5;
const DEFAULT_COMPLEXITY = "M";
const DEFAULT_ESTIMATED_WEEKS = 26;

const MAX_WEEKS = 52;

const COMPLEXITY_VALUE_MAP: Record<string, number> = {
  MB: 2,
  B: 4,
  M: 6,
  A: 8,
  MA: 10,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeImpact(value: number) {
  return clamp(value, 1, 10);
}

function normalizeComplexity(complexity: string) {
  return COMPLEXITY_VALUE_MAP[complexity] ?? COMPLEXITY_VALUE_MAP[DEFAULT_COMPLEXITY];
}

function normalizeWeeks(weeks: number) {
  // 1 semana -> 1, 52+ semanas -> 10 (linear)
  const w = clamp(weeks, 1, MAX_WEEKS);
  const t = (w - 1) / (MAX_WEEKS - 1); // 0..1
  return 1 + t * 9; // 1..10
}

const RAW_SCORE_MIN = -3.4;
const RAW_SCORE_MAX = 5.4;

export function calculateScore(input: ProjectScoreInput) {
  const socialImpact = normalizeImpact(input.socialImpact ?? DEFAULT_SOCIAL_IMPACT);
  const semarhImpact = normalizeImpact(input.semarhImpact ?? DEFAULT_SEMARH_IMPACT);
  const complexityValue = normalizeComplexity(input.complexity ?? DEFAULT_COMPLEXITY);
  const timeValue = normalizeWeeks(input.estimatedWeeks ?? DEFAULT_ESTIMATED_WEEKS);

  const positive = socialImpact * 0.3 + semarhImpact * 0.3;
  const negative = complexityValue * 0.2 + timeValue * 0.2;

  const raw = positive - negative;
  const normalized = 1 + ((raw - RAW_SCORE_MIN) / (RAW_SCORE_MAX - RAW_SCORE_MIN)) * 9;
  return clamp(normalized, 1, 10);
}

function formatScore(value: number) {
  return value.toFixed(1);
}

function getScoreVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 7) return "default";
  if (score >= 4) return "secondary";
  return "destructive";
}

export function ProjectScoreBadge({ project }: { project: ProjectScoreInput }) {
  const score = useMemo(() => calculateScore(project), [project]);
  const variant = getScoreVariant(score);

  return <Badge variant={variant}>{formatScore(score)}</Badge>;
}

