import { useState, type FormEvent } from 'react';
import { Building2, CheckCircle2, LogOut, ShieldCheck, Store, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useAuth } from '@/context/AuthContext';
import { businessTypes, type BusinessProfileInput, type UserType } from '@/lib/auth';

const initialBusiness: BusinessProfileInput = {
  company_name: '', business_type: 'beauty_salon', country: 'Vietnam', city: '', sns_url: '', phone: '', website: '', description: '', distribution_focus: '', expected_purchase_scale: '',
};

export default function AccountPage() {
  const { t } = useTranslation('account');
  const auth = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('consumer');
  const [business, setBusiness] = useState<BusinessProfileInput>(initialBusiness);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await auth.signIn(email, password);
      } else {
        const result = await auth.signUp({ email, password, userType, businessProfile: userType === 'consumer' ? undefined : business });
        setConfirmationSent(result.needsEmailConfirmation);
      }
    } catch (caught) {
      setError(caught instanceof Error && caught.message === 'SUPABASE_NOT_CONFIGURED' ? t('errors.notConfigured') : caught instanceof Error ? caught.message : t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  if (auth.loading) return <div className="container-app py-24 text-center text-sm text-charcoal-700/45">{t('loading')}</div>;
  if (auth.user && auth.profile) return <MemberProfile />;

  return (
    <>
      <SEO titleKey="account:seo.title" descriptionKey="account:seo.description" />
      <section className="bg-gradient-to-b from-rose-50/70 to-ivory-50 py-10 sm:py-16">
        <div className="container-app max-w-3xl">
          <div className="text-center"><span className="section-eyebrow">MEMBERSHIP</span><h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{mode === 'signin' ? t('signin.title') : t('signup.title')}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-charcoal-700/55">{mode === 'signin' ? t('signin.subtitle') : t('signup.subtitle')}</p></div>
          <div className="card mx-auto mt-8 max-w-2xl p-5 sm:p-8">
            {confirmationSent ? <Confirmation onBack={() => { setConfirmationSent(false); setMode('signin'); }} /> : (
              <form onSubmit={submit} className="space-y-6">
                {mode === 'signup' ? <UserTypeSelector value={userType} onChange={(nextType) => { setUserType(nextType); setBusiness((current) => ({ ...current, business_type: nextType === 'distributor' ? 'distributor' : 'beauty_salon' })); }} /> : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">{t('fields.email')}<input className="input-field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
                  <label className="text-sm font-medium">{t('fields.password')}<input className="input-field mt-2" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></label>
                </div>
                {mode === 'signup' && userType !== 'consumer' ? <BusinessFields userType={userType} value={business} onChange={setBusiness} /> : null}
                {error ? <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
                {!auth.configured ? <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{t('errors.notConfigured')}</p> : null}
                <button disabled={submitting || !auth.configured} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{submitting ? t('submitting') : mode === 'signin' ? t('signin.submit') : t('signup.submit')}</button>
              </form>
            )}
            {!confirmationSent ? <button type="button" onClick={() => { setMode((current) => current === 'signin' ? 'signup' : 'signin'); setError(''); }} className="mt-5 w-full text-center text-sm text-charcoal-700/55 hover:text-rose-600">{mode === 'signin' ? t('signin.switch') : t('signup.switch')}</button> : null}
          </div>
        </div>
      </section>
    </>
  );
}

function UserTypeSelector({ value, onChange }: { value: UserType; onChange: (value: UserType) => void }) {
  const { t } = useTranslation('account');
  const options: Array<{ value: UserType; icon: typeof UserRound }> = [{ value: 'consumer', icon: UserRound }, { value: 'professional', icon: Store }, { value: 'distributor', icon: Building2 }];
  return <fieldset><legend className="text-sm font-semibold">{t('signup.purpose')}</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{options.map(({ value: option, icon: Icon }) => <button type="button" key={option} aria-pressed={value === option} onClick={() => onChange(option)} className={`rounded-2xl border p-4 text-left transition ${value === option ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-rose-100 hover:border-rose-300'}`}><Icon className={`h-5 w-5 ${value === option ? 'text-rose-600' : 'text-charcoal-700/35'}`} /><span className="mt-3 block text-sm font-semibold">{t(`types.${option}.label`)}</span><span className="mt-1 block text-xs leading-5 text-charcoal-700/50">{t(`types.${option}.description`)}</span></button>)}</div></fieldset>;
}

function BusinessFields({ userType, value, onChange }: { userType: UserType; value: BusinessProfileInput; onChange: (value: BusinessProfileInput) => void }) {
  const { t } = useTranslation('account');
  const update = (field: keyof BusinessProfileInput, next: string) => onChange({ ...value, [field]: next });
  const allowedTypes = userType === 'professional' ? businessTypes.slice(0, 5) : businessTypes.slice(5);
  return <div className="rounded-2xl bg-ivory-100 p-4 sm:p-5"><h2 className="font-sans text-sm font-semibold">{t('business.title')}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm">{userType === 'professional' ? t('fields.shopName') : t('fields.companyName')}<input className="input-field mt-2" value={value.company_name} onChange={(event) => update('company_name', event.target.value)} required /></label>
    <label className="text-sm">{t('fields.businessType')}<select className="input-field mt-2" value={value.business_type} onChange={(event) => update('business_type', event.target.value)}>{allowedTypes.map((type) => <option key={type} value={type}>{t(`businessTypes.${type}`)}</option>)}</select></label>
    <label className="text-sm">{t('fields.country')}<input className="input-field mt-2" value={value.country} onChange={(event) => update('country', event.target.value)} required /></label>
    {userType === 'professional' ? <label className="text-sm">{t('fields.city')}<input className="input-field mt-2" value={value.city} onChange={(event) => update('city', event.target.value)} required /></label> : <label className="text-sm">{t('fields.distributionFocus')}<input className="input-field mt-2" value={value.distribution_focus} onChange={(event) => update('distribution_focus', event.target.value)} required /></label>}
    {userType === 'professional' ? <label className="text-sm sm:col-span-2">{t('fields.sns')}<input className="input-field mt-2" type="url" value={value.sns_url} onChange={(event) => update('sns_url', event.target.value)} placeholder="https://" /></label> : <><label className="text-sm">{t('fields.website')}<input className="input-field mt-2" type="url" value={value.website} onChange={(event) => update('website', event.target.value)} placeholder="https://" /></label><label className="text-sm">{t('fields.purchaseScale')}<input className="input-field mt-2" value={value.expected_purchase_scale} onChange={(event) => update('expected_purchase_scale', event.target.value)} required /></label></>}
  </div></div>;
}

function MemberProfile() {
  const { t } = useTranslation('account');
  const { user, profile, businessProfile, signOut } = useAuth();
  if (!user || !profile) return null;
  return <section className="bg-gradient-to-b from-rose-50/70 to-ivory-50 py-12 sm:py-20"><div className="container-app max-w-3xl"><div className="card p-6 sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><UserRound /></div><div><span className="text-xs font-semibold uppercase tracking-wider text-rose-500">{t('mypage.eyebrow')}</span><h1 className="mt-1 text-2xl font-semibold">{t(`types.${profile.user_type}.memberLabel`)}</h1><p className="mt-1 text-sm text-charcoal-700/50">{user.email}</p></div></div><button onClick={() => void signOut()} className="btn-secondary"><LogOut className="h-4 w-4" />{t('mypage.logout')}</button></div>{businessProfile ? <div className="mt-7 grid gap-4 rounded-2xl bg-ivory-100 p-5 sm:grid-cols-2"><ProfileItem label={t('fields.companyName')} value={businessProfile.company_name} /><ProfileItem label={t('fields.businessType')} value={t(`businessTypes.${businessProfile.business_type}`)} /><ProfileItem label={t('fields.country')} value={businessProfile.country} /><ProfileItem label={t('mypage.verification')} value={businessProfile.verified ? t('mypage.verified') : t('mypage.pending')} /></div> : <div className="mt-7 flex items-center gap-3 rounded-2xl bg-ivory-100 p-5 text-sm text-charcoal-700/60"><ShieldCheck className="h-5 w-5 text-rose-500" />{t('mypage.consumerMessage')}</div>}</div></div></section>;
}

function ProfileItem({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-charcoal-700/40">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
function Confirmation({ onBack }: { onBack: () => void }) { const { t } = useTranslation('account'); return <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" /><h2 className="mt-4 text-2xl font-semibold">{t('confirmation.title')}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-charcoal-700/55">{t('confirmation.body')}</p><button onClick={onBack} className="btn-primary mt-6">{t('confirmation.back')}</button></div>; }
