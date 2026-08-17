import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Box, Boxes, CalendarClock, ChevronRight, Clipboard, ExternalLink, LayoutDashboard, LogOut, Menu, PackageSearch, RefreshCw, Search, Settings, ShoppingBag, UserRound, X } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { listOrders, updateOrderStatus, type OrderRecord, type OrderStatus } from '@/lib/orders';
import { isAdminUser } from '@/lib/auth';
import ProfessionalProductSettings from '@/components/admin/ProfessionalProductSettings';
import PackageManagement from '@/components/admin/PackageManagement';

type View = 'orders' | 'products' | 'packages' | 'sync';

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: '신규', className: 'bg-rose-100 text-rose-700' },
  confirmed: { label: '확인', className: 'bg-amber-100 text-amber-700' },
  forwarded: { label: '전달', className: 'bg-blue-100 text-blue-700' },
  shipping: { label: '배송', className: 'bg-violet-100 text-violet-700' },
  completed: { label: '완료', className: 'bg-emerald-100 text-emerald-700' },
};

export default function AdminPage() {
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'forbidden' | 'authorized'>(isSupabaseConfigured ? 'loading' : 'authorized');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  if (authState === 'loading') return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] text-sm text-black/40">권한을 확인하는 중...</div>;
  if (authState === 'forbidden') return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4"><div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl shadow-black/5"><h1 className="text-xl font-semibold">관리자 권한이 없습니다</h1><p className="mt-2 text-sm text-black/45">일반 회원 계정으로는 관리 센터에 접근할 수 없습니다.</p><button onClick={() => void supabase?.auth.signOut()} className="mt-6 w-full rounded-xl bg-charcoal-800 px-4 py-3 text-sm text-white">다른 계정으로 로그인</button></div></div>;
  if (authState === 'signedOut') return <AdminLogin email={email} password={password} error={loginError} onEmail={setEmail} onPassword={setPassword} onSubmit={login} />;
  return <AdminDashboard onLogout={() => supabase?.auth.signOut()} />;
}

