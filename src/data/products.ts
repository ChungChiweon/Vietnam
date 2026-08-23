import type { LanguageCode } from '@/config/languages';
import catalog from './jlmedicos-products.json';

export type CategoryId =
  | 'pmu-machines-needles'
  | 'pmu-pigments'
  | 'pmu-supplies'
  | 'lash'
  | 'waxing'
  | 'oem'
  | 'competition';

export interface Category {
  id: CategoryId;
  image: string;
  icon: string;
}

export interface ProductTranslation {
  name: string;
  originalName: string;
  summary: string;
  benefits: string[];
  usage: string;
  ingredients: string;
  wholesaleInfo: string;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  category: CategoryId;
  image: string;
  gallery: string[];
  detailImages: string[];
  options: string[];
  sourceUrl: string;
  priceKrw: number | null;
  capacity: string;
  moq: number;
  countryOfOrigin: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  professionalCategory?: string | null;
  businessTypes?: string[] | null;
  minimumOrderQuantity?: number | null;
  bulkAvailable?: boolean;
  oemAvailable?: boolean;
  sampleAvailable?: boolean;
  exportAvailable?: boolean;
  recommendedCountries?: string[] | null;
  marketingTags?: string[] | null;
  ingredientTags?: string[] | null;
  benefitTags?: string[] | null;
  skinConcernTags?: string[] | null;
  skinTypeTags?: string[] | null;
  inciIngredients?: string[] | null;
  normalizedIngredients?: string[] | null;
  cautionTags?: string[] | null;
  derivedBenefitTags?: string[] | null;
  verificationStatus?: 'unverified' | 'label_verified' | 'brand_verified' | 'admin_verified' | null;
  verificationSource?: string | null;
  verifiedAt?: string | null;
  professionalDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations: Record<LanguageCode, ProductTranslation>;
}

export interface LocalizedProduct extends Product, ProductTranslation {
  categoryLabel: string;
}

const categoryCopy: Record<CategoryId, { ko: string; vi: string; en: string }> = {
  'pmu-machines-needles': { ko: '반영구 머신 & 니들', vi: 'Máy & kim phun xăm', en: 'PMU machines & needles' },
  'pmu-pigments': { ko: '반영구 색소', vi: 'Mực phun xăm', en: 'PMU pigments' },
  'pmu-supplies': { ko: '반영구 재료', vi: 'Dụng cụ phun xăm', en: 'PMU supplies' },
  lash: { ko: '속눈썹', vi: 'Sản phẩm nối mi', en: 'Lash supplies' },
  waxing: { ko: '왁싱 재료', vi: 'Sản phẩm waxing', en: 'Waxing supplies' },
  oem: { ko: 'OEM & ODM', vi: 'OEM & ODM', en: 'OEM & ODM' },
  competition: { ko: '대회 준비물', vi: 'Dụng cụ thi đấu', en: 'Competition supplies' },
};

const categoryImages = Object.fromEntries(
  catalog.products.map((product) => [product.categoryId, product.mainImage])
) as Record<CategoryId, string>;

export const categories: Category[] = [
  { id: 'pmu-machines-needles', image: categoryImages['pmu-machines-needles'], icon: 'PenTool' },
  { id: 'pmu-pigments', image: categoryImages['pmu-pigments'], icon: 'Droplets' },
  { id: 'pmu-supplies', image: categoryImages['pmu-supplies'], icon: 'BriefcaseMedical' },
  { id: 'lash', image: categoryImages.lash, icon: 'Eye' },
  { id: 'waxing', image: categoryImages.waxing, icon: 'Sparkles' },
  { id: 'oem', image: categoryImages.oem, icon: 'Factory' },
  { id: 'competition', image: categoryImages.competition, icon: 'Trophy' },
];

