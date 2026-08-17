import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, ChevronRight, Clipboard, LogOut, PackageCheck, Phone, RefreshCw, Search, Truck, UserRound, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { listOrders, updateOrderStatus, type OrderRecord, type OrderStatus } from '@/lib/orders';
import { isAdminUser } from '@/lib/auth';

const statusOptions: Array<{ value: OrderStatus; label: string; icon: typeof Check }> = [
  { value: 'new', label: '신규', icon: Bell },
  { value: 'confirmed', label: '확인', icon: Check },
  { value: 'forwarded', label: '전달', icon: Clipboard },
  { value: 'shipping', label: '배송', icon: Truck },
  { value: 'completed', label: '완료', icon: PackageCheck },
];

const statusStyles: Record<OrderStatus, string> = {
  new: 'bg-rose-100 text-rose-700',
  confirmed: 'bg-amber-100 text-amber-700',
  forwarded: 'bg-blue-100 text-blue-700',
  shipping: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export default function MobileOrdersPage() {
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'forbidden' | 'authorized'>(isSupabaseConfigured ? 'loading' : 'authorized');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'K-Beauty 주문 확인';
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/orders-manifest.webmanifest';
    document.head.appendChild(manifest);
    return () => {
      document.title = previousTitle;
      manifest.remove();
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const authorize = async (user: Parameters<typeof isAdminUser>[0] | null) => setAuthState(user ? await isAdminUser(user) ? 'authorized' : 'forbidden' : 'signedOut');
    void supabase.auth.getUser().then(({ data }) => authorize(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { void authorize(session?.user ?? null); });
    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return setAuthState('authorized');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginError(error?.message ?? '');
  };

  if (authState === 'loading') return <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4f5f3] text-sm text-black/40">권한을 확인하는 중...</div>;

  if (authState === 'forbidden') return <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4f5f3] px-5"><div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-xl shadow-black/5"><h1 className="text-xl font-semibold">관리자 권한이 없습니다</h1><p className="mt-2 text-sm text-black/45">주문 내역은 관리자만 확인할 수 있습니다.</p><button onClick={() => void supabase?.auth.signOut()} className="mt-6 w-full rounded-2xl bg-[#171917] py-3.5 text-sm text-white">다른 계정으로 로그인</button></div></div>;

  if (authState === 'signedOut') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4f5f3] px-5">
        <form onSubmit={login} className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-xl shadow-black/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171917] text-white"><UserRound className="h-6 w-6" /></div>
          <h1 className="mt-6 font-sans text-2xl font-semibold">주문 확인</h1>
          <p className="mt-2 text-sm text-black/45">관리자 계정으로 로그인하세요.</p>
          <div className="mt-6 space-y-3">
            <input className="input-field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일" required />
            <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호" required />
            {loginError && <p className="text-xs text-rose-600">{loginError}</p>}
            <button className="w-full rounded-2xl bg-[#171917] py-3.5 text-sm font-medium text-white">로그인</button>
          </div>
        </form>
      </div>
    );
  }

  return <MobileOrderList onLogout={() => supabase?.auth.signOut()} />;
}

