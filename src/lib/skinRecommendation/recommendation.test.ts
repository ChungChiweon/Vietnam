import { describe, expect, it } from 'vitest';
import type { Product } from '@/data/products';
import type { SkinMetric, SkinVisionResult } from '@/lib/skinVision';
import { classifySkinMetrics } from './calibration';
import { getRecommendedProducts, getSkinNeedTags } from './index';

const metrics = (value: number): Record<SkinMetric, number> => ({ redness: value, unevenTone: value, darkCircles: value, blemishes: value, texture: value, shine: value });
const result = (overrides: Partial<SkinVisionResult> = {}): SkinVisionResult => ({
  status: 'ready', confidence: 85, scores: metrics(20), calibratedMetrics: metrics(20), rawMetrics: metrics(20),
  metricConfidence: metrics(85), skinMaskCoverage: 55, ...overrides,
});
const product = (id: string, tags: Partial<Product> = {}): Product => ({
  id, slug: id, brand: 'test', category: 'pmu-supplies', image: '', gallery: [], detailImages: [], options: [], sourceUrl: '', priceKrw: null,
  capacity: '', moq: 1, countryOfOrigin: 'KR', isBestSeller: false, isNewArrival: false, rating: 0, reviewCount: 0,
  translations: { ko: { name: id, originalName: id, summary: '', benefits: [], usage: '', ingredients: '', wholesaleInfo: '' }, vi: { name: id, originalName: id, summary: '', benefits: [], usage: '', ingredients: '', wholesaleInfo: '' }, en: { name: id, originalName: id, summary: '', benefits: [], usage: '', ingredients: '', wholesaleInfo: '' } }, ...tags,
});

describe('skin calibration and recommendation', () => {
  it('marks a low-confidence metric unknown', () => {
    expect(classifySkinMetrics({ scores: metrics(90), calibratedMetrics: null, metricConfidence: metrics(20) }).redness).toBe('unknown');
  });

  it('maps redness and sensitivity to soothing and barrier', () => {
    const levels = classifySkinMetrics(result({ scores: { ...metrics(20), redness: 90 }, calibratedMetrics: { ...metrics(20), redness: 90 } }));
    expect(getSkinNeedTags(levels, { sensitive: true })).toEqual(expect.arrayContaining(['soothing', 'barrier']));
  });

  it('maps shine and uneven tone to cosmetic needs', () => {
    const high = { ...metrics(20), shine: 90, unevenTone: 90 };
    const needs = getSkinNeedTags(classifySkinMetrics(result({ scores: high, calibratedMetrics: high })), {});
    expect(needs).toEqual(expect.arrayContaining(['oil_balance', 'brightening']));
  });

  it('blocks recommendations when quality or confidence gates fail', () => {
    expect(getRecommendedProducts({ skinResult: result({ status: 'quality' }), questionnaire: {}, products: [] }).products).toHaveLength(0);
    expect(getRecommendedProducts({ skinResult: result({ confidence: 40 }), questionnaire: {}, products: [] }).reason).toBe('low_confidence');
    expect(getRecommendedProducts({ skinResult: result({ skinMaskCoverage: 10 }), questionnaire: {}, products: [] }).reason).toBe('insufficient_skin');
  });

  it('scores tags deterministically and returns at most three stable matches', () => {
    const items = [product('a', { benefitTags: ['soothing'], ingredientTags: ['centella'] }), product('b', { marketingTags: ['soothing'] }), product('c', { skinConcernTags: ['soothing'] }), product('d', { benefitTags: ['soothing'] })];
    const recommendation = getRecommendedProducts({ skinResult: result(), questionnaire: { concern: 'redness' }, products: items });
    expect(recommendation.products).toHaveLength(3);
    expect(recommendation.products[0].product.id).toBe('a');
    expect(recommendation.products[0].matchedIngredients).toContain('centella');
  });

  it('returns only eligible products and safely ignores missing ingredient data', () => {
    expect(getRecommendedProducts({ skinResult: result(), questionnaire: { concern: 'redness' }, products: [product('only', { benefitTags: ['soothing'] })] }).products).toHaveLength(1);
    const none = getRecommendedProducts({ skinResult: result(), questionnaire: { concern: 'redness' }, products: [product('none')] });
    expect(none.products).toHaveLength(0);
    expect(none.reason).toBe('no_matching_products');
  });
});
