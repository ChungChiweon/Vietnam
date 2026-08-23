import type { Product } from '@/data/products';
import type { SkinMetric, SkinVisionResult } from '@/lib/skinVision';

export type ConcernLevel = 'low' | 'moderate' | 'high' | 'unknown';
export type SkinNeedTag = 'soothing' | 'barrier' | 'hydration' | 'oil_balance' | 'brightening' | 'texture_care' | 'blemish_care' | 'gentle_cleansing';

export interface SkinCalibrationProfile {
  version: string;
  metric: SkinMetric;
  lowThreshold: number;
  mediumThreshold: number;
  highThreshold: number;
  minConfidence: number;
  sampleCount: number;
  updatedAt: string | null;
}

export interface QuestionnaireResult {
  concern?: string;
  feel?: string;
  sensitive?: boolean;
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  matchedNeeds: SkinNeedTag[];
  matchedBenefits: string[];
  matchedIngredients: string[];
  recommendationReasons: Array<{ type: 'need' | 'benefit' | 'ingredient' | 'skin_type'; key: string }>;
}

export interface SkinRecommendationResult {
  eligible: boolean;
  reason?: 'invalid_analysis' | 'low_confidence' | 'insufficient_skin' | 'too_many_unknown_metrics' | 'no_matching_products';
  needs: SkinNeedTag[];
  concernLevels: Record<SkinMetric, ConcernLevel>;
  products: ProductRecommendation[];
}

export interface RecommendationInput {
  skinResult: SkinVisionResult | null;
  questionnaire: QuestionnaireResult;
  products: Product[];
  limit?: number;
}
