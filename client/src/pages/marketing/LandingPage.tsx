import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  HardHat,
  History,
  Menu,
  PencilRuler,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const MODULES = [
  {
    icon: Clock,
    title: 'NEC deadline engine',
    short: 'Clause clocks calculated automatically',
    body: 'Every clause clock runs automatically - the 8-week time bar, the one-week reply and the three-week quotation.',
  },
  {
    icon: AlertTriangle,
    title: 'Early warnings',
    short: 'Raise and issue in under a minute',
    body: 'Raise an early warning quickly and issue it as a formal, letterheaded notice in one click.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk register',
    short: 'See exposure and mitigation clearly',
    body: 'Track probability, cost and time impact, mitigation and ownership with a live heat map and total exposure.',
  },
  {
    icon: FileText,
    title: 'Compensation events',
    short: 'Keep the NEC workflow moving forward',
    body: 'Move from notified to implemented in a forward-only workflow so the contractual record stays trustworthy.',
  },
  {
    icon: Bell,
    title: 'Notices & instructions',
    short: 'Create professional contractual records',
    body: 'Issue eight NEC notice types, each producing a professional PDF for the contractual record.',
  },
  {
    icon: ClipboardList,
    title: 'Tamper-evident audit trail',
    short: 'Know who changed what and when',
    body: 'Every action, change, download and acknowledgement is recorded with who, when and what changed.',
  },
]

const DEADLINES = [
  { icon: AlertTriangle, event: 'Early warning', clause: '16.1', due: '3 days', tone: 'text-brand-yellow' },
  { icon: ShieldAlert, event: 'Risk response', clause: '16.2', due: '7 days', tone: 'text-blue-300' },
  { icon: FileText, event: 'Compensation event', clause: '61.3(1)', due: '12 days', tone: 'text-brand-yellow' },
]

const PROOF = [
  {
    icon: Clock,
    stat: '8 weeks',
    label: 'to notify a compensation event, or entitlement can be lost entirely (NEC cl. 61.3)',
  },
  {
    icon: CalendarDays,
    stat: '1 week',
    label: 'for the Project Manager to reply - miss it and a quotation can be deemed accepted',
  },
  {
    icon: FileSpreadsheet,
    stat: 'Excel',
    label: 'is still how many teams track all of this. It is familiar, but it forgets.',
  },
]

const AUDIENCES = [
  {
    icon: HardHat,
    title: 'Main contractors',
    body: 'Protect entitlement across every subcontract package without an enterprise rollout.',
  },
  {
    icon: Briefcase,
    title: 'Subcontractors',
    body: 'Keep the clock running even when there is no dedicated commercial team.',
  },
  {
    icon: Building2,
    title: 'Clients & project managers',
    body: 'See what needs a reply and keep decisions inside the contractual period.',
  },
  {
    icon: PencilRuler,
    title: 'NEC consultants',
    body: 'Administer several client contracts side by side with a clear audit trail.',
  },
]

const BENEFITS = [
  'NEC clause logic built in - not a generic workflow you configure yourself',
  'Working in 30 minutes, not three months',
  'Transparent pricing - no sales call to find out what it costs',
  'Priced for small and mid-size contractors, not only tier-one',
  'Every record exportable as PDF, Excel or CSV for the final account',
]

