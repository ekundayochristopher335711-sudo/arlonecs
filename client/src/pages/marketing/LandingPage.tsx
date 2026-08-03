import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ShieldAlert, FileText, Bell, ClipboardList, Clock,
  Check, Menu, X, ArrowRight, HardHat, Building2, Briefcase, PencilRuler,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const MODULES = [
  { icon: Clock, title: 'NEC deadline engine', body: 'Every clause clock runs automatically — the 8-week time bar, the one-week reply, the three-week quotation. Countdowns on screen, reminders by email.' },
  { icon: AlertTriangle, title: 'Early warnings', body: 'Raise an early warning in under a minute and issue it as a formal, letterheaded notice in one click.' },
  { icon: ShieldAlert, title: 'Risk register', body: 'Probability, cost and time impact, mitigation and owner — with a live heat map and total exposure.' },
  { icon: FileText, title: 'Compensation events', body: 'The full NEC workflow from notified to implemented, forward-only, so nobody can quietly rewrite history.' },
  { icon: Bell, title: 'Notices & instructions', body: 'Eight NEC notice types, each producing a professional PDF that forms part of the contractual record.' },
  { icon: ClipboardList, title: 'Tamper-evident audit trail', body: 'Every action, change, download and acknowledgement recorded with who, when and what changed.' },
]

const AUDIENCES = [
  { icon: HardHat, title: 'Main contractors', body: 'Protect entitlement across every subcontract package, without an enterprise budget or a three-month rollout.' },
  { icon: Briefcase, title: 'Subcontractors', body: 'No commercial team? Aurum runs the clock for you, so a missed notice never costs you a claim again.' },
  { icon: Building2, title: 'Clients & project managers', body: 'Reply inside the contractual period. Miss it and the contractor’s claim can be deemed accepted automatically.' },
  { icon: PencilRuler, title: 'NEC consultants', body: 'Administer several clients’ contracts side by side, each with its own workspace and audit trail.' },
]

