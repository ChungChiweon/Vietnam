import { describe, expect, it } from 'vitest';
import { deriveBenefitTags, normalizeIngredientList, normalizeIngredientName } from './index';

describe('ingredient normalization and knowledge', () => {
  it('normalizes supported INCI names deterministically', () => {
    expect(normalizeIngredientName('Centella Asiatica Extract')).toBe('centella_asiatica');
    expect(normalizeIngredientList(['Sodium Hyaluronate', 'Niacinamide', 'Niacinamide'])).toEqual(['sodium_hyaluronate', 'niacinamide']);
  });

  it('derives cosmetic benefits while preserving verified manual tags', () => {
    expect(deriveBenefitTags(['panthenol'], ['hydration'])).toEqual(expect.arrayContaining(['hydration', 'soothing', 'barrier']));
  });
});