const PLANS = [
  {
    name: 'Pilot',
    description: 'For individuals exploring Aurum.',
    price: 'Free',
    period: 'one project',
    features: ['One active project', 'All NEC modules', 'Deadline engine & reminders', 'PDF and spreadsheet exports', 'Email support'],
    cta: 'Start free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Project',
    description: 'For teams managing one project.',
    price: 'Contact us',
    period: 'per project / month',
    features: ['Unlimited users per project', 'Everything in Pilot', 'Document, photo & drawing registers', 'Full audit trail & exports', 'Priority support'],
    cta: 'Talk to us',
    href: '#contact',
    highlight: true,
  },
  {
    name: 'Portfolio',
    description: 'For organisations managing many projects.',
    price: 'Contact us',
    period: 'per organisation',
    features: ['Unlimited projects', 'Everything in Project', 'Multi-party access', 'Onboarding & training', 'Named account contact'],
    cta: 'Talk to us',
    href: '#contact',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'Does it work with NEC3 as well as NEC4?',
    a: 'Yes. You choose the contract form when you create a project, and the registers, notice types and terminology follow it. The clause clocks are set for NEC4 by default and every date can be overridden where your contract data says otherwise.',
  },
  {
    q: 'Who can see our commercial information?',
    a: 'Only people invited to that specific project, and only as far as their role allows. Viewers can read and comment but never edit. Comments can also be restricted to managers, so discussion about money stays away from read-only accounts. Uploaded files are never given a public link - every download is authenticated and recorded.',
  },
  {
    q: 'What happens if a deadline is missed anyway?',
    a: 'Nothing is hidden. The record stays exactly as it was, the countdown shows how far past the date it is, and the audit trail keeps the full history of who did what and when. That evidence is what protects you if the matter is ever disputed.',
  },
  {
    q: 'Can we get our data out?',
    a: 'At any time. Every register exports to PDF, Excel or CSV, every notice generates a letterheaded PDF, and one button produces a complete contract dossier containing the whole record for adjudication.',
  },
  {
    q: 'How long does it take to set up?',
    a: 'Minutes. Create an account, add a project, invite your team by email. There is no implementation project, no configuration consultant, and nothing to install.',
  },
  {
    q: 'Do subcontractors and the client need their own licence?',
    a: 'No. You invite them into your project at no extra cost, with the role you choose. Keeping every party on the same record is the point.',
  },
]

const CONTACT_EMAIL = 'aurumadmindash@gmail.com'

const primaryAction =
  'group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-brand-yellow to-gold-500 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-[0_10px_24px_rgba(245,158,11,0.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(245,158,11,0.28)] focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2'

