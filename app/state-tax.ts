export type StateCode =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL"
  | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME"
  | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH"
  | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI"
  | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

export const STATE_OPTIONS: ReadonlyArray<{ code: StateCode; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

type TaxYear = "2025" | "2026";
type FilingStatus = "single" | "mfj" | "mfs" | "hoh";
type StateBracket = { min: number; rate: number };
type StateTaxRule = {
  single: StateBracket[];
  joint: StateBracket[];
  deductionSingle?: number;
  deductionJoint?: number;
  exemptionSingle?: number;
  exemptionJoint?: number;
  creditSingle?: number;
  creditJoint?: number;
};

const b = (...values: Array<[number, number]>): StateBracket[] =>
  values.map(([min, rate]) => ({ min, rate }));

const r = (
  single: StateBracket[],
  joint: StateBracket[] = single,
  deductionSingle = 0,
  deductionJoint = deductionSingle,
  exemptionSingle = 0,
  exemptionJoint = exemptionSingle,
  creditSingle = 0,
  creditJoint = creditSingle,
): StateTaxRule => ({
  single,
  joint,
  deductionSingle,
  deductionJoint,
  exemptionSingle,
  exemptionJoint,
  creditSingle,
  creditJoint,
});

const none = r([]);

const RULES_2026: Record<StateCode, StateTaxRule> = {
  AL: r(b([0, .02], [500, .04], [3000, .05]), b([0, .02], [1000, .04], [6000, .05]), 3000, 8500, 1500, 3000),
  AK: none,
  AZ: r(b([0, .025]), undefined, 8350, 16700),
  AR: r(b([0, .02], [4600, .039]), undefined, 2470, 4940, 0, 0, 29, 58),
  CA: r(
    b([0, .01], [11079, .02], [26264, .04], [41452, .06], [57542, .08], [72724, .093], [371479, .103], [445771, .113], [742953, .123], [1000000, .133]),
    b([0, .01], [22158, .02], [52528, .04], [82904, .06], [115084, .08], [145448, .093], [742958, .103], [891542, .113], [1000000, .123], [1485906, .133]),
    5540, 11080, 0, 0, 153, 306,
  ),
  CO: r(b([0, .044]), undefined, 16100, 32200),
  CT: r(b([0, .02], [10000, .045], [50000, .055], [100000, .06], [200000, .065], [250000, .069], [500000, .0699]), b([0, .02], [20000, .045], [100000, .055], [200000, .06], [400000, .065], [500000, .069], [1000000, .0699]), 0, 0, 15000, 24000),
  DE: r(b([2000, .022], [5000, .039], [10000, .048], [20000, .052], [25000, .0555], [60000, .066]), undefined, 3250, 6500, 0, 0, 110, 220),
  DC: r(b([0, .04], [10000, .06], [40000, .065], [60000, .085], [250000, .0925], [500000, .0975], [1000000, .1075]), undefined, 16100, 32200),
  FL: none,
  GA: r(b([0, .0519]), undefined, 12000, 24000),
  HI: r(
    b([0, .014], [9600, .032], [14400, .055], [19200, .064], [24000, .068], [36000, .072], [48000, .076], [125000, .079], [175000, .0825], [225000, .09], [275000, .10], [325000, .11]),
    b([0, .014], [19200, .032], [28800, .055], [38400, .064], [48000, .068], [72000, .072], [96000, .076], [250000, .079], [350000, .0825], [450000, .09], [550000, .10], [650000, .11]),
    4400, 8800, 1144, 2288,
  ),
  ID: r(b([4811, .053]), b([9622, .053]), 16100, 32200),
  IL: r(b([0, .0495]), undefined, 0, 0, 2925, 5850),
  IN: r(b([0, .0295]), undefined, 0, 0, 1000, 2000),
  IA: r(b([0, .038]), undefined, 16100, 32200, 0, 0, 40, 80),
  KS: r(b([0, .052], [23000, .0558]), b([0, .052], [46000, .0558]), 3605, 8240, 9160, 18320),
  KY: r(b([0, .035]), undefined, 3360, 3360),
  LA: r(b([0, .03]), undefined, 12875, 25750),
  ME: r(b([0, .058], [27399, .0675], [64849, .0715]), b([0, .058], [54849, .0675], [129749, .0715]), 8350, 16700, 5300, 10600),
  MD: r(
    b([0, .02], [1000, .03], [2000, .04], [3000, .0475], [100000, .05], [125000, .0525], [150000, .055], [250000, .0575], [500000, .0625], [1000000, .065]),
    b([0, .02], [1000, .03], [2000, .04], [3000, .0475], [150000, .05], [175000, .0525], [225000, .055], [300000, .0575], [600000, .0625], [1200000, .065]),
    3350, 6700, 3200, 6400,
  ),
  MA: r(b([0, .05], [1083150, .09]), undefined, 0, 0, 4400, 8800),
  MI: r(b([0, .0425]), undefined, 0, 0, 5900, 11800),
  MN: r(b([0, .0535], [33310, .068], [109430, .0785], [203150, .0985]), b([0, .0535], [48700, .068], [193480, .0785], [337930, .0985]), 15300, 30600),
  MS: r(b([10000, .04]), undefined, 2300, 4600, 6000, 12000),
  MO: r(b([1348, .02], [2696, .025], [4044, .03], [5392, .035], [6740, .04], [8088, .045], [9436, .047]), undefined, 16100, 32200),
  MT: r(b([0, .047], [47500, .0565]), b([0, .047], [95000, .0565]), 16100, 32200),
  NE: r(b([0, .0246], [4130, .0351], [24760, .0455]), b([0, .0246], [8250, .0351], [49530, .0455]), 8850, 17700, 0, 0, 176, 352),
  NV: none,
  NH: none,
  NJ: r(b([0, .014], [20000, .0175], [35000, .035], [40000, .05525], [75000, .0637], [500000, .0897], [1000000, .1075]), b([0, .014], [20000, .0175], [50000, .0245], [70000, .035], [80000, .05525], [150000, .0637], [500000, .0897], [1000000, .1075]), 0, 0, 1000, 2000),
  NM: r(b([0, .015], [5500, .032], [16500, .043], [33500, .047], [66500, .049], [210000, .059]), b([0, .015], [8000, .032], [25000, .043], [50000, .047], [100000, .049], [315000, .059]), 16100, 32200),
  NY: r(b([0, .039], [8500, .044], [11700, .0515], [13900, .054], [80650, .059], [215400, .0685], [1077550, .0965], [5000000, .103], [25000000, .109]), b([0, .039], [17150, .044], [23600, .0515], [27900, .054], [161550, .059], [323200, .0685], [2155350, .0965], [5000000, .103], [25000000, .109]), 8000, 16050),
  NC: r(b([0, .0399]), undefined, 12750, 25500),
  ND: r(b([48475, .0195], [244825, .025]), b([80975, .0195], [298075, .025]), 16100, 32200),
  OH: r(b([26050, .0275])),
  OK: r(b([3750, .025], [4900, .035], [7200, .045]), b([7500, .025], [9800, .035], [14400, .045]), 6350, 12700, 1000, 2000),
  OR: r(b([0, .0475], [4550, .0675], [11400, .0875], [125000, .099]), b([0, .0475], [9100, .0675], [22800, .0875], [250000, .099]), 2910, 5820, 0, 0, 256, 512),
  PA: r(b([0, .0307])),
  RI: r(b([0, .0375], [82050, .0475], [186450, .0599]), undefined, 11200, 22400, 5250, 10500),
  SC: r(b([0, 0], [3640, .03], [18230, .06]), undefined, 8350, 16700),
  SD: none,
  TN: none,
  TX: none,
  UT: r(b([0, .045]), undefined, 0, 0, 0, 0, 966, 1932),
  VT: r(b([0, .0335], [49400, .066], [119700, .076], [249700, .0875]), b([0, .0335], [82500, .066], [199450, .076], [304000, .0875]), 7650, 15300, 5300, 10600),
  VA: r(b([0, .02], [3000, .03], [5000, .05], [17000, .0575]), undefined, 8750, 17500, 930, 1860),
  WA: none,
  WV: r(b([0, .0222], [10000, .0296], [25000, .0333], [40000, .0444], [60000, .0482]), undefined, 0, 0, 2000, 4000),
  WI: r(b([0, .035], [15110, .044], [51950, .053], [332720, .0765]), b([0, .035], [20150, .044], [69260, .053], [443630, .0765]), 13960, 25840, 700, 1400),
  WY: none,
};

const RULES_2025: Record<StateCode, StateTaxRule> = {
  ...RULES_2026,
  AZ: r(b([0, .025]), undefined, 15000, 30000),
  AR: r(b([0, .02], [4500, .039]), undefined, 2410, 4820, 0, 0, 29, 58),
  CA: r(
    b([0, .01], [10756, .02], [25499, .04], [40245, .06], [55866, .08], [70606, .093], [360659, .103], [432787, .113], [721314, .123], [1000000, .133]),
    b([0, .01], [21512, .02], [50998, .04], [80490, .06], [111732, .08], [141212, .093], [721318, .103], [865574, .113], [1000000, .123], [1442628, .133]),
    5540, 11080, 0, 0, 149, 298,
  ),
  CO: r(b([0, .044]), undefined, 15000, 30000),
  DC: r(RULES_2026.DC.single, undefined, 15000, 30000),
  GA: r(b([0, .0539]), undefined, 12000, 24000),
  ID: r(b([4673, .05695]), b([9346, .05695]), 15000, 30000),
  IL: r(b([0, .0495]), undefined, 0, 0, 2850, 5700),
  IN: r(b([0, .03]), undefined, 0, 0, 1000, 2000),
  IA: r(b([0, .038]), undefined, 0, 0, 0, 0, 40, 80),
  KY: r(b([0, .04]), undefined, 3270, 6540),
  LA: r(b([0, .03]), undefined, 12500, 25000),
  ME: r(b([0, .058], [26800, .0675], [63450, .0715]), b([0, .058], [53600, .0675], [126900, .0715]), 15000, 30000, 5150, 10300),
  MD: { ...RULES_2026.MD, deductionSingle: 2700, deductionJoint: 5450 },
  MI: r(b([0, .0425]), undefined, 0, 0, 5800, 11600),
  MN: r(b([0, .0535], [32570, .068], [106990, .0785], [198630, .0985]), b([0, .0535], [47620, .068], [189180, .0785], [330410, .0985]), 14950, 29900),
  MS: r(b([10000, .044]), undefined, 2300, 4600, 6000, 12000),
  MO: r(b([1313, .02], [2626, .025], [3939, .03], [5252, .035], [6565, .04], [7878, .045], [9191, .047]), undefined, 15000, 30000),
  MT: r(b([0, .047], [21100, .059]), b([0, .047], [42200, .059]), 15000, 30000),
  NE: r(b([0, .0246], [4030, .0351], [24120, .0501], [38870, .052]), b([0, .0246], [8040, .0351], [48250, .0501], [77730, .052]), 8600, 17200, 0, 0, 171, 342),
  NM: { ...RULES_2026.NM, deductionSingle: 15000, deductionJoint: 30000 },
  NY: r(b([0, .04], [8500, .045], [11700, .0525], [13900, .055], [80650, .06], [215400, .0685], [1077550, .0965], [5000000, .103], [25000000, .109]), b([0, .04], [17150, .045], [23600, .0525], [27900, .055], [161550, .06], [323200, .0685], [2155350, .0965], [5000000, .103], [25000000, .109]), 8000, 16050),
  NC: r(b([0, .0425]), undefined, 12750, 25500),
  ND: { ...RULES_2026.ND, deductionSingle: 15000, deductionJoint: 30000 },
  OH: r(b([26050, .0275], [100000, .035])),
  OK: r(b([0, .0025], [1000, .0075], [2500, .0175], [3750, .0275], [4900, .0375], [7200, .0475]), b([0, .0025], [2000, .0075], [5000, .0175], [7500, .0275], [9800, .0375], [14400, .0475]), 6350, 12700, 1000, 2000),
  OR: r(b([0, .0475], [4400, .0675], [11050, .0875], [125000, .099]), b([0, .0475], [8800, .0675], [22100, .0875], [250000, .099]), 2800, 5600, 0, 0, 250, 500),
  RI: r(b([0, .0375], [79900, .0475], [181650, .0599]), undefined, 10900, 21800, 5100, 10200),
  SC: r(b([0, 0], [3560, .03], [17830, .062]), undefined, 15000, 30000),
  UT: r(b([0, .0455]), undefined, 0, 0, 0, 0, 900, 1800),
  VT: r(b([0, .0335], [47900, .066], [116000, .076], [242000, .0875]), b([0, .0335], [79950, .066], [193300, .076], [294600, .0875]), 7400, 14850, 5100, 10200),
  VA: r(RULES_2026.VA.single, undefined, 8500, 17000, 930, 1860),
  WI: r(b([0, .035], [14680, .044], [29370, .053], [323290, .0765]), b([0, .035], [19580, .044], [39150, .053], [431060, .0765]), 13560, 25110, 700, 1400),
};

const STATE_RULES: Record<TaxYear, Record<StateCode, StateTaxRule>> = {
  "2025": RULES_2025,
  "2026": RULES_2026,
};

function progressiveTax(taxableIncome: number, brackets: StateBracket[]) {
  if (!brackets.length) return 0;
  let tax = 0;
  for (let index = 0; index < brackets.length; index += 1) {
    const start = brackets[index].min;
    const end = brackets[index + 1]?.min ?? Infinity;
    const amount = Math.max(0, Math.min(taxableIncome, end) - start);
    tax += amount * brackets[index].rate;
  }
  return tax;
}

function ohioExemption(income: number, isJoint: boolean) {
  const multiplier = isJoint ? 2 : 1;
  if (income <= 40000) return 2400 * multiplier;
  if (income <= 80000) return 2150 * multiplier;
  if (income < 500000) return 1900 * multiplier;
  return 0;
}

export function stateName(code: StateCode | "") {
  return STATE_OPTIONS.find((state) => state.code === code)?.name ?? "Selected state";
}

export function calculateStateIncomeTax({
  year,
  state,
  filingStatus,
  adjustedGrossIncome,
}: {
  year: TaxYear;
  state: StateCode | "";
  filingStatus: FilingStatus;
  adjustedGrossIncome: number;
}) {
  if (!state) return 0;
  const rule = STATE_RULES[year][state];
  const isJoint = filingStatus === "mfj";
  const brackets = isJoint ? rule.joint : rule.single;
  const deduction = isJoint ? (rule.deductionJoint ?? 0) : (rule.deductionSingle ?? 0);
  const defaultExemption = isJoint ? (rule.exemptionJoint ?? 0) : (rule.exemptionSingle ?? 0);
  const exemption = state === "OH" ? ohioExemption(adjustedGrossIncome, isJoint) : defaultExemption;
  const credit = isJoint ? (rule.creditJoint ?? 0) : (rule.creditSingle ?? 0);
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction - exemption);
  return Math.max(0, progressiveTax(taxableIncome, brackets) - credit);
}