function MobileOrderList({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selected, setSelected] = useState<OrderRecord | null>(null);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await listOrders());
    } catch {
      setError('주문을 불러오지 못했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const active = filter === 'all' || order.status !== 'completed';
      const matches = !query || `${order.full_name} ${order.phone} ${order.products} ${order.company}`.toLowerCase().includes(query);
      return active && matches;
    });
  }, [filter, orders, search]);

  const newCount = orders.filter((order) => order.status === 'new').length;

  const changeStatus = async (status: OrderStatus) => {
    if (!selected) return;
    await updateOrderStatus(selected.id, status);
    setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, status } : order));
    setSelected((current) => current ? { ...current, status } : current);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4f5f3] pb-[calc(24px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f4f5f3]/95 px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-black/40">K-BEAUTY</p><h1 className="font-sans text-xl font-semibold">주문 내역</h1></div>
            <div className="flex items-center gap-2">
              <button onClick={() => void load()} aria-label="주문 새로고침" className="rounded-2xl bg-white p-2.5 shadow-sm"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
              {isSupabaseConfigured && <button onClick={onLogout} aria-label="로그아웃" className="rounded-2xl bg-white p-2.5 shadow-sm"><LogOut className="h-5 w-5" /></button>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
            <button onClick={() => setFilter('active')} className={`rounded-xl py-2.5 text-sm font-medium ${filter === 'active' ? 'bg-[#171917] text-white' : 'text-black/45'}`}>진행 중 {newCount > 0 && `· 신규 ${newCount}`}</button>
            <button onClick={() => setFilter('all')} className={`rounded-xl py-2.5 text-sm font-medium ${filter === 'all' ? 'bg-[#171917] text-white' : 'text-black/45'}`}>전체 {orders.length}</button>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border-0 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-rose-200" placeholder="고객, 전화번호, 상품 검색" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 pt-4">
        {!isSupabaseConfigured && <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">현재 데모 모드입니다. 휴대전화에서 실제 주문을 함께 보려면 Supabase 연결이 필요합니다.</div>}
        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {loading && orders.length === 0 ? <div className="py-16 text-center text-sm text-black/35">주문을 불러오는 중...</div> : visibleOrders.map((order) => (
          <button key={order.id} onClick={() => setSelected(order)} className="w-full rounded-3xl bg-white p-4 text-left shadow-sm transition active:scale-[0.99]">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{order.full_name}</p><p className="mt-1 text-xs text-black/40">{order.company || order.city} · {formatDate(order.created_at)}</p></div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}>{statusOptions.find((item) => item.value === order.status)?.label}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-5 text-black/60">{order.products}</p>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3"><span className="flex items-center gap-1.5 text-xs text-black/45"><Phone className="h-3.5 w-3.5" />{order.phone}</span><ChevronRight className="h-4 w-4 text-black/20" /></div>
          </button>
        ))}
        {!loading && visibleOrders.length === 0 && <div className="py-16 text-center"><PackageCheck className="mx-auto h-10 w-10 text-black/15" /><p className="mt-3 text-sm text-black/35">표시할 주문이 없습니다.</p></div>}
      </main>

      {selected && <MobileOrderSheet order={selected} onClose={() => setSelected(null)} onStatus={changeStatus} />}
    </div>
  );
}

function MobileOrderSheet({ order, onClose, onStatus }: { order: OrderRecord; onClose: () => void; onStatus: (status: OrderStatus) => void }) {
  const shareText = `주문 ${order.id}\n고객: ${order.full_name}\n연락처: ${order.phone}\n지역: ${order.city}\n상품: ${order.products}\n수량: ${order.quantities || '-'}\n요청: ${order.message || '-'}`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <section aria-label="주문 상세" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[32px] bg-white pb-[calc(18px+env(safe-area-inset-bottom))] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4"><div><p className="text-xs text-black/35">{order.id}</p><h2 className="font-sans text-lg font-semibold">{order.full_name}</h2></div><button onClick={onClose} aria-label="상세 닫기" className="rounded-2xl bg-black/5 p-2"><X className="h-5 w-5" /></button></div>
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-3"><Info label="전화번호" value={order.phone} /><Info label="도시" value={order.city} /><Info label="회사" value={order.company || '-'} /><Info label="Zalo" value={order.zalo_id || '-'} /></div>
          <div className="rounded-2xl bg-[#f4f5f3] p-4"><Info label="상품" value={order.products} /><div className="mt-4"><Info label="수량" value={order.quantities || '-'} /></div><div className="mt-4"><Info label="요청사항" value={order.message || '-'} /></div></div>
          <div><p className="mb-2 text-xs font-medium text-black/40">상태 변경</p><div className="grid grid-cols-5 gap-1.5">{statusOptions.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => void onStatus(value)} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] ${order.status === value ? 'bg-[#171917] text-white' : 'bg-black/5 text-black/45'}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div>
          <button onClick={() => void copy()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#171917] py-3.5 text-sm font-medium text-white">{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? '복사 완료' : '전달할 주문 내용 복사'}</button>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-black/35">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-5">{value}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