function Nav() {
  const token = useAuthStore((state) => state.token)
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Aurum home">
          <img src="/logo.png" alt="" className="h-10 w-10" />
          <span className="font-display text-lg font-bold tracking-[0.08em] text-navy-900">AURUM</span>
        </Link>

        <nav className="ml-8 hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Primary navigation">
          <a href="#modules" className="transition-colors hover:text-navy-900">Platform</a>
          <a href="#who" className="transition-colors hover:text-navy-900">Who it&apos;s for</a>
          <a href="#pricing" className="transition-colors hover:text-navy-900">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-navy-900">FAQ</a>
          <a href="#contact" className="transition-colors hover:text-navy-900">Contact</a>
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-4 md:flex">
          {token ? (
            <Link to="/home" className={`${primaryAction} px-5 py-2.5`}>Go to app</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 transition-colors hover:text-navy-900">Log in</Link>
              <Link to="/register" className={`${primaryAction} px-5 py-2.5`}>Get started</Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-lg p-2.5 text-navy-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-gold-500 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-navigation" className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
          <nav className="space-y-1" aria-label="Mobile navigation">
            {[
              ['#modules', 'Platform'],
              ['#who', "Who it's for"],
              ['#pricing', 'Pricing'],
              ['#faq', 'FAQ'],
              ['#contact', 'Contact'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
            {token ? (
              <Link to="/home" className={`${primaryAction} w-full`}>Go to app</Link>
            ) : (
              <>
                <Link to="/login" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">Log in</Link>
                <Link to="/register" className={`${primaryAction} flex-1 px-4 py-3`}>Get started</Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function DeadlinePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-navy-950 text-white shadow-[0_24px_80px_rgba(10,21,51,0.34)] ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-7 w-7" />
          <div>
            <p className="text-xs font-bold tracking-[0.12em]">AURUM</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Project workspace</p>
          </div>
        </div>
        <Bell className="h-4 w-4 text-brand-yellow" />
      </div>

      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-xs font-semibold text-white">Upcoming deadlines</p>
          <p className="mt-1 text-[10px] text-slate-400">Calculated from your contract dates</p>
        </div>
        <span className="text-[10px] font-semibold text-blue-300">View all</span>
      </div>

      <div className="space-y-1.5">
        {DEADLINES.map(({ icon: Icon, event, clause, due, tone }) => (
          <div key={event} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.045] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
              <span className="truncate text-[11px] font-medium sm:text-xs">{event}</span>
            </div>
            <span className="hidden text-[10px] text-slate-400 sm:block">{clause}</span>
            <span className="text-[10px] font-bold text-brand-yellow">{due}</span>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2.5">
          <span className="flex items-center gap-2 text-[10px] text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Early warning sent
          </span>
          <span className="text-[10px] text-slate-400">Audit trail updated</span>
        </div>
      ) : null}
    </div>
  )
}

function Hero({ token }: { token: string | null }) {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-8 lg:py-24">
          <div className="relative z-10 landing-reveal">
            <h1 className="max-w-2xl font-display text-[2.6rem] font-bold leading-[1.06] tracking-[-0.045em] text-navy-950 sm:text-5xl lg:text-[3.6rem]">
              Never lose money to a missed contract deadline
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Aurum runs the NEC clock for you. Early warnings, risks, compensation events and notices in one place - with every contractual deadline counted down, chased by email, and recorded in a tamper-evident audit trail.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={token ? '/home' : '/register'} className={primaryAction}>
                {token ? 'Go to app' : 'Start free'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#modules" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/20 bg-white px-6 py-3.5 text-sm font-bold text-navy-900 transition duration-200 hover:-translate-y-0.5 hover:border-navy-900/40 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2">
                See the platform
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
            <p className="mt-7 flex items-center gap-2.5 text-sm font-medium text-slate-600">
              <ShieldCheck className="h-5 w-5 text-gold-500" />
              Built exclusively for <span className="font-bold text-gold-600">NEC3 &amp; NEC4</span>
            </p>
          </div>

          <div className="relative min-w-0 landing-reveal landing-reveal-delay">
            <div className="overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-[0_30px_90px_rgba(15,31,75,0.2)]">
              <img
                src="/landing/aurum-hero-site.jpg"
                alt="Two construction professionals reviewing plans on an active concrete construction site"
                className="h-[420px] w-full object-cover object-center sm:h-[520px]"
                width="1536"
                height="1024"
                fetchPriority="high"
              />
            </div>
            <div className="relative -mt-14 ml-4 mr-4 sm:-mt-28 sm:ml-8 sm:mr-12 lg:absolute lg:-bottom-10 lg:-left-20 lg:mt-0 lg:w-[430px] media-float">
              <DeadlinePanel compact />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white" aria-label="NEC deadline facts">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {PROOF.map(({ icon: Icon, stat, label }) => (
            <div key={stat} className="flex gap-4 py-8 first:md:pr-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
              <Icon className="mt-1 h-7 w-7 shrink-0 text-navy-900" strokeWidth={1.7} />
              <div>
                <p className="font-display text-2xl font-bold text-gold-600 sm:text-3xl">{stat}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function PlatformSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeModule = MODULES[activeIndex]
  const ActiveIcon = activeModule.icon

  return (
    <section id="modules" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-600">The platform</p>
            <h2 className="mt-4 max-w-lg font-display text-3xl font-bold leading-tight text-navy-950 sm:text-4xl">
              Everything the contract asks of you
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              Not a general construction suite bolted onto NEC. Every screen speaks the contract&apos;s language.
            </p>

            <div className="mt-9 border-y border-slate-200">
              {MODULES.map(({ icon: Icon, title, short }, index) => {
                const active = index === activeIndex
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={active}
                    className={`group flex w-full items-center gap-4 border-b border-slate-200 px-1 py-4 text-left transition last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 ${active ? 'text-navy-950' : 'text-slate-600 hover:text-navy-900'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${active ? 'bg-gold-500 text-white' : 'border border-slate-300 bg-white text-slate-500'}`}>
                      {index + 1}
                    </span>
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-gold-600' : 'text-slate-400'}`} strokeWidth={1.8} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="mt-0.5 hidden text-xs font-normal text-slate-500 sm:block">{short}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${active ? 'translate-x-0.5 text-gold-600' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative lg:pt-2">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-navy-950 p-5 text-white shadow-[0_30px_80px_rgba(15,31,75,0.22)] sm:p-7">
              <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="" className="h-8 w-8" />
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em]">AURUM</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">NEC deadline workspace</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300">Project workspace</div>
              </div>

              <div className="grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-yellow">Selected module</p>
                  <h3 className="mt-2 flex items-center gap-2 text-lg font-bold">
                    <ActiveIcon className="h-5 w-5 text-brand-yellow" /> {activeModule.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{activeModule.body}</p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Audit enabled
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                <div className="grid grid-cols-4 gap-2">
                  {['Event date', 'Notice due', 'Reply due', 'Final date'].map((label, index) => (
                    <div key={label} className="text-center">
                      <span className={`mx-auto mb-3 block h-3 w-3 rounded-full ring-4 ${index === 1 ? 'bg-brand-yellow ring-gold-500/20' : index === 0 ? 'bg-blue-400 ring-blue-400/20' : 'bg-slate-600 ring-slate-600/20'}`} />
                      <p className="text-[9px] text-slate-400 sm:text-[10px]">{label}</p>
                      <p className="mt-1 text-[10px] font-bold text-white sm:text-xs">{index === 0 ? '1 May' : index === 1 ? '8 May' : index === 2 ? '15 May' : '22 May'}</p>
                    </div>
                  ))}
                </div>
                <div className="relative -top-[51px] mx-[12.5%] -z-0 h-px bg-slate-600">
                  <div className="h-px w-1/3 bg-blue-400" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {DEADLINES.map(({ icon: Icon, event, clause, due, tone }) => (
                  <div key={event} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-lg border border-white/[0.07] px-3 py-3 text-xs transition hover:bg-white/[0.05]">
                    <span className="flex min-w-0 items-center gap-2.5 font-medium">
                      <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
                      <span className="truncate">{event}</span>
                    </span>
                    <span className="hidden text-slate-400 sm:inline">{clause}</span>
                    <span className="font-bold text-brand-yellow">{due}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2"><History className="h-3.5 w-3.5 text-brand-yellow" /> Last entry recorded automatically</span>
                <span className="flex items-center gap-2"><Download className="h-3.5 w-3.5 text-brand-yellow" /> PDF · Excel · CSV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AudienceSection() {
  return (
    <section id="who" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-600">Built for every side</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-navy-950 sm:text-4xl">Whoever&apos;s name is on the notice</h2>
          <p className="mt-4 leading-7 text-slate-600">Different roles. The same contractual truth. If a missed deadline lands on your desk, Aurum is built for you.</p>
        </div>

        <div className="mt-12 grid border-y border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, title, body }, index) => (
            <div key={title} className={`group py-7 sm:px-6 lg:py-9 ${index % 2 === 0 ? 'sm:border-r' : ''} ${index < 3 ? 'lg:border-r' : 'lg:border-r-0'} border-slate-200`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-200 bg-gold-50 text-gold-600 transition duration-200 group-hover:-translate-y-1 group-hover:border-gold-400">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-navy-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DifferenceSection() {
  return (
    <section className="overflow-hidden bg-navy-950 text-white">
      <div className="mx-auto grid max-w-[1536px] lg:grid-cols-2">
        <div className="flex items-center px-5 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              The big platforms manage the project.
              <span className="mt-1 block text-brand-yellow">Aurum protects your money.</span>
            </h2>
            <p className="mt-5 leading-7 text-slate-300">
              Enterprise construction suites are broad, expensive and contract-agnostic. They do not know what clause 61.3 is, and they take months to roll out. Aurum does one thing properly, and you can be running on it this afternoon.
            </p>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 py-3.5 text-sm leading-6 text-slate-200">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand-yellow" strokeWidth={2.5} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="min-h-[420px] lg:min-h-[680px]">
          <img
            src="/landing/aurum-contract-review.jpg"
            alt="Construction drawings and contract records being reviewed on site"
            className="h-full w-full object-cover"
            width="1536"
            height="1024"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-600">Choose your starting point</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-navy-950 sm:text-4xl">Straightforward pricing</h2>
          <p className="mt-4 leading-7 text-slate-600">No construction-volume formula, no annual lock-in before you have seen it work.</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,31,75,0.10)] sm:p-8 ${plan.highlight ? 'border-gold-400 shadow-[0_22px_60px_rgba(245,158,11,0.12)] ring-1 ring-gold-200 lg:-mt-4 lg:pb-10' : 'border-slate-200 shadow-[0_14px_40px_rgba(15,31,75,0.06)]'}`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-br from-brand-yellow to-gold-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-navy-950 shadow-sm">
                  Most popular
                </span>
              ) : null}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="font-display text-xl font-bold text-navy-950">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
              </div>
              <div className="py-6">
                <p className={`font-display text-3xl font-bold ${plan.highlight ? 'text-gold-600' : 'text-navy-950'}`}>{plan.price}</p>
                <p className="mt-1 text-xs text-slate-500">{plan.period}</p>
              </div>
              <ul className="flex-1 space-y-3 border-t border-slate-100 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-600" /> {feature}
                  </li>
                ))}
              </ul>
              {plan.href.startsWith('#') ? (
                <a
                  href={plan.href}
                  className={plan.highlight ? `${primaryAction} mt-8 w-full` : 'group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-900/25 px-5 py-3.5 text-sm font-bold text-navy-900 transition hover:border-navy-900/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2'}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link
                  to={plan.href}
                  className={plan.highlight ? `${primaryAction} mt-8 w-full` : 'group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-900/25 px-5 py-3.5 text-sm font-bold text-navy-900 transition hover:border-navy-900/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2'}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="mt-7 text-center text-xs text-slate-400">New accounts are reviewed before access is granted, so your project data stays private.</p>
      </div>
    </section>
  )
}

function FaqSection() {
  // One open at a time keeps the section compact and scannable
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-600">Before you ask</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-navy-950 sm:text-4xl">Common questions</h2>
        </div>

        <dl className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map(({ q, a }, index) => {
            const isOpen = open === index
            return (
              <div key={q}>
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-gold-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <span className="font-display text-base font-bold text-navy-950">{q}</span>
                    <ChevronRight
                      className={`mt-0.5 h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                </dt>
                {isOpen ? (
                  <dd id={`faq-answer-${index}`} className="pb-6 pr-10 text-sm leading-7 text-slate-600">
                    {a}
                  </dd>
                ) : null}
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-[0_14px_40px_rgba(15,31,75,0.06)] sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-600">Talk to us</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-navy-950 sm:text-4xl">
              See it on your own contract
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Tell us about the project you are administering and we will show you how Aurum would run its clocks - using your contract dates, not a canned demo. We will also answer pricing questions directly, without a sales process.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Aurum - request a walkthrough')}&body=${encodeURIComponent('Hello Aurum team,\n\nProject / contract form (NEC3 or NEC4):\nOrganisation:\nRoughly how many people would use it:\n\nWhat I would like to see:\n\nThank you.')}`}
                className={primaryAction}
              >
                Request a walkthrough
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/20 bg-white px-6 py-3.5 text-sm font-bold text-navy-900 transition duration-200 hover:-translate-y-0.5 hover:border-navy-900/40 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2"
              >
                Start free instead
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Prefer email?{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-navy-900 underline decoration-gold-400 underline-offset-4 hover:text-gold-700">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <ul className="space-y-4">
            {[
              { icon: Clock, title: 'A 20-minute walkthrough', body: 'Enough to see the deadline engine running on a real contract.' },
              { icon: ShieldCheck, title: 'No obligation', body: 'We will tell you plainly if Aurum is not the right fit for your contract.' },
              { icon: Download, title: 'Leave with the dossier', body: 'See the full adjudication bundle Aurum produces in one click.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-200 bg-gold-50 text-gold-600">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-navy-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function FinalCta({ token }: { token: string | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white">
      <div className="landing-gold-lines pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:px-8">
        <div>
          <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">Start protecting your entitlement today</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">Create an account, add your first NEC project, and let the clock run itself.</p>
        </div>
        <Link to={token ? '/home' : '/register'} className={`${primaryAction} shrink-0 px-8`}>
          {token ? 'Go to app' : 'Get started'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-10 w-10" />
            <div>
              <p className="font-display text-base font-bold tracking-[0.08em] text-white">AURUM</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-brand-yellow">Project Controls</p>
            </div>
          </div>
          <div className="flex-1" />
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Footer navigation">
            <a href="#modules" className="transition-colors hover:text-white">Platform</a>
            <a href="#who" className="transition-colors hover:text-white">Who it&apos;s for</a>
            <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
            <Link to="/login" className="transition-colors hover:text-white">Log in</Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Aurum Project Controls. All rights reserved.</p>
          <p>NEC3 and NEC4 contract administration software.</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const token = useAuthStore((state) => state.token)

  return (
    <div className="overflow-x-clip bg-white text-slate-900">
      <Nav />
      <main>
        <Hero token={token} />
        <PlatformSection />
        <AudienceSection />
        <DifferenceSection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
        <FinalCta token={token} />
      </main>
      <Footer />
    </div>
  )
}