const genericCopy = (category: CategoryId, lang: LanguageCode, name: string): ProductTranslation => {
  const label = categoryCopy[category][lang];
  if (lang === 'vi') return {
    name,
    originalName: name,
    summary: `${label} chính hãng từ Hàn Quốc dành cho spa, salon và chuyên viên làm đẹp tại Việt Nam.`,
    benefits: ['Sản phẩm chuyên nghiệp nhập khẩu từ Hàn Quốc', 'Phù hợp cho spa, salon và chuyên viên', 'Hỗ trợ tư vấn lựa chọn và báo giá sỉ'],
    usage: 'Vui lòng kiểm tra hướng dẫn chi tiết và lựa chọn phiên bản phù hợp trước khi sử dụng.',
    ingredients: 'Thông số và thành phần chi tiết được cung cấp theo từng sản phẩm khi báo giá.',
    wholesaleInfo: 'Liên hệ để nhận báo giá sỉ, số lượng tối thiểu và phương án vận chuyển đến Việt Nam.',
  };
  if (lang === 'en') return {
    name,
    originalName: name,
    summary: `Professional ${label.toLowerCase()} supplied from Korea for beauty studios and distributors in Vietnam.`,
    benefits: ['Professional product sourced from Korea', 'Suitable for beauty studios and trained professionals', 'Wholesale selection and quotation support'],
    usage: 'Review the product-specific guide and select the correct option before professional use.',
    ingredients: 'Detailed specifications and composition are supplied with the quotation for each product.',
    wholesaleInfo: 'Contact us for wholesale pricing, minimum order quantity, and shipping options to Vietnam.',
  };
  return {
    name,
    originalName: name,
    summary: `베트남의 뷰티숍과 전문가를 위한 한국산 ${label} 제품입니다.`,
    benefits: ['한국에서 공급되는 전문가용 제품', '뷰티숍·살롱·전문 시술자용', '도매 상품 선정과 견적 상담 지원'],
    usage: '사용 전 제품별 상세 안내와 옵션을 확인하십시오.',
    ingredients: '제품별 상세 규격과 구성은 견적 상담 시 제공합니다.',
    wholesaleInfo: '베트남 도매가격, 최소 주문수량 및 배송 조건은 문의해 주세요.',
  };
};

export const products: Product[] = catalog.products
  .filter((item): item is typeof item & { error?: never } => !('error' in item))
  .map((item, index) => {
    const category = item.categoryId as CategoryId;
    const options = item.options ?? [];
    const translations = {
      ko: genericCopy(category, 'ko', item.nameKo),
      vi: genericCopy(category, 'vi', item.nameVi),
      en: genericCopy(category, 'en', item.nameKo),
    };
    return {
      id: item.id,
      slug: item.slug,
      brand: 'K-Beauty Wholesale',
      category,
      image: item.mainImage,
      gallery: item.gallery.length ? item.gallery : [item.mainImage],
      detailImages: item.detailImages ?? [],
      options,
      sourceUrl: item.sourceUrl,
      priceKrw: item.priceKrw,
      capacity: options.length ? `${options.length} options` : '1 item',
      moq: 1,
      countryOfOrigin: 'South Korea',
      isBestSeller: index < 12,
      isNewArrival: Number(item.id) >= 630,
      rating: 0,
      reviewCount: 0,
      translations,
    };
  });

export const brands = ['K-Beauty Wholesale'];

export function getCategoryLabel(category: CategoryId, lang: LanguageCode): string {
  return categoryCopy[category][lang];
}

export function getLocalizedProduct(product: Product, lang: LanguageCode): LocalizedProduct {
  const translation = product.translations[lang] ?? product.translations.vi ?? product.translations.ko;
  return { ...product, ...translation, categoryLabel: categoryCopy[product.category][lang] };
}

export const getBestSellers = () => products.filter((product) => product.isBestSeller);
export const getNewArrivals = () => products.filter((product) => product.isNewArrival);
export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);
export const getRelatedProducts = (product: Product, count = 4) =>
  products.filter((candidate) => candidate.category === product.category && candidate.id !== product.id).slice(0, count);

export function hasProfessionalInformation(product: Product) {
  return Boolean(
    product.professionalCategory ||
    product.minimumOrderQuantity != null ||
    product.bulkAvailable ||
    product.oemAvailable ||
    product.sampleAvailable ||
    product.exportAvailable ||
    product.recommendedCountries?.length ||
    product.professionalDescription
  );
}
