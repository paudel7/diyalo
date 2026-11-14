/** Public and admin navigation. Labels follow roadmap section 4.1 and 8.1 exactly. */
export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Our Causes", href: "/causes" },
  { label: "Children & Families", href: "/children-and-families" },
  { label: "Sponsor a Need", href: "/sponsor-a-need" },
  { label: "Our Impact", href: "/impact" },
  { label: "About DIYALO", href: "/about" },
];

export const utilityNav: NavItem[] = [
  { label: "Apply for Support", href: "/apply" },
  { label: "Corporate & Institutional Giving", href: "/corporate-giving" },
  { label: "Contact", href: "/contact" },
];

export const footerGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Give",
    items: [
      { label: "Donate now", href: "/donate" },
      { label: "Children & Families", href: "/children-and-families" },
      { label: "Sponsor a Need", href: "/sponsor-a-need" },
      { label: "Corporate & Institutional Giving", href: "/corporate-giving" },
    ],
  },
  {
    title: "Get support",
    items: [
      { label: "Apply for Support", href: "/apply" },
      { label: "Our Causes", href: "/causes" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "About DIYALO", href: "/about" },
      { label: "Governance", href: "/about/governance" },
      { label: "Partners", href: "/about/partners" },
      { label: "Our Impact", href: "/impact" },
    ],
  },
  {
    title: "Policies",
    items: [
      { label: "Child safeguarding", href: "/safeguarding" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Donation terms", href: "/donation-terms" },
      { label: "Complaints", href: "/complaints" },
    ],
  },
];

/** Admin modules, roadmap section 8.1. */
export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Cases", href: "/admin/cases" },
  { label: "Campaigns", href: "/admin/campaigns" },
  { label: "Donations", href: "/admin/donations" },
  { label: "Funds", href: "/admin/funds" },
  { label: "Disbursements", href: "/admin/disbursements" },
  { label: "Accounting", href: "/admin/accounting" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Documents", href: "/admin/documents" },
  { label: "Settings", href: "/admin/settings" },
];
