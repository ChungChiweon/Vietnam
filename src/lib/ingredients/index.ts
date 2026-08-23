import type { SkinNeedTag } from '@/lib/skinRecommendation/types';

const aliases: Record<string, string> = {
  'centella asiatica extract': 'centella_asiatica', 'centella asiatica': 'centella_asiatica',
  panthenol: 'panthenol', 'ceramide np': 'ceramide_np', niacinamide: 'niacinamide',
  'hyaluronic acid': 'hyaluronic_acid', 'sodium hyaluronate': 'sodium_hyaluronate', glycerin: 'glycerin',
  allantoin: 'allantoin', squalane: 'squalane', 'ascorbic acid': 'vitamin_c',
  'salicylic acid': 'salicylic_acid', 'zinc pca': 'zinc_pca', 'lactic acid': 'lactic_acid',
};

export const ingredientKnowledge: Record<string, { benefits: SkinNeedTag[] }> = {
  centella_asiatica: { benefits: ['soothing'] }, panthenol: { benefits: ['soothing', 'barrier'] },
  ceramide_np: { benefits: ['barrier'] }, niacinamide: { benefits: ['brightening', 'oil_balance'] },
  hyaluronic_acid: { benefits: ['hydration'] }, sodium_hyaluronate: { benefits: ['hydration'] },
  glycerin: { benefits: ['hydration'] }, allantoin: { benefits: ['soothing'] }, squalane: { benefits: ['barrier'] },
  vitamin_c: { benefits: ['brightening'] }, salicylic_acid: { benefits: ['blemish_care'] },
  zinc_pca: { benefits: ['oil_balance'] }, lactic_acid: { benefits: ['texture_care'] },
};

export function normalizeIngredientName(name: string) {
  const cleaned = name.trim().toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return aliases[cleaned] ?? cleaned.replace(/\s+/g, '_');
}

export function normalizeIngredientList(ingredients: string[]) {
  return [...new Set(ingredients.map(normalizeIngredientName).filter(Boolean))];
}

export function deriveBenefitTags(normalizedIngredients: string[], verifiedBenefitTags: string[] = []) {
  return [...new Set([...verifiedBenefitTags, ...normalizedIngredients.flatMap((ingredient) => ingredientKnowledge[ingredient]?.benefits ?? [])])];
}