function Nav() {
  const token = useAuthStore((s) => s.token)
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="Aurum" className="w-9 h-9" />
          <span className="font-display font-bold text-navy-900 tracking-wide">AURUM</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-slate-600">
          <a href="#modules" className="hover:text-navy-900 transition-colors">Platform</a>
          <a href="#who" className="hover:text-navy-900 transition-colors">Who it&apos;s for</a>
          <a href="#pricing" className="hover:text-navy-900 transition-colors">Pricing</a>
        </nav>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <Link to="/home" className="text-sm font-semibold px-4 py-2 rounded-lg gradient-brand text-navy-900 hover:opacity-90 transition-opacity">
              Go to app
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">Log in</Link>
              <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-lg gradient-brand text-navy-900 hover:opacity-90 transition-opacity">
                Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3">
          <a href="#modules" onClick={() => setOpen(false)} className="block text-sm text-slate-600">Platform</a>
          <a href="#who" onClick={() => setOpen(false)} className="block text-sm text-slate-600">Who it&apos;s for</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block text-sm text-slate-600">Pricing</a>
          <div className="pt-2 flex gap-3">
            {token ? (
              <Link to="/home" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-lg gradient-brand text-navy-900">Go to app</Link>
            ) : (
              <>
                <Link to="/login" className="flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700">Log in</Link>
                <Link to="/register" className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-lg gradient-brand text-navy-900">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default function LandingPage() {
  const token = useAuthStore((s) => s.token)

  return (
    <div className="bg-white">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, #F59E0B 0%, transparent 45%), radial-gradient(circle at 85% 70%, #3B82F6 0%, transparent 45%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-brand-yellow bg-white/10 border border-white/15 rounded-full px-3 py-1">
              Built exclusively for NEC3 &amp; NEC4
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Never lose money to a missed contract deadline
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Aurum runs the NEC clock for you. Early warnings, risks, compensation events and
              notices in one place — with every contractual deadline counted down, chased by email,
              and recorded in a tamper-evident audit trail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={token ? '/home' : '/register'}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg gradient-brand text-navy-900 hover:opacity-90 transition-opacity"
              >
                {token ? 'Go to app' : 'Start free'} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#modules"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                See the platform
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-400">
              One missed 8-week notice can cost more than a decade of subscription.
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { stat: '8 weeks', label: 'to notify a compensation event, or entitlement can be lost entirely (NEC cl. 61.3)' },
            { stat: '1 week', label: 'for the Project Manager to reply — miss it and a quotation can be deemed accepted' },
            { stat: 'Excel', label: 'is still how most teams track all of this. That is the real competition, and it forgets' },
          ].map(({ stat, label }) => (
            <div key={stat} className="rounded-xl border border-slate-200 p-6 shadow-card">
              <p className="font-display text-3xl font-bold text-gold-600">{stat}</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="bg-surface-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-navy-900">Everything the contract asks of you</h2>
            <p className="mt-3 text-slate-600">
              Not a general construction suite bolted onto NEC. Every screen speaks the contract&apos;s language.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-card-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gold-600" />
                </div>
                <h3 className="font-semibold text-navy-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="who" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-navy-900">Whoever&apos;s name is on the notice</h2>
          <p className="mt-3 text-slate-600">If a missed deadline lands on your desk, Aurum is built for you.</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-slate-200 p-6 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-navy-700" />
              </div>
              <h3 className="font-semibold text-navy-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Difference */}
      <section className="bg-navy-900">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">
                The big platforms manage the project.<br />
                <span className="text-gradient-brand">Aurum protects your money.</span>
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Enterprise construction suites are broad, expensive and contract-agnostic. They do not
                know what clause 61.3 is, and they take months to roll out. Aurum does one thing
                properly, and you can be running on it this afternoon.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                'NEC clause logic built in — not a generic workflow you configure yourself',
                'Working in 30 minutes, not three months',
                'Transparent pricing — no sales call to find out what it costs',
                'Priced for small and mid-size contractors, not only tier-one',
                'Every record exportable as PDF, Excel or CSV for the final account',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-yellow" />
                  </span>
                  <span className="text-sm leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-navy-900">Straightforward pricing</h2>
          <p className="mt-3 text-slate-600">
            No construction-volume formula, no annual lock-in before you have seen it work.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5 items-start">
          {[
            {
              name: 'Pilot', price: 'Free', period: 'one project',
              features: ['One active project', 'All NEC modules', 'Deadline engine & reminders', 'PDF and spreadsheet exports', 'Email support'],
              cta: 'Start free', highlight: false,
            },
            {
              name: 'Project', price: 'Contact us', period: 'per project / month',
              features: ['Unlimited users per project', 'Everything in Pilot', 'Document, photo & drawing registers', 'Full audit trail & exports', 'Priority support'],
              cta: 'Talk to us', highlight: true,
            },
            {
              name: 'Portfolio', price: 'Contact us', period: 'per organisation',
              features: ['Unlimited projects', 'Everything in Project', 'Multi-party access', 'Onboarding & training', 'Named account contact'],
              cta: 'Talk to us', highlight: false,
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-7 ${tier.highlight ? 'border-gold-400 shadow-card-lg ring-1 ring-gold-200' : 'border-slate-200 shadow-card'}`}
            >
              {tier.highlight && (
                <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-gold-700 bg-gold-50 px-2 py-1 rounded-full mb-3">
                  Most popular
                </span>
              )}
              <h3 className="font-display font-bold text-navy-900 text-lg">{tier.name}</h3>
              <p className="mt-3">
                <span className="font-display text-3xl font-bold text-navy-900">{tier.price}</span>
                <span className="text-sm text-slate-500 ml-2">{tier.period}</span>
              </p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-7 block text-center text-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity ${
                  tier.highlight ? 'gradient-brand text-navy-900 hover:opacity-90' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          New accounts are reviewed before access is granted, so your project data stays private.
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-surface-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-navy-900">Start protecting your entitlement today</h2>
          <p className="mt-3 text-slate-600">
            Create an account, add your first NEC project, and let the clock run itself.
          </p>
          <Link
            to={token ? '/home' : '/register'}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold px-7 py-3 rounded-lg gradient-brand text-navy-900 hover:opacity-90 transition-opacity"
          >
            {token ? 'Go to app' : 'Get started'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Aurum" className="w-8 h-8" />
              <div>
                <p className="font-display font-bold text-white tracking-wide leading-none">AURUM</p>
                <p className="text-[10px] tracking-[0.2em] uppercase mt-1">Project Controls</p>
              </div>
            </div>
            <div className="flex-1" />
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="#modules" className="hover:text-white transition-colors">Platform</a>
              <a href="#who" className="hover:text-white transition-colors">Who it&apos;s for</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link to="/login" className="hover:text-white transition-colors">Log in</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 justify-between text-xs">
            <p>© {new Date().getFullYear()} Aurum Project Controls. All rights reserved.</p>
            <p>NEC3 and NEC4 contract administration software.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
