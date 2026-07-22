export interface NavigationItem {
  href: string;
  label: string;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    href: "mission.html",
    label: "Mission",
    children: [
      { href: "our-mission.html", label: "Our Mission" },
      { href: "vision.html", label: "Our Vision" },
      { href: "why-us-fellows.html", label: "Why US Fellows Exists" },
      { href: "us-fellows-standard.html", label: "The US Fellows Standard" },
      { href: "governance-stewardship.html", label: "Governance & Stewardship" }
    ]
  },
  {
    href: "fellowships.html",
    label: "Fellowships",
    children: [
      { href: "fellowship-programs.html", label: "Fellowship Programs" },
      {
        href: "scholars.html",
        label: "R&D Scholars Program",
        children: [
          { href: "international-rd-scholars.html", label: "01 — International R&D Scholar" },
          { href: "resident-rd-scholar.html", label: "02 — Resident R&D Scholar" },
          { href: "trusted-rd-scholar.html", label: "03 — Trusted R&D Scholar" },
          { href: "principal-rd-scholar.html", label: "04 — Principal R&D Scholar" },
          { href: "distinguished-rd-scholar.html", label: "05 — Distinguished R&D Scholar" },
          { href: "scholar-standards.html", label: "Standards & Standing" },
          { href: "scholars-network.html", label: "Scholars Network" }
        ]
      },
      { href: "career-advancement.html", label: "Career Advancement Track" },
      { href: "international-graduate-fellows.html", label: "International Graduate Fellows" },
      { href: "national-capacity-fellows.html", label: "National Capacity Fellows" },
      { href: "mission-fellowships.html", label: "Mission Fellowships" }
    ]
  },
  {
    href: "society.html",
    label: "The Society",
    children: [
      { href: "fellowship-society.html", label: "The US Fellows Society" },
      { href: "cohorts-chapters.html", label: "Cohorts & Chapters" },
      { href: "convenings-honors.html", label: "Convenings & Honors" },
      { href: "code-of-service.html", label: "Code of Service" },
      { href: "fellowship-oath.html", label: "Fellowship Oath" }
    ]
  },
  {
    href: "host-institutions.html",
    label: "Host Institutions",
    children: [
      { href: "become-a-host.html", label: "Become a Host" },
      { href: "who-can-host.html", label: "Who Can Host" },
      { href: "host-standards.html", label: "Host Standards" },
      { href: "appointment-model.html", label: "Appointment Model" },
      { href: "submit-opportunity.html", label: "Submit an Opportunity" }
    ]
  },
  {
    href: "missions.html",
    label: "Missions",
    children: [
      { href: "humanity-dignity.html", label: "Humanity & Dignity" },
      { href: "science-discovery.html", label: "Science & Discovery" },
      { href: "planetary-stewardship.html", label: "Planetary Stewardship" },
      { href: "civic-life-public-trust.html", label: "Civic Life & Trust" },
      { href: "national-capacity-resilience.html", label: "National Capacity" }
    ]
  },
  {
    href: "fellows.html",
    label: "Fellows",
    children: [
      { href: "become-a-fellow.html", label: "Become a Fellow" },
      { href: "eligibility.html", label: "Eligibility" },
      { href: "selection-criteria.html", label: "Selection Criteria" },
      { href: "fellow-benefits.html", label: "Fellow Benefits" },
      { href: "nominate-a-fellow.html", label: "Nominate a Fellow" }
    ]
  },
  {
    href: "journal.html",
    label: "Journal",
    children: [
      { href: "essays-research-notes.html", label: "Essays & Research Notes" },
      { href: "field-reports.html", label: "Field Reports" },
      { href: "fellow-stories.html", label: "Fellow Stories" },
      { href: "institutional-briefings.html", label: "Institutional Briefings" },
      { href: "impact-reports.html", label: "Impact Reports" }
    ]
  }
];
