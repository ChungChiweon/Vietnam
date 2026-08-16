import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Send, FileText, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { useLanguage } from '@/utils/routing';
import { createOrder } from '@/lib/orders';

interface FormState {
  fullName: string;
  company: string;
  phone: string;
  zaloId: string;
  email: string;
  city: string;
  interestedProducts: string;
  quantities: string;
  schedule: string;
  message: string;
}

const initialForm: FormState = {
  fullName: '',
  company: '',
  phone: '',
  zaloId: '',
  email: '',
  city: '',
  interestedProducts: '',
  quantities: '',
  schedule: '',
  message: '',
};

export default function InquiryPage() {
  const { t } = useTranslation(['contact', 'common', 'footer']);
  const lang = useLanguage();
  const location = useLocation();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as { productName?: string } | null;
    if (state?.productName) {
      setForm((f) => ({ ...f, interestedProducts: state.productName! }));
    }
  }, [location.state]);

  const update = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = t('contact:inquiry.validation.fullName');
    if (!form.phone.trim()) e.phone = t('contact:inquiry.validation.phone');
    else if (!/^[0-9+\s-]{8,15}$/.test(form.phone.trim())) e.phone = t('contact:inquiry.validation.phoneInvalid');
    if (!form.city.trim()) e.city = t('contact:inquiry.validation.city');
    if (!form.interestedProducts.trim()) e.interestedProducts = t('contact:inquiry.validation.interestedProducts');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact:inquiry.validation.emailInvalid');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await createOrder({
          full_name: form.fullName.trim(), company: form.company.trim(), phone: form.phone.trim(),
          zalo_id: form.zaloId.trim(), email: form.email.trim(), city: form.city.trim(),
          products: form.interestedProducts.trim(), quantities: form.quantities.trim(), schedule: form.schedule,
          message: form.message.trim(), language: lang,
        });
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const reset = () => {
    setForm(initialForm);
    setSubmitted(false);
  };

  const scheduleOptions = [
    { key: '1week', value: t('contact:inquiry.scheduleOptions.1week') },
    { key: '2-4weeks', value: t('contact:inquiry.scheduleOptions.2-4weeks') },
    { key: '1-2months', value: t('contact:inquiry.scheduleOptions.1-2months') },
    { key: 'exploring', value: t('contact:inquiry.scheduleOptions.exploring') },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen py-16">
        <SEO titleKey="footer:seo.inquiry.title" descriptionKey="footer:seo.inquiry.description" />
        <div className="container-app">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 animate-scale-in">
              <CheckCircle className="h-10 w-10 text-rose-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-charcoal-800 sm:text-3xl">{t('contact:inquiry.success.title')}</h1>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-700/50">
              {t('contact:inquiry.success.message')}
            </p>

            <div className="mt-6 rounded-2xl border border-rose-100 bg-white p-5 text-left shadow-soft">
              <h3 className="mb-3 font-sans text-sm font-semibold text-charcoal-800">{t('contact:inquiry.summary')}</h3>
              <dl className="space-y-2 text-sm">
                <InfoRow label={t('contact:inquiry.labels.fullName')} value={form.fullName} />
                <InfoRow label={t('contact:inquiry.labels.company')} value={form.company || '—'} />
                <InfoRow label={t('contact:inquiry.labels.phone')} value={form.phone} />
                <InfoRow label={t('contact:inquiry.labels.zaloId')} value={form.zaloId || '—'} />
                <InfoRow label={t('contact:inquiry.labels.email')} value={form.email || '—'} />
                <InfoRow label={t('contact:inquiry.labels.city')} value={form.city} />
                <InfoRow label={t('contact:inquiry.labels.interestedProducts')} value={form.interestedProducts} />
                <InfoRow label={t('contact:inquiry.labels.quantities')} value={form.quantities || '—'} />
                <InfoRow label={t('contact:inquiry.labels.schedule')} value={form.schedule || '—'} />
                <InfoRow label={t('contact:inquiry.labels.message')} value={form.message || '—'} />
              </dl>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={reset} className="btn-primary">
                {t('contact:inquiry.newRequest')}
              </button>
              <Link to={`/${lang}/products`} className="btn-secondary">
                {t('contact:inquiry.viewMoreProducts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <SEO titleKey="footer:seo.inquiry.title" descriptionKey="footer:seo.inquiry.description" />
      {/* Header */}
      <div className="gradient-ivory border-b border-rose-100 py-8 sm:py-10">
        <div className="container-app">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-charcoal-700/40">
            <Link to={`/${lang}`} className="transition-colors hover:text-rose-500">{t('common:nav.home')}</Link>
            <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
            <span className="text-charcoal-700/60">{t('contact:inquiry.breadcrumb')}</span>
          </nav>
          <span className="section-eyebrow">{t('contact:inquiry.eyebrow')}</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal-800 sm:text-3xl">{t('contact:inquiry.title')}</h1>
          <p className="mt-2 max-w-xl text-sm text-charcoal-700/50">
            {t('contact:inquiry.subtitle')}
          </p>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact info */}
            <FormSection title={t('contact:inquiry.sections.contactInfo')} icon={FileText}>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t('contact:inquiry.fields.fullName')} required error={errors.fullName}>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder={t('contact:inquiry.fields.fullNamePlaceholder')}
                    className="input-field"
                  />
                </FormField>
                <FormField label={t('contact:inquiry.fields.company')}>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder={t('contact:inquiry.fields.companyPlaceholder')}
                    className="input-field"
                  />
                </FormField>
                <FormField label={t('contact:inquiry.fields.phone')} required error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder={t('contact:inquiry.fields.phonePlaceholder')}
                    className="input-field"
                  />
                </FormField>
                <FormField label={t('contact:inquiry.fields.zaloId')}>
                  <input
                    type="text"
                    value={form.zaloId}
                    onChange={(e) => update('zaloId', e.target.value)}
                    placeholder={t('contact:inquiry.fields.zaloIdPlaceholder')}
                    className="input-field"
                  />
                </FormField>
                <FormField label={t('contact:inquiry.fields.email')} error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder={t('contact:inquiry.fields.emailPlaceholder')}
                    className="input-field"
                  />
                </FormField>
                <FormField label={t('contact:inquiry.fields.city')} required error={errors.city}>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder={t('contact:inquiry.fields.cityPlaceholder')}
                    className="input-field"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Order info */}
            <FormSection title={t('contact:inquiry.sections.orderInfo')} icon={FileText}>
              <FormField label={t('contact:inquiry.fields.interestedProducts')} required error={errors.interestedProducts}>
                <textarea
                  value={form.interestedProducts}
                  onChange={(e) => update('interestedProducts', e.target.value)}
                  rows={3}
                  placeholder={t('contact:inquiry.fields.interestedProductsPlaceholder')}
                  className="input-field resize-none"
                />
                <p className="mt-1.5 text-xs text-charcoal-700/40">
                  {t('contact:inquiry.fields.interestedProductsHint')}{' '}
                  <Link to={`/${lang}/products`} className="font-medium text-rose-500 hover:text-rose-600">{t('contact:inquiry.linkToProducts')}</Link>
                </p>
              </FormField>

              <FormField label={t('contact:inquiry.fields.quantities')}>
                <input
                  type="text"
                  value={form.quantities}
                  onChange={(e) => update('quantities', e.target.value)}
                  placeholder={t('contact:inquiry.fields.quantitiesPlaceholder')}
                  className="input-field"
                />
              </FormField>

              <FormField label={t('contact:inquiry.fields.schedule')}>
                <div className="flex flex-wrap gap-2">
                  {scheduleOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => update('schedule', opt.value)}
                      className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                        form.schedule === opt.value
                          ? 'bg-rose-500 text-white shadow-soft'
                          : 'border border-rose-200 bg-white text-charcoal-700 hover:bg-rose-50'
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label={t('contact:inquiry.fields.message')}>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={4}
                  placeholder={t('contact:inquiry.fields.messagePlaceholder')}
                  className="input-field resize-none"
                />
              </FormField>
            </FormSection>

            {/* Submit */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
                <Send className="h-4 w-4" strokeWidth={1.8} />
                {submitting ? 'Saving...' : t('contact:inquiry.submit')}
              </button>
              <p className="text-xs text-charcoal-700/40">
                {t('contact:inquiry.privacy')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <h2 className="font-sans text-base font-semibold text-charcoal-800">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-charcoal-800">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-charcoal-700/40">{label}</dt>
      <dd className="flex-1 text-charcoal-800">{value}</dd>
    </div>
  );
}
