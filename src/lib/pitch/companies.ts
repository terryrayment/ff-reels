/**
 * Per-company configs for the generic branded pitch pages at /pitch/[slug].
 *
 * Each config swaps the Versant messaging for a specific outreach target
 * while keeping the same design system. Research notes live in
 * sales/pitch-research/. Outreach emails live in sales/INTROS.md.
 *
 * Copy rules: Terry voice, warm and direct, no em dashes, no AI-symmetric
 * lists. Facts in tickers must be real (sourced in research docs).
 */

/**
 * Brand-neutral director card copy for non-Versant pitch pages.
 * Overrides the golf/Versant assignment fits in RosterModes.
 */
export const BRAND_ROSTER_FITS: Record<
  string,
  { signature?: string; match?: string; tags?: string[] }
> = {
  "jack-turits": {
    signature: "Comedy performance, real-people casting, creator-led formats.",
    match: "Comedy spots and real-people casting",
    tags: ["Comedy", "Casting", "Creator-led"],
  },
  "kelsey-larkin": {
    match: "Identity films and athlete portraits",
    tags: ["Portrait", "Identity", "Brand film"],
  },
  "matt-dilmore": {
    signature: "Comedy, format, archive-driven storytelling.",
    match: "Format-driven comedy and archive storytelling",
    tags: ["Comedy", "Format", "Talent"],
  },
  "boma-iluma": {
    match: "Culture and talent-led films",
    tags: ["Talent", "Culture", "Youth"],
  },
  "le-ged": {
    match: "Social motion and camera-first spots",
    tags: ["Motion", "Camera", "Social"],
  },
  "caleb-slain": {
    match: "Anthem films and broadcast promos",
    tags: ["Promo", "Anthem", "Delivery"],
  },
  bueno: {
    match: "Mixed-media campaigns and fan energy",
    tags: ["Mixed media", "Fans", "Social"],
  },
  "brother-willis": {
    signature: "Local stories, real places, field production.",
    match: "Local heroes and field production",
    tags: ["Local stories", "Casting", "Field production"],
  },
  "cody-cloud": {
    match: "Talent portrait package",
  },
  "terry-rayment": {
    match: "Founder and talent documentary films",
    tags: ["Documentary", "Talent", "Founder story"],
  },
};

export type PitchCompanyConfig = {
  slug: string;
  company: string;
  /** Founder / recipient on the outreach email. */
  recipientName: string;
  recipientFirst: string;
  recipientEmail: string;
  metaTitle: string;
  metaDescription: string;
  /** Hero h1 reads "Friends & Family for {heroFor}". */
  heroFor: string;
  /** Second hero paragraph: the per-company "why you" beat. */
  heroWhy: string;
  /** Marquee ticker, " · " separated, real facts about THEM. */
  ticker: string;
  /** "What F&F does" studio panel, tuned to their world. */
  studio: { headline: string; subline: string };
  /**
   * The company's master brand color (hex). Used for the hero, partner
   * bench, and CTA surfaces via --pitch-accent. Must hold white text.
   */
  accent: string;
  /** Editorial section: proof we did the homework. */
  noticed: {
    title: string;
    intro: string;
    cards: { label: string; body: string }[];
  };
  /** "How we would start" section. */
  fit: {
    titlePlain: string;
    titleAccent: string;
    intro: string;
    gives: [string, string][];
    tags: string[];
  };
};

