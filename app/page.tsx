"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Car,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  Hammer,
  Home as HouseIcon,
  Info,
  Laptop,
  LockKeyhole,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingDown,
  Users,
  WalletCards,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateStateIncomeTax,
  STATE_OPTIONS,
  stateName,
  type StateCode,
} from "./state-tax";

type TaxYear = "2025" | "2026";
type FilingStatus = "single" | "mfj" | "mfs" | "hoh";
type WorkType =
  | "rideshare"
  | "freelance"
  | "real-estate"
  | "creator"
  | "nil"
  | "trades"
  | "ecommerce"
  | "home-services"
  | "other";

type FormState = {
  year: TaxYear;
  filingStatus: FilingStatus;
  state: StateCode | "";
  workType: WorkType;
  income1099: string;
  trackedExpenses: string;
  yourW2Income: string;
  spouseW2Income: string;
  otherIncome: string;
  federalWithholding: string;
  quarterlyPayments: string;
  adjustments: string;
  additionalDeductions: string;
  itemizedDeductions: string;
  taxCredits: string;
};

type Bracket = { cap: number; rate: number };

type WebModelContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: Record<string, unknown>;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

const TAX_RULES: Record<
  TaxYear,
  {
    standardDeduction: Record<FilingStatus, number>;
    socialSecurityWageBase: number;
    qbiThreshold: Record<FilingStatus, number>;
    brackets: Record<FilingStatus, Bracket[]>;
  }
