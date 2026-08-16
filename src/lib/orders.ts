import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type OrderStatus = 'new' | 'confirmed' | 'forwarded' | 'shipping' | 'completed';

export interface OrderRecord {
  id: string;
  created_at: string;
  full_name: string;
  company: string;
  phone: string;
  zalo_id: string;
  email: string;
  city: string;
  products: string;
  quantities: string;
  schedule: string;
  message: string;
  language: string;
  status: OrderStatus;
}

export type NewOrder = Omit<OrderRecord, 'id' | 'created_at' | 'status'>;

const storageKey = 'kbeauty-admin-orders';

const demoOrders: OrderRecord[] = [
  {
    id: 'demo-1003', created_at: new Date().toISOString(), full_name: 'Nguyễn Minh Anh', company: 'Mina Beauty',
    phone: '090 123 4567', zalo_id: '0901234567', email: '', city: 'TP. Hồ Chí Minh',
    products: 'Gentle Lash Shampoo, Stella Velvet C Curl', quantities: '각 20개', schedule: '1주 이내',
    message: '도매 가격과 배송비를 알려주세요.', language: 'vi', status: 'new',
  },
  {
    id: 'demo-1002', created_at: new Date(Date.now() - 86400000).toISOString(), full_name: 'Trần Thu Hà', company: 'Hana Studio',
    phone: '091 555 2040', zalo_id: '', email: 'hana@example.com', city: 'Hà Nội',
    products: 'PMU pigment set', quantities: '30세트', schedule: '2~4주', message: '', language: 'vi', status: 'confirmed',
  },
];

function readLocal(): OrderRecord[] {
  const saved = localStorage.getItem(storageKey);
  if (saved) return JSON.parse(saved) as OrderRecord[];
  localStorage.setItem(storageKey, JSON.stringify(demoOrders));
  return demoOrders;
}

export async function createOrder(order: NewOrder): Promise<OrderRecord> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data as OrderRecord;
  }
  const record: OrderRecord = { ...order, id: crypto.randomUUID(), created_at: new Date().toISOString(), status: 'new' };
  localStorage.setItem(storageKey, JSON.stringify([record, ...readLocal()]));
  return record;
}

export async function listOrders(): Promise<OrderRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as OrderRecord[];
  }
  return readLocal();
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(readLocal().map((order) => order.id === id ? { ...order, status } : order)));
}

