import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const insert = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => ({ insert })),
  },
}));

import { createOrder, type NewOrder } from '@/lib/orders';

const order: NewOrder = {
  full_name: 'Test Customer',
  company: 'Test Company',
  phone: '0000000000',
  zalo_id: '',
  email: '',
  city: 'Ho Chi Minh City',
  products: 'Test Product',
  quantities: '1',
  schedule: '',
  message: '',
  language: 'vi',
};

describe('anonymous order submission', () => {
  it('inserts without requesting the created row', async () => {
    insert.mockResolvedValueOnce({ error: null });

    await expect(createOrder(order)).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith(order);

    const insertResult = insert.mock.results[0]?.value as Record<string, unknown>;
    expect(insertResult).not.toHaveProperty('select');
  });

  it('enforces new-only anonymous inserts in the security migration', () => {
    const migrationPath = fileURLToPath(
      new URL('../../supabase/migrations/202608310001_harden_orders_security.sql', import.meta.url),
    );
    const sql = readFileSync(migrationPath, 'utf8');

    expect(sql).toContain("with check (status = 'new')");
    expect(sql).toContain('grant insert on table public.orders to anon');
    expect(sql).not.toMatch(/grant\s+(select|update|delete)[^;]*\bto anon\b/i);
    expect(sql).toContain('using (public.is_admin())');
  });
});
