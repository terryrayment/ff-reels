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
};

export const PITCH_SLUGS = Object.keys(PITCH_COMPANIES);
