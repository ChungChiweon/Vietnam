import type { Product } from '@/data/products';
import { classifySkinMetrics } from './calibration';
import type { ProductRecommendation, RecommendationInput, SkinNeedTag, SkinRecommendationResult } from './types';

const INGREDIENTS_BY_NEED: Record<SkinNeedTag, string[]> = {
  soothing: ['centella', 'panthenol', 'allantoin'], barrier: ['ceramide', 'panthenol', 'squalane'],
  hydration: ['hyaluronic_acid', 'glycerin'], oil_balance: ['niacinamide', 'zinc_pca'],
  brightening: ['niacinamide', 'vitamin_c'], texture_care: ['pha', 'lactic_acid'],
  blemish_care: ['salicylic_acid', 'niacinamide'], gentle_cleansing: ['gentle', 'low_ph'],
};

const normalize = (values?: string[] | null) => new Set((values ?? []).map((value) => value.trim().toLowerCase().replace(/[\s-]+/g, '_')));

export function getSkinNeedTags(levels: ReturnType<typeof classifySkinMetrics>, questionnaire: RecommendationInput['questionnaire']): SkinNeedTag[] {
  const needs = new Set<SkinNeedTag>();
  const sensitive = questionnaire.sensitive === true;
  if (levels.redness === 'high' || questionnaire.concern === 'redness') needs.add('soothing');
  if ((levels.redness === 'high' && sensitive) || questionnaire.concern === 'dryness') needs.add('barrier');
  if (questionnaire.concern === 'dryness' || questionnaire.feel === 'tight') needs.add('hydration');
  if (levels.shine === 'high' || questionnaire.feel === 'oily' || questionnaire.feel === 'combination') needs.add('oil_balance');
  if (levels.unevenTone === 'high' || questionnaire.concern === 'pigment') needs.add('brightening');
  if (levels.texture === 'high' || questionnaire.concern === 'pores') needs.add('texture_care');
  if (levels.blemishes === 'high' || questionnaire.concern === 'blemish') needs.add('blemish_care');
  if (sensitive) needs.add('gentle_cleansing');
  return [...needs];
}

function scoreProduct(product: Product, needs: SkinNeedTag[], skinType: string | undefined, index: number): ProductRecommendation & { index: number } {
  const benefits = normalize(product.benefitTags);
  const ingredients = normalize(product.ingredientTags);
  const concerns = normalize(product.skinConcernTags);
  const marketing = normalize(product.marketingTags);
  const skinTypes = normalize(product.skinTypeTags);
  const matchedNeeds = needs.filter((need) => benefits.has(need) || concerns.has(need) || marketing.has(need));
  const desiredIngredients = new Set(needs.flatMap((need) => INGREDIENTS_BY_NEED[need]));
  const matchedIngredients = [...ingredients].filter((ingredient) => desiredIngredients.has(ingredient));
  const matchedBenefits = [...benefits].filter((benefit) => needs.includes(benefit as SkinNeedTag));
  const score = matchedNeeds.length * 4 + matchedBenefits.length * 3 + matchedIngredients.length * 2 + (skinType && skinTypes.has(skinType) ? 1 : 0);
  return { product, score, matchedNeeds, matchedBenefits, matchedIngredients, index };
}

export function getRecommendedProducts({ skinResult, questionnaire, products, limit = 3 }: RecommendationInput): SkinRecommendationResult {
  const emptyLevels = classifySkinMetrics({ calibratedMetrics: null, scores: null, metricConfidence: undefined });
  if (!skinResult || skinResult.status !== 'ready' || !skinResult.scores) return { eligible: false, reason: 'invalid_analysis', needs: [], concernLevels: emptyLevels, products: [] };
  const concernLevels = classifySkinMetrics(skinResult);
  if (skinResult.confidence < 60) return { eligible: false, reason: 'low_confidence', needs: [], concernLevels, products: [] };
  if ((skinResult.skinMaskCoverage ?? 0) < 22) return { eligible: false, reason: 'insufficient_skin', needs: [], concernLevels, products: [] };
  if (Object.values(concernLevels).filter((level) => level === 'unknown').length > 3) return { eligible: false, reason: 'too_many_unknown_metrics', needs: [], concernLevels, products: [] };
  const needs = getSkinNeedTags(concernLevels, questionnaire);
  const ranked = products.map((product, index) => scoreProduct(product, needs, questionnaire.feel, index)).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, Math.max(0, limit)).map((item) => ({ product: item.product, score: item.score, matchedNeeds: item.matchedNeeds, matchedBenefits: item.matchedBenefits, matchedIngredients: item.matchedIngredients }));
  return { eligible: ranked.length > 0, reason: ranked.length ? undefined : 'no_matching_products', needs, concernLevels, products: ranked };
}

export type { ConcernLevel, ProductRecommendation, QuestionnaireResult, SkinCalibrationProfile, SkinNeedTag, SkinRecommendationResult } from './types';
