/**
 * Curated list of ~200 commercial production companies.
 * Territory derived from HQ location using AICP standard regions:
 *   EAST     — NY, NJ, CT, MA, PA, etc.
 *   SOUTHEAST — GA, FL, NC, TN, etc.
 *   MIDWEST  — IL, MI, MN, OH, etc.
 *   SOUTHWEST — TX, LA, OK, etc.
 *   WEST     — CA, OR, WA, CO, etc.
 *
 * Many companies are simplified to the 3-territory model reps use:
 *   EAST, MIDWEST, WEST  (Southeast folds into East, Southwest into West or Midwest)
 */

export interface ProductionCompany {
  name: string;
  territory: "EAST" | "MIDWEST" | "WEST";
  city: string;
  website?: string;
  instagram?: string;
}

export const PRODUCTION_COMPANIES: ProductionCompany[] = [
  // ── WEST (LA / SF / Portland / Seattle) ────────────────────
  { name: "MJZ", territory: "WEST", city: "Los Angeles", website: "https://mjz.com", instagram: "mjz_directors" },
  { name: "Biscuit Filmworks", territory: "WEST", city: "Los Angeles", website: "https://bfreps.com", instagram: "biscuitfilmworks" },
  { name: "Prettybird", territory: "WEST", city: "Los Angeles", website: "https://prettybird.com", instagram: "prettybird" },
  { name: "Smuggler", territory: "WEST", city: "Los Angeles", website: "https://smugglersite.com", instagram: "smugglersite" },
  { name: "Stink Films", territory: "WEST", city: "Los Angeles", website: "https://stinkfilms.com", instagram: "stinkfilms" },
  { name: "Anonymous Content", territory: "WEST", city: "Los Angeles", website: "https://anonymouscontent.com", instagram: "anonymouscontent" },
  { name: "RSA Films", territory: "WEST", city: "Los Angeles", website: "https://rsafilms.com", instagram: "rsafilms" },
  { name: "Radical Media", territory: "WEST", city: "Los Angeles", website: "https://radicalmedia.com", instagram: "radicalmedia" },
  { name: "Epoch Films", territory: "WEST", city: "Los Angeles", website: "https://epochfilms.com", instagram: "epochfilms" },
  { name: "Park Pictures", territory: "WEST", city: "Los Angeles", website: "https://parkpictures.com", instagram: "parkpictures" },
  { name: "Tool of North America", territory: "WEST", city: "Los Angeles", website: "https://toolofna.com", instagram: "toolofna" },
  { name: "Reset", territory: "WEST", city: "Los Angeles", website: "https://resetcontent.com", instagram: "resetcontent" },
  { name: "Caviar", territory: "WEST", city: "Los Angeles", website: "https://caviar.tv", instagram: "caviarcontent" },
  { name: "Doomsday Entertainment", territory: "WEST", city: "Los Angeles", website: "https://doomsdayent.com", instagram: "doomsdayent" },
  { name: "Object & Animal", territory: "WEST", city: "Los Angeles", website: "https://objectandanimal.com", instagram: "objectandanimal" },
  { name: "Kaboom Productions", territory: "WEST", city: "Los Angeles", website: "https://kaboomproductions.com", instagram: "kaboomproductions" },
  { name: "Honor Society", territory: "WEST", city: "Los Angeles", website: "https://honorsociety.com", instagram: "honorsociety" },
  { name: "Arts & Sciences", territory: "WEST", city: "Los Angeles", website: "https://artsandsciences.la", instagram: "artsandsciencesla" },
  { name: "Somesuch", territory: "WEST", city: "Los Angeles", website: "https://somesuch.co", instagram: "somesuch" },
  { name: "Rattling Stick", territory: "WEST", city: "Los Angeles", website: "https://rattlingstick.com", instagram: "rattlingstick" },
  { name: "Moxie Pictures", territory: "WEST", city: "Los Angeles", website: "https://moxiepictures.com", instagram: "moxiepictures" },
  { name: "Gifted Youth", territory: "WEST", city: "Los Angeles", website: "https://giftedyouth.co", instagram: "giftedyouth" },
  { name: "Superprime", territory: "WEST", city: "Los Angeles", website: "https://superprime.com", instagram: "superprime" },
  { name: "Believe Media", territory: "WEST", city: "Los Angeles", website: "https://believemedia.com", instagram: "believemedia" },
  { name: "1stAveMachine", territory: "WEST", city: "Los Angeles", website: "https://1stavemachine.com", instagram: "1stavemachine" },
  { name: "Revolver", territory: "WEST", city: "Los Angeles", website: "https://revolver.ca", instagram: "revolverfilms" },
  { name: "Sanctuary", territory: "WEST", city: "Los Angeles", website: "https://sanctuaryus.com", instagram: "sanctuaryus" },
  { name: "Ridley Scott Creative Group", territory: "WEST", city: "Los Angeles", website: "https://rsafilms.com" },
  { name: "Hungry Man", territory: "WEST", city: "Los Angeles", website: "https://hungryman.com", instagram: "hungrymanproductions" },
  { name: "Iconoclast", territory: "WEST", city: "Los Angeles", website: "https://iconoclast.tv", instagram: "iconoclast.tv" },
  { name: "Pulse Films", territory: "WEST", city: "Los Angeles", website: "https://pulsefilms.com", instagram: "pulsefilms" },
  { name: "Bullitt", territory: "WEST", city: "Los Angeles", website: "https://bullittla.com", instagram: "bullittla" },
  { name: "Interrogate", territory: "WEST", city: "Los Angeles", website: "https://interrogate.com", instagram: "interrogate" },
  { name: "O Positive", territory: "WEST", city: "Los Angeles", website: "https://opositivefilms.com", instagram: "opositive" },
  { name: "Furlined", territory: "WEST", city: "Los Angeles", website: "https://furlined.com", instagram: "furlined" },
  { name: "Craft", territory: "WEST", city: "Los Angeles", website: "https://craftfilms.com" },
  { name: "Dummy", territory: "WEST", city: "Los Angeles", website: "https://dummyfilms.com", instagram: "dummyfilms" },
  { name: "Jojx", territory: "WEST", city: "Los Angeles", website: "https://jojx.co", instagram: "jojx.co" },
  { name: "Pretty Bird", territory: "WEST", city: "Los Angeles", website: "https://prettybird.com", instagram: "prettybird" },
  { name: "Blacklist", territory: "WEST", city: "Los Angeles", website: "https://blacklistfilm.com", instagram: "blacklistfilm" },
  { name: "Station Film", territory: "WEST", city: "Los Angeles", website: "https://stationfilm.com", instagram: "stationfilm" },
  { name: "Skunk", territory: "WEST", city: "Los Angeles", website: "https://skunk.tv", instagram: "skunk.tv" },
  { name: "Greenpoint Pictures", territory: "WEST", city: "Los Angeles", website: "https://greenpointpictures.com", instagram: "greenpointpictures" },
  { name: "Serial Pictures", territory: "WEST", city: "Los Angeles", website: "https://serialpictures.com" },
  { name: "Little Minx", territory: "WEST", city: "Los Angeles", website: "https://littleminx.tv", instagram: "littleminx.tv" },
  { name: "Chelsea Pictures", territory: "WEST", city: "Los Angeles", website: "https://chelseapictures.com", instagram: "chelseapictures" },
  { name: "Division7", territory: "WEST", city: "Los Angeles", website: "https://division7.com", instagram: "division7" },
  { name: "Golden", territory: "WEST", city: "Los Angeles", website: "https://goldencontent.com", instagram: "goldencontent" },
  { name: "Tessa Films", territory: "WEST", city: "Los Angeles", website: "https://tessafilms.com" },
  { name: "Good Behavior", territory: "WEST", city: "Los Angeles", website: "https://goodbehavior.film", instagram: "goodbehavior.film" },
  // Portland
  { name: "Wieden+Kennedy Entertainment", territory: "WEST", city: "Portland" },
  { name: "Joint", territory: "WEST", city: "Portland", website: "https://jointproductions.com", instagram: "jointproductions" },
  // San Francisco
  { name: "Wild Plum", territory: "WEST", city: "San Francisco" },
  // Colorado / Denver
  { name: "RadicalMedia West", territory: "WEST", city: "Denver" },

  // ── EAST (NYC / Philly / Boston) ─────────────────────────
  { name: "Hungry Man East", territory: "EAST", city: "New York", website: "https://hungryman.com", instagram: "hungrymanproductions" },
  { name: "O Positive East", territory: "EAST", city: "New York", website: "https://opositivefilms.com" },
  { name: "1stAveMachine East", territory: "EAST", city: "New York" },
  { name: "Partizan", territory: "EAST", city: "New York", website: "https://partizan.com", instagram: "partizan" },
  { name: "Anonymous Content East", territory: "EAST", city: "New York" },
  { name: "Smuggler East", territory: "EAST", city: "New York" },
  { name: "Radical Media East", territory: "EAST", city: "New York" },
  { name: "Epoch Films East", territory: "EAST", city: "New York" },
  { name: "Park Pictures East", territory: "EAST", city: "New York" },
  { name: "Morton Jankel Zander", territory: "EAST", city: "New York" },
  { name: "Psyop", territory: "EAST", city: "New York", website: "https://psyop.com", instagram: "psyop" },
  { name: "The Directors Bureau", territory: "EAST", city: "New York", website: "https://thedirectorsbureau.com" },
  { name: "HSI Productions", territory: "EAST", city: "New York", website: "https://hsiproductions.com", instagram: "hsiproductions" },
  { name: "Supply & Demand", territory: "EAST", city: "New York", website: "https://supplyanddemand.tv", instagram: "supplyanddemand.tv" },
  { name: "Knucklehead", territory: "EAST", city: "New York", website: "https://knuckleheadusa.com", instagram: "knuckleheadusa" },
  { name: "Artery Industries", territory: "EAST", city: "New York", website: "https://arteryindustries.com", instagram: "arteryindustries" },
  { name: "Chromista", territory: "EAST", city: "New York", website: "https://chromista.com", instagram: "chromista" },
  { name: "Wondros", territory: "EAST", city: "New York", website: "https://wondros.com", instagram: "wondros" },
  { name: "Stink Studios", territory: "EAST", city: "New York", website: "https://stinkstudios.com", instagram: "stinkstudios" },
  { name: "Luckychap Entertainment", territory: "EAST", city: "New York", website: "https://luckychap.co", instagram: "luckychap" },
  { name: "Smuggler Films East", territory: "EAST", city: "New York" },
  { name: "Habana Films", territory: "EAST", city: "New York", website: "https://habanafilms.com" },
  { name: "Cortez Brothers", territory: "EAST", city: "New York", website: "https://cortezbrothers.com", instagram: "cortezbrothers" },
  { name: "Bossa Nova Films", territory: "EAST", city: "New York", website: "https://bossanovafilms.com" },
  { name: "MPC Creative", territory: "EAST", city: "New York" },
  { name: "Riff Raff Films", territory: "EAST", city: "New York", website: "https://riffrafffilms.tv", instagram: "riffrafffilms" },
  { name: "Rattling Stick East", territory: "EAST", city: "New York" },
  { name: "Somesuch East", territory: "EAST", city: "New York" },
  { name: "Park Pictures East", territory: "EAST", city: "New York" },
  { name: "Caviar East", territory: "EAST", city: "New York" },
  // Atlanta (Southeast → East for 3-territory)
  { name: "BARK BARK", territory: "EAST", city: "Atlanta", website: "https://barkbark.tv" },
  { name: "Believe Media East", territory: "EAST", city: "Atlanta" },
  // Miami
  { name: "Landia", territory: "EAST", city: "Miami", website: "https://landia.com", instagram: "landia" },
  { name: "Central Films", territory: "EAST", city: "Miami", website: "https://centralfilms.com", instagram: "centralfilms" },

  // ── MIDWEST (Chicago / Minneapolis / Detroit) ─────────────
  { name: "Tessa Films Midwest", territory: "MIDWEST", city: "Chicago" },
  { name: "Backyard Productions", territory: "MIDWEST", city: "Chicago", website: "https://backyardprod.com", instagram: "backyardproductions" },
  { name: "Lord + Thomas Content", territory: "MIDWEST", city: "Chicago" },
  { name: "Escape Pod", territory: "MIDWEST", city: "Chicago", website: "https://escapepodfilms.com" },
  { name: "Fur Coat Club", territory: "MIDWEST", city: "Chicago" },
  { name: "STORY", territory: "MIDWEST", city: "Chicago", website: "https://storyfilms.tv", instagram: "storyfilms.tv" },
  { name: "Table Top", territory: "MIDWEST", city: "Chicago", website: "https://tabletopfilms.com" },
  { name: "Think Tank", territory: "MIDWEST", city: "Chicago" },
  { name: "Optimus", territory: "MIDWEST", city: "Chicago", website: "https://optimus.com", instagram: "optimuschicago" },
  { name: "Republic Productions", territory: "MIDWEST", city: "Chicago" },
  // Minneapolis
  { name: "Periscope", territory: "MIDWEST", city: "Minneapolis" },
  { name: "Woodshop", territory: "MIDWEST", city: "Minneapolis" },
  // Detroit
  { name: "Motor Content", territory: "MIDWEST", city: "Detroit" },
  { name: "Doner Productions", territory: "MIDWEST", city: "Detroit" },
  // Texas (Southwest → Midwest for 3-territory)
  { name: "Dirk Rough Films", territory: "MIDWEST", city: "Dallas" },
  { name: "Matte Black", territory: "MIDWEST", city: "Austin" },
  { name: "Republic Films Dallas", territory: "MIDWEST", city: "Dallas" },

  // ── International companies with US presence ──────────────
  { name: "Academy Films", territory: "WEST", city: "Los Angeles", website: "https://academyfilms.com", instagram: "academyfilms" },
  { name: "Colonel Blimp", territory: "EAST", city: "New York", website: "https://colonelblimp.com", instagram: "colonelblimp" },
  { name: "Saville Productions", territory: "WEST", city: "Los Angeles", website: "https://savilleproductions.com" },
  { name: "Hamlet", territory: "WEST", city: "Los Angeles", website: "https://hamlet.us", instagram: "hamlet.us" },
  { name: "DIVISION", territory: "WEST", city: "Los Angeles", website: "https://divisionparis.com", instagram: "divisionparis" },
  { name: "Iconoclast US", territory: "WEST", city: "Los Angeles" },
  { name: "Stink Films US", territory: "WEST", city: "Los Angeles" },
  { name: "Rogue Films", territory: "EAST", city: "New York", website: "https://roguefilms.com", instagram: "roguefilms" },
  { name: "Academy Films US", territory: "WEST", city: "Los Angeles" },
  { name: "Blink Productions", territory: "WEST", city: "Los Angeles", website: "https://blinkprods.com", instagram: "blinkproductions" },
  { name: "Nexus Studios", territory: "EAST", city: "New York", website: "https://nexusstudios.com", instagram: "nexusstudios" },
  { name: "Great Guns", territory: "WEST", city: "Los Angeles", website: "https://greatgunsltd.com", instagram: "greatguns" },
  { name: "Smuggler London", territory: "EAST", city: "New York" },
  { name: "Wanda Productions", territory: "EAST", city: "New York", website: "https://wandaproductions.com", instagram: "wandaproductions" },
  { name: "Framestore", territory: "EAST", city: "New York", website: "https://framestore.com", instagram: "framestore" },
  { name: "Nexus Studios West", territory: "WEST", city: "Los Angeles" },
  { name: "Manor House", territory: "WEST", city: "Los Angeles" },

  // ── Additional WEST companies ───────────────────────────────
  { name: "Durable Goods", territory: "WEST", city: "Los Angeles", website: "https://durablegoods.co", instagram: "durablegoods" },
  { name: "Nonfiction", territory: "WEST", city: "Los Angeles", website: "https://nonfiction.la", instagram: "nonfiction.la" },
  { name: "Merman", territory: "WEST", city: "Los Angeles", website: "https://merman.tv", instagram: "merman.tv" },
  { name: "Smuggler West", territory: "WEST", city: "Los Angeles" },
  { name: "Biscuit West", territory: "WEST", city: "Los Angeles" },
  { name: "Soft Citizen", territory: "WEST", city: "Los Angeles", website: "https://softcitizen.com", instagram: "softcitizen" },
  { name: "Untitled", territory: "WEST", city: "Los Angeles", website: "https://untitled.tv" },
  { name: "Somesuch West", territory: "WEST", city: "Los Angeles" },
  { name: "Serviceplan", territory: "WEST", city: "Los Angeles" },
  { name: "Park Village", territory: "WEST", city: "Los Angeles", website: "https://parkvillage.co" },
  { name: "Riff Raff West", territory: "WEST", city: "Los Angeles" },
  { name: "Reset Content", territory: "WEST", city: "Los Angeles", website: "https://resetcontent.com" },
  { name: "Iconoclast West", territory: "WEST", city: "Los Angeles" },
  { name: "Smuggler LA", territory: "WEST", city: "Los Angeles" },
  { name: "m ss ng p eces", territory: "WEST", city: "Los Angeles", website: "https://mssngpeces.com", instagram: "mssngpeces" },
  { name: "Black Dog Films", territory: "WEST", city: "Los Angeles", website: "https://blackdogfilms.com", instagram: "blackdogfilms" },
  { name: "London Alley", territory: "WEST", city: "Los Angeles", website: "https://londonalley.com", instagram: "londonalley" },
  { name: "Ways & Means", territory: "WEST", city: "Los Angeles", website: "https://waysandmeans.tv" },
  { name: "Outsider", territory: "WEST", city: "Los Angeles", website: "https://outsider.tv", instagram: "outsider" },
  { name: "Sibling Rivalry", territory: "WEST", city: "Los Angeles", website: "https://siblingrivalry.com", instagram: "siblingrivalrystudio" },
  { name: "Cut+Run", territory: "WEST", city: "Los Angeles", website: "https://cutandrun.com", instagram: "cutandrun" },
  { name: "Gentleman Scholar", territory: "WEST", city: "Los Angeles", website: "https://gentlemanscholar.com" },
  { name: "Community Films", territory: "WEST", city: "Los Angeles", website: "https://communityfilms.com" },

  // ── Additional EAST companies ──────────────────────────────
  { name: "Modest", territory: "EAST", city: "New York", website: "https://modest.tv" },
  { name: "Serial Pictures East", territory: "EAST", city: "New York" },
  { name: "Bullitt East", territory: "EAST", city: "New York" },
  { name: "Durable Goods East", territory: "EAST", city: "New York" },
  { name: "Scouts", territory: "EAST", city: "New York", website: "https://scouts.tv" },
  { name: "Hungry Man NYC", territory: "EAST", city: "New York" },
  { name: "Nonfiction East", territory: "EAST", city: "New York" },
  { name: "Merman East", territory: "EAST", city: "New York" },
  { name: "Great Guns East", territory: "EAST", city: "New York" },
  { name: "Kaboom East", territory: "EAST", city: "New York" },
  { name: "Arts & Sciences East", territory: "EAST", city: "New York" },
  { name: "Tool East", territory: "EAST", city: "New York" },
  { name: "Gifted Youth East", territory: "EAST", city: "New York" },
  { name: "BARK BARK East", territory: "EAST", city: "New York" },
  { name: "Honor Society East", territory: "EAST", city: "New York" },
  { name: "Object & Animal East", territory: "EAST", city: "New York" },
  { name: "Reset East", territory: "EAST", city: "New York" },
  { name: "Soft Citizen East", territory: "EAST", city: "New York" },
  { name: "Black Dog Films East", territory: "EAST", city: "New York" },
  { name: "m ss ng p eces East", territory: "EAST", city: "New York" },
  { name: "Ways & Means East", territory: "EAST", city: "New York" },

  // ── Additional MIDWEST companies ───────────────────────────
  { name: "Bullitt Midwest", territory: "MIDWEST", city: "Chicago" },
  { name: "Arts & Sciences Midwest", territory: "MIDWEST", city: "Chicago" },
  { name: "Tool Midwest", territory: "MIDWEST", city: "Chicago" },
  { name: "Republic Films", territory: "MIDWEST", city: "Chicago" },
  { name: "MJZ Midwest", territory: "MIDWEST", city: "Chicago" },
];

