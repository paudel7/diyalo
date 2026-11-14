import type { Program } from "@/mocks/types";

export const programs: Program[] = [
  {
    slug: "education",
    name: "Education support",
    shortName: "Education",
    summary:
      "Helps children stay in school: fees, books, uniforms, transport and study essentials.",
    covers: [
      "School and exam fees",
      "Books and stationery",
      "Uniforms and school bags",
      "Transport to school",
    ],
    doesNotCover: [
      "Cash given to a family without a purpose",
      "Costs not linked to a child's schooling",
    ],
  },
  {
    slug: "essential-living",
    name: "Essential living support",
    shortName: "Essential living",
    summary:
      "Helps families cover basics when a gap would otherwise put a child's wellbeing or schooling at risk.",
    covers: [
      "Food support",
      "Warm clothing and bedding",
      "Heating fuel",
      "Short-term rent contributions",
    ],
    doesNotCover: ["Long-term income replacement", "Debts unrelated to a child's wellbeing"],
  },
];

export function getProgram(slug: string) {
  return programs.find((p) => p.slug === slug);
}
