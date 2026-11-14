import type { Money } from "@/lib/money";
import type { PublicCase, SponsorshipNeed } from "@/mocks/types";

const usd = (dollars: number): Money => ({ minor: dollars * 100, currency: "USD" });

/**
 * FICTIONAL sample cases for the design prototype. No real child, family, school or place is
 * described. Names are invented pseudonyms. Real cases only appear after the Stage 3 workflow
 * (screening, verification, assessment, approval, consent) has been completed.
 */
export const cases: PublicCase[] = [
  {
    slug: "sample-school-year",
    displayName: "Aarav (sample)",
    ageBand: "10 to 12",
    region: "Bagmati Province",
    program: "education",
    title: "A full school year of fees and books",
    needSummary: "School fees, books, a uniform and bus fare for one school year.",
    story: [
      "This is a sample case written to show how a case page reads. Aarav is an invented child.",
      "A real case page tells the need in plain words, says what the money will buy, and shows only what the guardian has agreed to share.",
    ],
    status: "open",
    target: usd(640),
    raised: usd(410),
    budget: [
      { item: "School fees", amount: usd(380) },
      { item: "Books and stationery", amount: usd(110) },
      { item: "Uniform", amount: usd(70) },
      { item: "Transport", amount: usd(80) },
    ],
    lastUpdate: { date: "2026-10-28", text: "Sample update: term fees confirmed with the school." },
  },
  {
    slug: "sample-exam-year",
    displayName: "Maya (sample)",
    ageBand: "13 to 15",
    region: "Gandaki Province",
    program: "education",
    title: "Exam fees and a solar study light",
    needSummary: "Final exam fees, tuition support and a light to study by after dark.",
    story: [
      "Another invented sample. Maya's family has no steady power in the evenings.",
      "This sample is fully funded, so the page shows how a funded case looks and where the donor goes next.",
    ],
    status: "funded",
    target: usd(480),
    raised: usd(480),
    budget: [
      { item: "Exam fees", amount: usd(150) },
      { item: "Tuition support", amount: usd(220) },
      { item: "Solar study light", amount: usd(45) },
      { item: "Books", amount: usd(65) },
    ],
    lastUpdate: { date: "2026-11-02", text: "Sample update: target reached." },
  },
  {
    slug: "sample-winter-warmth",
    displayName: "Family of five (sample)",
    ageBand: "Children 4 to 14",
    region: "Koshi Province",
    program: "essential-living",
    title: "Winter warmth for a family of five",
    needSummary: "Blankets, warm clothing, heating fuel and three months of food support.",
    story: [
      "An invented family used to show an essential-living case. The need is described by category, not by a private story.",
      "Public text never includes an address, a school name or anything that could identify the family.",
    ],
    status: "open",
    target: usd(650),
    raised: usd(95),
    budget: [
      { item: "Blankets and warm clothing", amount: usd(210) },
      { item: "Heating fuel", amount: usd(140) },
      { item: "Food support (3 months)", amount: usd(300) },
    ],
    lastUpdate: { date: "2026-10-30", text: "Sample update: case approved for publication." },
  },
  {
    slug: "sample-rent-gap",
    displayName: "Sample household B",
    ageBand: "Children 6 to 9",
    region: "Lumbini Province",
    program: "essential-living",
    title: "Three months of rent support after a job loss",
    needSummary: "A short-term rent contribution and basics so two children can stay in school.",
    story: [
      "An invented single-parent household. The aim is a short bridge, not long-term support.",
      "Case pages state what happens if the target is not reached, using the published donation terms.",
    ],
    status: "open",
    target: usd(600),
    raised: usd(250),
    budget: [
      { item: "Rent contribution (3 months)", amount: usd(360) },
      { item: "Utilities", amount: usd(90) },
      { item: "Basic food", amount: usd(150) },
    ],
    lastUpdate: { date: "2026-11-01", text: "Sample update: landlord arrangement confirmed." },
  },
  {
    slug: "sample-siblings-schooling",
    displayName: "Two siblings (sample)",
    ageBand: "8 and 11",
    region: "Bagmati Province",
    program: "education",
    title: "Uniforms, books and bags for two siblings",
    needSummary: "Everything two children need to start the school term.",
    story: [
      "An invented pair of siblings used to show a smaller case.",
      "Smaller targets can be reached quickly, so the page must read well at every stage of funding.",
    ],
    status: "open",
    target: usd(340),
    raised: usd(120),
    budget: [
      { item: "Uniforms", amount: usd(140) },
      { item: "Books", amount: usd(120) },
      { item: "School bags", amount: usd(80) },
    ],
    lastUpdate: { date: "2026-10-25", text: "Sample update: list of items confirmed." },
  },
];

export function getCase(slug: string) {
  return cases.find((c) => c.slug === slug);
}

export const sponsorshipNeeds: SponsorshipNeed[] = [
  {
    slug: "school-supply-pack",
    name: "School supply pack",
    program: "education",
    unitCost: usd(35),
    unitsNeeded: 40,
    unitsFunded: 18,
    description: "Notebooks, pens, a geometry set and a bag for one student.",
  },
  {
    slug: "solar-study-light",
    name: "Solar study light",
    program: "education",
    unitCost: usd(22),
    unitsNeeded: 30,
    unitsFunded: 30,
    description: "A rechargeable light so a child can study after dark.",
  },
  {
    slug: "winter-blanket-set",
    name: "Winter blanket set",
    program: "essential-living",
    unitCost: usd(40),
    unitsNeeded: 25,
    unitsFunded: 6,
    description: "Two thick blankets and warm socks for one household.",
  },
  {
    slug: "school-transport-month",
    name: "One month of school transport",
    program: "education",
    unitCost: usd(20),
    unitsNeeded: 60,
    unitsFunded: 22,
    description: "Bus fare so a child can reach school for a month.",
  },
];
