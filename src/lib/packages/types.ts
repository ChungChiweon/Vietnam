import type { Product } from '@/data/products';

export interface ProductPackage {
  id: string;
  slug: string;
  nameKo: string;
  nameVi?: string | null;
  nameEn?: string | null;
  descriptionKo?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  targetBusinessTypes: string[];
  recommendedCountries?: string[] | null;
  minimumOrderQuantity?: number | null;
  isActive: boolean;
  images?: string[] | null;
  marketingTags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPackageItem {
  id: string;
  packageId: string;
  productId: string;
  quantity: number;
  sortOrder: number;
}

export interface PackageProductItem extends ProductPackageItem {
  product: Product;
}

export interface PackageWithProducts extends ProductPackage {
  items: PackageProductItem[];
}