> = {
  "2025": {
    standardDeduction: {
      single: 15750,
      mfj: 31500,
      mfs: 15750,
      hoh: 23625,
    },
    socialSecurityWageBase: 176100,
    qbiThreshold: {
      single: 197300,
      mfj: 394600,
      mfs: 197300,
      hoh: 197300,
    },
    brackets: {
      single: [
        { cap: 11925, rate: 0.1 },
        { cap: 48475, rate: 0.12 },
        { cap: 103350, rate: 0.22 },
        { cap: 197300, rate: 0.24 },
        { cap: 250525, rate: 0.32 },
        { cap: 626350, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      mfj: [
        { cap: 23850, rate: 0.1 },
        { cap: 96950, rate: 0.12 },
        { cap: 206700, rate: 0.22 },
        { cap: 394600, rate: 0.24 },
        { cap: 501050, rate: 0.32 },
        { cap: 751600, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      mfs: [
        { cap: 11925, rate: 0.1 },
        { cap: 48475, rate: 0.12 },
        { cap: 103350, rate: 0.22 },
        { cap: 197300, rate: 0.24 },
        { cap: 250525, rate: 0.32 },
        { cap: 375800, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      hoh: [
        { cap: 17000, rate: 0.1 },
        { cap: 64850, rate: 0.12 },
        { cap: 103350, rate: 0.22 },
        { cap: 197300, rate: 0.24 },
        { cap: 250500, rate: 0.32 },
        { cap: 626350, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
    },
  },
  "2026": {
    standardDeduction: {
      single: 16100,
      mfj: 32200,
      mfs: 16100,
      hoh: 24150,
    },
    socialSecurityWageBase: 184500,
    qbiThreshold: {
      single: 201750,
      mfj: 403500,
      mfs: 201775,
      hoh: 201750,
    },
    brackets: {
      single: [
        { cap: 12400, rate: 0.1 },
        { cap: 50400, rate: 0.12 },
        { cap: 105700, rate: 0.22 },
        { cap: 201775, rate: 0.24 },
        { cap: 256225, rate: 0.32 },
        { cap: 640600, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      mfj: [
        { cap: 24800, rate: 0.1 },
        { cap: 100800, rate: 0.12 },
        { cap: 211400, rate: 0.22 },
        { cap: 403550, rate: 0.24 },
        { cap: 512450, rate: 0.32 },
        { cap: 768700, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      mfs: [
        { cap: 12400, rate: 0.1 },
        { cap: 50400, rate: 0.12 },
        { cap: 105700, rate: 0.22 },
        { cap: 201775, rate: 0.24 },
        { cap: 256225, rate: 0.32 },
        { cap: 384350, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
      hoh: [
        { cap: 17700, rate: 0.1 },
        { cap: 67450, rate: 0.12 },
        { cap: 105700, rate: 0.22 },
        { cap: 201750, rate: 0.24 },
        { cap: 256200, rate: 0.32 },
        { cap: 640600, rate: 0.35 },
        { cap: Infinity, rate: 0.37 },
      ],
    },
  },
};

const WORK_TYPES: Array<{
  value: WorkType;
  title: string;
  description: string;
  Icon: typeof Car;
  deductionRange: [number, number];
}> = [
  { value: "rideshare", title: "Rideshare & delivery", description: "Driving, delivery, or courier work", Icon: Car, deductionRange: [0.15, 0.32] },
  { value: "freelance", title: "Freelance & professional", description: "Client work, consulting, or services", Icon: Laptop, deductionRange: [0.08, 0.22] },
  { value: "real-estate", title: "Real estate", description: "Agents, brokers, or property work", Icon: Building2, deductionRange: [0.12, 0.28] },
  { value: "creator", title: "Creator economy", description: "Content, brand deals, or digital work", Icon: Sparkles, deductionRange: [0.1, 0.27] },
  { value: "nil", title: "NIL athlete", description: "Brand deals, appearances, or camps", Icon: Star, deductionRange: [0.08, 0.24] },
  { value: "trades", title: "Construction & trades", description: "Contract jobs, tools, and job sites", Icon: Hammer, deductionRange: [0.14, 0.32] },
  { value: "ecommerce", title: "E-commerce & resale", description: "Online shops, resale, or marketplaces", Icon: ShoppingBag, deductionRange: [0.15, 0.3] },
  { value: "home-services", title: "Home & personal services", description: "Care, beauty, cleaning, or repair", Icon: HouseIcon, deductionRange: [0.1, 0.26] },
  { value: "other", title: "Something else", description: "Any other independent income", Icon: BriefcaseBusiness, deductionRange: [0.08, 0.24] },
];

const FILING_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  mfj: "Married filing jointly",
  mfs: "Married filing separately",
  hoh: "Head of household",
};

const INITIAL_FORM: FormState = {
  year: "2026",
  filingStatus: "single",
  state: "",
  workType: "rideshare",
  income1099: "",
  trackedExpenses: "",
  yourW2Income: "",
  spouseW2Income: "",
  otherIncome: "",
  federalWithholding: "0",
  quarterlyPayments: "0",
  adjustments: "0",
  additionalDeductions: "0",
  itemizedDeductions: "0",
  taxCredits: "0",
};

const FAQ_ITEMS = [
  {
    question: "What is self-employment tax?",
    answer:
      "Self-employment tax is the Social Security and Medicare tax on your net earnings from self-employment. W-2 employees and their employers generally split these payroll taxes. Independent contractors and sole proprietors generally pay both the employee and employer-equivalent shares through self-employment tax. It is separate from federal income tax and usually applies when net earnings from self-employment are $400 or more.",
  },
  {
    question: "How much is self-employment tax? What is the rate?",
    answer:
      "The general self-employment tax rate is 15.3% of net earnings subject to the tax: 12.4% for Social Security and 2.9% for Medicare. For 2026, the Social Security portion applies only until your combined wages and self-employment earnings reach $184,500, up from $176,100 in 2025. The Medicare portion has no wage cap. An additional 0.9% Medicare tax may apply when combined wages and self-employment earnings exceed $200,000 for single or head of household filers, $250,000 for married filing jointly, or $125,000 for married filing separately. This calculator applies those limits and uses the W-2 wages you enter when determining the remaining Social Security wage base.",
  },
  {
    question: "How is self-employment tax calculated?",
    answer:
      "Start with net profit, which is gross 1099 income minus ordinary and necessary business expenses. Generally, multiply that profit by 92.35% to find net earnings subject to self-employment tax. Then apply 12.4% Social Security tax up to the remaining annual wage base and 2.9% Medicare tax, plus Additional Medicare Tax when applicable. For example, if you have $50,000 of net profit, no W-2 wages, and remain below the wage base, $50,000 multiplied by 92.35% equals $46,175, and the base self-employment tax is about $7,065. The calculator runs these steps and estimates federal income tax separately.",
  },
  {
    question: "Is self-employment tax on top of income tax?",
    answer:
      "Yes. They are separate federal tax calculations that can both apply to your business income. Self-employment tax funds Social Security and Medicare. Federal income tax uses progressive brackets and depends on filing status, household income, deductions, and credits. The calculator combines both in the estimated federal total, then shows a separate estimate for the state you select. Local taxes are not included.",
  },
  {
    question: "How much should I set aside for taxes on 1099 income?",
    answer:
      "There is no single percentage that works for everyone. Your set-aside depends on net profit, W-2 wages, filing status, household income, deductions, credits, and your state. This calculator estimates the additional federal and selected-state income tax associated with your 1099 income and turns it into a personalized range based on gross 1099 income. The highlighted percentage is the upper end of that planning range. Local income taxes and special state adjustments are not included.",
  },
  {
    question: "When are quarterly estimated taxes due?",
    answer:
      "For 2026 calendar-year taxpayers, federal estimated payments are generally due April 15, 2026, June 15, 2026, September 15, 2026, and January 15, 2027. If a due date falls on a weekend or legal holiday, it moves to the next business day. Individuals generally need federal estimated payments if they expect to owe at least $1,000 after withholding and refundable credits and do not meet an exception or safe harbor. This calculator provides annual federal and state planning estimates. State payment thresholds and due dates can differ, so check your selected state's guidance.",
  },
  {
    question: "Do I have to pay quarterly taxes in my first year of self-employment?",
    answer:
      "There is no automatic first-year exemption. You may need estimated payments if you expect to owe at least $1,000. You can generally avoid an underpayment penalty if timely withholding and estimated payments equal at least the smaller of 90% of the current year's tax or 100% of the prior year's tax. The prior-year percentage is generally 110% when prior-year adjusted gross income was more than $150,000, or more than $75,000 if married filing separately. If your prior-year tax liability was zero, you were a U.S. citizen or resident for the full year, and that return covered 12 months, you generally do not have to make estimated payments for the current year. Any tax you owe is still due when you file.",
  },
  {
    question: "What can I write off as a 1099 contractor?",
    answer:
      "You can generally deduct expenses that are ordinary and necessary for your business, subject to the rules for each expense. Common examples include a qualifying home office, business vehicle costs or mileage, the business-use portion of phone and internet, software, subscriptions, supplies, professional fees, and business insurance. Schedule C business expenses reduce net profit, which can lower both federal income tax and self-employment tax. Self-employed health insurance is generally claimed separately as an adjustment to income and does not reduce net earnings for self-employment tax. This calculator subtracts the business expenses you enter from gross 1099 income and treats other adjustments separately.",
  },
  {
    question: "Is self-employment tax deductible?",
    answer:
      "You can generally deduct the employer-equivalent portion of self-employment tax as an adjustment to income. This is usually one-half of the base self-employment tax and does not include Additional Medicare Tax. The deduction can reduce adjusted gross income and federal income tax, but it does not reduce self-employment tax itself. You can claim it whether or not you itemize. The calculator includes this deduction automatically.",
  },
  {
    question: "How can I reduce my self-employment tax?",
    answer:
      "Claiming every legitimate Schedule C business expense reduces net profit and usually reduces self-employment tax. SEP-IRA or Solo 401(k) contributions and the self-employed health insurance deduction may reduce federal income tax, but they generally do not reduce net earnings for self-employment tax. An S corporation election can change employment-tax treatment because reasonable W-2 wages are subject to payroll taxes while qualifying non-wage distributions are not. The election also brings payroll, filing, compliance, and reasonable-compensation requirements, and the IRS can reclassify distributions as wages. This calculator does not model an S corporation election, so review that decision with a qualified tax professional.",
  },
] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function money(value: number) {
  return currency.format(Math.max(0, Math.round(value)));
}

function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function progressiveTax(taxableIncome: number, brackets: Bracket[]) {
  let remaining = Math.max(0, taxableIncome);
  let lower = 0;
  let tax = 0;
  for (const bracket of brackets) {
    const width = bracket.cap - lower;
    const taxedHere = Math.min(remaining, width);
    if (taxedHere > 0) tax += taxedHere * bracket.rate;
    remaining -= taxedHere;
    lower = bracket.cap;
    if (remaining <= 0) break;
  }
  return tax;
}

function medicareThreshold(status: FilingStatus) {
  if (status === "mfj") return 250000;
  if (status === "mfs") return 125000;
  return 200000;
}

function calculateTax(
  form: FormState,
  options?: { gross1099?: number; businessExpenses?: number; allowPotentialQbi?: boolean },
) {
  const rules = TAX_RULES[form.year];
  const gross1099 = options?.gross1099 ?? parseMoney(form.income1099);
  const businessExpenses = Math.min(gross1099, options?.businessExpenses ?? parseMoney(form.trackedExpenses));
  const yourW2Income = parseMoney(form.yourW2Income);
  const spouseW2Income = form.filingStatus === "mfj" ? parseMoney(form.spouseW2Income) : 0;
  const combinedW2Income = yourW2Income + spouseW2Income;
  const otherIncome = parseMoney(form.otherIncome);
  const adjustments = parseMoney(form.adjustments);
  const additionalDeductions = parseMoney(form.additionalDeductions);
  const itemizedDeductions = parseMoney(form.itemizedDeductions);
  const credits = parseMoney(form.taxCredits);

  const netProfit = Math.max(0, gross1099 - businessExpenses);
  const netEarnings = netProfit * 0.9235;
  const socialSecurityRoom = Math.max(0, rules.socialSecurityWageBase - Math.min(yourW2Income, rules.socialSecurityWageBase));
  const socialSecurityTax = Math.min(netEarnings, socialSecurityRoom) * 0.124;
  const medicareTax = netEarnings * 0.029;
  const additionalMedicareTax = Math.max(0, combinedW2Income + netEarnings - medicareThreshold(form.filingStatus)) * 0.009;
  const baseSelfEmploymentTax = socialSecurityTax + medicareTax;
  const selfEmploymentTax = baseSelfEmploymentTax + additionalMedicareTax;
  const deductibleHalf = baseSelfEmploymentTax * 0.5;

  const adjustedGrossIncome = Math.max(0, combinedW2Income + otherIncome + netProfit - deductibleHalf - adjustments);
  const deductionUsed = Math.max(rules.standardDeduction[form.filingStatus], itemizedDeductions);
  const taxableBeforeQbi = Math.max(0, adjustedGrossIncome - deductionUsed - additionalDeductions);
  const qualifiedBusinessIncome = Math.max(0, netProfit - deductibleHalf);
  const percentageQbiDeduction = Math.min(qualifiedBusinessIncome * 0.2, taxableBeforeQbi * 0.2);
  const minimumQbiDeduction = form.year === "2026" && qualifiedBusinessIncome >= 1000
    ? Math.min(400, taxableBeforeQbi)
    : 0;
  const maximumQbiDeduction = Math.max(percentageQbiDeduction, minimumQbiDeduction);
  const qbiIsStraightforward = taxableBeforeQbi <= rules.qbiThreshold[form.filingStatus];
  const qbiDeduction = qbiIsStraightforward || options?.allowPotentialQbi ? maximumQbiDeduction : 0;
  const taxableIncome = Math.max(0, taxableBeforeQbi - qbiDeduction);
  const federalIncomeTaxBeforeCredits = progressiveTax(taxableIncome, rules.brackets[form.filingStatus]);
  const federalIncomeTax = Math.max(0, federalIncomeTaxBeforeCredits - credits);
  const totalFederalTax = federalIncomeTax + selfEmploymentTax;

  return {
    gross1099,
    businessExpenses,
    netProfit,
    netEarnings,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    selfEmploymentTax,
    deductibleHalf,
    adjustedGrossIncome,
    deductionUsed,
    taxableBeforeQbi,
    qbiDeduction,
    qbiIsStraightforward,
    taxableIncome,
    federalIncomeTax,
    totalFederalTax,
  };
}

function calculateResults(form: FormState) {
  const gross = parseMoney(form.income1099);
  const tracked = Math.min(gross, parseMoney(form.trackedExpenses));
  const selectedWork = WORK_TYPES.find((item) => item.value === form.workType) ?? WORK_TYPES[1];
  const [lowRatio, highRatio] = selectedWork.deductionRange;
  const reviewLow = Math.min(gross * 0.65, Math.max(tracked, gross * lowRatio));
  const reviewHigh = Math.min(gross * 0.65, Math.max(reviewLow, gross * highRatio));
  const additionalLow = Math.max(0, reviewLow - tracked);
  const additionalHigh = Math.max(0, reviewHigh - tracked);

  const current = calculateTax(form);
  const potentialLowTax = calculateTax(form, { businessExpenses: reviewHigh, allowPotentialQbi: true });
  const baselineWithout1099 = calculateTax(form, { gross1099: 0, businessExpenses: 0 });
  const currentStateTax = calculateStateIncomeTax({
    year: form.year,
    state: form.state,
    filingStatus: form.filingStatus,
    adjustedGrossIncome: current.adjustedGrossIncome,
  });
  const potentialStateTax = calculateStateIncomeTax({
    year: form.year,
    state: form.state,
    filingStatus: form.filingStatus,
    adjustedGrossIncome: potentialLowTax.adjustedGrossIncome,
  });
  const baselineStateTax = calculateStateIncomeTax({
    year: form.year,
    state: form.state,
    filingStatus: form.filingStatus,
    adjustedGrossIncome: baselineWithout1099.adjustedGrossIncome,
  });
  const incrementalCurrent = Math.max(
    0,
    current.totalFederalTax + currentStateTax - baselineWithout1099.totalFederalTax - baselineStateTax,
  );
  const incrementalPotential = Math.max(
    0,
    potentialLowTax.totalFederalTax + potentialStateTax - baselineWithout1099.totalFederalTax - baselineStateTax,
  );
  const lowPercent = gross > 0 ? (incrementalPotential / gross) * 100 : 0;
  const highPercent = gross > 0 ? (incrementalCurrent / gross) * 100 : 0;
  const setAsideLow = Math.max(0, Math.floor(Math.min(lowPercent, highPercent)));
  const setAsideHigh = Math.min(50, Math.max(setAsideLow, Math.ceil(Math.max(lowPercent, highPercent) + 1)));
  const recommendedSetAside = setAsideHigh;
  const payments = parseMoney(form.federalWithholding) + parseMoney(form.quarterlyPayments);
  const balanceLow = potentialLowTax.totalFederalTax - payments;
  const balanceHigh = current.totalFederalTax - payments;
  const currentCombinedTax = current.totalFederalTax + currentStateTax;
  const potentialCombinedTax = potentialLowTax.totalFederalTax + potentialStateTax;
  const taxSavingsOpportunity = Math.max(0, currentCombinedTax - potentialCombinedTax);

  return {
    current,
    potentialLowTax,
    baselineWithout1099,
    currentStateTax,
    potentialStateTax,
    baselineStateTax,
    reviewLow,
    reviewHigh,
    additionalLow,
    additionalHigh,
    setAsideLow,
    setAsideHigh,
    recommendedSetAside,
    balanceLow,
    balanceHigh,
    currentCombinedTax,
    potentialCombinedTax,
    taxSavingsOpportunity,
    selectedWork,
    payments,
  };
}

function MoneyInput({ id, label, hint, value, onChange, placeholder = "0" }: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="money-field" htmlFor={id}>
      <span className="field-label"><span>{label}</span>{hint ? <small>{hint}</small> : null}</span>
      <span className="money-control">
        <span aria-hidden="true">$</span>
        <input id={id} inputMode="decimal" autoComplete="off" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function TrialButton({ compact = false }: { compact?: boolean }) {
  return (
    <button className={compact ? "trial-button compact" : "trial-button"} type="button" onClick={() => document.getElementById("trial-offer")?.scrollIntoView({ behavior: "smooth" })}>
      Get Started for Free
      <ArrowRight aria-hidden="true" size={compact ? 17 : 19} />
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [error, setError] = useState("");
  const results = useMemo(() => calculateResults(form), [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function next() {
    if (step === 2 && !form.state) {
      setError("Choose your state of residence to continue.");
      return;
    }
    if (step === 2 && parseMoney(form.income1099) <= 0) {
      setError("Add your expected 1099 income to continue.");
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(INITIAL_FORM);
    setStep(1);
    setAdvancedOpen(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: WebModelContext }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();

    const register = modelContext.registerTool(
      {
        name: "calculate_1099_tax_estimate",
        title: "Calculate 1099 tax estimate",
        description: "Fill the visible 1099Vibe calculator with annual income details and show 2025 or 2026 federal and state planning estimates, a deduction review range, and a recommended set-aside percentage.",
        inputSchema: {
          type: "object",
          properties: {
            year: { type: "string", enum: ["2025", "2026"] },
            filing_status: { type: "string", enum: ["single", "mfj", "mfs", "hoh"] },
            state: { type: "string", enum: STATE_OPTIONS.map((item) => item.code) },
            work_type: { type: "string", enum: WORK_TYPES.map((item) => item.value) },
            income_1099: { type: "number", minimum: 1 },
            tracked_expenses: { type: "number", minimum: 0 },
            your_w2_income: { type: "number", minimum: 0 },
            spouse_w2_income: { type: "number", minimum: 0 },
            other_income: { type: "number", minimum: 0 },
            federal_withholding: { type: "number", minimum: 0 },
            quarterly_payments: { type: "number", minimum: 0 },
            additional_federal_deductions: { type: "number", minimum: 0 },
          },
          required: ["year", "filing_status", "state", "work_type", "income_1099"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== "object") throw new Error("Calculator input must be an object.");
          const value = input as Record<string, unknown>;
          if (value.year !== "2025" && value.year !== "2026") throw new Error("Choose tax year 2025 or 2026.");
          if (!["single", "mfj", "mfs", "hoh"].includes(String(value.filing_status))) throw new Error("Choose a supported filing status.");
          if (!STATE_OPTIONS.some((item) => item.code === value.state)) throw new Error("Choose a supported state.");
          if (!WORK_TYPES.some((item) => item.value === value.work_type)) throw new Error("Choose a supported 1099 work type.");
          if (typeof value.income_1099 !== "number" || !Number.isFinite(value.income_1099) || value.income_1099 <= 0) throw new Error("1099 income must be a positive number.");
          const optionalNumber = (key: string) => {
            const candidate = value[key] ?? 0;
            if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < 0) throw new Error(`${key} must be a nonnegative number.`);
            return String(candidate);
          };
          const nextForm: FormState = {
            ...INITIAL_FORM,
            year: value.year,
            filingStatus: value.filing_status as FilingStatus,
            state: value.state as StateCode,
            workType: value.work_type as WorkType,
            income1099: String(value.income_1099),
            trackedExpenses: optionalNumber("tracked_expenses"),
            yourW2Income: optionalNumber("your_w2_income"),
            spouseW2Income: optionalNumber("spouse_w2_income"),
            otherIncome: optionalNumber("other_income"),
            federalWithholding: optionalNumber("federal_withholding"),
            quarterlyPayments: optionalNumber("quarterly_payments"),
            additionalDeductions: optionalNumber("additional_federal_deductions"),
          };
          const estimate = calculateResults(nextForm);
          setForm(nextForm);
          setStep(4);
          setError("");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return {
            tax_year: nextForm.year,
            state: nextForm.state,
            recommended_set_aside_percent: estimate.recommendedSetAside,
            set_aside_range_percent: [estimate.setAsideLow, estimate.setAsideHigh],
            estimated_federal_tax_range: [Math.round(estimate.potentialLowTax.totalFederalTax), Math.round(estimate.current.totalFederalTax)],
            estimated_state_tax_range: [Math.round(estimate.potentialStateTax), Math.round(estimate.currentStateTax)],
            potential_business_expense_review_range: [Math.round(estimate.reviewLow), Math.round(estimate.reviewHigh)],
          };
        },
      },
      { signal: lifecycle.signal },
    );
    void Promise.resolve(register).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const progress = step * 25;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="https://vibe1099-mockup.nickrathbun85.chatgpt.site/">
          <img src="/1099vibe-logo.png" alt="1099Vibe" />
        </a>
        <TrialButton compact />
      </header>

      <section className={step === 4 ? "calculator-shell results-shell" : "calculator-shell"}>
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />

        {step < 4 ? (
          <div className="calculator-grid">
            <aside className="intro-panel">
              <div>
                <h1 className="calculator-title-pill"><Calculator aria-hidden="true" size={17} />1099 Tax Calculator</h1>
                <h2 className="intro-headline">Know what to set aside. See what could lower it.</h2>
                <p className="intro-copy">Get personalized federal and state tax ranges for your 1099 income, then see the business expenses that may help you keep more of what you earn.</p>
              </div>

              <div className="confidence-list">
                <div><span><FileCheck2 size={18} /></span><p><strong>Current tax rules</strong>Updated for the 2025 and 2026 tax years</p></div>
                <div><span><LockKeyhole size={18} /></span><p><strong>Private by design</strong>Your answers stay in this calculator</p></div>
                <div><span><Users size={18} /></span><p><strong>Built for 1099 earners</strong>Side hustles, full-time work, and everything between</p></div>
              </div>

              <div className="savings-note">
                <div className="savings-icon"><TrendingDown size={22} /></div>
                <div><span>Average client tax savings</span><strong>$4,000*</strong></div>
              </div>
            </aside>

            <section className="flow-card" aria-labelledby="step-heading">
              <div className="flow-topline"><span>Step {step} of 3</span></div>
              <Progress value={progress} aria-label={`${progress}% complete`} />

              {step === 1 ? (
                <div className="step-content">
                  <div className="step-heading">
                    <span className="step-icon"><BriefcaseBusiness size={22} /></span>
                    <div><p>First, tell us how you earn</p><h2 id="step-heading">What kind of 1099 work do you do?</h2></div>
                  </div>

                  <RadioGroup value={form.workType} onValueChange={(value) => update("workType", value as WorkType)} className="work-grid" aria-label="1099 work type">
                    {WORK_TYPES.map(({ value, title, description, Icon }) => (
                      <label className={form.workType === value ? "work-option selected" : "work-option"} key={value}>
                        <span className="work-option-icon"><Icon size={20} /></span>
                        <span><strong>{title}</strong><small>{description}</small></span>
                        <RadioGroupItem value={value} aria-label={title} />
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="step-content">
                  <div className="step-heading">
                    <span className="step-icon"><WalletCards size={22} /></span>
                    <div><p>Now, the money part</p><h2 id="step-heading">What do you expect to earn?</h2></div>
                  </div>

                  <div className="year-status-row">
                    <fieldset className="year-picker">
                      <legend>Tax year</legend>
                      <RadioGroup value={form.year} onValueChange={(value) => update("year", value as TaxYear)} className="year-options" aria-label="Tax year">
                        {(["2025", "2026"] as TaxYear[]).map((year) => (
                          <label key={year} className={form.year === year ? "year-option active" : "year-option"}>
                            <RadioGroupItem value={year} aria-label={year} />
                            <span>{year}</span><small>{year === "2026" ? "Plan ahead" : "File now"}</small>
                          </label>
                        ))}
                      </RadioGroup>
                    </fieldset>

                    <label className="select-field">
                      <span>Filing status</span>
                      <Select value={form.filingStatus} onValueChange={(value) => update("filingStatus", value as FilingStatus)}>
                        <SelectTrigger className="brand-select" aria-label="Filing status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.keys(FILING_LABELS) as FilingStatus[]).map((status) => <SelectItem key={status} value={status}>{FILING_LABELS[status]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="select-field">
                      <span>State of residence</span>
                      <Select value={form.state || undefined} onValueChange={(value) => update("state", value as StateCode)}>
                        <SelectTrigger className="brand-select" aria-label="State of residence"><SelectValue placeholder="Choose state" /></SelectTrigger>
                        <SelectContent>
                          {STATE_OPTIONS.map((state) => <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <small className="select-hint">Assumes full-year residency</small>
                    </label>
                  </div>

                  <div className="income-grid">
                    <MoneyInput id="income1099" label="Gross 1099 income" hint="Before business expenses" value={form.income1099} onChange={(value) => update("income1099", value)} placeholder="65,000" />
                    <MoneyInput id="trackedExpenses" label="Business expenses tracked" hint="What you already know about" value={form.trackedExpenses} onChange={(value) => update("trackedExpenses", value)} placeholder="5,000" />
                    <MoneyInput id="yourW2Income" label="Your W-2 wages" hint="Only wages paid to the 1099 earner" value={form.yourW2Income} onChange={(value) => update("yourW2Income", value)} />
                    {form.filingStatus === "mfj" ? <MoneyInput id="spouseW2Income" label="Spouse's W-2 wages" hint="Used for your joint income-tax estimate" value={form.spouseW2Income} onChange={(value) => update("spouseW2Income", value)} /> : null}
                    <MoneyInput id="otherIncome" label="Other taxable income" hint="Interest, rent, or other income" value={form.otherIncome} onChange={(value) => update("otherIncome", value)} />
                  </div>

                  <div className="inline-note"><Info size={17} /><span>Use full-year amounts. The state estimate assumes all income entered is taxable in your selected state.</span></div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="step-content">
                  <div className="step-heading">
                    <span className="step-icon"><ReceiptText size={22} /></span>
                    <div><p>One last check</p><h2 id="step-heading">What have you already paid?</h2></div>
                  </div>

                  <div className="income-grid two-up">
                    <MoneyInput id="federalWithholding" label="Federal tax withheld" hint="From W-2s or other income" value={form.federalWithholding} onChange={(value) => update("federalWithholding", value)} />
                    <MoneyInput id="quarterlyPayments" label="Quarterly payments made" hint="Federal estimated taxes only" value={form.quarterlyPayments} onChange={(value) => update("quarterlyPayments", value)} />
                  </div>

                  <button type="button" className={advancedOpen ? "advanced-toggle open" : "advanced-toggle"} onClick={() => setAdvancedOpen((value) => !value)} aria-expanded={advancedOpen}>
                    <span><Calculator size={18} /> Add advanced tax details</span><span aria-hidden="true">+</span>
                  </button>

                  {advancedOpen ? (
                    <div className="advanced-panel">
                      <MoneyInput id="adjustments" label="Other income adjustments" hint="HSA, retirement, health insurance, and similar adjustments" value={form.adjustments} onChange={(value) => update("adjustments", value)} />
                      <MoneyInput id="additionalDeductions" label="Additional federal deductions" hint="Senior, tip, overtime, car loan, charitable, and similar deductions" value={form.additionalDeductions} onChange={(value) => update("additionalDeductions", value)} />
                      <MoneyInput id="itemizedDeductions" label="Itemized deductions" hint="We use the higher of this or the standard deduction" value={form.itemizedDeductions} onChange={(value) => update("itemizedDeductions", value)} />
                      <MoneyInput id="taxCredits" label="Expected nonrefundable credits" hint="Child, education, energy, or other credits" value={form.taxCredits} onChange={(value) => update("taxCredits", value)} />
                    </div>
                  ) : null}

                  <div className="accuracy-card"><ShieldCheck size={21} /><div><strong>Federal and state planning estimate</strong><span>Local taxes and special state credits or adjustments are not included.</span></div></div>
                </div>
              ) : null}

              <div className="flow-actions">
                {step > 1 ? <button className="back-button" type="button" onClick={back}><ArrowLeft size={18} /> Back</button> : <span />}
                <div>
                  {error ? <p className="form-error" role="alert">{error}</p> : null}
                  <button className="continue-button" type="button" onClick={next}>{step === 3 ? "See My Tax Estimate" : "Continue"}<ArrowRight size={18} /></button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <section className="results" aria-labelledby="results-heading">
            <div className="results-topbar">
              <button type="button" onClick={back}><ArrowLeft size={17} /> Edit answers</button>
              <span><CheckCircle2 size={16} /> {form.year} tax estimate ready</span>
              <button type="button" onClick={reset}><RotateCcw size={16} /> Start over</button>
            </div>

            <section className="results-summary-panel">
              <div className="results-heading-row">
                <div>
                  <span className="eyebrow">Your personalized 1099 tax estimate</span>
                  <h1 id="results-heading">Here are your estimated totals.</h1>
                  <p>Based on {money(parseMoney(form.income1099))} of 1099 income and the federal and state details you shared.</p>
                </div>
                <div className="result-pills"><span>{form.year} tax year</span><span>{FILING_LABELS[form.filingStatus]}</span><span>{stateName(form.state)}</span></div>
              </div>

              <div className="summary-totals">
                <article className="tax-total">
                  <span>Estimated federal tax</span>
                  <strong>{money(results.potentialLowTax.totalFederalTax)} to {money(results.current.totalFederalTax)}</strong>
                  <small>Income tax and self-employment tax</small>
                </article>
                <article className={results.currentStateTax === 0 ? "zero-tax-total" : "tax-total"}>
                  <span>Estimated {stateName(form.state)} income tax</span>
                  <strong>{money(results.potentialStateTax)} to {money(results.currentStateTax)}</strong>
                  <small>{results.currentStateTax === 0 ? "No state income tax estimated" : "State-level estimate. Local taxes are not included."}</small>
                </article>
                <article className="positive-total">
                  <span>Potential business deductions</span>
                  <strong>{money(results.reviewLow)} to {money(results.reviewHigh)}</strong>
                  <small>Includes {money(parseMoney(form.trackedExpenses))} you already entered</small>
                </article>
              </div>

              <div className="set-aside-summary tax-set-aside">
                <div>
                  <span>Set aside about</span>
                  <strong>{results.recommendedSetAside}%</strong>
                  <small>of each 1099 payment</small>
                </div>
                <p>That is about <strong>{money(results.recommendedSetAside)} per $100 earned</strong>, or up to <strong>{money(parseMoney(form.income1099) * results.recommendedSetAside / 100)}</strong> for the year. Your combined federal and state planning range is {results.setAsideLow}% to {results.setAsideHigh}%.</p>
              </div>
            </section>

            <section className="uncovered-savings" aria-labelledby="uncovered-savings-heading">
              <div className="uncovered-savings-total">
                <span id="uncovered-savings-heading"><TrendingDown size={17} /> Possible tax savings from overlooked deductions</span>
                <strong>You could keep up to {money(results.taxSavingsOpportunity)} more</strong>
                <p>1099Vibe helps you find eligible write-offs and keep the records needed to claim them.</p>
              </div>
              <div className="savings-explainer">
                <span>How this number is estimated</span>
                <p>Your current combined federal and state estimate is <strong>{money(results.currentCombinedTax)}</strong>. If eligible business expenses reach the top of your <strong>{money(results.reviewLow)} to {money(results.reviewHigh)}</strong> review range, the estimate falls to <strong>{money(results.potentialCombinedTax)}</strong>. The difference is <strong>{money(results.taxSavingsOpportunity)}</strong>.</p>
                <small>You entered {money(parseMoney(form.trackedExpenses))} in expenses. There may be another {money(results.additionalLow)} to {money(results.additionalHigh)} worth reviewing. Actual deductions and savings depend on eligibility and documentation.</small>
              </div>
            </section>

            <section className="conversion-banner" id="trial-offer" aria-labelledby="conversion-heading">
              <div className="conversion-copy">
                <span className="conversion-kicker">
                  <Sparkles size={16} />
                  <span>Turn potential savings into a plan with</span>
                  <img className="conversion-kicker-logo" src="/1099vibe-logo.png" alt="1099Vibe" />
                </span>
                <h2 id="conversion-heading">Find the deductions you may be missing.</h2>
                <p>1099Vibe helps you identify business write-offs, organize receipts and records, and get tax expert-informed guidance so you can keep more of what you earn.</p>
              </div>
              <div className="conversion-action">
                <div className="average-savings"><span>Average client tax savings*</span><strong>$4,000</strong></div>
                <button className="trial-button" type="button" onClick={() => alert("Your final free signup link will connect here.")}>Get Started for Free <ArrowRight size={19} /></button>
                <small>15 days free. Cancel anytime.</small>
              </div>
            </section>

            <article className="result-card tax-detail-card">
              <div className="tax-detail-heading">
                <div className="result-card-head"><span><CircleDollarSign size={21} /></span><div><small>Your estimated federal tax</small><strong>{money(results.potentialLowTax.totalFederalTax)} to {money(results.current.totalFederalTax)}</strong></div></div>
                <p>This includes federal income tax and self-employment tax. The lower estimate reflects the potential business deductions shown above.</p>
              </div>
              <div className="tax-summary-breakdown">
                <div className="tax-line"><span>Federal income tax</span><strong>{money(results.current.federalIncomeTax)}</strong></div>
                <div className="tax-line"><span>Self-employment tax</span><strong>{money(results.current.selfEmploymentTax)}</strong></div>
                <div className="payment-line"><span>Payments entered</span><strong>-{money(results.payments)}</strong></div>
                <div className="total"><span>Estimated amount still to cover</span><strong>{money(Math.max(0, results.balanceLow))} to {money(Math.max(0, results.balanceHigh))}</strong></div>
              </div>
            </article>

            {!results.current.qbiIsStraightforward ? (
              <div className="qbi-note"><Info size={19} /><p><strong>Your income may trigger special QBI limits.</strong> The estimate range allows for uncertainty in the qualified business income deduction. Business type, payroll, and qualified property can change the final amount.</p></div>
            ) : null}

            <section className="methodology">
              <details>
                <summary>How this estimate works</summary>
                <div className="methodology-content">
                  <p>This calculator applies the selected year&apos;s federal tax brackets, standard deduction, 92.35% net-earnings factor, 12.4% Social Security tax, 2.9% Medicare tax, Additional Medicare Tax thresholds, deductible employer-equivalent portion of self-employment tax, and QBI rules where they can be estimated from your answers. For 2026, it also applies the $400 minimum QBI deduction when qualified business income is at least $1,000.</p>
                  <p>The state estimate applies the selected state&apos;s 2025 or 2026 individual income-tax rates, brackets, general standard deduction, and basic taxpayer exemption or credit where applicable. It assumes full-year residency and that all income entered is taxable in that state. It does not include city or county income taxes, dependent benefits, every state-specific credit, additions or subtractions, part-year or nonresident allocation, capital gains taxes, or entity-level taxes.</p>
                  <p>Federal refundable credits, alternative minimum tax, special capital gains rates, depreciation schedules, and every special federal deduction are also outside this planning estimate. Add known federal adjustments, deductions, itemized deductions, and nonrefundable credits in the advanced fields for a closer result.</p>
                  <div className="source-links">
                    <a href="https://www.irs.gov/publications/p505" target="_blank" rel="noreferrer">IRS Publication 505</a>
                    <a href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" target="_blank" rel="noreferrer">IRS 2026 inflation adjustments</a>
                    <a href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" target="_blank" rel="noreferrer">IRS Revenue Procedure 2025-32</a>
                    <a href="https://www.irs.gov/irb/2024-45_IRB" target="_blank" rel="noreferrer">IRS 2025 tax rate tables</a>
                    <a href="https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" target="_blank" rel="noreferrer">2026 state rate schedules</a>
                    <a href="https://taxfoundation.org/data/all/state/state-income-tax-rates/" target="_blank" rel="noreferrer">2025 state rate schedules</a>
                  </div>
                </div>
              </details>
            </section>

            <p className="legal-note">*Average savings based on 1-800Accountant client data. Individual results vary. This calculator provides a federal and state planning estimate, not tax advice or a guarantee of your final liability. Local taxes and special state rules may change your result. Review your full situation with a qualified tax professional.</p>
          </section>
        )}
      </section>

      {step < 4 ? (
        <section className="faq-section" aria-labelledby="faq-heading">
          <div className="faq-shell">
            <div className="faq-intro">
              <span className="eyebrow">Clear answers for independent earners</span>
              <h2 id="faq-heading">1099 tax questions, answered.</h2>
              <p>Understand what the calculator is estimating, why the numbers matter, and what can change your result.</p>
              <div className="faq-trust-note">
                <ShieldCheck aria-hidden="true" size={20} />
                <span><strong>Reviewed for 2025 and 2026</strong>Based on current federal and state guidance used by this calculator.</span>
              </div>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                const answerId = `faq-answer-${index}`;
                return (
                  <article className={isOpen ? "faq-item open" : "faq-item"} key={item.question}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span>{item.question}</span>
                        <span className="faq-toggle" aria-hidden="true"><ChevronDown size={20} /></span>
                      </button>
                    </h3>
                    <div className="faq-answer" id={answerId} hidden={!isOpen}>
                      <p>{item.answer}</p>
                    </div>
                  </article>
                );
              })}

              <div className="faq-sources">
                <span>Tax guidance:</span>
                <a href="https://www.irs.gov/taxtopics/tc554" target="_blank" rel="noreferrer">IRS self-employment tax</a>
                <a href="https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes" target="_blank" rel="noreferrer">IRS estimated taxes</a>
                <a href="https://www.irs.gov/businesses/small-businesses-self-employed/s-corporation-compensation-and-medical-insurance-issues" target="_blank" rel="noreferrer">IRS S corporation guidance</a>
                <a href="https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" target="_blank" rel="noreferrer">2026 state schedules</a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="site-footer"><img src="/1099vibe-logo.png" alt="1099Vibe" /><p>Taxes built for how you earn.</p><span>Federal and state rules reviewed September 2026</span></footer>
    </main>
  );
}