function AdminLogin({ email, password, error, onEmail, onPassword, onSubmit }: { email: string; password: string; error: string; onEmail: (value: string) => void; onPassword: (value: string) => void; onSubmit: (event: React.FormEvent) => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-7 shadow-xl shadow-black/5">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-800 text-white"><UserRound className="h-6 w-6" /></div>
        <h1 className="font-sans text-2xl font-semibold text-charcoal-800">관리자 로그인</h1>
        <p className="mt-2 text-sm text-charcoal-700/50">주문과 상품을 안전하게 관리합니다.</p>
        <div className="mt-7 space-y-4">
          <input className="input-field" type="email" placeholder="이메일" value={email} onChange={(e) => onEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="비밀번호" value={password} onChange={(e) => onPassword(e.target.value)} required />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button className="w-full rounded-xl bg-charcoal-800 px-4 py-3 text-sm font-medium text-white hover:bg-black">로그인</button>
        </div>
        <Link to="/ko" className="mt-5 block text-center text-xs text-charcoal-700/40 hover:text-charcoal-800">쇼핑몰로 돌아가기</Link>
      </form>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selected, setSelected] = useState<OrderRecord | null>(null);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setOrders(await listOrders()); setLoading(false); };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => orders.filter((order) => `${order.full_name} ${order.company} ${order.phone} ${order.products}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const newCount = orders.filter((order) => order.status === 'new').length;
  const todayCount = orders.filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString()).length;

  const changeStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
    setSelected((current) => current?.id === id ? { ...current, status } : current);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f4] text-charcoal-800">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-black/5 bg-[#171917] p-5 text-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-white/40">K-Beauty</p><p className="mt-1 font-semibold">관리 센터</p></div><button onClick={() => setMenuOpen(false)} className="lg:hidden"><X /></button></div>
        <nav className="mt-10 space-y-2">
          <SideButton active={view === 'orders'} icon={LayoutDashboard} label="주문 관리" count={newCount} onClick={() => setView('orders')} />
          <SideButton active={view === 'products'} icon={ShoppingBag} label="상품 관리" onClick={() => setView('products')} />
          <SideButton active={view === 'packages'} icon={Boxes} label="패키지 관리" onClick={() => setView('packages')} />
          <SideButton active={view === 'sync'} icon={RefreshCw} label="주간 업데이트" onClick={() => setView('sync')} />
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-2 border-t border-white/10 pt-4">
          <Link to="/ko" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"><ExternalLink className="h-4 w-4" />쇼핑몰 보기</Link>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />로그아웃</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setMenuOpen(true)} className="lg:hidden"><Menu /></button>
          <div><p className="text-sm font-semibold">{view === 'orders' ? '주문 관리' : view === 'products' ? '상품 관리' : view === 'packages' ? '패키지 관리' : '주간 업데이트'}</p><p className="text-xs text-charcoal-700/40">{isSupabaseConfigured ? '실시간 데이터 연결됨' : '데모 모드 · Supabase 연결 전'}</p></div>
          <button className="relative rounded-xl border border-black/5 bg-white p-2.5"><Bell className="h-5 w-5" />{newCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">{newCount}</span>}</button>
        </header>
        <main className="p-4 lg:p-8">
          {view === 'orders' && <OrdersView orders={filtered} loading={loading} newCount={newCount} todayCount={todayCount} search={search} onSearch={setSearch} onSelect={setSelected} onRefresh={load} />}
          {view === 'products' && <ProductsView />}
          {view === 'packages' && <PackageManagement />}
          {view === 'sync' && <SyncView />}
        </main>
      </div>
      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} onStatus={changeStatus} />}
    </div>
  );
}

function SideButton({ active, icon: Icon, label, count, onClick }: { active: boolean; icon: typeof Settings; label: string; count?: number; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? 'bg-white text-charcoal-800' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span>{label}</span>{Boolean(count) && <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{count}</span>}</button>;
}

function OrdersView({ orders, loading, newCount, todayCount, search, onSearch, onSelect, onRefresh }: { orders: OrderRecord[]; loading: boolean; newCount: number; todayCount: number; search: string; onSearch: (value: string) => void; onSelect: (order: OrderRecord) => void; onRefresh: () => void }) {
  return <div className="mx-auto max-w-6xl">
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="오늘 주문" value={todayCount} icon={ShoppingBag} /><Metric label="확인 필요" value={newCount} icon={Bell} accent /><Metric label="전체 주문" value={orders.length} icon={Clipboard} /></div>
    <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
      <div className="flex flex-col gap-3 border-b border-black/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" /><input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="고객, 전화번호, 상품 검색" className="w-full rounded-xl bg-[#f5f6f4] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-rose-200" /></div><button onClick={onRefresh} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm"><RefreshCw className="h-4 w-4" />새로고침</button></div>
      {loading ? <div className="p-12 text-center text-sm text-black/40">주문을 불러오는 중...</div> : <div className="divide-y divide-black/5">{orders.map((order) => <button key={order.id} onClick={() => onSelect(order)} className="grid w-full gap-2 p-4 text-left hover:bg-black/[0.02] sm:grid-cols-[1.1fr_1fr_1.4fr_auto] sm:items-center"><div><p className="font-medium">{order.full_name}</p><p className="text-xs text-black/40">{order.company || order.city}</p></div><div><p className="text-sm">{order.phone}</p><p className="text-xs text-black/40">{new Date(order.created_at).toLocaleString('ko-KR')}</p></div><p className="line-clamp-1 text-sm text-black/60">{order.products}</p><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta[order.status].className}`}>{statusMeta[order.status].label}</span><ChevronRight className="h-4 w-4 text-black/20" /></div></button>)}{orders.length === 0 && <div className="p-12 text-center text-sm text-black/40">검색 결과가 없습니다.</div>}</div>}
    </div>
  </div>;
}

function Metric({ label, value, icon: Icon, accent }: { label: string; value: number; icon: typeof Bell; accent?: boolean }) {
  return <div className={`rounded-2xl border p-5 ${accent ? 'border-rose-100 bg-rose-50' : 'border-black/5 bg-white'}`}><div className="flex items-center justify-between"><p className="text-sm text-black/45">{label}</p><Icon className={`h-5 w-5 ${accent ? 'text-rose-500' : 'text-black/25'}`} /></div><p className="mt-3 text-3xl font-semibold">{value}</p></div>;
}