/**
 * Map a city or state string to the 3-territory model.
 */
export function cityToTerritory(city: string): "EAST" | "MIDWEST" | "WEST" | null {
  const c = city.toLowerCase().trim();

  // West coast
  if (["los angeles", "la", "san francisco", "sf", "portland", "seattle", "denver", "san diego", "phoenix", "las vegas", "salt lake city", "honolulu"].includes(c)) return "WEST";
  if (["california", "oregon", "washington", "colorado", "arizona", "nevada", "utah", "hawaii", "alaska", "idaho", "montana", "wyoming", "new mexico"].includes(c)) return "WEST";

  // East
  if (["new york", "nyc", "brooklyn", "manhattan", "boston", "philadelphia", "miami", "atlanta", "charlotte", "richmond", "nashville", "washington dc", "dc"].includes(c)) return "EAST";
  if (["new york", "new jersey", "connecticut", "massachusetts", "pennsylvania", "maryland", "virginia", "georgia", "florida", "north carolina", "south carolina", "tennessee", "maine", "vermont", "new hampshire", "rhode island", "delaware", "kentucky", "alabama", "mississippi", "west virginia"].includes(c)) return "EAST";

  // Midwest
  if (["chicago", "minneapolis", "detroit", "milwaukee", "st. louis", "kansas city", "dallas", "austin", "houston", "indianapolis", "columbus", "cleveland", "cincinnati"].includes(c)) return "MIDWEST";
  if (["illinois", "michigan", "minnesota", "ohio", "wisconsin", "indiana", "iowa", "missouri", "kansas", "nebraska", "north dakota", "south dakota", "texas", "oklahoma", "arkansas", "louisiana"].includes(c)) return "MIDWEST";

  return null;
}

