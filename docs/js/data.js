/* ==========================================================================
   SITE CONTENT
   Everything repeated on the page (sponsors, prizes, timeline, gallery,
   socials…) is rendered from this object by main.js. Edit here, not in HTML.
   ========================================================================== */
window.SITE = (function () {
  // Drives the countdown. Local time.
  const EVENT_DATE = '2026-08-30T09:00:00'

  // Every Register button on the site (navbar, hero, register panel) opens this
  // form in a new tab.
  const REGISTER_URL = 'https://forms.gle/x7Tfbfx3DGQvPEb6A'

  const HERO_WORDS = ['Flag Forge 3.0', 'Breach The Gates!', 'Capture The Flags!']

  // Sponsors, in the order they appear. `logo` is a 1160×240 banner in
  // assets/sponsors/ (rendered from the brochure at 300 DPI, so it stays sharp).
  const SPONSORS = [
    {
      tier: 'Title Sponsor',
      name: 'Cyberfortix Technologies Pvt. Ltd.',
      logo: 'assets/sponsors/cyberfortix.webp',
      url: 'https://cyberfortix.com',
      site: 'cyberfortix.com',
      desc: 'Cyberfortix is a leader in modern cybersecurity, empowering learners through expert-driven training that builds real industry skill. It delivers focused security solutions that protect digital assets with precision and care, shaping capable professionals and strengthening the security posture of its clients.',
    },
    {
      tier: 'Prize Sponsor',
      name: 'Altered Security',
      logo: 'assets/sponsors/altered-security.webp',
      url: 'https://alteredsecurity.com',
      site: 'alteredsecurity.com',
      desc: 'Altered Security is a global cybersecurity education and training company specialising in hands-on Red Teaming, Active Directory Security, Cloud (Azure) Security and Enterprise AI Security. Founded in 2018 by renowned security researcher Nikhil Mittal, it operates from offices in India and Singapore.',
    },
    {
      tier: 'Strategic Partner',
      name: 'Numerical Analytics Instruments Pvt. Ltd.',
      logo: 'assets/sponsors/numerical-analytics.webp',
      url: 'https://numerical-analytics.com',
      site: 'numerical-analytics.com',
      desc: 'Numerical Analytics Instruments is an Indian distributor and solutions provider specialising in educational technology, statistical software and computational analytics. Founded in 2008 as part of the Malaysia- and Singapore-based Statworks Group, it serves academic institutions, enterprises and government agencies across India and South Asia.',
    },
  ]

  // Podium order — the featured card sits in the middle on desktop.
  // `tone` picks the card's accent: primary | accent | highlight.
  // `extra` is an optional line under the amount (e.g. a voucher).
  const PRIZES = [
    { place: '2', rank: 'Runner Up', amount: 7000, tone: 'primary' },
    {
      place: '1',
      rank: 'Winner Takes Root',
      amount: 7000,
      extra: '+ 1 Altered Security CRTP Exam Voucher',
      tone: 'highlight',
      featured: true,
      badge: 'Champion',
    },
    { place: '3', rank: 'Second Runner Up', amount: 6000, tone: 'accent' },
  ]

  // Total advertised pool (as on the brochure). Set separately from the cards
  // because it also counts the voucher and other rewards.
  const PRIZE_POOL = 40000

  const EVENT_FACTS = [
    { icon: '👥', label: 'Team Size', value: '2–4 Hackers' },
    { icon: '⏰', label: 'Duration', value: '9 Hours' },
    { icon: '🏆', label: 'Prize Pool', value: '₹' + PRIZE_POOL.toLocaleString('en-IN') },
  ]

  const PHASES = [
    { phase: 'Phase 01', date: 'Aug 01', title: 'Registration Opens', desc: 'The portal goes live. Assemble your squad of 2–4 players, pick your handle, and lock your slot before the queue fills up.' },
    { phase: 'Phase 02', date: 'Aug 10', title: 'Early Bird Deadline', desc: 'Register before the timer hits zero to grab exclusive swag, priority seeding, and a head start on the practice arena.' },
    { phase: 'Phase 03', date: 'Aug 18', title: 'Team Briefing & Warm-up', desc: 'Final rosters lock. Rules briefing, platform walkthrough, and a set of warm-up challenges drop to get you battle-ready.' },
    { phase: 'Phase 04', date: 'Aug 24', title: 'Qualifiers — Round 1', desc: '3-hour online jeopardy across web, steganography, cryptography and Linux.' },
    { phase: 'Phase 05', date: 'Aug 30', title: 'The Grand Finale', desc: 'A 6-hour online showdown packed with Boot2Root challenges. This is where the gates fall and legends are made.' },
    { phase: 'Phase 06', date: 'Aug 31', title: 'Awards & Closing', desc: 'Winners crowned, prizes distributed, and the Hall of Fame gets a fresh set of names. See you on the leaderboard.' },
  ]

  // Gallery. A plain static site can't list a folder, so each photo is named
  // here. Drop a .webp into the folder and add its path to the right group.
  const P = 'assets/photos/'
  const MEMORY_GROUPS = [
    {
      title: 'Champions',
      blurb: 'The teams that walked away with root last year.',
      photos: ['1st', '2nd', '3rd', 'all-winners'].map((f) => P + 'winners/' + f + '.webp'),
    },
    {
      title: 'Crucial Hours',
      blurb: 'Heads down, terminals up — inside the arena while the clock ran.',
      photos: [4, 6, 7, 8, 9, 10].map((n) => P + 'participants/part' + n + '.webp'),
    },
    {
      title: 'Team Flag Forge',
      blurb: 'The crew who built the gates before anyone could break them.',
      photos: [2, 3, 4].map((n) => P + 'team/team' + n + '.webp'),
    },
  ]

  // Footer + mobile-menu socials.
  //   id    → brand hover colour + icon (see ICONS in main.js)
  //   short → 2-letter chip in the mobile menu
  const SOCIALS = [
    { id: 'linkedin', name: 'LinkedIn', short: 'IN', url: 'https://www.linkedin.com/in/flag-forge-ctf/' },
    { id: 'instagram', name: 'Instagram', short: 'IG', url: 'https://www.instagram.com/flagforgeofficial/' },
  ]

  // Footer contact list. `tel` is the dialable form of the number.
  const CONTACTS = [
    { name: 'Pranjal Mishra', phone: '+91 83560 92249', tel: '+918356092249' },
    { name: 'Risha Tiwari', phone: '+91 77383 55881', tel: '+917738355881' },
  ]

  return {
    EVENT_DATE,
    REGISTER_URL,
    HERO_WORDS,
    SPONSORS,
    PRIZES,
    PRIZE_POOL,
    EVENT_FACTS,
    PHASES,
    MEMORY_GROUPS,
    SOCIALS,
    CONTACTS,
  }
})()