function OrderDrawer({ order, onClose, onStatus }: { order: OrderRecord; onClose: () => void; onStatus: (id: string, status: OrderStatus) => void }) {
  const share = `주문 ${order.id}\n고객: ${order.full_name}\n연락처: ${order.phone}\n지역: ${order.city}\n상품: ${order.products}\n수량: ${order.quantities || '-'}\n메모: ${order.message || '-'}`;
  return <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose}><aside className="absolute bottom-0 right-0 top-0 w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between border-b border-black/5 pb-5"><div><p className="text-xs text-black/40">{order.id}</p><h2 className="mt-1 font-sans text-xl font-semibold">{order.full_name}</h2></div><button onClick={onClose} className="rounded-xl bg-black/5 p-2"><X /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><Detail label="전화번호" value={order.phone} /><Detail label="도시" value={order.city} /><Detail label="회사" value={order.company || '-'} /><Detail label="Zalo" value={order.zalo_id || '-'} /></div><div className="mt-5 rounded-2xl bg-[#f5f6f4] p-4"><Detail label="상품" value={order.products} /><div className="mt-4"><Detail label="수량" value={order.quantities || '-'} /></div><div className="mt-4"><Detail label="요청사항" value={order.message || '-'} /></div></div><div className="mt-6"><p className="mb-3 text-xs font-medium uppercase tracking-wider text-black/40">주문 상태</p><div className="grid grid-cols-5 gap-1">{(Object.keys(statusMeta) as OrderStatus[]).map((status) => <button key={status} onClick={() => onStatus(order.id, status)} className={`rounded-lg px-1 py-2 text-xs ${order.status === status ? 'bg-charcoal-800 text-white' : 'bg-black/5 text-black/50'}`}>{statusMeta[status].label}</button>)}</div></div><button onClick={() => navigator.clipboard.writeText(share)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-charcoal-800 px-4 py-3 text-sm font-medium text-white"><Clipboard className="h-4 w-4" />친구에게 보낼 내용 복사</button></aside></div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-black/40">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-medium">{value}</p></div>; }

function ProductsView() {
  const { products, source } = useProducts();
  const categories = new Set(products.map((product) => product.category)).size;
  return <div className="mx-auto max-w-6xl"><div className="grid gap-3 sm:grid-cols-3"><Metric label="등록 상품" value={products.length} icon={ShoppingBag} /><Metric label="카테고리" value={categories} icon={Box} /><Metric label="업데이트 대기" value={0} icon={PackageSearch} /></div><div className="mt-6 rounded-2xl border border-black/5 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-sans text-lg font-semibold">상품 카탈로그</h2><p className="mt-1 text-sm text-black/40">데이터 소스: {source === 'supabase' ? 'Supabase Product Hub' : '정적 fallback 카탈로그'}</p></div><Link to="/ko/products" className="rounded-xl border border-black/10 px-4 py-2 text-sm">상품 보기</Link></div></div><ProfessionalProductSettings key={source} products={products} /></div>;
}

function SyncView() {
  return <div className="mx-auto max-w-4xl"><div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CalendarClock /></div><h2 className="mt-5 font-sans text-xl font-semibold">주 1회 원본 상품 확인</h2><p className="mt-2 text-sm leading-6 text-black/45">매주 월요일 오전 9시에 원본 사이트와 상품명, 옵션, 설명, 이미지, 판매 상태를 비교합니다.</p><div className="mt-6 space-y-3"><SyncRow label="자동 확인 주기" value="매주 월요일 09:00" /><SyncRow label="원본" value="jlmedicos.com" /><SyncRow label="변경 시 처리" value="관리자 승인 후 반영" /><SyncRow label="최근 확인" value="자동화 연결 전" /></div><button disabled className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black/10 px-4 py-3 text-sm text-black/35"><RefreshCw className="h-4 w-4" />GitHub Actions 연결 후 사용 가능</button></div></div>;
}

function SyncRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-xl bg-[#f5f6f4] px-4 py-3"><span className="text-sm text-black/45">{label}</span><span className="text-sm font-medium">{value}</span></div>; }
