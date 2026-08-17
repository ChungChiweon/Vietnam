import { describe, expect, it } from 'vitest';
import { hasProfessionalInformation, products, type Product } from './products';

describe('professional product schema compatibility', () => {
  it('keeps an existing product without B2B fields valid', () => {
    const existing = products[0];
    expect(existing).toBeDefined();
    expect(hasProfessionalInformation(existing)).toBe(false);
  });

  it('recognizes a product with B2B fields', () => {
    const professionalProduct: Product = {
      ...products[0],
      professionalCategory: 'lash',
      businessTypes: ['lash_artist', 'distributor'],
      minimumOrderQuantity: 24,
      bulkAvailable: true,
      oemAvailable: true,
      sampleAvailable: true,
      exportAvailable: true,
      recommendedCountries: ['VN', 'TH', 'PH'],
      marketingTags: ['professional', 'lash', 'korean_beauty'],
      professionalDescription: 'For trained lash professionals.',
    };

    expect(hasProfessionalInformation(professionalProduct)).toBe(true);
    expect(professionalProduct.minimumOrderQuantity).toBe(24);
    expect(professionalProduct.recommendedCountries).toContain('VN');
  });
});