export const PITCH_COMPANIES: Record<string, PitchCompanyConfig> = {
  hadrian: {
    slug: "hadrian",
    accent: "#002548",
    company: "Hadrian",
    recipientName: "Chris Power",
    recipientFirst: "Chris",
    recipientEmail: "chris@hadrian.co",
    metaTitle: "Friends & Family for Hadrian",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Hadrian.",
    heroFor: "Hadrian",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Hadrian because you're reindustrializing America, and someone should film it like it matters.",
    ticker:
      "Founded 2020 · $260M Series C, Founders Fund + Lux · 4 facilities, ~2.85M sq ft · ~10K unique parts a month from Torrance · Factory 3: 270,000 sq ft, Mesa AZ · $2.4B Navy maritime partnership · Technicians trained in 30 days",
    studio: {
      headline: "A production company built for factory floors and first hires",
      subline: "Shop access, safety windows, real technicians on camera, the list goes on.",
    },
    noticed: {
      title: "We did our homework.",
      intro:
        "Before we wrote a word, we watched everything Hadrian has put out and read everything Chris has said on the record. A few things stuck with us.",
      cards: [
        {
          label: "The clock strip",
          body: "The hadrian.co header shows live time in California, Arizona, Alabama, and DC. A company telling time across a rebuilding nation. That's the opening shot of your anthem film and it's already on your website.",
        },
        {
          label: "Sean's story",
          body: "In your own shop tour video, a technician explains how a ceramics class at Torrance High led to machining rocket parts. The New American Workforce isn't a talking point. It's a recruiting film waiting for a director.",
        },
        {
          label: "We're neighbors",
          body: "Factory 2 is in Torrance. We shoot all over LA. We will happily drive over, no deck, no pitch, just a walk through the shop. That's how we like to start anyway.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the workforce story.",
      titleAccent: "Build the anthem from there.",
      intro:
        "Mesa needs 350 hires. Alabama is opening for submarine parts. The story of ordinary people becoming factory technicians in 30 days is the most cinematic recruiting problem in American manufacturing, and it's sitting in your shops right now.",
      gives: [
        ["Brief", "Recruiting goals, facility timelines, Navy partnership beats"],
        ["Production", "Shop floor crews, technician stories, founder on camera"],
        ["Deliverables", "Anthem film, recruiting cutdowns, facility launch films"],
        ["Audience", "The next 350 technicians, and the country watching"],
      ],
      tags: [
        "Recruiting film",
        "Brand anthem",
        "Facility launches",
        "Founder story",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  "shield-ai": {
    slug: "shield-ai",
    accent: "#050506",
    company: "Shield AI",
    recipientName: "Brandon Tseng",
    recipientFirst: "Brandon",
    recipientEmail: "brandon.tseng@shield.ai",
    metaTitle: "Friends & Family for Shield AI",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Shield AI.",
    heroFor: "Shield AI",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Shield AI because 'Earth is our runway' is already a director's logline, and the films should match it.",
    ticker:
      "Founded by a Navy SEAL · $12.7B valuation · Hivemind has flown 26 aircraft classes · V-BAT: 130+ sorties in Ukraine · X-BAT: no runway required · Featured on Netflix · San Diego, CA · Fielding 2028",
    studio: {
      headline: "A production company built for hardware in motion",
      subline: "Flight windows, range access, machines in real landscapes, the list goes on.",
    },
    noticed: {
      title: "The runway is everywhere. So is the story.",
      intro:
        "We watched the X-BAT reveal, the documentary, and the leadership interviews. Here is what stuck.",
      cards: [
        {
          label: "Netflix found it first",
          body: "Documentary cameras found the human story at Shield AI before your own marketing did. Unknown: Killer Robots worked because Brandon is genuinely good on camera. That presence is an asset most defense companies would kill for, and it's underused.",
        },
        {
          label: "The one-shot film",
          body: "X-BAT taking off vertically from a ship deck with no runway is a single continuous shot waiting to be directed. Machine in landscape, human stakes. That's the exact kind of cinema we shoot for Ford and ESPN.",
        },
        {
          label: "Crew over headcount",
          body: "Brandon's leadership creed is boundless positive energy and concerning yourself wholly with the team. That's how a director-led shop runs too. Small crews, total trust, mission over org chart.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with X-BAT.",
      titleAccent: "Build the deterrence story around it.",
      intro:
        "A $12.7B chapter deserves a brand anthem at the same scale as the engineering. The spec sheets are covered. What's thin is the cinematic layer: the humans the machines protect, the recruiting story, the founder's voice.",
      gives: [
        ["Brief", "X-BAT milestones, recruiting goals, deterrence narrative"],
        ["Production", "Flight test access, aircraft cinematography, founder films"],
        ["Deliverables", "Brand anthem, capability films, recruiting cutdowns"],
        ["Audience", "Talent, partners, and the policy world watching"],
      ],
      tags: [
        "Brand anthem",
        "Capability films",
        "Recruiting film",
        "Founder story",
        "Aerial",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  impulse: {
    slug: "impulse",
    accent: "#000000",
    company: "Impulse Space",
    recipientName: "Tom Mueller",
    recipientFirst: "Tom",
    recipientEmail: "tom@impulsespace.com",
    metaTitle: "Friends & Family for Impulse Space",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Impulse Space.",
    heroFor: "Impulse Space",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Impulse because the company's story, and Tom's, is far better than any footage that exists of it. We're twenty minutes up the freeway and we'd like to fix that.",
    ticker:
      "Founded 2021 · SpaceX employee #1 · Merlin engine designer · 3 Mira spacecraft on orbit · LEO to GEO in under a day · $500M Series D · $4.26B valuation · 144 open roles",
    studio: {
      headline: "A production company built for hardware in motion",
      subline: "Clean rooms, factory floors, launch windows, the list goes on.",
    },
    noticed: {
      title: "The hardest part isn't getting to space.",
      intro:
        "It's the story once you're up there. We read the Series D coverage and watched the factory tour. Here's what stuck.",
      cards: [
        {
          label: "The garage years",
          body: "A lumberjack's son from Saint Maries, Idaho builds the largest amateur liquid-fuel engine ever, in his spare time, in the Mojave. Then designs Merlin. Somebody is going to tell that story. It should be told well.",
        },
        {
          label: "People, not AI",
          body: "TechCrunch's headline said you raised $500M to hire people, not AI. 144 open roles means you need film that shows real hands building real hardware in Redondo Beach. That is a recruiting film, and it's our favorite kind.",
        },
        {
          label: "Three versions",
          body: "Tom says it takes three versions to get a really tight product. Same in our business. The first cut is never the film. We respect companies that iterate in public and we work the same way.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the people.",
      titleAccent: "Scale to the story of the last mile.",
      intro:
        "Helios debuts in 2027 and GEO rideshare is selling now. Between here and there you need 144 people who believe, customers who get it, and footage that finally matches the company. We'd start small and build.",
      gives: [
        ["Brief", "Hiring goals, Helios timeline, rideshare positioning"],
        ["Production", "Factory floor crews, founder story, mission films"],
        ["Deliverables", "Recruiting film, brand film, launch content"],
        ["Audience", "Engineers deciding where to build their decade"],
      ],
      tags: [
        "Recruiting film",
        "Founder story",
        "Brand film",
        "Factory floor",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  joby: {
    slug: "joby",
    accent: "#1C3F99",
    company: "Joby Aviation",
    recipientName: "JoeBen Bevirt",
    recipientFirst: "JoeBen",
    recipientEmail: "joeben@jobyaviation.com",
    metaTitle: "Friends & Family for Joby Aviation",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Joby Aviation.",
    heroFor: "Joby",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Joby because the hard part was physics, and the next part is feeling. That's a directing problem, not an aerospace one.",
    ticker:
      "Founded 2009 · 200 mph, zero operating emissions · Stage 4 FAA certification · First NYC eVTOL flight, April 2026 · Dubai passenger service targeted 2026 · $894M from Toyota · Delta + Uber partners · Built in Marina, CA",
    studio: {
      headline: "A production company built for first flights",
      subline: "Flight windows, city permits, rider trust, the list goes on.",
    },
    noticed: {
      title: "The hard part was physics.",
      intro:
        "The next part is feeling. We've followed the certification milestones and watched the NYC flight clip more times than we'd like to admit. Here's what stuck.",
      cards: [
        {
          label: "Last Chance Road",
          body: "The whole company traces back to a kid in the Santa Cruz redwoods with a long walk to school, dreaming about flying over it. That is the most filmable founding story in aviation and it hasn't been made yet.",
        },
        {
          label: "Quiet aircraft, loud city",
          body: "Millions saw thirty seconds of news footage of the Manhattan flight. The cinematic version of that moment, the hush of it over all that noise, doesn't exist. It should exist before the first paying passenger boards.",
        },
        {
          label: "Trust is the product now",
          body: "Seventeen years earned the engineering trust. The next twelve months are about passenger trust. What it feels like to step in, lift off, and relax. We make films that do exactly that translation.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with what it feels like to fly.",
      titleAccent: "Build the launch films from there.",
      intro:
        "Dubai this year. Delta and Uber after. Every launch city needs people to go from skeptical to curious to booked. That's consumer storytelling at broadcast craft, and it's the lane we've run for two decades.",
      gives: [
        ["Brief", "Launch cities, rider-trust narrative, partner beats"],
        ["Production", "Flight cinematography, rider films, city stories"],
        ["Deliverables", "Launch films, brand anthem, social cutdowns"],
        ["Audience", "First passengers and the cities watching them"],
      ],
      tags: [
        "Launch films",
        "Brand anthem",
        "Rider trust",
        "Aerial",
        "City stories",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  athletic: {
    slug: "athletic",
    accent: "#003A5D",
    company: "Athletic Brewing",
    recipientName: "Bill Shufelt",
    recipientFirst: "Bill",
    recipientEmail: "bill@athleticbrewing.com",
    metaTitle: "Friends & Family for Athletic Brewing",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Athletic Brewing.",
    heroFor: "Athletic Brewing",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Athletic because beer for people in motion deserves film made the same way, and because the post-round Run Wild on the 19th hole is genuinely part of our lives already.",
    ticker:
      "Founded 2017 · #6 U.S. craft brewer · ~19% of NA beer · ~$800M valuation · 50,000+ retail doors · Certified B Corp · Up to $2M a year to trails · Brewed in Milford, CT and San Diego",
    studio: {
      headline: "A production company built for athletes and the hours they keep",
      subline: "Dawn call times, race calendars, weather windows, the list goes on.",
    },
    noticed: {
      title: "Beer for people in motion.",
      intro:
        "We've watched the campaigns and we drink the product. A few things stood out from this side of the lens.",
      cards: [
        {
          label: "A hundred batches",
          body: "Bill quit a trading desk, recruited a brewer from Santa Fe, and iterated about a hundred home-brew batches before launch. That stubbornness about taste is the same thing as director-led production. You don't ship the third-best version.",
        },
        {
          label: "Two for the Trails",
          body: "Up to $2M a year for trail and park access is built for documentary craft. Trail crews, grant recipients, real dirt. We'd shoot those as short docs, not ads, and they'd be the most shared work the brand has made.",
        },
        {
          label: "The 120% year",
          body: "Your summer media spend is up roughly 120% year over year. That's the moment when production quality either scales with the budget or gets exposed by it. We've made that jump with brands before and we know where it breaks.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with athlete-true film.",
      titleAccent: "Scale it with the media budget.",
      intro:
        "From category creator to national beer brand is a craft problem as much as a media problem. Sport, trail, and the moments a Run Wild actually fits. We shoot athletes for Callaway, ESPN, and Nike, and that's the exact muscle this chapter needs.",
      gives: [
        ["Brief", "Campaign calendar, occasions, athlete partnerships"],
        ["Production", "Athlete-true crews, trail docs, founder story"],
        ["Deliverables", "National spots, doc shorts, social cutdowns"],
        ["Audience", "People in motion who can taste when it's fake"],
      ],
      tags: [
        "National spots",
        "Athlete films",
        "Doc shorts",
        "Trail stories",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  olipop: {
    slug: "olipop",
    accent: "#034638",
    company: "Olipop",
    recipientName: "Ben Goodwin",
    recipientFirst: "Ben",
    recipientEmail: "ben@drinkolipop.com",
    metaTitle: "Friends & Family for Olipop",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Olipop.",
    heroFor: "Olipop",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Olipop because feel-good soda deserves feel-good film, and you're about to make more of it in 18 months than in your first eight years.",
    ticker:
      "Founded 2018 · Oakland, CA · $400M+ 2024 sales · $1.85B valuation · 50,000+ stores · The feel good soda · Profitable and independent · 6g of fiber per can",
    studio: {
      headline: "A production company built for food and feeling",
      subline: "Talent windows, food styling, national versioning, the list goes on.",
    },
    noticed: {
      title: "Feel-good soda deserves feel-good film.",
      intro:
        "We watched the new campaign work and read up on how the company got here. Three things stuck.",
      cards: [
        {
          label: "Founder-formulator",
          body: "Ben formulated every flavor himself, from kombucha roots up. Terry directs the work his company sells. A founder-formulator and a founder-director tend to talk about craft the same way, which makes the first call easy.",
        },
        {
          label: "Soda Stories",
          body: "The Chenoweth and Jackson testimonial spots live on nostalgic personal memory, warm and a little funny. That is exactly the territory our directors live in, and there's a lot more of that vein to mine.",
        },
        {
          label: "The first CTV flight",
          body: "First sonic logo, first national CTV campaign, first brand refresh, all in 2026. The cadence you're entering needs more director-led film than one agency relationship usually covers. That's the gap we fill without drama.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the nostalgia craft.",
      titleAccent: "Keep the cadence national.",
      intro:
        "Poppi sold to Pepsi. You stayed independent. The brand that owns feel-good soda will be the one whose film actually feels good, not just tests well. We make warm, human, broadcast-grade work and we're built for sustained campaign volume.",
      gives: [
        ["Brief", "Campaign calendar, talent spots, refresh rollout"],
        ["Production", "Talent direction, nostalgia craft, brand films"],
        ["Deliverables", "National spots, talent films, social cutdowns"],
        ["Audience", "People coming back to soda and trusting it again"],
      ],
      tags: [
        "National spots",
        "Talent films",
        "Nostalgia craft",
        "Brand film",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  "magic-spoon": {
    slug: "magic-spoon",
    accent: "#3F0791",
    company: "Magic Spoon",
    recipientName: "Gabi Lewis",
    recipientFirst: "Gabi",
    recipientEmail: "gabi@magicspoon.com",
    metaTitle: "Friends & Family for Magic Spoon",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Magic Spoon.",
    heroFor: "Magic Spoon",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Magic Spoon because Saturday morning deserves to be shot like it deserves, and your world is rich enough for real filmmaking.",
    ticker:
      "Founded 2019 · 30,000+ stores · +35% YoY retail growth · $100M+ raised · 12 to 14g protein, 0 to 3g sugar · Protein Pastries, Jan 2026 · Marshmallow, most-requested flavor ever · Brooklyn-born, Brown-dorm origins",
    studio: {
      headline: "A production company built for pop spectacle",
      subline: "Talent windows, set builds, national versioning, the list goes on.",
    },
    noticed: {
      title: "Saturday morning, shot like it deserves.",
      intro:
        "We watched the campaigns and read the founder interviews. Here's what stuck with us.",
      cards: [
        {
          label: "Exo first",
          body: "Cricket protein didn't work, and Gabi talks about that failure as the education that built Magic Spoon. Right product, wrong package, try again. Every founder who has bet a company on taste and craft knows exactly that arc.",
        },
        {
          label: "It's Magic was right",
          body: "The 90s extreme-kids-commercial campaign proved you already know your world is cinematic. Guitar solos and skateboard grinds are literally a film genre our directors grew up on. The next chapter deserves the full version, not just the :06s.",
        },
        {
          label: "The shelf carries awareness now",
          body: "30,000 stores means the box is doing the introduction. The question that matters next: what does Magic Spoon look like when the film has to carry the feeling instead of the box? That's a director question.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the anthem.",
      titleAccent: "Let the box keep doing retail.",
      intro:
        "Pastries, marshmallow, granola, treats. The brand is becoming a breakfast platform and most of the film to date is performance-sized. We'd build the campaign-scale layer that makes the whole platform feel like one world.",
      gives: [
        ["Brief", "Line expansion beats, retail moments, campaign calendar"],
        ["Production", "Talent direction, pop spectacle, food craft"],
        ["Deliverables", "Anthem film, national spots, social cutdowns"],
        ["Audience", "Adults who left the cereal aisle and miss it"],
      ],
      tags: [
        "Anthem film",
        "National spots",
        "Pop spectacle",
        "Food craft",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  graza: {
    slug: "graza",
    accent: "#3C422E",
    company: "Graza",
    recipientName: "Andrew Benin",
    recipientFirst: "Andrew",
    recipientEmail: "andrew@graza.co",
    metaTitle: "Friends & Family for Graza",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Graza.",
    heroFor: "Graza",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Graza because the next chapter is mayo, NASCAR, and mass retail, and that needs film made by directors, not decks.",
    ticker:
      "Jaén, Spain Picual olives · Drizzle, Sizzle, Frizzle · 13,000+ retailers · ~$48M gross sales 2024 · Mayo launched Jan 2026 · Official Olive Oil and Mayo of NASCAR · 35,444 apology emails, 78% opened",
    studio: {
      headline: "A production company built for brands with personality",
      subline: "Food styling, live sport, talent windows, the list goes on.",
    },
    noticed: {
      title: "Big-screen craft for a squeeze-bottle brand.",
      intro:
        "Full disclosure, the Sizzle bottle on our kitchen counter is almost empty. Here's what stuck when we did the homework.",
      cards: [
        {
          label: "The apology email",
          body: "Emailing all 35,444 customers a personal, unvarnished apology and getting a 78% open rate is the single most Graza thing that has ever happened. We communicate like people too. It's why founders hire us directly.",
        },
        {
          label: "The NASCAR food truck era",
          body: "A squeeze bottle in front of race crowds is a genuinely funny, genuinely big swing. We shoot around live sport for ESPN and Ford. Filming at that scale without losing the brand's weirdness is exactly the job.",
        },
        {
          label: "Mayo is a knife fight",
          body: "Duke's loyalists. The Kewpie cult. The way you win in 30 seconds is making the first mayo from 100% unrefined oil feel inevitable, not explained. That's a directing problem and we'd love to take a crack at it.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the mayo fight.",
      titleAccent: "Keep the weird at national scale.",
      intro:
        "Creator content built the brand. Mass retail, Top Chef, and NASCAR are pushing it toward broadcast-adjacent audiences. The gap is premium film craft that scales the personality without sanding it off. That's our favorite assignment.",
      gives: [
        ["Brief", "Mayo launch beats, NASCAR calendar, retail moments"],
        ["Production", "Food craft, live sport, founder-true comedy"],
        ["Deliverables", "National spots, launch films, social cutdowns"],
        ["Audience", "People who already quote your packaging"],
      ],
      tags: [
        "National spots",
        "Food craft",
        "Comedy",
        "Live sport",
        "Launch films",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  "our-place": {
    slug: "our-place",
    accent: "#D37657",
    company: "Our Place",
    recipientName: "Shiza Shahid",
    recipientFirst: "Shiza",
    recipientEmail: "shiza@fromourplace.com",
    metaTitle: "Friends & Family for Our Place",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Our Place.",
    heroFor: "Our Place",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Our Place because you turned a pan into a place, and the film that carries that idea at cinematic scale hasn't been made yet.",
    ticker:
      "Founded in LA, 2019 · Always Pan sold out 30+ times · Selena Gomez collections · Crocs x Molly Baz collab · In Target, Amazon, Nordstrom and Walmart · Flagships on Melrose and Abbot Kinney · Co-founder of the Malala Fund · US, Canada, UK and Australia",
    studio: {
      headline: "A production company built for stories about people",
      subline: "Real homes, real cooks, founders on camera, the list goes on.",
    },
    noticed: {
      title: "Films for the table everyone gathers around.",
      intro:
        "We make films about people, and Our Place is the rare cookware brand whose actual product story is people. Here's what stuck when we did the homework.",
      cards: [
        {
          label: "The founding story",
          body: "A Pakistani-born founder who co-founded the Malala Fund, building a brand around home-cooked meals as how a family holds onto identity. That's not a product story with a mission attached. The mission is the product, and it's never had its film.",
        },
        {
          label: "The swings are real",
          body: "Crocs with Molly Baz. Repeat Selena Gomez collections. The brand clearly takes creative swings. Our lane is giving swings like that a film worthy of the idea, so the culture moment travels past the drop announcement.",
        },
        {
          label: "We're across town",
          body: "Both companies are LA, founder-run, and built on craft over scale. We'd genuinely rather walk the Melrose store and grab a coffee than send a deck. That offer stands whether or not a brief ever shows up.",
        },
      ],
    },
    fit: {
      titlePlain: "Start with the gathering.",
      titleAccent: "Build the brand film for mass retail.",
      intro:
        "Target, Amazon, and Walmart change who finds the brand first. The social-native content that built the cult following won't carry the top of that funnel. A director-led brand film about the table, the people, and the founder will.",
      gives: [
        ["Brief", "Retail expansion beats, collab calendar, founding story"],
        ["Production", "Human-first crews, food and tabletop craft, founder film"],
        ["Deliverables", "Brand film, launch films, social cutdowns"],
        ["Audience", "Every kitchen in America, not just the group chat"],
      ],
      tags: [
        "Brand film",
        "Founder story",
        "Food craft",
        "Launch films",
        "Social cutdowns",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  tracksmith: {
    slug: "tracksmith",
    accent: "#0A1E32",
    company: "Tracksmith",
    recipientName: "Matt Taylor",
    recipientFirst: "Matt",
    recipientEmail: "matt@tracksmith.com",
    metaTitle: "Friends & Family for Tracksmith",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Tracksmith.",
    heroFor: "Tracksmith",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Tracksmith because you already know exactly what good looks like, and what a CCO-led growth chapter needs is more of it than a small team can make alone.",
    ticker:
      "Founded Boston, 2014 · Trackhouse on Newbury St · Stores in Boston, Brooklyn and London · ~50 wholesale doors and climbing · Amateur Support Program since 2019 · METER, in print · No Days Off, annually · Founder now full-time CCO",
    studio: {
      headline: "A production company built for the amateur hours",
      subline: "Dawn miles, race weekends, weather windows, the list goes on.",
    },
    noticed: {
      title: "Films for the serious amateur's next chapter.",
      intro:
        "We come to this one as fans first. Tracksmith already makes some of the best brand film in running, so this is a letter between craftspeople, not a rescue pitch.",
      cards: [
        {
          label: "No Days Off",
          body: "The 2021 edition with Julia Chase-Brand's narration is the kind of film most brands talk about and never make. Our Januarys look the same as the ones you film. Unglamorous, cumulative, consistent. That's shared language.",
        },
        {
          label: "The Amateur Support Program",
          body: "Deliberately non-exclusive so athletes can graduate to pro contracts. The most quietly generous sponsorship model in the sport. Backing people before they're famous is also roughly the business model of a director roster.",
        },
        {
          label: "The CCO move",
          body: "Hiring your own replacement as CEO to protect the creative is a rare founder move and we noticed. Terry made the same call, staying a director who founded a company instead of becoming a manager who used to direct.",
        },
      ],
    },
    fit: {
      titlePlain: "More of what you already make.",
      titleAccent: "Without diluting any of it.",
      intro:
        "Wholesale is doubling and the creative output has to scale with it. The honest offer: director-led capacity that matches the standard you've set, briefed by a CCO who no longer has to choose between the brand film and the fifty other things.",
      gives: [
        ["Brief", "Season calendar, race moments, athlete stories"],
        ["Production", "Runner-true crews, doc craft, editorial taste"],
        ["Deliverables", "Brand films, athlete docs, campaign spots"],
        ["Audience", "Serious amateurs who can smell a fake mile"],
      ],
      tags: [
        "Brand films",
        "Athlete docs",
        "Doc craft",
        "Campaign spots",
        "Editorial",
        "Edit",
        "Motion",
        "Delivery",
      ],
    },
  },

  mach: {
    slug: "mach",
    accent: "#000000",
    company: "Mach Industries",
    recipientName: "Ethan Thornton",
    recipientFirst: "Ethan",
    recipientEmail: "ethan@machindustries.com",
    metaTitle: "Friends & Family for Mach Industries",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Mach Industries.",
    heroFor: "Mach",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Mach because the Forge expansion is a visual story most defense companies never get to tell, and it's happening in Huntington Beach right now.",
    ticker:
      "$300M Series C at $1.8B, June 2026 · Sequoia's first defense tech investment · Founded by an MIT dropout at 19 · Forge 1: 115,000 sq ft, Huntington Beach · Acquired Exquadrum for $50M · ~350 employees, up from a dozen · Army Strategic Strike flew Feb 2025",
    studio: {
      headline: "A production company built for the people rearming America",
      subline: "Factory floors under ITAR, flight tests with one take, a founder story the whole industry is watching, the list goes on.",
    },
    noticed: {
      title: "Forge 1, then four more.",
      intro:
        "We read the Series C coverage and everything Ethan has said on the record. Three things stuck.",
      cards: [
        {
          label: "The scale-up",
          body: "Your Huntington Beach plant is built to push out a thousand Vipers and three thousand Glides a month, with four more facilities coming by the end of 2026. That ramp is a once-in-a-company filmmaking moment and it's happening now.",
        },
        {
          label: "You talk about the hard parts",
          body: "Ethan addressed the 2023 hydrogen explosion publicly instead of burying it. A company that honest about failure deserves film that doesn't sand the edges off. We'd shoot it the same way you tell it.",
        },
        {
          label: "It actually flew",
          body: "Strategic Strike went from Army contract to successful flight tests in early 2025. Real flight footage beats renders every time, and you have the real thing sitting in your archive.",
        },
      ],
    },
    fit: {
      titlePlain: "Start at Forge 1.",
      titleAccent: "Shoot the work as it happens.",
      intro:
        "Small crew, one day on the floor, founder on camera, no agency layer. The expansion needs recruiting film and the Series C watchers need to see the machines, and both come from the same shoot.",
      gives: [
        ["Brief", "Recruiting and credibility film for the Forge expansion"],
        ["Production", "Security-aware crews, factory floor, flight test units"],
        ["Deliverables", "Hero film, recruiting cutdowns, stills"],
        ["Audience", "Engineers, Army customers, the industry watching"],
      ],
      tags: [
        "Founder story",
        "Factory floor",
        "Flight test",
        "Recruiting film",
        "Brand film",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  castelion: {
    slug: "castelion",
    accent: "#1F3B64",
    company: "Castelion",
    recipientName: "Bryon Hargis",
    recipientFirst: "Bryon",
    recipientEmail: "bryon@castelion.com",
    metaTitle: "Friends & Family for Castelion",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Castelion.",
    heroFor: "Castelion",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Castelion because you flew twenty test articles last year while the primes flew one, and that cadence is a story that deserves footage shot at the same tempo.",
    ticker:
      "$350M Series B, Dec 2025 · Blackbeard on F/A-18 by 2027 · 20+ flight tests in 2025 · Pentagon framework: 500 missiles a year minimum · Project Ranger: 1,000 acres in New Mexico · Founded 2022 by SpaceX veterans · Five sites: CA, NM, TX, DC",
    studio: {
      headline: "A production company built for the people rebuilding American deterrence",
      subline: "Test-range shoots, factory-floor crews, ITAR-aware sets, recruiting films that outrun the news cycle, the list goes on.",
    },
    noticed: {
      title: "Twenty flights, one year.",
      intro:
        "We read the Series B coverage and the Pentagon framework news. Here's what stuck.",
      cards: [
        {
          label: "The cadence is the story",
          body: "Most primes fly a test article every few years. Castelion flew more than twenty in 2025 alone, on motors and seekers and flight computers you build in-house. That tempo is the brand, and it mostly lives in press releases right now.",
        },
        {
          label: "Project Ranger is a place",
          body: "A thousand-acre solid rocket motor campus rising in New Mexico, built to turn out thousands of Blackbeards a year. Ground-up factory builds are once-in-a-company filmmaking moments. This one is pouring concrete now.",
        },
        {
          label: "Hiring against the clock",
          body: "Forty-plus open roles across five sites in three states plus DC. Every one of those candidates Googles Castelion first. Film is what they'll find, or what they won't.",
        },
      ],
    },
    fit: {
      titlePlain: "You build the hardware.",
      titleAccent: "We build how the world sees it.",
      intro:
        "We'd start with a discovery day in Torrance: walk the floor, meet the team, map what can be shown and what can't. From there, one anthem film and a modular library cut for recruiting and the milestones already on your 2026 calendar.",
      gives: [
        ["Brief", "Anthem film plus recruiting and milestone library"],
        ["Production", "ITAR-aware crews, test-range and factory units"],
        ["Deliverables", "Hero film, cutdowns, social verticals, stills"],
        ["Audience", "Engineers you're hiring and services you're fielding with"],
      ],
      tags: [
        "Anthem film",
        "Recruiting film",
        "Factory build doc",
        "Test-day coverage",
        "Founder on camera",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  "k2-space": {
    slug: "k2-space",
    accent: "#141414",
    company: "K2 Space",
    recipientName: "Karan Kunjur",
    recipientFirst: "Karan",
    recipientEmail: "karan@k2space.com",
    metaTitle: "Friends & Family for K2 Space",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for K2 Space.",
    heroFor: "K2 Space",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with K2 because you bet on big satellites while the whole industry went small, the bet paid off, and that arc deserves to be told on film instead of in press releases.",
    ticker:
      "$250M Series C at $3B valuation · 20 kW Mega Class bus · 3,000 kg payload capacity · GRAVITAS: 40m solar wingspan · 80% built in-house · Founded 2022, Torrance CA · Two brothers, BCG and SpaceX Dragon",
    studio: {
      headline: "A production company built for the launch-abundance era",
      subline: "Facility films in Torrance, mission-countdown content, recruiting reels that have to out-pull SpaceX, the list goes on.",
    },
    noticed: {
      title: "Contrarian by design.",
      intro:
        "We read the Series C coverage and watched what footage exists of GRAVITAS. Here's what stuck.",
      cards: [
        {
          label: "The bet paid off",
          body: "While the industry raced toward smallsats, K2 bet on mega-class platforms. Now there's a $3B valuation and a launch manifest through 2027. That story arc is rare and it's still mostly untold on film.",
        },
        {
          label: "Hardware you can point a lens at",
          body: "A 40-meter solar wingspan. Eighty percent of the vehicle built in-house. A Torrance factory scaling to serial production. Most startups have a slide deck. You have cinema-grade subject matter sitting on the floor.",
        },
        {
          label: "Two brothers, one company",
          body: "A BCG dealmaker and a SpaceX Dragon engineer building their first venture together is the kind of founder dynamic audiences actually remember. Build Bigger is a tagline. The brothers are the story.",
        },
      ],
    },
    fit: {
      titlePlain: "You build bigger.",
      titleAccent: "We shoot bigger.",
      intro:
        "K2 is entering its most visible year: first production launches, new customers, aggressive hiring. The footage you capture now becomes the brand archive for the next decade, and it should be shot like it.",
      gives: [
        ["Brief", "Founder story plus factory anthem film"],
        ["Production", "Torrance facility shoots, doc crews, launch coverage"],
        ["Deliverables", "Hero film, cutdowns, recruiting verticals, stills"],
        ["Audience", "Customers, DoD stakeholders, candidates, investors"],
      ],
      tags: [
        "Founder doc",
        "Factory anthem",
        "Launch coverage",
        "Recruiting film",
        "Social cutdowns",
        "Photography",
        "Edit",
        "Delivery",
      ],
    },
  },

  varda: {
    slug: "varda",
    accent: "#0A3065",
    company: "Varda Space",
    recipientName: "Delian Asparouhov",
    recipientFirst: "Delian",
    recipientEmail: "delian@foundersfund.com",
    metaTitle: "Friends & Family for Varda Space",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Varda Space.",
    heroFor: "Varda",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Varda because your raw reentry camera went to the top of Hacker News on its own, and we keep imagining what a crafted edit of that material could do.",
    ticker:
      "Founded 2020 in El Segundo · $329M raised · First drug crystallized in orbit · First commercial capsule recovered on US soil · Reentry at Mach 25 · Six missions flown · AFRL Prometheus hypersonic partner · W-6 landed at Koonibba, May 2026",
    studio: {
      headline: "A production company built for orbital manufacturing",
      subline: "Capsules in clean rooms, recoveries in the outback, plasma at Mach 25, a factory floor in El Segundo, the list goes on.",
    },
    noticed: {
      title: "The footage already went viral.",
      intro:
        "We watched the W-2 reentry video the day it dropped, like everyone else. Here's what stuck.",
      cards: [
        {
          label: "The raw camera did that",
          body: "Plasma, sound and all, LEO to Earth in five minutes, top of Hacker News. That was an unedited onboard camera. The crafted version of Varda's missions doesn't exist yet, and it's sitting in your archive waiting.",
        },
        {
          label: "Milestones as press releases",
          body: "First drug crystallized in orbit. First commercial capsule recovered on US soil. Two reentries already in 2026. Each one is a film waiting to happen, and right now they mostly live as PDFs.",
        },
        {
          label: "Delian is the distribution",
          body: "One of the most-watched founder accounts on X, posting constantly about Varda and El Segundo. Film made for that feed, cut for that voice, travels further than anything a brand account posts.",
        },
      ],
    },
    fit: {
      titlePlain: "You make medicine in orbit.",
      titleAccent: "We make the films on Earth.",
      intro:
        "Varda's missions already produce the most cinematic raw material in aerospace. We'd turn the milestone calendar into a film system built for recruiting, pharma partners, and the feed.",
      gives: [
        ["Brief", "Mission films, recruiting, brand"],
        ["Production", "El Segundo shoots plus mission footage edit"],
        ["Deliverables", "Hero film, cutdowns, social verticals"],
        ["Audience", "Pharma partners, DoD, hard-tech talent"],
      ],
      tags: [
        "Mission films",
        "Founder content",
        "Recruiting film",
        "Launch recaps",
        "Facility tours",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  "fly-by-jing": {
    slug: "fly-by-jing",
    accent: "#F9423A",
    company: "Fly By Jing",
    recipientName: "Jing Gao",
    recipientFirst: "Jing",
    recipientEmail: "jing@flybyjing.com",
    metaTitle: "Friends & Family for Fly By Jing",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Fly By Jing.",
    heroFor: "Fly By Jing",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Fly By Jing because the move from cult condiment to 12,000 doors changes what your film has to do, and shelf awareness is a different job than conversion ads.",
    ticker:
      "Founded 2018 · Highest-funded craft food Kickstarter of 2018 · Made in Chengdu · 12,000 retail doors · $12M Series B · B Corp certified · Author of The Book of Sichuan Chili Crisp · Chili Crisp Ketchup with Frankie Gaw",
    studio: {
      headline: "A production company built for brands that put flavor first",
      subline: "Tabletop that makes chili oil glisten, founder-led storytelling, retail-ready cutdowns, recipe content that actually gets cooked, the list goes on.",
    },
    noticed: {
      title: "Fly restaurants, literally.",
      intro:
        "We did the homework on the brand and the founder. Three things stuck.",
      cards: [
        {
          label: "The name is a film",
          body: "Fly By Jing honors Chengdu's hole-in-the-wall spots so good they draw people like flies. That origin story is built into every jar, and it deserves film treatment instead of a label paragraph.",
        },
        {
          label: "The pivot changes the job",
          body: "In 2025 you moved hard into retail: 12,000 stores, new packaging, sharper prices for the Walmart expansion. Shelf awareness is a different assignment than the DTC content that built the cult. That gap is exactly our lane.",
        },
        {
          label: "Jing is the brand",
          body: "The name reclamation, the chef credentials, the cookbook. Few founders carry this much narrative weight on camera, and most brand films underuse a founder this good.",
        },
      ],
    },
    fit: {
      titlePlain: "We make food look the way it tastes.",
      titleAccent: "Tingly, glossy, alive.",
      intro:
        "Founder story and retail awareness can live in one campaign. We'd shoot the documentary layer and the tabletop layer in the same week, in LA, and cut both for the shelf and the feed.",
      gives: [
        ["Brief", "Founder story plus retail awareness in one campaign"],
        ["Production", "Tabletop, macro food, documentary founder shoot in LA"],
        ["Deliverables", "Hero film plus 15s and 6s retail and social cutdowns"],
        ["Audience", "Grocery shoppers meeting chili crisp for the first time"],
      ],
      tags: [
        "Tabletop",
        "Food macro",
        "Founder doc",
        "Brand film",
        "Retail cutdowns",
        "Recipe content",
        "Edit",
        "Delivery",
      ],
    },
  },

  fishwife: {
    slug: "fishwife",
    accent: "#387CC0",
    company: "Fishwife",
    recipientName: "Becca Millstein",
    recipientFirst: "Becca",
    recipientEmail: "becca@eatfishwife.com",
    metaTitle: "Friends & Family for Fishwife",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Fishwife.",
    heroFor: "Fishwife",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Fishwife because you largely created the American tinned fish wave, and the audience is now mainstream grocery, which means the content has to scale from foodie in-joke to aisle five.",
    ticker:
      "Founded 2020 in Los Angeles · 5,000+ retail doors · Target, Whole Foods, Sprouts, Costco · Shark Tank deal with Lori Greiner · 800k+ customers · The Fishwife Cookbook, 2025 · Fly By Jing collab best seller",
    studio: {
      headline: "A production company built for the modern pantry brand",
      subline: "Tabletop and macro food, retail-ready cutdowns, founder-led storytelling, social-first verticals, the list goes on.",
    },
    noticed: {
      title: "The cans do the talking.",
      intro:
        "We did the homework on the brand, the cookbook, and the collabs. Here's what stuck.",
      cards: [
        {
          label: "The illustrated world",
          body: "Danny Miller's packaging made Fishwife instantly recognizable on shelf and screen. That visual world deserves motion built around it, not pasted on top. Few CPG brands hand a director this much to start with.",
        },
        {
          label: "Collabs as campaign beats",
          body: "The Fly By Jing chili crisp salmon became a best seller because two beloved brands shared an audience. Each collab is a ready-made campaign moment, and the video should move at that same drop cadence.",
        },
        {
          label: "You built the wave",
          body: "Fishwife didn't join the tinned fish trend. It largely created the American version of it. Costco, Target, and a cookbook mean the next audience has never seen the in-jokes, and the film has to carry them in.",
        },
      ],
    },
    fit: {
      titlePlain: "You built the category.",
      titleAccent: "Now own the screen.",
      intro:
        "Fishwife grew from a pandemic idea to 5,000 stores on brand alone. The next chapter is film that matches that shelf presence, shot in LA where you and we both live.",
      gives: [
        ["Brief", "Hero brand film plus retail and social cutdowns"],
        ["Production", "Tabletop plus lifestyle, director-led, LA-based"],
        ["Deliverables", "30s, 15s, 6s, vertical-first social, retail screens"],
        ["Audience", "Grocery shoppers, foodies, gift buyers, Costco families"],
      ],
      tags: [
        "Brand film",
        "Tabletop food",
        "Founder story",
        "Social verticals",
        "Retail media",
        "Collab drops",
        "Edit",
        "Delivery",
      ],
    },
  },

  ghia: {
    slug: "ghia",
    accent: "#651C32",
    company: "Ghia",
    recipientName: "Mélanie Masarin",
    recipientFirst: "Mélanie",
    recipientEmail: "melanie@drinkghia.com",
    metaTitle: "Friends & Family for Ghia",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Ghia.",
    heroFor: "Ghia",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Ghia because the distribution problem is solved, 2,800 doors and counting, and what's left is awareness, which is a moving-image problem.",
    ticker:
      "Founded 2020 · Lyon-born, Mediterranean-raised founder · Ex-Glossier head of retail · 2,800+ retailers incl. Target and Erewhon · 700+ bars and restaurants · Shark Tank, no deal, ~$10M raised anyway · Le Fizz launched 2024 · 0% alcohol, no added sugar",
    studio: {
      headline: "A production company built for aperitivo hour",
      subline: "Golden-hour tabletop, pours that actually look bittersweet, social films that feel like a dinner party, cutdowns in every ratio, the list goes on.",
    },
    noticed: {
      title: "No deal, no problem.",
      intro:
        "We did the homework on the brand and the founder. Three things stuck.",
      cards: [
        {
          label: "The Shark Tank walk",
          body: "You asked for $250K at 5%, walked away without a deal, and raised about $10M anyway while keeping 57% of the company. That's a founder who knows exactly what the brand is worth, and we make work for people like that.",
        },
        {
          label: "Design before category",
          body: "The bottle, the pink-and-burgundy world, the it's-not-a-mocktail positioning. It reads like an object from a Riviera summer, not a wellness brand. Film for Ghia has to clear the bar the packaging already set.",
        },
        {
          label: "Awareness is what's left",
          body: "From 750 doors at the Shark Tank pitch to 2,800 plus 700 bars. Distribution is no longer the constraint. The next layer of growth is people knowing what aperitivo hour is, and that's a film job.",
        },
      ],
    },
    fit: {
      titlePlain: "Aperitivo hour deserves film",
      titleAccent: "made with the same taste as the liquid.",
      intro:
        "We produce director-driven work for brands that care how things look as much as how they sell. We'd start with golden hour, a table, and the spritz as the main character.",
      gives: [
        ["Brief", "Make the spritz the main character of golden hour"],
        ["Production", "LA crews, tabletop plus lifestyle, fast turnarounds"],
        ["Deliverables", "Hero film, social cutdowns, retail and OOH assets"],
        ["Audience", "Sober-curious 25 to 45, design-literate, hosting-obsessed"],
      ],
      tags: [
        "Tabletop",
        "Liquid pours",
        "Lifestyle",
        "Social-first",
        "Color-led grade",
        "Food styling",
        "Edit",
        "Delivery",
      ],
    },
  },

  topicals: {
    slug: "topicals",
    accent: "#FF454E",
    company: "Topicals",
    recipientName: "Olamide Olowe",
    recipientFirst: "Olamide",
    recipientEmail: "olamide@mytopicals.com",
    metaTitle: "Friends & Family for Topicals",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Topicals.",
    heroFor: "Topicals",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Topicals because your whole premise is showing real skin honestly, and most beauty production is built to do the opposite.",
    ticker:
      "Founded 2020 in LA · Youngest Black woman to raise $10M+ in VC · Sephora's fastest-growing skincare brand · 6M+ Faded Eye Masks sold · #1 eye product at Sephora for 18 months · Angel Reese and Rema invested Jan 2026 · Acquired Bread Beauty Supply 2025",
    studio: {
      headline: "A production company built for skin you can actually see",
      subline: "Real texture in close-up, casting across every shade and condition, lighting that doesn't erase, the list goes on.",
    },
    noticed: {
      title: "Texture is the story.",
      intro:
        "We did the homework on the brand and the platform play. Here's what stuck.",
      cards: [
        {
          label: "Against the retouch",
          body: "Most beauty production retouches skin into plastic. Topicals' whole premise is showing eczema, hyperpigmentation, and ingrowns honestly. That demands crews who light and grade real texture instead of hiding it, which is a craft choice most beauty shoots never make.",
        },
        {
          label: "Culture trip energy",
          body: "The Ghana creator trip drove a sales surge by treating community like content. That format wants documentary coverage with commercial polish, shot fast and cut for feeds. It's a real production discipline and we run it often.",
        },
        {
          label: "A platform, not a product",
          body: "Cost of Doing Business is acquiring brands now, starting with Bread. That means the next production partner has to scale one visual standard across multiple labels without flattening them into each other.",
        },
      ],
    },
    fit: {
      titlePlain: "You built skincare for people the industry overlooked.",
      titleAccent: "We shoot the skin the industry retouches out.",
      intro:
        "Topicals turned chronic skin conditions into culture, and that deserves film craft equal to the formulas. We'd start with one campaign shot the way the brand actually talks.",
      gives: [
        ["Brief", "Condition-first beauty, zero erasure"],
        ["Production", "LA crews, macro skin work, location-ready"],
        ["Deliverables", "Hero film plus social cutdowns and stills"],
        ["Audience", "Gen Z, melanin-rich, community-led"],
      ],
      tags: [
        "Beauty macro",
        "Skin-true grading",
        "Casting all shades",
        "Docu brand trips",
        "Social cutdowns",
        "Founder story",
        "Edit",
        "Delivery",
      ],
    },
  },

  cymbiotika: {
    slug: "cymbiotika",
    accent: "#163F35",
    company: "Cymbiotika",
    recipientName: "Shahab Elmi",
    recipientFirst: "Shahab",
    recipientEmail: "shahab@cymbiotika.com",
    metaTitle: "Friends & Family for Cymbiotika",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Cymbiotika.",
    heroFor: "Cymbiotika",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Cymbiotika because you bootstrapped to $150M on product and community, and the first big brand campaign is a different muscle. It sets the visual bar for everything after.",
    ticker:
      "Founded 2018, San Diego · ~$150M revenue 2025 · $25M seed led by David Grutman · 50+ celebrity investors · ~2,000 Target stores · Ulta rollout March 2026 · 100M+ packets sold",
    studio: {
      headline: "A production company built for the wellness shelf wars",
      subline: "A first big brand campaign, Target endcaps that have to stop a cart, Ulta launch content, founder-led storytelling, the list goes on.",
    },
    noticed: {
      title: "The first real campaign.",
      intro:
        "We read the raise coverage and the retail expansion plan. Here's what stuck.",
      cards: [
        {
          label: "A different muscle",
          body: "You raised $25M partly to fund your first large-scale brand campaign. Organic and creator content got you to $150M. The first big swing is a different discipline, and it decides how the brand looks for years.",
        },
        {
          label: "Shelf shoppers haven't seen the TikToks",
          body: "Target's only liposomal brand, plus a thousand Ulta doors in March. The aisle audience needs fifteen seconds that explain rip and sip before the cart moves on. That's a precision filmmaking problem.",
        },
        {
          label: "The proof is the story",
          body: "Clinical trials on finished formulas. Numbers most supplement brands can't say on camera. You can, and it should look as premium as the packet does.",
        },
      ],
    },
    fit: {
      titlePlain: "You've outgrown content.",
      titleAccent: "Time for film.",
      intro:
        "Cymbiotika went from bootstrapped to Target shelves on product and community. The next phase is brand film that earns the premium price in three seconds, and we'd build the retail cutdowns from the same shoot.",
      gives: [
        ["Brief", "Launch campaign plus retail cutdowns"],
        ["Production", "Director-led, LA to San Diego"],
        ["Deliverables", "Hero film, 15s and 6s retail, social verticals"],
        ["Audience", "Wellness-curious shoppers, Target and Ulta foot traffic"],
      ],
      tags: [
        "Brand film",
        "Retail cutdowns",
        "Founder story",
        "Product tabletop",
        "Social verticals",
        "Campaign stills",
        "Edit",
        "Delivery",
      ],
    },
  },

  rabbit: {
    slug: "rabbit",
    accent: "#D63C00",
    company: "Rabbit",
    recipientName: "Jesse Lyu",
    recipientFirst: "Jesse",
    recipientEmail: "j@rabbit.tech",
    metaTitle: "Friends & Family for Rabbit",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Rabbit.",
    heroFor: "Rabbit",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Rabbit because the second act is more cinematic than the first, and the next launch will be judged against 2024's promises. Honest, well-crafted film is the only register that works for that crowd.",
    ticker:
      "Founded by Jesse Lyu, Raven Tech to Baidu alum · HQ Santa Monica · r1 co-designed with Teenage Engineering · $10M in preorders after CES 2024 · 100,000+ units sold · $199, no subscription · rabbitOS 2 shipped Sept 2025 · Next-gen device teased for 2026",
    studio: {
      headline: "A production company built for the comeback story",
      subline: "Launch films that have to land twice as hard the second time, product cinematography worthy of Teenage Engineering hardware, demo content shot for skeptics, the list goes on.",
    },
    noticed: {
      title: "The keynote, twice.",
      intro:
        "We watched the CES keynote, the rough reviews, and the rabbitOS 2 reversal. Here's what stuck.",
      cards: [
        {
          label: "The orange object",
          body: "The r1 is one of the few AI gadgets people kept on their desks even when they stopped using it. Teenage Engineering gave it real object-hood, and that design did $10M of preorders before anyone touched one. The film should be as tactile as the thing.",
        },
        {
          label: "Most founders disappear",
          body: "The launch reviews were rough and Jesse shipped rabbitOS 2 instead of vanishing. Reviewers publicly changed their minds. That second act is more cinematic than the first, and it hasn't been filmed.",
        },
        {
          label: "Earned, not bought",
          body: "Rabbit's audience came from demos, community, and a founder who answers critics directly, not media spend. The 2026 device will be judged against 2024's promises, and that audience can smell a hype edit from a mile away.",
        },
      ],
    },
    fit: {
      titlePlain: "You're building the second device while everyone remembers the first.",
      titleAccent: "We make films that change the memory.",
      intro:
        "We're twenty minutes from Santa Monica and we build launch films, product cinematography, and director-led campaigns for brands at exactly this kind of inflection point.",
      gives: [
        ["Brief", "Next-gen device launch film plus the rabbitOS story"],
        ["Production", "LA-based, director-led, fast"],
        ["Deliverables", "Hero film, keynote content, product tabletop, cutdowns"],
        ["Audience", "Tech press, early adopters, the skeptics from round one"],
      ],
      tags: [
        "Launch film",
        "Product tabletop",
        "Keynote content",
        "Brand anthem",
        "Demo capture",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  apex: {
    slug: "apex",
    accent: "#1A1A1A",
    company: "Apex Space",
    recipientName: "Ian Cinnamon",
    recipientFirst: "Ian",
    recipientEmail: "ian.cinnamon@apexspace.com",
    metaTitle: "Friends & Family for Apex Space",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Apex Space.",
    heroFor: "Apex",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Apex because the Factory One buildout only exists in this state once, and with satellites shipping later this year the window to film the hardware is narrow.",
    ticker:
      "Founded 2022 in Los Angeles · $2.3B valuation, June 2026 · 200+ satellites a year at peak capacity · Factory One: 100,000+ sq ft by end of 2026 · 350+ employees, doubled in a year · Backed by a16z, 8VC, CRV, Point72 · $46M U.S. Space Force contract",
    studio: {
      headline: "A production company built for the new space industrial base",
      subline: "Cleanroom protocols, ITAR-aware crews, a factory floor that looks different every month, the list goes on.",
    },
    noticed: {
      title: "Factory One, mid-expansion.",
      intro:
        "We read the June raise coverage and Ian's interviews. Here's what stuck.",
      cards: [
        {
          label: "The buildout window",
          body: "You're adding 30,000 square feet by the end of 2026 on the way to 200 buses a year. That buildout is the visual story most aerospace companies wish they had, and it only exists in this state once.",
        },
        {
          label: "Productized, not bespoke",
          body: "Aries, Nova, and Comet as configurable products is a genuinely different pitch in an industry of one-off programs. The film should sell the catalog logic, not just hardware beauty shots.",
        },
        {
          label: "Hardware leaves the building",
          body: "Several satellites launch later in 2026. There's a narrow window to film the real thing on the floor before it's in orbit, and that footage becomes the brand archive for years.",
        },
      ],
    },
    fit: {
      titlePlain: "You build satellites like products.",
      titleAccent: "We'll film it like one.",
      intro:
        "We'd start with a half-day walkthrough of Factory One to map what's shootable now versus post-expansion. Then a single anthem film cut for recruiting, customers, and the next raise.",
      gives: [
        ["Brief", "Anthem film plus cutdowns"],
        ["Production", "Cleanroom-ready crews, LA-based, two-day shoot"],
        ["Deliverables", "90s hero, 30s cuts, social verticals, stills"],
        ["Audience", "Constellation customers, DoD, candidates, investors"],
      ],
      tags: [
        "Brand film",
        "Factory doc",
        "Recruiting film",
        "Launch content",
        "Founder interview",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  epirus: {
    slug: "epirus",
    accent: "#0F0E12",
    company: "Epirus",
    recipientName: "Andy Lowery",
    recipientFirst: "Andy",
    recipientEmail: "andy.lowery@epirusinc.com",
    metaTitle: "Friends & Family for Epirus",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Epirus.",
    heroFor: "Epirus",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Epirus because 49 drones falling out of the sky at once is a story that wants to be filmed, not explained.",
    ticker:
      "Founded 2018 · $550M+ raised, $250M Series D in 2025 · 49 drones downed in seconds at Camp Atterbury · First known defeat of fiber-optic guided drones, Jan 2026 · $43.5M Army IFPC-HPM Gen II contract · Built in Torrance, CA · Partners include General Dynamics and Northrop Grumman",
    studio: {
      headline: "A production company built for the people redefining defense",
      subline: "Secure facilities, hardware that can't leave the building, crews who know what not to film, the list goes on.",
    },
    noticed: {
      title: "A force field, on camera.",
      intro:
        "We watched the CNBC appearance and read the Camp Atterbury coverage. Here's what stuck.",
      cards: [
        {
          label: "Instantly visual",
          body: "Most deep-tech products need an animation to explain. Leonidas drops 49 drones out of the sky in seconds. That's a rare gift: an effect a camera can simply show.",
        },
        {
          label: "The voice is already there",
          body: "Andy talks about centaur warfare and reactor rooms with the ease of someone who has lived both. Most defense companies have to manufacture a spokesperson. You have one, and he just needs frames built around him.",
        },
        {
          label: "Story lagging the scale",
          body: "A $250M Series D to hyperscale production, new COO and CPO this month, Army Gen II deliveries underway. The company is moving faster than its public story, and recruiting, customers, and Congress all watch video first.",
        },
      ],
    },
    fit: {
      titlePlain: "We make work that holds up under scrutiny.",
      titleAccent: "Yours has to.",
      intro:
        "Defense-tech audiences are skeptical of gloss and allergic to vagueness. We shoot real hardware, real engineers, and real tests, then cut it so it moves.",
      gives: [
        ["Brief", "Brand film plus recruiting and capability cuts"],
        ["Production", "Torrance facility and range shoots, security-aware workflow"],
        ["Deliverables", "Hero film, social verticals, event loops, stills"],
        ["Audience", "DoD customers, engineers you want to hire, investors"],
      ],
      tags: [
        "Brand film",
        "Recruiting film",
        "Facility shoot",
        "Capability demo",
        "Founder profile",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  slingshot: {
    slug: "slingshot",
    accent: "#1B1D22",
    company: "Slingshot Aerospace",
    recipientName: "Tim Solms",
    recipientFirst: "Tim",
    recipientEmail: "tim.solms@slingshotaerospace.com",
    metaTitle: "Friends & Family for Slingshot Aerospace",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Slingshot Aerospace.",
    heroFor: "Slingshot",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Slingshot because the brand film hasn't caught up to the contracts, and making complex systems legible to generals, allies, and recruits is exactly our kind of assignment.",
    ticker:
      "Founded 2017 · ~$120M raised · 220+ sensors, 22 sites · $27M Space Force OTTI contract, Jan 2026 · UK Space Agency optical partner · Fast Company Most Innovative 2026 · Trusted by NASA and U.S. Space Force",
    studio: {
      headline: "A production company built for the people watching the sky",
      subline: "Telescope sites on five continents, a Space Force training floor, launch windows that will not move, the list goes on.",
    },
    noticed: {
      title: "Seeing is not the pitch.",
      intro:
        "We read the OTTI contract news and spent time on the site. Here's what stuck.",
      cards: [
        {
          label: "From seeing to acting",
          body: "Your homepage says awareness is no longer enough, and that's a sharp move. You're selling the jump from seeing to understanding to acting, and that arc is a story structure, not a feature list.",
        },
        {
          label: "Orange against the void",
          body: "A near-black site with one defiant orange is a confident system. Film handles that contrast better than any web page can, especially with real telescopes under real night sky.",
        },
        {
          label: "The training turn",
          body: "TALOS and the OTTI contract shift you from data company to the company that teaches Guardians how orbit conflict feels. That's human material: operators, screens, decisions under pressure.",
        },
      ],
    },
    fit: {
      titlePlain: "You track everything above us.",
      titleAccent: "We make people feel why that matters.",
      intro:
        "Slingshot sits at a rare intersection of defense gravity and commercial clarity. We'd build a cinematic anthem plus modular product films that work for generals, allies, and the engineers you're hiring.",
      gives: [
        ["Brief", "Brand anthem plus modular product films"],
        ["Production", "El Segundo HQ shoot, sensor-site footage, orbit CG"],
        ["Deliverables", "90s anthem, 30s cutdowns, social verticals, booth loop"],
        ["Audience", "DoD and allied space agencies, operators, engineering hires"],
      ],
      tags: [
        "Brand film",
        "Product launch",
        "CG orbit viz",
        "Recruiting film",
        "Trade show",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  aptera: {
    slug: "aptera",
    accent: "#4F7A1E",
    company: "Aptera Motors",
    recipientName: "Chris Anthony",
    recipientFirst: "Chris",
    recipientEmail: "chris@aptera.us",
    metaTitle: "Friends & Family for Aptera Motors",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Aptera Motors.",
    heroFor: "Aptera",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Aptera because the moments coming next happen once: first deliveries, first owners, first sun-powered commutes. That footage can't be reshot later.",
    ticker:
      "Carlsbad, CA · Nasdaq: SEV · 17,000+ crowdfund investors · $130M+ community raised · 40 solar miles a day · 400 mi range · 0.13 drag coefficient · First 5 validation vehicles, May 2026",
    studio: {
      headline: "A production company built for the solar electric road",
      subline: "Validation-line milestones filmed as they happen, a 17,000-investor community waiting on every update, delivery-day stories about to start, the list goes on.",
    },
    noticed: {
      title: "Funded by believers.",
      intro:
        "We watched the validation-vehicle announcement and the community updates. Here's what stuck.",
      cards: [
        {
          label: "17,000 investors",
          body: "Over 17,000 people put more than $130M into Aptera before Wall Street did. That community expects to see progress, not just read about it. Every milestone video is also an investor update, and the bar for those keeps rising.",
        },
        {
          label: "The never-charge promise",
          body: "Forty solar miles a day means most commutes never touch a plug. That's an idea you have to show: sun on the panels, odometer climbing, nothing else. It films beautifully because it's true.",
        },
        {
          label: "A shape that stops traffic",
          body: "A 0.13 drag coefficient gives you a vehicle that looks like nothing else on the road. People already point cameras at it. The official footage should be as considered as the aerodynamics.",
        },
      ],
    },
    fit: {
      titlePlain: "You built the most efficient vehicle on the road.",
      titleAccent: "The story should move just as efficiently.",
      intro:
        "Aptera is entering its delivery era and the moments coming next happen once. We capture launch films, community updates, and delivery-day stories with a small crew that moves at startup speed.",
      gives: [
        ["Brief", "Launch and delivery-era brand films"],
        ["Production", "Lean San Diego-based crews, fast turnarounds"],
        ["Deliverables", "Hero film, cutdowns, investor updates, social verticals"],
        ["Audience", "Reservation holders, retail investors, the EV-curious public"],
      ],
      tags: [
        "Launch film",
        "Delivery stories",
        "Founder updates",
        "Investor comms",
        "Factory doc",
        "Social verticals",
        "Edit",
        "Delivery",
      ],
    },
  },

  ntwrk: {
    slug: "ntwrk",
    accent: "#101113",
    company: "Complex NTWRK",
    recipientName: "Aaron Levant",
    recipientFirst: "Aaron",
    recipientEmail: "aaron@complex.com",
    metaTitle: "Friends & Family for Complex NTWRK",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Complex NTWRK.",
    heroFor: "Complex",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Complex because you ship content at the speed of drops, streams, and festival weekends, and director-led craft that holds up at that pace is the whole reason we exist.",
    ticker:
      "NTWRK acquired Complex for $108.6M in 2024 · ComplexCon 2025: record 70,000 in Las Vegas · 400+ brands · Verzuz x Complex debut hit 8M livestream viewers · ComplexCon Hong Kong grew 30% · ComplexCon LA returns Oct 3 and 4, 2026 · HQ Los Angeles",
    studio: {
      headline: "A production company built for convergence culture",
      subline: "Drop campaigns that turn around in days, festival content shot in the chaos of 70,000 people, brand collabs on social timelines, the list goes on.",
    },
    noticed: {
      title: "Three businesses, one brand.",
      intro:
        "We read the ComplexCon numbers and Aaron's interviews. Here's what stuck.",
      cards: [
        {
          label: "Three engines at once",
          body: "Commerce, events, and editorial each carry about a third of Complex NTWRK. That's three content engines running simultaneously, each with its own velocity and visual bar, and most production partners can only keep up with one.",
        },
        {
          label: "ComplexCon is the flywheel",
          body: "A record 70,000 people in Vegas, 30 percent growth in Hong Kong, and a hometown LA return this October. Every edition generates a year of content demand before, during, and after the weekend.",
        },
        {
          label: "Built by an operator",
          body: "Aaron started Agenda in the back of a Thai restaurant and has launched dozens of event brands since. He moves fast and expects partners who do too. So do we, and LA to LA helps.",
        },
      ],
    },
    fit: {
      titlePlain: "You make culture move.",
      titleAccent: "We make it look like cinema.",
      intro:
        "ComplexCon LA is October 3 and 4. The smartest first project is locking the capture and campaign plan now, so the hometown edition gets film that works all year.",
      gives: [
        ["Brief", "Campaign films, drop content, festival capture, collab spots"],
        ["Production", "LA-based, director-led, fast turnaround, on-site event crews"],
        ["Deliverables", "Hero films, social cutdowns, livestream packaging, photo"],
        ["Audience", "Superfans of sneakers, streetwear, music, food, and art"],
      ],
      tags: [
        "Brand films",
        "Drop campaigns",
        "Event capture",
        "Livestream packaging",
        "Artist collabs",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  karat: {
    slug: "karat",
    accent: "#4733FF",
    company: "Karat Financial",
    recipientName: "Eric Wei",
    recipientFirst: "Eric",
    recipientEmail: "eric@trykarat.com",
    metaTitle: "Friends & Family for Karat",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Karat Financial.",
    heroFor: "Karat",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Karat because your customers are on camera every day, the audience can smell stock footage from a mile away, and that raises the production bar in a way we find genuinely fun.",
    ticker:
      "$1.5B+ in credit extended · Founded 2019 by Eric Wei and Will Kim · ~$100M raised · Series B led by SignalFire · Backed by Y Combinator and Union Square Ventures · Business banking launched May 2025 · Avg creator credit limit $25,000",
    studio: {
      headline: "A production company built for the creator economy",
      subline: "Launch films, card and banking campaigns, creator testimonial spots, event and community content, the list goes on.",
    },
    noticed: {
      title: "Banking the unbanked famous.",
      intro:
        "We read the banking-launch coverage and Eric's creator-finance writing. Here's what stuck.",
      cards: [
        {
          label: "A different bet",
          body: "Approving cards on income and audience data instead of FICO is a genuinely different bet on who is creditworthy. That's a story worth showing through real creators, not explaining in a deck.",
        },
        {
          label: "From card to full stack",
          body: "The banking launch with Grasshopper turned Karat from one product into checking, payments, bookkeeping, and invoicing. A brand moment like that deserves film made by people who shoot business stories for a living.",
        },
        {
          label: "Creators sell Karat best",
          body: "Your site leads with real creators and Eric calls community the growth hack. Production built around real creator voices, docu and scripted, is exactly our lane.",
        },
      ],
    },
    fit: {
      titlePlain: "You bank the people who make things.",
      titleAccent: "We film the people who make things.",
      intro:
        "Karat's customers are on camera every day, so the brand bar is high. We'd build creator-fluent commercial work that matches it, starting with the full-stack banking story.",
      gives: [
        ["Brief", "Launch and trust-building films creators have to believe"],
        ["Production", "Director-led shoots with real Karat creators"],
        ["Deliverables", "Hero film plus cutdowns for YouTube, TikTok, paid, site"],
        ["Audience", "Full-time creators and the managers and agencies behind them"],
      ],
      tags: [
        "Brand film",
        "Creator testimonials",
        "Product launch",
        "Docu-style",
        "Paid social",
        "Case studies",
        "Edit",
        "Delivery",
      ],
    },
  },

  "patrick-ta": {
    slug: "patrick-ta",
    accent: "#6E3B33",
    company: "Patrick Ta Beauty",
    recipientName: "Kimberly Villatoro",
    recipientFirst: "Kimberly",
    recipientEmail: "kimberly@patrickta.com",
    metaTitle: "Friends & Family for Patrick Ta Beauty",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Patrick Ta Beauty.",
    heroFor: "Patrick Ta Beauty",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Patrick Ta Beauty because your best media is Patrick's hands at work, and launch content now has to land in Riyadh and Mexico City as much as LA. That changes how you shoot, not just how you subtitle.",
    ticker:
      "Founded 2019 · Top-10 brand at Sephora · #1 blush at Sephora · ~$100M in sales · Sephora Mexico, Aug 2025 · Sephora Middle East, 34 doors, Jan 2026 · 17-hour lines at the Melrose pop-up · 4.75-star average ratings",
    studio: {
      headline: "A production company built for the glow economy",
      subline: "Campaign films, artist-led tutorial content, launch-day social cuts, retail screens for 34 Sephora doors, the list goes on.",
    },
    noticed: {
      title: "The blush that broke Sephora.",
      intro:
        "We did the homework on the brand, the pop-up, and the international run. Here's what stuck.",
      cards: [
        {
          label: "The technique is the media",
          body: "Powder first, then cream. One application technique turned a product demo into the number one blush at Sephora. Your best media is Patrick's hands at work, and it deserves production that keeps up with the artistry.",
        },
        {
          label: "Lines around the block",
          body: "Fans camped 17 hours for the Melrose pop-up and Sephora sales jumped 28 percent that week. Experiential is clearly part of the playbook now, and capturing those moments well multiplies their reach long after the tent comes down.",
        },
        {
          label: "The world is watching",
          body: "70 percent of Patrick's audience is international and the Middle East drives over a third of global sales. Launch content has to work in Riyadh and Mexico City as much as LA, and that's a shooting decision, not a subtitling one.",
        },
      ],
    },
    fit: {
      titlePlain: "You built the glow.",
      titleAccent: "We film it like it matters.",
      intro:
        "We're a production company in Los Angeles, minutes from your West Hollywood world. We'd start with launch films and evergreen artistry content for the hero franchises, shot to travel.",
      gives: [
        ["Brief", "Launch films and evergreen artistry content"],
        ["Production", "LA-based shoots, talent-friendly sets, fast turnarounds"],
        ["Deliverables", "Hero film, cutdowns, vertical social, retail screens, regional versions"],
        ["Audience", "Sephora shoppers in North America, Mexico, and the Gulf"],
      ],
      tags: [
        "Campaign film",
        "Tutorial content",
        "Pop-up capture",
        "Retail screens",
        "Product macro",
        "Regional versioning",
        "Edit",
        "Delivery",
      ],
    },
  },

  harbinger: {
    slug: "harbinger",
    accent: "#003242",
    company: "Harbinger Motors",
    recipientName: "Fred DePerez",
    recipientFirst: "Fred",
    recipientEmail: "fred.deperez@harbingermotors.com",
    metaTitle: "Friends & Family for Harbinger Motors",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Harbinger Motors.",
    heroFor: "Harbinger",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Harbinger because the revolution is under the body where a camera can't casually find it, and that's a filmmaking problem, not a messaging problem.",
    ticker:
      "Founded 2021 in Garden Grove, CA · ~$360M raised, Series C co-led by FedEx · ~4,690 vehicle orders worth ~$500M · Serial production launched April 2025 · FedEx deliveries began 2025 · Up to 500 miles with hybrid range extender · 10-year battery and drivetrain warranty",
    studio: {
      headline: "A production company built for the people electrifying the working truck",
      subline: "Factory floors that double as sets, vehicles that can't leave the line, FedEx-grade brand approvals, the list goes on.",
    },
    noticed: {
      title: "Familiar form, invisible story.",
      intro:
        "We read the Series C coverage and the IPO reports. Here's what stuck.",
      cards: [
        {
          label: "The revolution hides",
          body: "Your tagline is Familiar Form, Revolutionary Foundation, but the revolution lives under the body where a camera can't casually find it. That's solvable with the right cutaways, builds, and factory access, and it's a fun problem.",
        },
        {
          label: "FedEx changed the audience",
          body: "A FedEx order and a THOR partnership mean your buyers are fleet directors and procurement teams now. They respond to TCO math, uptime, and the 10-year warranty told plainly, on camera, by operators.",
        },
        {
          label: "Before the quiet period",
          body: "Reports say you're working with Goldman on a potential IPO. Companies entering that phase suddenly need a deep library of brand film, founder story, and product footage, and it's far cheaper to build it before the quiet period than during it.",
        },
      ],
    },
    fit: {
      titlePlain: "You're scaling production and telling a bigger story.",
      titleAccent: "We make the films that carry it.",
      intro:
        "We build brand and product films for companies at exactly this inflection point, concept through delivery, so your team stays focused on trucks.",
      gives: [
        ["Brief", "Founder story, product films, fleet-customer proof"],
        ["Production", "Garden Grove factory shoots, on-route with fleet partners"],
        ["Deliverables", "Anthem film, product explainers, testimonials, cutdowns"],
        ["Audience", "Fleet buyers, dealers, investors, the talent you hire next"],
      ],
      tags: [
        "Brand anthem",
        "Founder film",
        "Factory shoot",
        "Product explainer",
        "Customer testimonial",
        "Investor cut",
        "Edit",
        "Delivery",
      ],
    },
  },

  merit: {
    slug: "merit",
    accent: "#62605E",
    company: "MERIT Beauty",
    recipientName: "Katherine Power",
    recipientFirst: "Katherine",
    recipientEmail: "katherine@meritbeauty.com",
    metaTitle: "Friends & Family for MERIT Beauty",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for MERIT Beauty.",
    heroFor: "MERIT",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with MERIT because effortless is the hardest thing to shoot, and a brand built on restraint needs production with the same discipline.",
    ticker:
      "Launched January 2021 with 7 products · ~$200M annual retail sales · 800 Sephora doors in North America · Sephora UK, March 2025 · Retrospect fragrance launch · Profitable, $100M+ net revenue in 2024 · Founder of Who What Wear and Versed",
    studio: {
      headline: "A production company built for beauty with intention",
      subline: "Campaign films, Sephora retail assets, talent shoots with real skin and real light, the list goes on.",
    },
    noticed: {
      title: "Five minutes, framed.",
      intro:
        "We did the homework on the brand system and the international run. Here's what stuck.",
      cards: [
        {
          label: "Effortless is hard",
          body: "MERIT's entire pitch is the five-minute routine, born from one bathroom video. Product film has to feel unhurried and inevitable, which is much harder to shoot than maximalist beauty. We consider that the fun part.",
        },
        {
          label: "Three categories, one voice",
          body: "Makeup, skincare, and now fragrance with Retrospect. Each needs its own visual language while staying inside one of the most disciplined brand systems in beauty. That's a production design problem before it's a media problem.",
        },
        {
          label: "The Sephora machine",
          body: "800 doors in North America, the UK as of March 2025, France next. International retail rollouts eat content: localized cutdowns, in-store screens, launch assets, all on retail calendars that do not move.",
        },
      ],
    },
    fit: {
      titlePlain: "You built a brand on restraint.",
      titleAccent: "We shoot like we read the same brief.",
      intro:
        "We make commercial work for brands where the craft is in what gets left out. Minimalist beauty needs maximal production discipline, and that's our native register.",
      gives: [
        ["Brief", "Quiet luxury beauty that converts at Sephora and on social"],
        ["Production", "LA-based crews, beauty lighting, real-skin talent direction"],
        ["Deliverables", "Hero film, retail cutdowns, vertical social, stills"],
        ["Audience", "Routine-minimalists shopping Sephora, DTC, and UK/EU"],
      ],
      tags: [
        "Beauty film",
        "Campaign",
        "Sephora retail",
        "Fragrance launch",
        "Product tabletop",
        "Vertical social",
        "Edit",
        "Delivery",
      ],
    },
  },

  seed: {
    slug: "seed",
    accent: "#1C3A13",
    company: "Seed Health",
    recipientName: "Ara Katz",
    recipientFirst: "Ara",
    recipientEmail: "ara@seed.com",
    metaTitle: "Friends & Family for Seed Health",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Seed Health.",
    heroFor: "Seed",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Seed because you spent ten years earning the right to be believed, and the first brand campaign should spend that credibility carefully.",
    ticker:
      "Founded 2015, Venice CA · DS-01: 24 strains, 53.6B AFU · First CMO Anisha Raghavan, May 2026 · ~$200M revenue 2024 · Nationwide at Target · FDA-authorized IND for IBS · SeedLabs and LUCA Biologics",
    studio: {
      headline: "A production company built for the microbiome era",
      subline: "Clinical claims that need legal-clean visuals, founder stories without wellness cliches, retail cutdowns for Target endcaps, the list goes on.",
    },
    noticed: {
      title: "Science before selling.",
      intro:
        "We did the homework on the brand and the new chapter. Here's what stuck.",
      cards: [
        {
          label: "The influencer exam",
          body: "Seed makes influencers pass a science exam before they can post about the product. A brand that vets its spokespeople that hard will vet its production partners the same way. We like that.",
        },
        {
          label: "First CMO, first campaign",
          body: "For a decade Seed grew on founder voice, education, and word of mouth. Hiring your first CMO signals the shift to mass brand building, and that means film at scale for the first time in the company's life.",
        },
        {
          label: "Three seconds in an aisle",
          body: "The Target launch means the story has to land in three seconds on a shelf, not three paragraphs on a product page. That's a craft problem, not a media problem, and it's the exact translation we do for science-heavy brands.",
        },
      ],
    },
    fit: {
      titlePlain: "Science this rigorous deserves film this considered.",
      titleAccent: "We shoot the proof, not the promise.",
      intro:
        "Seed spent ten years earning the right to be believed. The first brand campaign should spend that credibility carefully, with directors who can make clinical truth feel cinematic.",
      gives: [
        ["Brief", "Translate microbiome science into brand film without dumbing it down"],
        ["Production", "Director-led shoots, tabletop and macro work, founder docu-style"],
        ["Deliverables", "Hero film, retail cutdowns, social verticals, PDP assets"],
        ["Audience", "Health-curious skeptics, new Target shoppers, subscribers"],
      ],
      tags: [
        "Brand film",
        "Tabletop macro",
        "Founder doc",
        "Retail cutdowns",
        "Science explainer",
        "Social-first",
        "Edit",
        "Delivery",
      ],
    },
  },

  whatnot: {
    slug: "whatnot",
    accent: "#A59200",
    company: "Whatnot",
    recipientName: "Grant LaFontaine",
    recipientFirst: "Grant",
    recipientEmail: "grant@whatnot.com",
    metaTitle: "Friends & Family for Whatnot",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Whatnot.",
    heroFor: "Whatnot",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Whatnot because brand film for a live marketplace can't feel like polished retail advertising. It has to carry the energy of a stream, and that's a specific craft.",
    ticker:
      "Founded 2019, Los Angeles · Y Combinator W20 · $225M Series F, Oct 2025 · $11.5B valuation · $6B+ GMV in 2025 · Buyers average 80 min a day · Beauty up 791% YoY · ~900 employees and hiring",
    studio: {
      headline: "A production company built for the live shopping era",
      subline: "Seller stories shot in a day, brand spots that feel like a stream, campaign cutdowns for every channel, the list goes on.",
    },
    noticed: {
      title: "Brand team, forming now.",
      intro:
        "We read the Series F coverage and your open roles. Here's what stuck.",
      cards: [
        {
          label: "The Director of Brand req",
          body: "You posted a Director of Brand and Integrated Marketing role in May, owning multi-channel campaigns with serious budgets across digital, TV, OOH, and creators. That person will need production partners who can keep up from day one. We'd like to be on the bench before they arrive.",
        },
        {
          label: "Way past trading cards",
          body: "Beauty grew 791 percent year over year, Electronics 444, Women's Fashion 223. The brand now has to speak to people who have never opened a card break, and the work has to stretch with it.",
        },
        {
          label: "Live is the whole product",
          body: "Your buyers spend 80 minutes a day watching sellers perform. Brand film for Whatnot can't feel like polished retail advertising. It has to carry the energy of a stream, and that's a craft we practice.",
        },
      ],
    },
    fit: {
      titlePlain: "You're building the brand layer on a marketplace that already works.",
      titleAccent: "We make the film side easy.",
      intro:
        "You're in Marina del Rey and we can be in a seller's living room or on a stage within the week. Brand campaigns, doc-style seller stories, and fast social cutdowns from the same team.",
      gives: [
        ["Brief", "Brand campaigns, seller stories, category launches"],
        ["Production", "LA-based, fast-turn crews built for real people on camera"],
        ["Deliverables", "Hero films, TV and OOH cutdowns, vertical social"],
        ["Audience", "Collectors, resellers, and the new beauty and fashion wave"],
      ],
      tags: [
        "Brand film",
        "Seller docs",
        "TV cutdowns",
        "Vertical social",
        "Creator collabs",
        "Category launches",
        "Edit",
        "Delivery",
      ],
    },
  },

  radiant: {
    slug: "radiant",
    accent: "#03242B",
    company: "Radiant",
    recipientName: "Doug Bernauer",
    recipientFirst: "Doug",
    recipientEmail: "doug@radiantnuclear.com",
    metaTitle: "Friends & Family for Radiant",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Radiant.",
    heroFor: "Radiant",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Radiant because the DOME test this summer is the first fueled test of a new US reactor design in fifty years, and that moment only happens once.",
    ticker:
      "Founded 2020 in El Segundo by SpaceX veterans · Kaleidos: 1MW microreactor replacing diesel generators · Fueled test at INL's DOME, summer 2026 · First new US reactor design tested in ~50 years · $165M Series C, then $300M+ led by Draper · R-50 factory on the Oak Ridge Manhattan Project site · Target: 50 reactors a year",
    studio: {
      headline: "A production company built for the people putting reactors in shipping containers",
      subline: "First fueled tests, factory floors at Oak Ridge, recruiting films that have to out-pull SpaceX, the list goes on.",
    },
    noticed: {
      title: "The DOME moment.",
      intro:
        "We read the founder blog and the test timeline. Here's what stuck.",
      cards: [
        {
          label: "Radical transparency",
          body: "Most nuclear startups hide the ball. You publish design details, milestone predictions, and a founder blog that reads like engineering notes. That voice deserves film made the same way: straight, specific, no gloss.",
        },
        {
          label: "Fifty years of waiting",
          body: "Summer 2026 at INL's DOME facility is the first fueled test of a new US reactor design in roughly fifty years. That's a once-in-a-generation documentary beat, and it only happens once. The cameras should already be planned.",
        },
        {
          label: "A product you can film",
          body: "Kaleidos fits in a shipping container and R-50 will stamp out fifty a year on a Manhattan Project site. Unlike most energy companies, your product is physical, photogenic, and moving.",
        },
      ],
    },
    fit: {
      titlePlain: "You're making nuclear portable.",
      titleAccent: "We make it visible.",
      intro:
        "The next year holds the DOME test, the Oak Ridge buildout, and a hiring push against SpaceX gravity. One documentary-style production system covers all three.",
      gives: [
        ["Brief", "Brand and recruiting films around DOME and R-50"],
        ["Production", "Doc-style shoots at El Segundo, INL, and Oak Ridge"],
        ["Deliverables", "Hero film, cutdowns, social verticals, stills"],
        ["Audience", "Engineers, investors, DOD and data center buyers"],
      ],
      tags: [
        "Brand film",
        "Recruiting film",
        "Founder story",
        "Facility doc",
        "Milestone films",
        "Social verticals",
        "Edit",
        "Delivery",
      ],
    },
  },

  valar: {
    slug: "valar",
    accent: "#141414",
    company: "Valar Atomics",
    recipientName: "Isaiah Taylor",
    recipientFirst: "Isaiah",
    recipientEmail: "isaiah@valaratomics.com",
    metaTitle: "Friends & Family for Valar Atomics",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Valar Atomics.",
    heroFor: "Valar Atomics",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Valar because a company that ships to symbolic deadlines needs films cut to those same moments, ready before the milestone, not after.",
    ticker:
      "Founded July 4, 2023, El Segundo · First criticality Nov 17, 2025 at Los Alamos · First startup critical under the DOE Reactor Pilot Program · $450M raised at a $2B valuation · Backed by Palmer Luckey and Shyam Sankar · Ward250 targets power operations July 4, 2026 · Reactors named for a Manhattan Project physicist",
    studio: {
      headline: "A production company built for the new atomic age",
      subline: "Crew protocols for DOE sites, founder films shot between criticality tests, launch dates that land on the Fourth of July, the list goes on.",
    },
    noticed: {
      title: "Dates are the brand.",
      intro:
        "We listened to the Shawn Ryan episode and read the criticality coverage. Here's what stuck.",
      cards: [
        {
          label: "Founder as broadcaster",
          body: "Isaiah already carries the story himself: a two-hour podcast sit-down, constant posts from the shop floor. The raw material is there. It deserves cinematography that matches the hardware.",
        },
        {
          label: "July 4, twice",
          body: "Founded July 4, 2023. Ward250 aims for power on July 4, 2026. A company that ships to symbolic deadlines needs films ready before the milestone, not commissioned after. The next one is weeks away.",
        },
        {
          label: "A family heirloom in steel",
          body: "The reactors are named Ward, after a great-grandfather who worked on the Manhattan Project. That's a generational story most startups would invent if they could, and it has barely been told on film.",
        },
      ],
    },
    fit: {
      titlePlain: "You're building the new atomic age.",
      titleAccent: "We shoot it like it matters.",
      intro:
        "We make films for companies whose product is the story: founders, hardware, and milestones too big for a phone camera. Valar's next twelve months are the most filmable in nuclear.",
      gives: [
        ["Brief", "Founder story and milestone films around Ward250 first power"],
        ["Production", "Doc-style crews for reactor floors and DOE sites"],
        ["Deliverables", "Hero film, social cutdowns, recruiting and investor edits"],
        ["Audience", "Hyperscalers, DOE partners, engineers, the energy-curious public"],
      ],
      tags: [
        "Founder film",
        "Milestone launch",
        "Facility doc",
        "Recruiting film",
        "Investor edit",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  chaos: {
    slug: "chaos",
    accent: "#8F052F",
    company: "CHAOS Industries",
    recipientName: "John Tenet",
    recipientFirst: "John",
    recipientEmail: "john.tenet@chaosinc.com",
    metaTitle: "Friends & Family for CHAOS Industries",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for CHAOS Industries.",
    heroFor: "CHAOS",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with CHAOS because a Series D at $4.5B means the world starts watching, and the footage should match the engineering.",
    ticker:
      "Founded 2022 · $510M Series D led by Valor Equity Partners · $4.5B valuation · $1B+ raised · HQ in Hawthorne, CA · Tracks threats up to 250 km · George J. Tenet, Executive Chairman · On the U.S. Army acquisition marketplace",
    studio: {
      headline: "A production company built for redefining modern defense",
      subline: "Secure facilities, hardware that can't leave the building, ITAR-aware crews, the list goes on.",
    },
    noticed: {
      title: "Brand Designer, open now.",
      intro:
        "We read the Series D coverage and your open roles. Here's what stuck.",
      cards: [
        {
          label: "The hire is a signal",
          body: "You're hiring a Brand Designer in Hawthorne right now. That role will need a film and motion partner from day one, and we'd rather be in the room before the brand system locks than retrofit after.",
        },
        {
          label: "Tan on black",
          body: "Your site runs warm tan and deep crimson over near-black, closer to editorial than mil-spec. That restraint is rare in defense tech, and it translates beautifully to cinematography if someone protects it on set.",
        },
        {
          label: "Hawthorne neighbors",
          body: "Your facility sits in the same hardware corridor we shoot in constantly. We know how to film real machines in real facilities without slowing the floor down.",
        },
      ],
    },
    fit: {
      titlePlain: "You build the sensors.",
      titleAccent: "We make people feel what they do.",
      intro:
        "We build films for companies whose product is hard to see and harder to fake. One anthem plus a modular library covers recruiting, customers, and the press cycle the Series D just started.",
      gives: [
        ["Brief", "Anthem film plus recruiting and product cutdowns"],
        ["Production", "Facility-safe crews, real hardware, no stock"],
        ["Deliverables", "Hero film, social verticals, careers content"],
        ["Audience", "DoD customers, engineers you're hiring, press"],
      ],
      tags: [
        "Anthem film",
        "Recruiting film",
        "Facility shoot",
        "Product demo",
        "Founder story",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  arc: {
    slug: "arc",
    accent: "#031E25",
    company: "Arc Boat Company",
    recipientName: "Mitch Lee",
    recipientFirst: "Mitch",
    recipientEmail: "mitch@arcboats.com",
    metaTitle: "Friends & Family for Arc",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Arc Boat Company.",
    heroFor: "Arc",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Arc because 570 horsepower with no engine roar changes what a boat film sounds like, and we want to be the ones who use the silence.",
    ticker:
      "Founded 2021 by ex-Boeing engineers · $50M Series C, March 2026 · Backed by Eclipse, a16z, Menlo Ventures · Arc Sport: 570 hp, 226 kWh · $160M Curtin Maritime tug deal · Built in Los Angeles · Expanding into defense propulsion",
    studio: {
      headline: "A production company built for the electric waterfront",
      subline: "On-water camera boats, factory floors in LA, launch films for hardware that did not exist last year, the list goes on.",
    },
    noticed: {
      title: "The quiet is the product.",
      intro:
        "We read the founders' story and the Series C coverage. Here's what stuck.",
      cards: [
        {
          label: "Boeing to boat ramp",
          body: "You and Ryan met in mechanical engineering at Northwestern, then prototyped startups in your downtime at Boeing. That origin reads on camera better than any brand manifesto, and it hasn't been filmed properly.",
        },
        {
          label: "Tesla playbook, on water",
          body: "Premium first with the Arc Sport, then tugs with Curtin Maritime, now propulsion for defense. Each chapter needs its own film language, and the through line is the drivetrain.",
        },
        {
          label: "Use the silence",
          body: "570 horsepower with no engine roar changes what a boat film sounds like. Most marine content hides the noise. Yours can use the quiet, and that's a sound design idea as much as a picture idea.",
        },
      ],
    },
    fit: {
      titlePlain: "You build boats people have to see moving.",
      titleAccent: "We make the films that move them.",
      intro:
        "We're a short drive from your floor and we shoot hardware, founders, and water, sometimes all three at once. Launch films across consumer, commercial, and defense from one production system.",
      gives: [
        ["Brief", "Launch and brand films across all three lines"],
        ["Production", "LA crews, on-water units, factory and dockside shoots"],
        ["Deliverables", "Hero film, cutdowns, social verticals, stills"],
        ["Audience", "Buyers, port operators, defense partners, recruits"],
      ],
      tags: [
        "Hero film",
        "On-water unit",
        "Factory doc",
        "Founder story",
        "Product launch",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  vuori: {
    slug: "vuori",
    accent: "#37526B",
    company: "Vuori",
    recipientName: "Joe Kudla",
    recipientFirst: "Joe",
    recipientEmail: "jkudla@vuoriclothing.com",
    metaTitle: "Friends & Family for Vuori",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Vuori.",
    heroFor: "Vuori",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Vuori because we grew up shooting the same coastline you built the brand on, and the performance pivot needs athlete-credible film, not lifestyle b-roll.",
    ticker:
      "Founded 2015 in an Encinitas garage · $825M raise at $5.5B valuation · 100+ stores globally · Seoul and Beijing opened 2025 · Jack Draper signature line debuted at the US Open · Kaia Gerber fronts SS26 women's campaign · Ships to 18 countries",
    studio: {
      headline: "A production company built for coastal California brands going global",
      subline: "Athlete shoots wedged between training blocks, retail openings on three continents, product drops every season, the list goes on.",
    },
    noticed: {
      title: "The performance pivot.",
      intro:
        "We've watched the athlete roster grow and the campaigns ship. Here's what stuck.",
      cards: [
        {
          label: "Athletes change the bar",
          body: "Jared Goff, Jack Draper, Kaia Gerber. A roster like that needs performance-credible film, not lifestyle b-roll, and athlete schedules make production logistics the whole game. That's the part we're unusually good at.",
        },
        {
          label: "Global, still Carlsbad",
          body: "Seoul, Beijing, London, Shanghai inside a year. Every market needs campaign assets that travel without diluting the coastal DNA the brand was built on. That's a shooting discipline, not a localization step.",
        },
        {
          label: "The cadence is climbing",
          body: "Draper in February, Kaia in April. That's a seasonal film pipeline now, and it rewards a production partner on a retainer rhythm instead of one-off bids.",
        },
      ],
    },
    fit: {
      titlePlain: "We grew up on the same coastline.",
      titleAccent: "Let's shoot like it.",
      intro:
        "We're an LA production company with directors who live in the world Vuori sells. We build campaign film systems for brands scaling fast without losing the thread.",
      gives: [
        ["Brief", "Performance campaigns with coastal soul"],
        ["Production", "SoCal-native crews, athlete-schedule-proof logistics"],
        ["Deliverables", "Hero film plus social cutdowns per market"],
        ["Audience", "Active 25 to 45, US plus new Europe and Asia retail"],
      ],
      tags: [
        "Athlete docs",
        "Product film",
        "Retail launch",
        "Campaign spots",
        "Social cutdowns",
        "Global toolkits",
        "Edit",
        "Delivery",
      ],
    },
  },

  kalshi: {
    slug: "kalshi",
    accent: "#030712",
    company: "Kalshi",
    recipientName: "Tarek Mansour",
    recipientFirst: "Tarek",
    recipientEmail: "tmansour@kalshi.com",
    metaTitle: "Friends & Family for Kalshi",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Kalshi.",
    heroFor: "Kalshi",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Kalshi because you sued your regulator, won, and now there's a concourse at Madison Square Garden with your name on it. Most brands have to invent a story. Yours is sitting there.",
    ticker:
      "$1B Series F at $22B valuation, March 2026 · Annualized volume tripled to $178B · 90%+ of US prediction market activity · $871M traded on Super Bowl Sunday · Official Prediction Market Partner of Madison Square Garden · First CFTC-regulated event exchange · Sued the CFTC and won",
    studio: {
      headline: "A production company built for the speed of the market",
      subline: "Launch films that ship before the contract settles, courtside activations at the Garden, creator spots that don't feel like ads, the list goes on.",
    },
    noticed: {
      title: "Staffing a brand machine.",
      intro:
        "We read the Series F coverage and your open roles. Here's what stuck.",
      cards: [
        {
          label: "The hires say it first",
          body: "Creator Partnerships and Marketing Activations roles are open in New York right now. That's not a media buy, that's building an in-house engine for culture, and the engine needs a production partner that moves at its pace.",
        },
        {
          label: "The Garden",
          body: "A concourse at Madison Square Garden is becoming the Kalshi Concourse. Physical brand moments at that scale deserve film crews who shoot live environments well, and that's where we live with ESPN.",
        },
        {
          label: "Courtroom to CNN",
          body: "You sued your regulator, won, and now you're piped into Robinhood, CNN, and CNBC. The story is cinematic on its own. It just hasn't been told at the craft level the valuation deserves.",
        },
      ],
    },
    fit: {
      titlePlain: "You're moving faster than any brand in finance.",
      titleAccent: "We shoot at that speed.",
      intro:
        "Kalshi is at the biggest inflection in fintech and the work should look like it. Brand films, creator spots, and activation coverage for a category you invented.",
      gives: [
        ["Brief", "Brand films, creator spots, activation coverage"],
        ["Production", "Director-led, fast turnarounds, live environments"],
        ["Deliverables", "Hero film, cutdowns, social verticals, event capture"],
        ["Audience", "Retail traders, institutions, sports fans, the press"],
      ],
      tags: [
        "Brand film",
        "Creator content",
        "Sports activations",
        "Event capture",
        "Broadcast spots",
        "Social verticals",
        "Edit",
        "Delivery",
      ],
    },
  },

  suno: {
    slug: "suno",
    accent: "#101012",
    company: "Suno",
    recipientName: "Mikey Shulman",
    recipientFirst: "Mikey",
    recipientEmail: "mikey@suno.com",
    metaTitle: "Friends & Family for Suno",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Suno.",
    heroFor: "Suno",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Suno because the legitimacy chapter is a filmmaking problem: settled with Warner, backed by Timbaland, and $400M to spend becoming a music company instead of a tech demo.",
    ticker:
      "Founded 2022 in Cambridge by four Kensho alumni · $400M Series D at $5.4B led by Bond Capital · ~$300M ARR, 2M+ paying subscribers · Warner settlement and licensing partnership · Acquired Songkick · Timbaland on board as strategic advisor · Offices in Harvard Square, Chelsea NYC, and Venice LA",
    studio: {
      headline: "A production company built for the soundtrack era",
      subline: "Launch films, artist partnership spots, brand campaigns that have to win over skeptical musicians, the list goes on.",
    },
    noticed: {
      title: "Neighbors in Venice.",
      intro:
        "We read the Series D coverage and the Songkick news. Here's what stuck.",
      cards: [
        {
          label: "Rooms matter to you",
          body: "Three offices deep into Cambridge, Chelsea, and Venice, you clearly believe in being in the room. Your Venice office is around the corner from our world, and we like companies that show up in person.",
        },
        {
          label: "Timbaland said yes",
          body: "Getting a producer of that stature to publicly back an AI music company, mid-lawsuit, says the product converts skeptics. The next wave of that story is told on film, not in a press release.",
        },
        {
          label: "Songkick is a sleeper",
          body: "Acquiring a live music discovery brand while everyone debates training data is a quiet tell. You're building toward culture, not just generation, and live music is the most filmable thing you own.",
        },
      ],
    },
    fit: {
      titlePlain: "You changed who gets to make music.",
      titleAccent: "Now show the world what that looks like.",
      intro:
        "Anthem and product films that make AI music feel human, artist-story docs that win over skeptics, and a production partner with a foot in your Venice neighborhood.",
      gives: [
        ["Brief", "Anthem and product films that make AI music feel human"],
        ["Production", "Director-led shoots from Venice to Cambridge"],
        ["Deliverables", "Hero film, cutdowns, social verticals, artist docs"],
        ["Audience", "Musicians, creators, and 100M+ people already making songs"],
      ],
      tags: [
        "Brand anthem",
        "Artist docs",
        "Product launch",
        "Founder story",
        "Social cutdowns",
        "Campaign craft",
        "Edit",
        "Delivery",
      ],
    },
  },

  david: {
    slug: "david",
    accent: "#B58745",
    company: "David",
    recipientName: "Peter Rahal",
    recipientFirst: "Peter",
    recipientEmail: "peter@davidprotein.com",
    metaTitle: "Friends & Family for David",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for David.",
    heroFor: "David",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with David because you followed a protein bar with canned cod, which is a brand confident enough to be strange, and film made for you should take the same swings.",
    ticker:
      "28g protein, 150 calories, 0g sugar · $75M Series A led by Greenoaks, May 2025 · $725M post-money valuation · $100M+ first-year revenue pace · Acquired Epogee, maker of EPG · 3,000+ retail doors · Founder Peter Rahal sold RXBAR to Kellogg for $600M",
    studio: {
      headline: "A production company built for the protein economy",
      subline: "Founder-led approvals, retail launch windows, product macro that has to look as clean as the label, the list goes on.",
    },
    noticed: {
      title: "Black, white, serif.",
      intro:
        "We did the homework on the brand and the Epogee play. Here's what stuck.",
      cards: [
        {
          label: "The restraint is the brand",
          body: "Stark black and white, a serif, and gold as the only color. That's a film language too. Most food brands can't carry that restraint. Yours demands it, and we'd protect it on set.",
        },
        {
          label: "Canned cod, seriously",
          body: "You followed a protein bar with wild-caught cod and protein pints. That's a brand confident enough to be strange, and the film should take the same swings instead of sanding them off.",
        },
        {
          label: "Science is the casting",
          body: "Huberman and Attia aren't endorsements, they're the architecture. Built on science, backed by experts needs production that treats data and appetite in the same frame.",
        },
      ],
    },
    fit: {
      titlePlain: "You moved fast without breaking the brand.",
      titleAccent: "We shoot the same way.",
      intro:
        "David went from launch to a $100M pace in a year and the work stayed sharp, minimal, confident. We build commercial film for brands at exactly this inflection, founder-direct, zero committee drag.",
      gives: [
        ["Brief", "Founder-direct, fast cycles, zero committee drag"],
        ["Production", "Director-led tabletop, talent, docu founder film"],
        ["Deliverables", "Broadcast master plus retail, social, DTC cutdowns"],
        ["Audience", "Protein-literate consumers, retail buyers, the Huberman crowd"],
      ],
      tags: [
        "Tabletop",
        "Product macro",
        "Founder story",
        "Retail launch",
        "Athlete talent",
        "Anthem spot",
        "Edit",
        "Delivery",
      ],
    },
  },

  unrivaled: {
    slug: "unrivaled",
    accent: "#591A7E",
    company: "Unrivaled",
    recipientName: "Alex Bazzell",
    recipientFirst: "Alex",
    recipientEmail: "bazzell@unrivaled.basketball",
    metaTitle: "Friends & Family for Unrivaled",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Unrivaled.",
    heroFor: "Unrivaled",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Unrivaled because your whole season lives in eight weeks, and that favors crews who move at sports speed without looking like sports TV.",
    ticker:
      "$340M valuation Series B, Sept 2025 · Founded 2023 by Collier and Stewart · ~$220K average player salary · Players hold ~15% equity · 8 clubs in 2026 · Four nights a week on TNT, truTV, HBO Max · Rose BC, first champions",
    studio: {
      headline: "A production company built for the league players actually own",
      subline: "Eight clubs, a January-to-March window, four broadcast nights a week, athlete stories that have to land between games, the list goes on.",
    },
    noticed: {
      title: "The window is brutal.",
      intro:
        "We watched season two and read the Series B coverage. Here's what stuck.",
      cards: [
        {
          label: "Eight weeks, all of it",
          body: "The whole season lives January to March. Every piece of content has to be shot, cut, and out while the league is live. That favors crews who move at sports speed without looking like sports TV, and the off-season is when that system gets built.",
        },
        {
          label: "Players are the product",
          body: "Your athletes are owners, not talent for hire, and the best Unrivaled content treats them that way. Collier and Stewart built this on athlete voice. The film work should sound like it too.",
        },
        {
          label: "TNT raised the bar",
          body: "Four nights a week on TNT, truTV, and HBO Max means your brand sits next to network-grade production every game night. The off-court content has to hold its own on that shelf.",
        },
      ],
    },
    fit: {
      titlePlain: "You built a league in two years.",
      titleAccent: "We shoot like the clock matters.",
      intro:
        "The smartest time to build next season's film system is now, in the off-season: player-led brand films, sponsor content, and hype reels banked before the eight-week sprint starts.",
      gives: [
        ["Brief", "Player-led brand films and sponsor content for next season"],
        ["Production", "LA and Miami capable crews, fast-turn editorial"],
        ["Deliverables", "Broadcast spots, social cutdowns, partner content, hype films"],
        ["Audience", "Young, female-skewing, basketball-native fans"],
      ],
      tags: [
        "Brand films",
        "Athlete docs",
        "Sponsor content",
        "Game-night promos",
        "Hype reels",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  jetzero: {
    slug: "jetzero",
    accent: "#01011F",
    company: "JetZero",
    recipientName: "Tom O'Leary",
    recipientFirst: "Tom",
    recipientEmail: "tom@jetzero.aero",
    metaTitle: "Friends & Family for JetZero",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for JetZero.",
    heroFor: "JetZero",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with JetZero because the next two years are one long launch moment, and some companies need ads while yours needs witnesses.",
    ticker:
      "Z4 seats 250 passengers · Up to 50% less fuel per passenger mile · $175M Series B led by B Capital, Jan 2026 · $1B+ total funding · $235M U.S. Air Force demonstrator contract · First flight targeted 2027 · United path to 100 aircraft plus 100 options · HQ on Donald Douglas Drive, Long Beach",
    studio: {
      headline: "A production company built for the next shape in the sky",
      subline: "Demonstrator rollouts in Long Beach hangars, flight-test mornings where the light will not wait, recruiting films for a factory that does not exist yet, the list goes on.",
    },
    noticed: {
      title: "Everything gates on 2027.",
      intro:
        "We read the Series B coverage and walked your site. Here's what stuck.",
      cards: [
        {
          label: "Donald Douglas Drive",
          body: "Your HQ sits on the old Douglas Aircraft ground in Long Beach. A new airframe shape being built where the DC series was born is a story asset most startups would invent if they could, and it's just your address.",
        },
        {
          label: "One date, maximum stakes",
          body: "The Series B, the $235M Air Force contract, and United's conditional hundred-plus-hundred order all converge on one event: first flight of the demonstrator. The footage between now and then becomes the brand archive forever.",
        },
        {
          label: "One color, one tagline",
          body: "The site runs a single orange against black and navy under the line The future takes shape. The brand already behaves like a film title sequence, and the film should keep that discipline.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "first flight.",
      intro:
        "We've made launch-moment work for Apple, Ford, Nike, ESPN, Callaway, and Netflix. JetZero's road to 2027 is one long launch moment, and it deserves an embedded documentary system, not one-off shoots.",
      gives: [
        ["Brief", "Document the demonstrator's road to 2027"],
        ["Production", "Embedded doc crews, hangar and flight-line ready, Long Beach local"],
        ["Deliverables", "Hero film, investor and airline cutdowns, recruiting verticals"],
        ["Audience", "United, USAF, future Greensboro hires, the flying public"],
      ],
      tags: [
        "Milestone doc",
        "First flight",
        "Founder story",
        "Recruiting film",
        "Investor cuts",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  coco: {
    slug: "coco",
    accent: "#EC27C3",
    company: "Coco Robotics",
    recipientName: "Zach Rash",
    recipientFirst: "Zach",
    recipientEmail: "zach.rash@cocodelivery.com",
    metaTitle: "Friends & Family for Coco Robotics",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Coco Robotics.",
    heroFor: "Coco",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Coco because your densest market is the exact sidewalks we already shoot on, and a thousand friendly robots deserve film that treats them as characters, not gadgets.",
    ticker:
      "$80M Series B, June 2025 · Backed by Sam and Max Altman · ~1,000 bots across LA, Miami, Dallas, Helsinki · 500,000+ deliveries since 2020 · 1,000,000 sidewalk miles · 3,000 merchant partners · OpenAI data partnership · UCLA physical AI lab",
    studio: {
      headline: "A production company built for the autonomous sidewalk",
      subline: "City launch films, merchant spotlights, bot's-eye footage, recruiting spots, the list goes on.",
    },
    noticed: {
      title: "The bot is the billboard.",
      intro:
        "We read the Series B coverage and the UCLA lab news. Here's what stuck.",
      cards: [
        {
          label: "A street-level media surface",
          body: "You already sell advertising on robot exteriors, which means the fleet is a rolling media network. Film extends that surface: the bots can carry a story through a city the way no billboard can.",
        },
        {
          label: "The story moved upstream",
          body: "The OpenAI data partnership and the Bolei Zhou physical-AI lab make Coco an AI infrastructure company that happens to deliver burritos. That's a much bigger film than food delivery, and nobody has made it yet.",
        },
        {
          label: "Same streets",
          body: "You're headquartered in Venice and your densest market is LA. We shoot these sidewalks constantly, and a city launch film system built here travels to Miami, Dallas, and Helsinki with the fleet.",
        },
      ],
    },
    fit: {
      titlePlain: "A thousand bots on the street.",
      titleAccent: "One film system to carry them.",
      intro:
        "Coco's next chapter is physical AI at street level, and that needs film with real craft behind it: hardware that reads as a character, merchants as people, cities as places.",
      gives: [
        ["Brief", "City launch films, merchant stories, the physical-AI chapter"],
        ["Production", "LA-native crews, bot POV rigs, fast rollout timelines"],
        ["Deliverables", "Hero film, launch cutdowns, social verticals"],
        ["Audience", "Merchants, city partners, recruits, the Altman-curious press"],
      ],
      tags: [
        "City launch films",
        "Bot POV",
        "Merchant stories",
        "Founder profile",
        "Recruiting film",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  alo: {
    slug: "alo",
    accent: "#242424",
    company: "Alo",
    recipientName: "Danny Harris",
    recipientFirst: "Danny",
    recipientEmail: "danny.harris@aloyoga.com",
    metaTitle: "Friends & Family for Alo",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Alo.",
    heroFor: "Alo",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Alo because your in-house engine owns the daily, and what we make is the layer above it: long-form film and documentary, same standard, different altitude.",
    ticker:
      "Founded Los Angeles 2007 · Alo stands for air, land, ocean · 50/50 founder owned, zero outside capital · $10B valuation talks, all offers declined · 169 stores worldwide · Champs-Élysées flagship opens 2026 · Six-story Seoul wellness flagship",
    studio: {
      headline: "A production company built for air, land, and ocean",
      subline: "Campaign films, flagship opening films, founder documentaries, retail cinema for Paris and Seoul, the list goes on.",
    },
    noticed: {
      title: "Still 50/50.",
      intro:
        "We did the homework on the company and the expansion. Here's what stuck, written as peers, not as a rescue pitch.",
      cards: [
        {
          label: "You said no to everyone",
          body: "Two childhood friends ran a $10B process, declined every offer, and kept every share. Decisions move at founder speed. We're founder-run too, and built to match that cadence.",
        },
        {
          label: "The engine is not the gap",
          body: "Your in-house creative ships daily and the campaign muscle is real. The layer above the daily, long-form film and documentary, is a different discipline. It's the only one we sell.",
        },
        {
          label: "Openings as events",
          body: "A former Zara on the Champs-Élysées. Six stories in Seoul with a rooftop retreat. Each opening is a film-sized story, not a content beat, and the footage should outlive the ribbon cutting.",
        },
      ],
    },
    fit: {
      titlePlain: "Where we sit:",
      titleAccent: "above the feed.",
      intro:
        "Your team owns the daily. We make what sits above it, and we hand back open masters and stems so your in-house engine can cut it a hundred ways.",
      gives: [
        ["Brief", "Brand films, founder documentary, flagship opening films"],
        ["Production", "Director-led, founder-speed approvals, LA-based"],
        ["Deliverables", "Cinema masters plus stems for your in-house engine"],
        ["Audience", "Global retail customers from Paris to Seoul"],
      ],
      tags: [
        "Brand film",
        "Founder documentary",
        "Flagship openings",
        "Campaign craft",
        "Open masters",
        "Retail cinema",
        "Edit",
        "Delivery",
      ],
    },
  },

  parallel: {
    slug: "parallel",
    accent: "#151515",
    company: "Parallel Systems",
    recipientName: "Matt Soule",
    recipientFirst: "Matt",
    recipientEmail: "matt@moveparallel.com",
    metaTitle: "Friends & Family for Parallel Systems",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Parallel Systems.",
    heroFor: "Parallel",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Parallel because driverless electric railcars moving real containers through Georgia pine country is pure cinema, and nobody has filmed it yet.",
    ticker:
      "FRA approval April 2025 · $38M Series B led by Anthos Capital · ~$100M raised · 160 miles of Georgia rail with Genesee and Wyoming · Port of Savannah to inland distribution · 300+ vehicle backlog · Founded 2020 by SpaceX veterans · Commercial launch 2026",
    studio: {
      headline: "A production company built for the future of freight",
      subline: "Pilot launch films, vehicle reveals, port-to-railyard documentary footage, recruiting spots, the list goes on.",
    },
    noticed: {
      title: "The pilot is live.",
      intro:
        "We read the FRA approval news and the Series B coverage. Here's what stuck.",
      cards: [
        {
          label: "A working route",
          body: "Your first commercial pilot runs 160 miles of Genesee and Wyoming track out of the Port of Savannah. A real route with real containers is the strongest film asset a freight company can have, and it's running right now.",
        },
        {
          label: "One red on black",
          body: "moveparallel.com is a dark theme with a single coral accent and the hardware carrying all the imagery. Film for this brand should live inside that same restraint instead of fighting it.",
        },
        {
          label: "Milestone cadence",
          body: "You communicate in milestones: FRA approval, Series B, a 300-vehicle backlog, 2026 launch. Each one deserves footage ready the day it lands, which means a standing film system, not scrambled shoots.",
        },
      ],
    },
    fit: {
      titlePlain: "A studio fluent in",
      titleAccent: "hardware that moves.",
      intro:
        "We build films around engineering milestones, not ad concepts, and your railcars are twenty minutes from our directors. The Georgia pilot should be shot like the milestone it is.",
      gives: [
        ["Brief", "Pilot launch film plus a repeatable milestone format"],
        ["Production", "Port and railyard crews, LA Arts District to Savannah"],
        ["Deliverables", "Launch film, milestone cuts, recruiting and brand content"],
        ["Audience", "Railroads, shippers, regulators, engineers you're hiring"],
      ],
      tags: [
        "Launch film",
        "Milestone system",
        "Founder story",
        "Recruiting film",
        "Port and rail",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  "reflect-orbital": {
    slug: "reflect-orbital",
    accent: "#F44200",
    company: "Reflect Orbital",
    recipientName: "Ben Nowack",
    recipientFirst: "Ben",
    recipientEmail: "ben@reflectorbital.com",
    metaTitle: "Friends & Family for Reflect Orbital",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Reflect Orbital.",
    heroFor: "Reflect Orbital",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Reflect because film already raised your rounds and filled your waitlist, and the World Tour is ten one-take live events that each need a crew in place before the light arrives.",
    ticker:
      "$20M Series A led by Lux Capital, May 2025 · Sequoia's first space investment since SpaceX · 260,000+ applications from 157 countries · EARENDIL-1 targets mid-2026 launch · 18m x 18m mylar mirror, 16 kg · 10-location World Tour · HQ in Hawthorne, CA",
    studio: {
      headline: "A production company built for sunlight after dark",
      subline: "Launch films, hardware verité, mission countdowns, World Tour coverage, the list goes on.",
    },
    noticed: {
      title: "The film already converts.",
      intro:
        "We watched the demo video like two million other people. Here's what stuck.",
      cards: [
        {
          label: "Video is your channel",
          body: "Your demo pulled two million views and 182,000 sunlight applications, and Sequoia led the seed after their partner watched it on the way to a Starship test. Film is this company's proven acquisition channel. We make film.",
        },
        {
          label: "Skeptics watch every frame",
          body: "The early demo took criticism and astronomers contest the constellation publicly. The answer to skeptics is real hardware on camera, shot straight, with nothing to walk back. That's the only register we work in.",
        },
        {
          label: "The World Tour is a shoot schedule",
          body: "EARENDIL-1 lights ten locations, each pass minutes long at near full-moon brightness. Ten one-take live events around the world, each needing a crew in place first. That's a production plan, and it should exist before launch.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "first light.",
      intro:
        "We're minutes from Hawthorne and built for hardware, founders, and one-take live moments. The mission window won't wait for a second take, so the planning is the craft.",
      gives: [
        ["Brief", "Launch film plus World Tour capture plan"],
        ["Production", "Night-capable crews and glass that holds an image at 0.1 lux"],
        ["Deliverables", "Mission film, live coverage, social cutdowns, stills"],
        ["Audience", "Customers, skeptics, the 260,000 who already applied"],
      ],
      tags: [
        "Launch films",
        "Hardware verité",
        "Night capture",
        "Live coverage",
        "Founder docs",
        "Mission countdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  firestorm: {
    slug: "firestorm",
    accent: "#050505",
    company: "Firestorm Labs",
    recipientName: "Dan Magy",
    recipientFirst: "Dan",
    recipientEmail: "dan@launchfirestorm.com",
    metaTitle: "Friends & Family for Firestorm Labs",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Firestorm Labs.",
    heroFor: "Firestorm",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Firestorm because the factory is the story: a container that prints a drone system in under 24 hours is the most filmable idea in defense manufacturing.",
    ticker:
      "Founded 2022 in San Diego · $47M Series A led by NEA, July 2025 · $82M Series B, April 2026 · $153M total raised · USAF IDIQ worth up to $100M · 60,000 sq ft Miramar HQ · xCell prints a drone system in under 24 hours · Backed by Lockheed Martin Ventures",
    studio: {
      headline: "A production company built for expeditionary manufacturing",
      subline: "Anthem films, capability demos, contract-win announcements, recruiting stories, the list goes on.",
    },
    noticed: {
      title: "The factory is the story.",
      intro:
        "We read the Series A and B coverage and your site. Here's what stuck.",
      cards: [
        {
          label: "xCell leads the coverage",
          body: "Press about the raises and the Air Force deal leads with the factory in a box before the airframes. The process is the headline, and a process is something a camera can follow start to finish in one day.",
        },
        {
          label: "Four imperatives",
          body: "Print. Build. Fly. Dominate. Your copy favors short commands over spec sheets, and one near-pure red on black backs it up. Film for Firestorm should cut at that same tempo.",
        },
        {
          label: "Third time around",
          body: "Dan sold Citadel Defense and came back for a third defense company. Founders who've exited and returned tell the story differently on camera: less pitch, more conviction. That's the founder film worth making.",
        },
      ],
    },
    fit: {
      titlePlain: "A crew that moves at",
      titleAccent: "contract speed.",
      intro:
        "We shoot hardware, factories, and the people who run them, with small senior crews that work around a live production floor. One shoot day yields the anthem, the recruiting cut, and the verticals.",
      gives: [
        ["Brief", "Anthem film plus capability and recruiting cuts"],
        ["Production", "Small senior crews, live-floor safe, San Diego is an easy drive"],
        ["Deliverables", "Anthem film, recruiting cut, verticals, stills from one day"],
        ["Audience", "USAF program offices, primes, engineers you're hiring"],
      ],
      tags: [
        "Anthem film",
        "Capability demo",
        "Recruiting film",
        "Facility tour",
        "Founder story",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  divergent: {
    slug: "divergent",
    accent: "#0D223F",
    company: "Divergent",
    recipientName: "Lukas Czinger",
    recipientFirst: "Lukas",
    recipientEmail: "lczinger@divergent3d.com",
    metaTitle: "Friends & Family for Divergent",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Divergent Technologies.",
    heroFor: "Divergent",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Divergent because a hypercar built as proof of a factory is a brief that writes itself, and the same footage has to flex between consumers and primes.",
    ticker:
      "$290M Series E at $2.3B, Sept 2025 · 5x YoY revenue growth · 600+ aerospace and defense part numbers · Lockheed Martin, RTX, General Dynamics customers · Czinger 21C: 1,350 hp, 0 to 60 in 1.9s · Laguna Seca lap record 1:24.75 · Oklahoma factory groundbreaking 2026",
    studio: {
      headline: "A production company built for the people reinventing how things get made",
      subline: "Hypercar reveals, factory floor films, record-run recaps, defense program stories, the list goes on.",
    },
    noticed: {
      title: "The car is the demo.",
      intro:
        "We read the Series E coverage and the record-run press. Here's what stuck.",
      cards: [
        {
          label: "One factory, any product",
          body: "The same Torrance cells that print Czinger 21C structures ship parts for Lockheed Martin, RTX, and General Dynamics. The platform is the story across every sector, and the factory floor is where it's visible.",
        },
        {
          label: "Records as receipts",
          body: "The 21C holds the Laguna Seca production car lap record and broke Goodwood's hillclimb record. A hypercar built to prove a factory is the rare brief where the beauty shots and the business case are the same footage.",
        },
        {
          label: "Two brands, one system",
          body: "Czinger speaks to consumers, Divergent to primes and investors. The same shoot has to serve both, which is a production design problem we'd genuinely enjoy solving.",
        },
      ],
    },
    fit: {
      titlePlain: "Built to keep pace with",
      titleAccent: "an adaptive factory.",
      intro:
        "We're twenty minutes from Torrance, equally at home on factory floors and racetracks. One production system covers the reveals, the records, and the program stories.",
      gives: [
        ["Brief", "Launch films, DAPS floor stories, the father-son narrative"],
        ["Production", "Factory and track crews, LA-based"],
        ["Deliverables", "Hero films plus modular cutdowns for both brands"],
        ["Audience", "Collectors, primes, investors, Oklahoma recruits"],
      ],
      tags: [
        "Hypercar reveals",
        "Factory floor",
        "Record runs",
        "Founder story",
        "Defense programs",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  servicetitan: {
    slug: "servicetitan",
    accent: "#103672",
    company: "ServiceTitan",
    recipientName: "Ara Mahdessian",
    recipientFirst: "Ara",
    recipientEmail: "amahdessian@servicetitan.com",
    metaTitle: "Friends & Family for ServiceTitan",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for ServiceTitan.",
    heroFor: "ServiceTitan",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with ServiceTitan because the scale is invisible: $21.7B in jobs moved through the platform last quarter, and furnaces and panel swaps are filmable while dashboards are not.",
    ticker:
      "NASDAQ: TTAN · IPO Dec 12, 2024 at $71 · ~$9B day-one market cap · FY2026 revenue $961M, up 24% · $21.7B quarterly gross transaction volume · HQ Glendale, CA · Acquired Aspire, FieldRoutes, Convex",
    studio: {
      headline: "A production company built for the trades",
      subline: "For the people who answer the call: HVAC techs, plumbers, electricians, roofers, the list goes on.",
    },
    noticed: {
      title: "The story is the dads.",
      intro:
        "We read the founding story and watched the Pantheon coverage. Here's what stuck.",
      cards: [
        {
          label: "Two fathers, one company",
          body: "ServiceTitan's own telling starts with a contractor and a plumber raising two sons who built the company as a thank-you. A film that doesn't open in a work truck ignores the founding logic.",
        },
        {
          label: "Customers are the heroes",
          body: "The homepage leads with contractors and Pantheon put two thousand tradespeople in the LA Coliseum. Real technicians are already the house visual language, and documentary craft is how that language gets richer.",
        },
        {
          label: "The scale is invisible",
          body: "$21.7B in jobs moved through the platform in a single quarter, and almost none of it photographs as software. The work itself, in driveways and crawlspaces, is where the brand lives on camera.",
        },
      ],
    },
    fit: {
      titlePlain: "Real work deserves",
      titleAccent: "real filmmaking.",
      intro:
        "We're a short drive from Glendale and we shoot people for a living. The founder story, the customer portraits, and the Pantheon stage can all come from one director-led system.",
      gives: [
        ["Brief", "Founder film, customer portraits, anthem spot"],
        ["Production", "Documentary crews in real shops and trucks"],
        ["Deliverables", "Broadcast :60 scaling to :15, event films, stills"],
        ["Audience", "Contractors, investors, the trades workforce"],
      ],
      tags: [
        "Anthem film",
        "Founder story",
        "Customer docs",
        "Event capture",
        "Recruiting film",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  "blue-water": {
    slug: "blue-water",
    accent: "#151719",
    company: "Blue Water Autonomy",
    recipientName: "Rylan Hamilton",
    recipientFirst: "Rylan",
    recipientEmail: "rylan@blw.ai",
    metaTitle: "Friends & Family for Blue Water Autonomy",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Blue Water Autonomy.",
    heroFor: "Blue Water",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Blue Water because when the product is a 190-foot unmanned ship hitting open water next year, the story deserves cameras on the pier, not stock footage.",
    ticker:
      "Founded 2024 in Boston · $50M Series A led by GV · $64M raised · Conrad Shipyard production partner · Liberty class: 190 feet · First ships in open water 2026 · Team quadrupled since seed · Founder sold 6 River Systems to Shopify for $450M",
    studio: {
      headline: "A production company built for the open ocean",
      subline: "Sea trial capture, shipyard documentaries, founder films, milestone launches, the list goes on.",
    },
    noticed: {
      title: "Steel, not slideware.",
      intro:
        "We read the Series A coverage and the Conrad deal. Here's what stuck.",
      cards: [
        {
          label: "The shipyard deal",
          body: "Weeks after the Series A closed you signed Conrad Shipyard to build the first class. Most autonomy companies show renders for years. You'll have full-size hulls in Louisiana, and hulls photograph.",
        },
        {
          label: "Waymo of the open ocean",
          body: "That's your own framing: Navy first, then allied fleets worldwide. A thesis that big needs a film that program offices and allies can watch in four minutes and believe.",
        },
        {
          label: "Quadrupled, four cities",
          body: "Boston, DC, Morgan City, San Diego, with shipbuilders who've delivered thirty Navy ships and DARPA NOMARS veterans. A team scaling that fast needs recruiting film that keeps pace.",
        },
      ],
    },
    fit: {
      titlePlain: "A film partner for",
      titleAccent: "the hard-tech era.",
      intro:
        "We shoot the real thing: shipyards, sea trials, and the people who build them. The first Liberty-class splash is a once-only event, and the cameras should be planned now.",
      gives: [
        ["Brief", "Founder film, sea trial capture, capability films"],
        ["Production", "Shipyard and on-water crews, Boston to Morgan City"],
        ["Deliverables", "Hero film, capability cuts, recruiting stories, stills"],
        ["Audience", "Navy program offices, allies, engineers you're hiring"],
      ],
      tags: [
        "Sea trials",
        "Shipyard doc",
        "Founder story",
        "Capability films",
        "Recruiting film",
        "Launch film",
        "Edit",
        "Delivery",
      ],
    },
  },

  whoop: {
    slug: "whoop",
    accent: "#191919",
    company: "WHOOP",
    recipientName: "Will Ahmed",
    recipientFirst: "Will",
    recipientEmail: "will.ahmed@whoop.com",
    metaTitle: "Friends & Family for WHOOP",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for WHOOP.",
    heroFor: "WHOOP",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with WHOOP because the strap has no screen, which puts the entire storytelling load on the film, and that's the kind of problem we like best.",
    ticker:
      "$575M Series G at $10.1B · 2025 bookings $1.1B, up 103% · 2.5M+ members, 56 countries · Cash flow positive in 2025 · Hiring 600+ roles in 2026 · 14-day battery, no screen · Backed by Ronaldo, LeBron, McIlroy · 24B+ hours of physiological data",
    studio: {
      headline: "A production company built for the recovery obsessed",
      subline: "Athlete windows measured in minutes, real 5 AM training instead of gym choreography, app UI that has to read in broadcast and vertical, the list goes on.",
    },
    noticed: {
      title: "No screen, all story.",
      intro:
        "We read the Series G coverage and we already shoot the worlds WHOOP lives in. Here's what stuck.",
      cards: [
        {
          label: "The product can't demo itself",
          body: "WHOOP 5.0 ships without a display, so the proof lives in the app and on the body. That puts the entire storytelling load on the film, which is exactly where director-led craft earns its keep.",
        },
        {
          label: "Golf runs deep",
          body: "Rory McIlroy and Shane Lowry invested in the Series G and the strap is a fixture on tour wrists. We shoot for Callaway, so this is a world we film every season, not a category we'd be learning.",
        },
        {
          label: "Brand is now a budget line",
          body: "You've said Series G capital goes to marketing and brand awareness alongside 600 hires. A company that hit cash-flow positive and then chose to spend on awareness usually means more film, not less.",
        },
      ],
    },
    fit: {
      titlePlain: "Performance culture,",
      titleAccent: "produced properly.",
      intro:
        "We already shoot where WHOOP lives: Callaway on the course, ESPN and Nike in training culture, Apple in product craft. The overlap is the work, not the pitch.",
      gives: [
        ["Brief", "Launch films, athlete stories, awareness work"],
        ["Production", "Sports-fluent crews built for short athlete windows"],
        ["Deliverables", "Broadcast spots, social verticals, product macro, stills"],
        ["Audience", "2.5M members plus the golfers, lifters, and sleepers you're reaching"],
      ],
      tags: [
        "Athlete films",
        "Launch film",
        "Product macro",
        "App UI capture",
        "Golf",
        "Social verticals",
        "Edit",
        "Delivery",
      ],
    },
  },

  vast: {
    slug: "vast",
    accent: "#2A2C2F",
    company: "Vast",
    recipientName: "Max Haot",
    recipientFirst: "Max",
    recipientEmail: "max.haot@vastspace.com",
    metaTitle: "Friends & Family for Vast",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Vast.",
    heroFor: "Vast",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Vast because you may be the only space station company run by someone who shipped video for a decade, which means you already know exactly what good film costs and what it's worth.",
    ticker:
      "Haven-1 targets 2027 on Falcon 9 · $500M raised March 2026, $1B+ total · NASA CLD decision July 2026 · 189,690 sq ft Long Beach HQ · 1,000+ employees · Haven Demo flew November 2025 · First US-built station structure in 20+ years · Gigabit Starlink onboard",
    studio: {
      headline: "A production company built for the first commercial space station",
      subline: "Clean room protocols, hardware you cannot reshoot, launch windows that do not move, the list goes on.",
    },
    noticed: {
      title: "Built by a broadcaster.",
      intro:
        "We read the funding news and the Haven-1 hardware updates. Here's what stuck.",
      cards: [
        {
          label: "You speak production",
          body: "Before rockets, you built Livestream and Mevo. A station company run by someone who shipped video for a decade doesn't need convincing about craft. It needs a crew that can keep up with the hardware schedule.",
        },
        {
          label: "The documentary is happening",
          body: "Primary structure pressure-tested in October, life support in test since January, Haven Demo flown and deorbited on schedule. The road to Haven-1 is already a film. The only question is whether cameras are there for it.",
        },
        {
          label: "The window comes first",
          body: "Haven-1 leads with a 1.1 meter domed window, crew quarters, a communal table. Designing a station around the human view of Earth is a filmmaking instinct, and the brand should be shot with the same one.",
        },
      ],
    },
    fit: {
      titlePlain: "You build real hardware in public.",
      titleAccent: "We film it that way.",
      intro:
        "We're twenty minutes up the 710 and we make director-led films about builders. The road from factory floor to first crew deserves an embedded film system, planned before the CLD decision lands.",
      gives: [
        ["Brief", "Road to Haven-1, factory floor to first crew"],
        ["Production", "Director-led crews, clean room ready, Long Beach local"],
        ["Deliverables", "Hero film plus launch, CLD, and recruiting cutdowns"],
        ["Audience", "NASA, customers, investors, the next thousand hires"],
      ],
      tags: [
        "Brand film",
        "Documentary",
        "Founder story",
        "Recruiting film",
        "Launch coverage",
        "Mission content",
        "Edit",
        "Delivery",
      ],
    },
  },

  inversion: {
    slug: "inversion",
    accent: "#D44D36",
    company: "Inversion Space",
    recipientName: "Justin Fiaschetti",
    recipientFirst: "Justin",
    recipientEmail: "justin@inversionspace.com",
    metaTitle: "Friends & Family for Inversion Space",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Inversion Space.",
    heroFor: "Inversion",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Inversion because 2026 is the year Arc flies, and the build, the tests, and the people deserve footage that holds up longer than the launch window.",
    ticker:
      "Founded 2021 by Fiaschetti and Briggs · Y Combinator, $10M seed Nov 2021 · $44M Series A co-led by Spark Capital and Adjacent · Lockheed Martin Ventures participated · Ray flew on Transporter-12, Jan 2025 · Arc targets first flight 2026 · 41 open roles, all in Playa Vista",
    studio: {
      headline: "A production company built for the one-hour-from-orbit era",
      subline: "A Mojave test site, a capsule built by 25 people, a 2026 first flight, the list goes on.",
    },
    noticed: {
      title: "Ray flew. Reentry didn't.",
      intro:
        "We read the Transporter-12 coverage and your hiring board. Here's what stuck.",
      cards: [
        {
          label: "You said so publicly",
          body: "When the propulsion malfunction scrubbed Ray's splashdown, you said it plainly and pointed the team at Arc. That's a real story beat, not a press release, and it's exactly the kind of honesty that makes a film worth watching.",
        },
        {
          label: "41 roles, one building",
          body: "Every opening on your board is in-person in Playa Vista. Hiring forty people into one room is a recruiting-film problem as much as a sourcing problem: candidates need to feel the floor before they apply.",
        },
        {
          label: "The site already whispers",
          body: "Beige page, black type, four small accents, one line about making Earth radically more accessible. The restraint sets the tone any film about Inversion has to match, and we'd protect it.",
        },
      ],
    },
    fit: {
      titlePlain: "A film crew for",
      titleAccent: "first flight year.",
      intro:
        "Arc flies this year and the cameras should be planned now. One system covers the build documentation, the recruiting films, and the milestone cuts your next rooms will watch.",
      gives: [
        ["Brief", "Milestone documentation plus recruiting films"],
        ["Production", "Playa Vista is our neighborhood, Mojave in reach"],
        ["Deliverables", "First-flight film, recruiting cuts, investor edits"],
        ["Audience", "Candidates, partners, the rooms after Lockheed"],
      ],
      tags: [
        "Milestone doc",
        "First flight",
        "Recruiting film",
        "Founder story",
        "Test footage",
        "Investor cuts",
        "Edit",
        "Delivery",
      ],
    },
  },

  oishii: {
    slug: "oishii",
    accent: "#431112",
    company: "Oishii",
    recipientName: "Hiroki Koga",
    recipientFirst: "Hiroki",
    recipientEmail: "hiroki@oishii.com",
    metaTitle: "Friends & Family for Oishii",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Oishii.",
    heroFor: "Oishii",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Oishii because the farm of the future exists mostly as news b-roll right now, and a world with bee colonies, fifty robots, and strawberries with first names deserves crafted cinema.",
    ticker:
      "$150M Series C first close, May 2026 · $370M raised since 2016 · 237,000 sq ft Amatelas Farm, Phillipsburg NJ · Powered by a 50-acre solar field · Nearly 50 harvest robots · Bee colonies pollinate indoors · Sold in 18 states plus Toronto",
    studio: {
      headline: "A production company built for the farm of the future",
      subline: "Bees working beside fifty robots, racks that drift from day to night, tasting menus and Whole Foods shelves, the list goes on.",
    },
    noticed: {
      title: "The berries have personas.",
      intro:
        "We read the Series C coverage and toured the brand. Here's what stuck.",
      cards: [
        {
          label: "Already cast",
          body: "Omakase is a chef's favorite, Koyo a childhood favorite, Nikko a family favorite. The line is cast like characters, and each varietal can carry its own film the way a fashion house gives each fragrance its own world.",
        },
        {
          label: "The palette is the produce",
          body: "Your red on parchment, with sage and ruby tokens, is built directly from the fruit. The grade of any film should come from the same place, and macro work on a single berry can hold a whole frame.",
        },
        {
          label: "Press b-roll isn't cinema",
          body: "Sixty billion data points, robots, bee colonies, moving racks. That world exists mostly as news footage shot in a hurry. The survivor of vertical farming deserves the considered version.",
        },
      ],
    },
    fit: {
      titlePlain: "Precision farming deserves",
      titleAccent: "precision filmmaking.",
      intro:
        "A farm this controlled deserves images made the same way, deliberately, at every scale from macro berry to 237,000 square feet. We'd shoot the craft and the science as one story.",
      gives: [
        ["Brief", "Brand film plus varietal films and retail cutdowns"],
        ["Production", "Tabletop macro plus docu-tech farm crews"],
        ["Deliverables", "Hero film, retail and social cutdowns, stills"],
        ["Audience", "Chefs, Whole Foods shoppers, 18 states plus Toronto"],
      ],
      tags: [
        "Tabletop",
        "Food macro",
        "Docu-tech",
        "Brand film",
        "Founder story",
        "Retail cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  underdog: {
    slug: "underdog",
    accent: "#040404",
    company: "Underdog",
    recipientName: "Jeremy Levine",
    recipientFirst: "Jeremy",
    recipientEmail: "jeremy.levine@underdogfantasy.com",
    metaTitle: "Friends & Family for Underdog",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Underdog.",
    heroFor: "Underdog",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Underdog because you can't outspend DraftKings and FanDuel, and out-crafting them is literally our business model too.",
    ticker:
      "$70M Series C led by Spark Capital · Valued at $1.23B, March 2025 · Backed by BlackRock funds, Mark Cuban, Kevin Durant · Founded 2020 in Brooklyn · 2.4M+ active users · Best Ball Mania VI: $15M in prizes, 670,000+ entries · Sportsbook on proprietary tech",
    studio: {
      headline: "A production company built for the challenger in sports gaming",
      subline: "Season launches, athlete spots, draft week sprints, social cutdowns, the list goes on.",
    },
    noticed: {
      title: "Built, not bought.",
      intro:
        "We read the Series C coverage and Jeremy's product-velocity thesis. Here's what stuck.",
      cards: [
        {
          label: "Product over media weight",
          body: "2.4 million active users, with most growth in states without legal betting. That came from shipping better product, not bigger media buys. The film strategy should run the same play: out-craft, don't outspend.",
        },
        {
          label: "Mania is a tentpole",
          body: "Best Ball Mania VI: fifteen million in prizes, six hundred seventy thousand entries. The flagship contest is effectively an annual season of content, and it deserves a launch film system instead of scrambled promos.",
        },
        {
          label: "The sportsbook is yours",
          body: "You built the book in-house while most challengers white-label. A company that makes product decisions like that will recognize the difference between director-led film and performance-ad wallpaper instantly.",
        },
      ],
    },
    fit: {
      titlePlain: "Out-craft,",
      titleAccent: "don't outspend.",
      intro:
        "You win by shipping better product faster than bigger rivals. Same model here: director-led film at sports-calendar speed, built around tight athlete windows.",
      gives: [
        ["Brief", "Season launches, Mania tentpole, athlete spots"],
        ["Production", "Sports-calendar speed, talent-window fluent"],
        ["Deliverables", "Brand film, pick'em promos, vertical social"],
        ["Audience", "2.4M users plus every fantasy player they talk to"],
      ],
      tags: [
        "Season launches",
        "Athlete spots",
        "Comedy",
        "Brand film",
        "Social-first",
        "Draft week",
        "Edit",
        "Delivery",
      ],
    },
  },

  runway: {
    slug: "runway",
    accent: "#0C0C0C",
    company: "Runway",
    recipientName: "Cristóbal Valenzuela",
    recipientFirst: "Cristóbal",
    recipientEmail: "cristobal@runwayml.com",
    metaTitle: "Friends & Family for Runway",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Runway.",
    heroFor: "Runway",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Runway because hybrid pipelines still begin with plates, performances, and production design somebody has to shoot, and we'd rather be on the same side of the camera than pretend the camera isn't changing.",
    ticker:
      "Founded 2018 at NYU ITP · $315M Series E at $5.3B, Feb 2026 · Backed by General Atlantic, Nvidia, Fidelity, Adobe · ~$860M raised · Gen-4.5 video model · Lionsgate, first major studio AI deal · AIFF: 300 submissions year one, 6,000 in 2025",
    studio: {
      headline: "A production company built for the world Runway is simulating",
      subline: "Live-action plates for Gen-4.5 pipelines, directors who treat new models like new cameras, hybrid VFX, the list goes on.",
    },
    noticed: {
      title: "The roadmap is hybrid.",
      intro:
        "We use the tools, we watched the AIFF winners, and we read the Lionsgate coverage. Here's what stuck.",
      cards: [
        {
          label: "Plates still come first",
          body: "Lionsgate uses Runway for storyboards, backgrounds, and effects augmentation. Those pipelines still begin with plates, performances, and production design someone has to shoot well. That's the half we bring.",
        },
        {
          label: "Craft is the filter now",
          body: "AIFF went from 300 submissions to 6,000 in three years, with winners at Lincoln Center and in IMAX. At that scale the model is table stakes and craft is the filter, which is an argument for working with filmmakers, not around them.",
        },
        {
          label: "Studios staffs like us",
          body: "Runway Studios recruits creative producers and business affairs people, which is production company muscle. Partners who already have that muscle shorten the path, and we've been building it for fifteen years.",
        },
      ],
    },
    fit: {
      titlePlain: "Same side of",
      titleAccent: "the camera.",
      intro:
        "Runway builds the models. We shoot the world they learn from and the plates they build on. Hybrid live-action plus AI work needs both, made by peers.",
      gives: [
        ["Brief", "Hybrid brand films, AIFF-grade shorts, enterprise proof"],
        ["Production", "Directors and DPs for plates, shoots planned around model passes"],
        ["Deliverables", "Broadcast-grade films plus hybrid pipeline assets"],
        ["Audience", "Studios, agencies, the enterprise buyers you're courting"],
      ],
      tags: [
        "Hybrid production",
        "Live-action plates",
        "AI VFX",
        "Brand films",
        "Commercial craft",
        "Music videos",
        "Edit",
        "Delivery",
      ],
    },
  },

  "farmers-dog": {
    slug: "farmers-dog",
    accent: "#173B33",
    company: "The Farmer's Dog",
    recipientName: "Jonathan Regev",
    recipientFirst: "Jonathan",
    recipientEmail: "jregev@thefarmersdog.com",
    metaTitle: "Friends & Family for The Farmer's Dog",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for The Farmer's Dog.",
    heroFor: "The Farmer's Dog",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with The Farmer's Dog because you already make the most loved work in the category, and we'd come in as the kind of partner that work deserves: execution without ego, behind your creative leads.",
    ticker:
      "Founded 2015 in NYC · $1B+ annualized revenue · $10M+ monthly profits · 1 billion+ meals delivered · Forever was #1 on USA Today's Ad Meter · Emmy nominee, Outstanding Commercial · Revenue up 50% YoY",
    studio: {
      headline: "A production company built for the dog people",
      subline: "Casting real dogs, animal-safe sets, tabletop recipe launches, social cutdowns, the list goes on.",
    },
    noticed: {
      title: "You already buy craft.",
      intro:
        "We've watched Forever more times than we'd admit in a meeting. Here's what stuck, written as peers.",
      cards: [
        {
          label: "The bar is set",
          body: "Forever came from your in-house team with a director and won the Ad Meter in your Super Bowl debut, then got an Emmy nomination. You don't need convincing about production value. You need partners who clear the bar you already set.",
        },
        {
          label: "The org is scaling",
          body: "33 open roles including a Director of Art and Design. An in-house creative org that size needs production partners who plug in behind creative leads without slowing them down. That's a posture, and we hold it well.",
        },
        {
          label: "Story is the moat",
          body: "The company exists because of one sick Rottweiler, and the work still leads with that honesty: real dogs, long emotional arcs, patience. The next big swing should come from the same place.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "dog people.",
      intro:
        "You make the most loved work in the category and we'd come in as the partner that work deserves: big-swing films with the patience of Forever, and always-on assets shot to the same standard.",
      gives: [
        ["Brief", "Big-swing brand films plus always-on craft"],
        ["Production", "Dog casting and wrangling owned end to end, animal-safe sets"],
        ["Deliverables", "Broadcast films, social cutdowns, tabletop, stills"],
        ["Audience", "Dog people, which is to say most people"],
      ],
      tags: [
        "Brand films",
        "Dog casting",
        "Tabletop food",
        "Docu-style",
        "In-house friendly",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  ballers: {
    slug: "ballers",
    accent: "#303030",
    company: "Ballers",
    recipientName: "David Gutstadt",
    recipientFirst: "David",
    recipientEmail: "david.gutstadt@ballers-us.com",
    metaTitle: "Friends & Family for Ballers",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Ballers.",
    heroFor: "Ballers",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Ballers because you land in DTLA this year, minutes from us, and a national rollout needs one visual language instead of a new vendor per city.",
    ticker:
      "$20M Series A led by Sharp Alpha and RHC Group · Backed by Andre Agassi, David Blitzer, Tyrese Maxey, Sloane Stephens · 55,000 sq ft flagship in a converted Fishtown power plant · Boston Seaport's first padel courts · 100,000+ sq ft DTLA venue slated for 2026 · 50+ locations planned",
    studio: {
      headline: "A production company built for social sport",
      subline: "Opening films, venue anthems, padel rallies, league promos, menu close-ups, the list goes on.",
    },
    noticed: {
      title: "Every venue is a different film.",
      intro:
        "We read the Series A coverage and the expansion plan. Here's what stuck.",
      cards: [
        {
          label: "Three buildings, one brand",
          body: "Philadelphia is a converted 1920s power plant, Boston is outdoor courts that become an ice rink each winter, DTLA fills a former Macy's. One launch-film system has to carry three completely different rooms, and that's a fun problem.",
        },
        {
          label: "One volt accent",
          body: "The site is black, white, and gray with a single highlight green. That restraint is rare in sports hospitality, and the films should hold it instead of drowning it in highlight-reel clichés.",
        },
        {
          label: "Public, not private",
          body: "Despite the Fitler Club lineage, Ballers sells walk-up play and tiers from $120 a month. Come one, come ball recruits walk-ins, not just members, and the content has to feel like an open door.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "the next 47 openings.",
      intro:
        "DTLA lands first, minutes from us, and we'd document The Bloc from build-out to opening night. The result is a repeatable launch kit: one anthem plus cutdowns per city.",
      gives: [
        ["Brief", "DTLA opening film plus a repeatable city launch kit"],
        ["Production", "Sport plus hospitality in one crew, athlete-comfortable sets"],
        ["Deliverables", "Venue anthem, opening films, social cutdowns, stills"],
        ["Audience", "Walk-ins, members, and the next 47 cities"],
      ],
      tags: [
        "Venue openings",
        "Padel",
        "Athlete talent",
        "Hospitality",
        "Anthem films",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  polymarket: {
    slug: "polymarket",
    accent: "#1A1F23",
    company: "Polymarket",
    recipientName: "Shayne Coplan",
    recipientFirst: "Shayne",
    recipientEmail: "shayne@polymarket.com",
    metaTitle: "Friends & Family for Polymarket",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Polymarket.",
    heroFor: "Polymarket",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Polymarket because the footage that told the crypto story will not tell the NYSE story, and a brand org is being built right now with no production arm attached.",
    ticker:
      "$2B from ICE at a $9B valuation, Oct 2025 · ~$600M more from ICE, Mar 2026 · $3.3B+ traded on the 2024 election · Official prediction market of X · Relaunched in the US Dec 2025 · Founded June 2020 in a Lower East Side apartment · 47 open roles, 9 in marketing",
    studio: {
      headline: "A production company built for the world's largest prediction market",
      subline: "Markets on elections, rate cuts, championships, award shows, box office, the list goes on.",
    },
    noticed: {
      title: "Nine marketing roles open.",
      intro:
        "We read the ICE coverage and your job board. Here's what stuck.",
      cards: [
        {
          label: "A brand org, no production arm",
          body: "Head of Partnership Marketing, sports and creator partnership managers, a Creative Performance Strategist. You're building the engine and every one of those hires will need film the week they start.",
        },
        {
          label: "The institution pivot",
          body: "ICE's $2B made Polymarket data an NYSE-distributed institutional product. The story has to grow up without losing the energy that built it, and that's a directing problem more than a messaging one.",
        },
        {
          label: "Sports is the volume",
          body: "Roughly 63 percent of trades involve sports and you're hiring sports partnership marketing specifically. Those audiences are trained on broadcast-grade creative, and we've shot for ESPN for years.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "market speed.",
      intro:
        "We make brand films and performance creative for companies at this exact inflection: product proven, story growing up. One system covers the flagship film and the sports-speed cutdowns.",
      gives: [
        ["Brief", "Institution-era brand film plus sports-speed cutdowns"],
        ["Production", "Fast-turn crews timed to game calendars and market spikes"],
        ["Deliverables", "Flagship film, social packages, creator kits, ad variants"],
        ["Audience", "Traders, institutions, sports fans, the press"],
      ],
      tags: [
        "Brand film",
        "Sports promos",
        "Creator kits",
        "Performance ads",
        "Event spots",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },

  chobani: {
    slug: "chobani",
    accent: "#1A3C34",
    company: "Chobani",
    recipientName: "Hamdi Ulukaya",
    recipientFirst: "Hamdi",
    recipientEmail: "hamdi.ulukaya@chobani.com",
    metaTitle: "Friends & Family for Chobani",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Chobani.",
    heroFor: "Chobani",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Chobani because a $1.2B plant rising on a former Air Force base, staffed by a workforce nobody else would hire first, is documentary material, not ad copy.",
    ticker:
      "$20B valuation Oct 2025 · $650M raised · $3.8B expected 2025 sales, up 28% · $1.2B Rome NY plant, 1,000+ jobs · $500M Twin Falls expansion · La Colombe acquired 2023 · Daily Harvest acquired 2025 · Founded 2005 in a shuttered Kraft plant",
    studio: {
      headline: "A production company built for food with a founder's story behind it",
      subline: "Plant-floor documentary, tabletop with real appetite, culture films, retail spots, the list goes on.",
    },
    noticed: {
      title: "The Rome build.",
      intro:
        "We read the raise coverage and the plant announcements. Here's what stuck.",
      cards: [
        {
          label: "A multi-year story",
          body: "A $1.2B, 1.4 million square foot plant on the former Griffiss Air Force Base: 28 lines, a billion pounds of dairy a year, a thousand jobs. From groundbreaking to first cup is a multi-year documentary, and it should have cameras from day one.",
        },
        {
          label: "A workforce worth filming",
          body: "Your plants employ refugees from across the world and Tent now counts 350-plus member companies. That's documentary material told with restraint, not ad copy, and it's the most human story in American food.",
        },
        {
          label: "A house of brands now",
          body: "La Colombe, Daily Harvest, oat milk, creamers. Each needs its own look from tabletop to founder film, which argues for one production partner who can hold the family together without flattening it.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for",
      titleAccent: "the way Chobani tells it.",
      intro:
        "You make food the right way and tell stories the plain way. We shoot both, from the shepherd-to-$20B founder arc to the Rome plant floor to the tabletop.",
      gives: [
        ["Brief", "Founder film, plant-floor doc, multi-brand system"],
        ["Production", "Documentary crews, upstate NY to Idaho, tabletop craft"],
        ["Deliverables", "Brand films, retail spots, culture films, stills"],
        ["Audience", "Grocery America, plus the people you hire and feed"],
      ],
      tags: [
        "Founder story",
        "Plant-floor doc",
        "Tabletop",
        "Multi-brand",
        "Culture films",
        "Retail spots",
        "Edit",
        "Delivery",
      ],
    },
  },

  wonder: {
    slug: "wonder",
    accent: "#044123",
    company: "Wonder",
    recipientName: "Marc Lore",
    recipientFirst: "Marc",
    recipientEmail: "mlore@wonder.com",
    metaTitle: "Friends & Family for Wonder",
    metaDescription:
      "Friends & Family directors, production, edit, motion, and delivery for Wonder.",
    heroFor: "Wonder",
    heroWhy:
      "Our clients are Callaway, ESPN, Nike, Apple, Ford, Netflix, and Gillette. We'd love to work with Wonder because you're opening a location a week while building toward a March 2027 IPO date that's written on the office whiteboards, and that pace needs a film system, not one-off shoots.",
    ticker:
      "$600M raised at $7B+, May 2025 · Acquired Grubhub for $650M · ~110 locations, 200+ targeted by end of 2026 · Roughly one opening a week · ~30 chef-driven concepts per kitchen · José Andrés on the board · Acquired Tastemade · IPO-ready target March 31, 2027",
    studio: {
      headline: "A production company built for the mealtime super app",
      subline: "Market-by-market launch films, chef partner spots, Grubhub tie-ins, IPO-era brand anthems, the list goes on.",
    },
    noticed: {
      title: "A location a week.",
      intro:
        "We read the funding coverage and the IPO interview. Here's what stuck.",
      cards: [
        {
          label: "The drumbeat",
          body: "Doubling from 110 to 200-plus locations by the end of 2026 means a constant stream of new neighborhoods, and each opening is a moment that needs content. That cadence rewards a repeatable launch-film kit, not scrambled coverage.",
        },
        {
          label: "Video is already strategy",
          body: "You bought Tastemade so viewers can watch a chef make a dish and then order it. The content-to-commerce loop is core to the model, not decoration, which makes the production partner a strategic seat.",
        },
        {
          label: "Talent on the menu",
          body: "Bobby Flay, Marcus Samuelsson, Nancy Silverton, José Andrés on the board. Name-brand chefs at the center demands talent-comfortable, craft-level sets, and that's the room we work in every week.",
        },
      ],
    },
    fit: {
      titlePlain: "Built for the pace of",
      titleAccent: "one opening a week.",
      intro:
        "Wonder is scaling food, logistics, media, and chef talent at once, with an IPO date on the whiteboard. We make the films that keep up, from market openers to the anthem an IPO-bound company leads with.",
      gives: [
        ["Brief", "Launch-film kit, chef spots, the IPO-era anthem"],
        ["Production", "Talent-comfortable sets, market-by-market crews"],
        ["Deliverables", "Openers per market, brand anthem, social cutdowns"],
        ["Audience", "New neighborhoods, app users, the Street in 2027"],
      ],
      tags: [
        "Launch films",
        "Chef talent",
        "Brand anthem",
        "Food craft",
        "App promos",
        "Social cutdowns",
        "Edit",
        "Delivery",
      ],
    },
  },
};

export const PITCH_SLUGS = Object.keys(PITCH_COMPANIES);