/**
 * Look up territory for a production company by name.
 * Uses fuzzy matching: exact first, then "contains" for partial names.
 */
export function companyTerritory(companyName: string): "EAST" | "MIDWEST" | "WEST" | null {
  const lower = companyName.toLowerCase().trim();
  // Exact match first
  const exact = PRODUCTION_COMPANIES.find(
    (c) => c.name.toLowerCase() === lower
  );
  if (exact) return exact.territory;

  // Fuzzy: input contains a known company name, or vice versa
  const fuzzy = PRODUCTION_COMPANIES.find(
    (c) => lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower)
  );
  return fuzzy?.territory ?? null;
}

/**
 * Map major US agencies to territory by HQ location.
 * Used as fallback when no production company is available.
 */
const AGENCY_TERRITORIES: Record<string, "EAST" | "MIDWEST" | "WEST"> = {
  // NYC / East
  "bbdo": "EAST", "bbdo new york": "EAST",
  "ddb": "EAST", "ddb new york": "EAST",
  "ogilvy": "EAST", "ogilvy new york": "EAST",
  "mccann": "EAST", "mccann new york": "EAST",
  "grey": "EAST", "grey new york": "EAST",
  "jwt": "EAST", "fcb": "EAST", "fcb new york": "EAST",
  "havas": "EAST", "havas new york": "EAST",
  "r/ga": "EAST", "huge": "EAST", "akqa": "EAST",
  "mother": "EAST", "anomaly": "EAST",
  "droga5": "EAST", "johannes leonardo": "EAST",
  "wunderman thompson": "EAST", "vml": "EAST", "vmly&r": "EAST",
  "translation": "EAST", "mischief": "EAST",
  "edelman": "EAST", "edelman new york": "EAST",
  "saatchi": "EAST", "saatchi & saatchi": "EAST",
  "publicis": "EAST", "publicis new york": "EAST",
  "tbwa": "EAST", "dentsu creative": "EAST",
  "gut": "EAST", "gut miami": "EAST",
  "the community": "EAST", "alma": "EAST",
  "gallegos united": "EAST", "la comunidad": "EAST",
  "david": "EAST", "david miami": "EAST",
  "bbh": "EAST", "bbh usa": "EAST", "bbh new york": "EAST",
  "mullenlowe": "EAST", "deutsch": "EAST",
  "the martin agency": "EAST", "arnold worldwide": "EAST",
  "hill holliday": "EAST",
  // West / LA / Portland
  "wieden+kennedy": "WEST", "w+k": "WEST",
  "72andsunny": "WEST", "tbwa\\chiat\\day": "WEST",
  "tbwa\\media arts lab": "WEST", "media arts lab": "WEST",
  "goodby silverstein": "WEST", "goodby silverstein & partners": "WEST",
  "crispin porter bogusky": "WEST", "cpb": "WEST",
  "special group": "WEST", "preacher": "WEST",
  "in-house": "WEST",
  // Chicago / Midwest
  "leo burnett": "MIDWEST", "leo burnett chicago": "MIDWEST",
  "fcb chicago": "MIDWEST", "energy bbdo": "MIDWEST",
  "ddb chicago": "MIDWEST", "highdive": "MIDWEST",
  "erich & kallman": "MIDWEST", "mckinney": "MIDWEST",
  "360i": "MIDWEST",
};

export function agencyTerritory(agencyName: string): "EAST" | "MIDWEST" | "WEST" | null {
  const lower = agencyName.toLowerCase().trim();
  // Exact match
  if (AGENCY_TERRITORIES[lower]) return AGENCY_TERRITORIES[lower];
  // Fuzzy: check if any known agency name is contained
  for (const [key, territory] of Object.entries(AGENCY_TERRITORIES)) {
    if (lower.includes(key) || key.includes(lower)) return territory;
  }
  return null;
}
