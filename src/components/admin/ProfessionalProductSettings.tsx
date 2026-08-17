import { useState, type FormEvent } from 'react';
import type { Product } from '@/data/products';
import type { ProfessionalProductFormValues } from '@/lib/products/types';

type Settings = ProfessionalProductFormValues;

const professionalCategories = ['lash', 'pmu', 'waxing', 'skincare', 'salon_supply', 'academy'];
const availableBusinessTypes = ['beauty_salon', 'lash_artist', 'pmu_artist', 'academy', 'distributor'];
const emptySettings: Settings = {
  professionalCategory: null, businessTypes: [], minimumOrderQuantity: null,
  bulkAvailable: false, oemAvailable: false, sampleAvailable: false, exportAvailable: false,
  recommendedCountries: [], marketingTags: [], professionalDescription: null,
};

function settingsFromProduct(product: Product): Settings {
  return {
    professionalCategory: product.professionalCategory ?? '',
    businessTypes: product.businessTypes ?? [],
    minimumOrderQuantity: product.minimumOrderQuantity ?? null,
    bulkAvailable: product.bulkAvailable ?? false,
    oemAvailable: product.oemAvailable ?? false,
    sampleAvailable: product.sampleAvailable ?? false,
    exportAvailable: product.exportAvailable ?? false,
    recommendedCountries: product.recommendedCountries ?? [],
    marketingTags: product.marketingTags ?? [],
    professionalDescription: product.professionalDescription ?? '',
  };
}

export default function ProfessionalProductSettings({ products }: { products: Product[] }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? '');
  const selectedProduct = products.find((product) => product.id === selectedId) ?? products[0];
  const [settings, setSettings] = useState<Settings>(() => selectedProduct ? settingsFromProduct(selectedProduct) : emptySettings);
  const [prepared, setPrepared] = useState(false);

  if (!selectedProduct) return null;

  const selectProduct = (id: string) => {
    const product = products.find((candidate) => candidate.id === id);
    setSelectedId(id);
    if (product) setSettings(settingsFromProduct(product));
    setPrepared(false);
  };

  const toggleBusinessType = (value: string) => {
    setSettings((current) => ({
      ...current,
      businessTypes: current.businessTypes?.includes(value)
        ? current.businessTypes.filter((item) => item !== value)
        : [...(current.businessTypes ?? []), value],
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPrepared(true);
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-500">B2B</p>
        <h2 className="mt-1 font-sans text-lg font-semibold">Professional Product Settings</h2>
        <p className="mt-1 text-sm text-black/40">전문 판매 정보를 입력할 상품을 선택하세요. 현재 단계에서는 입력 구조만 준비하며 원격 저장은 하지 않습니다.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">상품
          <select className="input-field mt-2" value={selectedId} onChange={(event) => selectProduct(event.target.value)}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.translations.ko.name}</option>)}
          </select>
        </label>
        <label className="text-sm">전문가 카테고리
          <select className="input-field mt-2" value={settings.professionalCategory ?? ''} onChange={(event) => setSettings((current) => ({ ...current, professionalCategory: event.target.value || null }))}>
            <option value="">선택 안 함</option>
            {professionalCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-sm">MOQ
          <input className="input-field mt-2" type="number" min="0" value={settings.minimumOrderQuantity ?? ''} onChange={(event) => setSettings((current) => ({ ...current, minimumOrderQuantity: event.target.value ? Number(event.target.value) : null }))} />
        </label>
        <label className="text-sm">추천 국가
          <input className="input-field mt-2" value={settings.recommendedCountries?.join(', ') ?? ''} onChange={(event) => setSettings((current) => ({ ...current, recommendedCountries: event.target.value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean) }))} placeholder="VN, TH, PH" />
        </label>
      </div>

      <fieldset className="mt-5"><legend className="text-sm font-medium">추천 사업 유형</legend><div className="mt-2 flex flex-wrap gap-2">{availableBusinessTypes.map((type) => <label key={type} className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs"><input type="checkbox" checked={settings.businessTypes?.includes(type) ?? false} onChange={() => toggleBusinessType(type)} />{type}</label>)}</div></fieldset>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">{([
        ['bulkAvailable', '대량 구매'], ['oemAvailable', 'OEM'], ['sampleAvailable', '샘플'], ['exportAvailable', '수출'],
      ] as const).map(([field, label]) => <label key={field} className="flex items-center gap-2 rounded-xl bg-[#f5f6f4] px-3 py-3 text-sm"><input type="checkbox" checked={settings[field] ?? false} onChange={(event) => setSettings((current) => ({ ...current, [field]: event.target.checked }))} />{label}</label>)}</div>

      <label className="mt-5 block text-sm">전문가 설명
        <textarea className="input-field mt-2 min-h-28 resize-y" value={settings.professionalDescription ?? ''} onChange={(event) => setSettings((current) => ({ ...current, professionalDescription: event.target.value }))} />
      </label>

      {prepared ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">입력값이 준비되었습니다. Supabase 상품 동기화 단계에서 저장 기능을 연결할 수 있습니다.</p> : null}
      <button className="mt-5 rounded-xl bg-charcoal-800 px-5 py-3 text-sm font-medium text-white">입력값 확인</button>
    </form>
  );
}
