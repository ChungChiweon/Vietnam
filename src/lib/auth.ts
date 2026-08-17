import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const userTypes = ['consumer', 'professional', 'distributor'] as const;
export type UserType = typeof userTypes[number];

export const businessTypes = ['beauty_salon', 'lash_studio', 'pmu_artist', 'waxing_shop', 'beauty_school', 'distributor', 'importer', 'wholesaler'] as const;
export type BusinessType = typeof businessTypes[number];

export interface Profile {
  id: string;
  user_type: UserType;
  business_verified: boolean;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessProfileInput {
  company_name: string;
  business_type: BusinessType;
  country: string;
  city?: string;
  sns_url?: string;
  phone?: string;
  website?: string;
  description?: string;
  distribution_focus?: string;
  expected_purchase_scale?: string;
}

export interface BusinessProfile extends BusinessProfileInput {
  id: string;
  user_id: string;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegistrationInput {
  email: string;
  password: string;
  userType: UserType;
  businessProfile?: BusinessProfileInput;
}

export function normalizeUserType(value: unknown): UserType {
  return typeof value === 'string' && userTypes.includes(value as UserType) ? value as UserType : 'consumer';
}

export function isProfessionalUser(profile: Pick<Profile, 'user_type'> | null | undefined) {
  return profile?.user_type === 'professional';
}

export function isDistributorUser(profile: Pick<Profile, 'user_type'> | null | undefined) {
  return profile?.user_type === 'distributor';
}

export function canAccessB2BFeature(profile: Pick<Profile, 'user_type'> | null | undefined) {
  return isProfessionalUser(profile) || isDistributorUser(profile);
}

export function buildSignUpMetadata(input: RegistrationInput) {
  const userType = normalizeUserType(input.userType);
  return {
    user_type: userType,
    ...(userType !== 'consumer' && input.businessProfile ? { business_profile: input.businessProfile } : {}),
  };
}

export function fallbackProfile(user: User): Profile {
  return {
    id: user.id,
    user_type: normalizeUserType(user.user_metadata?.user_type),
    business_verified: false,
    is_admin: false,
  };
}

export async function loadMemberProfile(user: User) {
  if (!supabase) return { profile: fallbackProfile(user), businessProfile: null };
  const [{ data: profile, error: profileError }, { data: businessProfile }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ]);
  if (profileError || !profile) return { profile: fallbackProfile(user), businessProfile: null };
  return { profile: profile as Profile, businessProfile: businessProfile as BusinessProfile | null };
}

export async function isAdminUser(user: User) {
  const { profile } = await loadMemberProfile(user);
  return profile.is_admin;
}
