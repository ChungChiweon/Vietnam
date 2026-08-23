export interface ProductRow {
  id: string;
  slug: string;
  name_ko: string;
  name_vi: string | null;
  name_en: string | null;
  description_ko: string | null;
  description_vi: string | null;
  description_en: string | null;
  category: string;
  images: unknown;
  options: unknown;
  price: number | null;
  is_new: boolean;
  is_best: boolean;
  professional_category: string | null;
  business_types: unknown;
  minimum_order_quantity: number | null;
  bulk_available: boolean;
  oem_available: boolean;
  sample_available: boolean;
  export_available: boolean;
  recommended_countries: unknown;
  marketing_tags: unknown;
  ingredient_tags?: unknown;
  benefit_tags?: unknown;
  skin_concern_tags?: unknown;
  skin_type_tags?: unknown;
  inci_ingredients?: unknown;
  normalized_ingredients?: unknown;
  caution_tags?: unknown;
  derived_benefit_tags?: unknown;
  verification_status?: string | null;
  verification_source?: string | null;
  verified_at?: string | null;
  professional_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProductFormValues {
  professionalCategory: string | null;
  businessTypes: string[];
  minimumOrderQuantity: number | null;
  bulkAvailable: boolean;
  oemAvailable: boolean;
  sampleAvailable: boolean;
  exportAvailable: boolean;
  recommendedCountries: string[];
  marketingTags: string[];
  professionalDescription: string | null;
}
