import { describe, expect, it } from 'vitest';
import { buildSignUpMetadata, canAccessB2BFeature, isDistributorUser, isProfessionalUser, normalizeUserType, type BusinessProfileInput } from './auth';

const professionalProfile: BusinessProfileInput = {
  company_name: 'Lotus Beauty',
  business_type: 'beauty_salon',
  country: 'Vietnam',
  city: 'Ho Chi Minh City',
  sns_url: 'https://instagram.com/lotus',
};

const distributorProfile: BusinessProfileInput = {
  company_name: 'Lotus Distribution',
  business_type: 'distributor',
  country: 'Vietnam',
  distribution_focus: 'Skincare',
  website: 'https://example.com',
  expected_purchase_scale: '1,000 units/month',
};

describe('member registration metadata', () => {
  it('creates a consumer without a business profile', () => {
    expect(buildSignUpMetadata({ email: 'consumer@example.com', password: 'password', userType: 'consumer', businessProfile: professionalProfile })).toEqual({ user_type: 'consumer' });
  });

  it('creates a professional with a business profile', () => {
    expect(buildSignUpMetadata({ email: 'pro@example.com', password: 'password', userType: 'professional', businessProfile: professionalProfile })).toEqual({ user_type: 'professional', business_profile: professionalProfile });
  });

  it('creates a distributor with a business profile', () => {
    expect(buildSignUpMetadata({ email: 'distributor@example.com', password: 'password', userType: 'distributor', businessProfile: distributorProfile })).toEqual({ user_type: 'distributor', business_profile: distributorProfile });
  });

  it('keeps legacy users compatible by defaulting unknown values to consumer', () => {
    expect(normalizeUserType(undefined)).toBe('consumer');
    expect(normalizeUserType('legacy')).toBe('consumer');
  });
});

describe('B2B access helpers', () => {
  const consumer = { user_type: 'consumer' as const };
  const professional = { user_type: 'professional' as const };
  const distributor = { user_type: 'distributor' as const };

  it('recognizes professional and distributor roles', () => {
    expect(isProfessionalUser(professional)).toBe(true);
    expect(isDistributorUser(distributor)).toBe(true);
    expect(canAccessB2BFeature(professional)).toBe(true);
    expect(canAccessB2BFeature(distributor)).toBe(true);
    expect(canAccessB2BFeature(consumer)).toBe(false);
  });
});
