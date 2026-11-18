import type { PermissionCode } from "@/lib/permissions/matrix";

/** Public and admin navigation. Labels follow roadmap section 4.1 and 8.1 exactly. */
export interface NavItem {
  label: string;
  href: string;
}

/** An admin item is shown when the user holds any of these permissions. Display only: every page and action re-checks on the server. */
export interface AdminNavItem extends NavItem {
  anyOf?: PermissionCode[];
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
export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Applications", href: "/admin/applications", anyOf: ["application.read"] },
  { label: "Cases", href: "/admin/cases", anyOf: ["case.read"] },
  { label: "Campaigns", href: "/admin/campaigns", anyOf: ["settings.manage"] },
  { label: "Donations", href: "/admin/donations", anyOf: ["donation.read"] },
  { label: "Funds", href: "/admin/funds", anyOf: ["fund.classify"] },
  {
    label: "Disbursements",
    href: "/admin/disbursements",
    anyOf: ["disbursement.request", "disbursement.approve"],
  },
  { label: "Accounting", href: "/admin/accounting", anyOf: ["journal.prepare", "journal.post"] },
  { label: "Reports", href: "/admin/reports", anyOf: ["report.view"] },
  { label: "Documents", href: "/admin/documents", anyOf: ["document.read"] },
  { label: "Settings", href: "/admin/settings", anyOf: ["user.manage", "audit.read"] },
];
