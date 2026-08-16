import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const BASE_URL = 'https://jlmedicos.com';
const OUTPUT = resolve('src/data/jlmedicos-products.json');
const CATEGORY_MAP = {
  24: { id: 'pmu-machines-needles', ko: '반영구 머신 & 니들', vi: 'Máy & kim phun xăm' },
  67: { id: 'pmu-pigments', ko: '반영구 색소', vi: 'Mực phun xăm' },
  25: { id: 'pmu-supplies', ko: '반영구 재료', vi: 'Dụng cụ phun xăm' },
  34: { id: 'lash', ko: '속눈썹', vi: 'Sản phẩm nối mi' },
  103: { id: 'waxing', ko: '왁싱 재료', vi: 'Sản phẩm waxing' },
  97: { id: 'oem', ko: 'OEM & ODM', vi: 'OEM & ODM' },
  140: { id: 'competition', ko: '대회 준비물', vi: 'Dụng cụ thi đấu' },
};

const decode = (value = '') => value
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .trim();

const absoluteUrl = (url = '') => {
  if (!url || url.startsWith('data:')) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return new URL(url, BASE_URL).href;
};

const unique = (items) => [...new Set(items.filter(Boolean))];
const matchOne = (html, pattern) => decode(html.match(pattern)?.[1] ?? '');
const stripTags = (value = '') => decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '));
const CATEGORY_PRIORITY = [34, 67, 24, 103, 97, 25, 140];

async function fetchText(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, {
      headers: { 'user-agent': 'JLMedicosCatalogImporter/1.0' },
    });
    if (response.ok) {
      const bytes = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') ?? '';
      const charset = contentType.match(/charset=([^;]+)/i)?.[1]?.trim().toLowerCase();
      return new TextDecoder(charset === 'utf-8' ? 'utf-8' : 'euc-kr').decode(bytes);
    }
    if (attempt === attempts) throw new Error(`${response.status} ${url}`);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 700));
  }
}

async function collectProductIndex() {
  const index = new Map();
  for (const categoryNo of Object.keys(CATEGORY_MAP)) {
    const url = `${BASE_URL}/product/list.html?cate_no=${categoryNo}&product_list_limit=100`;
    const html = await fetchText(url);
    const ids = unique([
      ...[...html.matchAll(/product_no=(\d+)/g)].map((match) => Number(match[1])),
      ...[...html.matchAll(/href=["'][^"']*\/product\/[^"']+\/(\d+)(?:\/|["'])/gi)].map((match) => Number(match[1])),
    ]);
    for (const productNo of ids) {
      const current = index.get(productNo) ?? { productNo, categoryNos: [] };
      if (!current.categoryNos.includes(Number(categoryNo))) current.categoryNos.push(Number(categoryNo));
      index.set(productNo, current);
    }
  }
  return [...index.values()].sort((a, b) => b.productNo - a.productNo);
}

function parseProduct(html, item) {
  const sourceUrl = `${BASE_URL}/product/detail.html?product_no=${item.productNo}`;
  const titleMatches = [...html.matchAll(/<meta\s+property="og:title"\s+content="([^"]*)"\s*\/?\s*>/gi)];
  const imageMatches = [...html.matchAll(/<meta\s+property="og:image"\s+content="([^"]*)"\s*\/?\s*>/gi)];
  const name = decode(titleMatches.at(-1)?.[1] ?? matchOne(html, /var product_name = '([^']*)'/));
  const mainImage = absoluteUrl(decode(imageMatches.at(-1)?.[1] ?? ''));
  const priceKrw = Number(matchOne(html, /var product_price = '(\d+)'/)) || null;
  const productOptionHtml = html.match(/<select[^>]+option_product_no=["'][^"']+["'][^>]*>([\s\S]*?)<\/select>/i)?.[1] ?? '';
  const options = unique([...productOptionHtml.matchAll(/<option[^>]+value="([^"*][^"]*)"[^>]*>([\s\S]*?)<\/option>/gi)]
    .map((match) => stripTags(match[2]))
    .filter((value) => value && !value.includes('필수') && value !== '-------------------'));
  const detailImages = unique([...html.matchAll(/<img[^>]+ec-data-src=["']([^"']+)["']/gi)]
    .map((match) => absoluteUrl(decode(match[1])))
    .filter((url) => url.includes('/web/upload/')));
  const primaryCategoryNo = CATEGORY_PRIORITY.find((categoryNo) => item.categoryNos.includes(categoryNo)) ?? item.categoryNos[0];
  const primaryCategory = CATEGORY_MAP[primaryCategoryNo];
  return {
    id: String(item.productNo),
    slug: `jl-${item.productNo}`,
    sourceUrl,
    nameKo: name,
    nameVi: name,
    categoryId: primaryCategory.id,
    categoryKo: primaryCategory.ko,
    categoryVi: primaryCategory.vi,
    categoryNos: item.categoryNos,
    priceKrw,
    priceVisibility: 'quote',
    mainImage,
    gallery: unique([mainImage, ...detailImages.slice(0, 8)]),
    detailImages,
    options,
    origin: 'Korea',
    status: 'active',
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = { id: String(items[index].productNo), error: String(error) };
      }
      if ((index + 1) % 20 === 0) console.log(`Imported ${index + 1}/${items.length}`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

const index = await collectProductIndex();
console.log(`Found ${index.length} unique products`);
const products = await mapWithConcurrency(index, 5, async (item) => {
  const html = await fetchText(`${BASE_URL}/product/detail.html?product_no=${item.productNo}`);
  return parseProduct(html, item);
});
const payload = {
  source: BASE_URL,
  importedAt: new Date().toISOString(),
  market: 'VN',
  currency: 'VND',
  categories: Object.values(CATEGORY_MAP),
  products,
};
await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Saved ${products.length} products to ${OUTPUT}`);
