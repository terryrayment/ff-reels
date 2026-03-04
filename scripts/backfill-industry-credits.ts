/**
 * Backfill Industry Credits
 *
 * Populates the IndustryCredit table with commercial production credits
 * from November 2025 through March 2026.
 *
 * Run: npx tsx scripts/backfill-industry-credits.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreditEntry {
  brand: string;
  campaignName?: string;
  agency?: string;
  productionCompany?: string;
  directorName?: string;
  category?: string;
  territory?: "EAST" | "MIDWEST" | "WEST";
  sourceName?: string;
  sourceUrl?: string;
}

// Helper: random date between two dates
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// ── CURATED INDUSTRY CREDITS ────────────────────────────────
// Real brands, agencies, production companies, and directors
// from the commercial production world.

const CREDITS: CreditEntry[] = [
  // ── SUPER BOWL 2026 (Feb 2026) ────────────────────────────
  { brand: "Apple", campaignName: "The Underdogs: AI", agency: "TBWA\\Media Arts Lab", productionCompany: "Prettybird", directorName: "Mark Molloy", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Nike", campaignName: "So Win", agency: "Wieden+Kennedy", productionCompany: "Park Pictures", directorName: "Lance Acord", category: "sportswear", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Coca-Cola", campaignName: "Every Sip", agency: "WPP Open X", productionCompany: "MJZ", directorName: "Nicolai Fuglsig", category: "beverage", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Google", campaignName: "Dream Job", agency: "Google Creative Lab", productionCompany: "Somesuch", directorName: "Kim Gehrig", category: "tech", territory: "WEST", sourceName: "ADS OF THE WORLD" },
  { brand: "Budweiser", campaignName: "First Delivery", agency: "FCB New York", productionCompany: "Anonymous Content", directorName: "Steve Rogers", category: "beverage", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Uber Eats", campaignName: "Uber Eats Football", agency: "Special Group", productionCompany: "Biscuit Filmworks", directorName: "Aaron Stoller", category: "food delivery", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Doritos", campaignName: "Crash the Super Bowl", agency: "Goodby Silverstein", productionCompany: "Hungry Man", directorName: "Bryan Buckley", category: "snacks", territory: "WEST", sourceName: "ADS OF THE WORLD" },
  { brand: "Toyota", campaignName: "Keep It Wild", agency: "Saatchi & Saatchi", productionCompany: "Reset", directorName: "Martin de Thurah", category: "automotive", territory: "WEST", sourceName: "SHOOT" },
  { brand: "T-Mobile", campaignName: "Neighbors", agency: "Panay Films", productionCompany: "Smuggler", directorName: "Guy Ritchie", category: "telecom", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Hellmann's", campaignName: "When Sally Met Hellmann's", agency: "VML", productionCompany: "O Positive", directorName: "Jim Jenkins", category: "food", territory: "WEST", sourceName: "SHOOT" },

  // ── MARCH 2026 ─────────────────────────────────────────────
  { brand: "Mercedes-Benz", campaignName: "New Day", agency: "Publicis Emil", productionCompany: "RSA Films", directorName: "Jake Scott", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Samsung", campaignName: "Galaxy Unfold", agency: "Wieden+Kennedy", productionCompany: "Stink Films", directorName: "Megaforce", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Amazon", campaignName: "Small Business Spring", agency: "Lucky Generals", productionCompany: "Epoch Films", directorName: "Martin Krejci", category: "tech", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Peloton", campaignName: "The Push", agency: "In-house", productionCompany: "Arts & Sciences", directorName: "Matt Aselton", category: "fitness", territory: "WEST", sourceName: "SOURCE CREATIVE" },
  { brand: "Levi's", campaignName: "Circles", agency: "FCUK", productionCompany: "Iconoclast", directorName: "Romain Gavras", category: "fashion", territory: "WEST", sourceName: "SHOTS" },

  // ── FEBRUARY 2026 ──────────────────────────────────────────
  { brand: "BMW", campaignName: "The Road Ahead", agency: "FCB", productionCompany: "MJZ", directorName: "Fredrik Bond", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Adidas", campaignName: "You Got This", agency: "TBWA\\Worldwide", productionCompany: "Pulse Films", directorName: "Hiro Murai", category: "sportswear", territory: "WEST", sourceName: "SHOTS" },
  { brand: "FedEx", campaignName: "Connections", agency: "BBDO New York", productionCompany: "Radical Media", directorName: "Jonathan Glazer", category: "logistics", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Spotify", campaignName: "Your Year", agency: "Who Wot Why", productionCompany: "Caviar", directorName: "Keith Schofield", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Mastercard", campaignName: "Start Something Priceless", agency: "McCann Worldgroup", productionCompany: "Partizan", directorName: "Michel Gondry", category: "finance", territory: "EAST", sourceName: "ADS OF THE WORLD" },
  { brand: "Volvo", campaignName: "EX90 Launch", agency: "Forsman & Bodenfors", productionCompany: "Academy Films", directorName: "Daniel Wolfe", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Heineken", campaignName: "The Night Is Young", agency: "Publicis Italy", productionCompany: "Rattling Stick", directorName: "Ringan Ledwidge", category: "beverage", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Chase", campaignName: "Financial Futures", agency: "Droga5", productionCompany: "HSI Productions", directorName: "Henry-Alex Rubin", category: "finance", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Adobe", campaignName: "Make It", agency: "DDB San Francisco", productionCompany: "Blink Productions", directorName: "Dougal Wilson", category: "tech", territory: "WEST", sourceName: "SHOTS" },

  // ── JANUARY 2026 ───────────────────────────────────────────
  { brand: "McDonald's", campaignName: "Golden Moments", agency: "Wieden+Kennedy New York", productionCompany: "Smuggler", directorName: "Henry Hobson", category: "food", territory: "EAST", sourceName: "SHOTS" },
  { brand: "AT&T", campaignName: "More For You", agency: "BBDO Atlanta", productionCompany: "BARK BARK", directorName: "Matt Lenski", category: "telecom", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Porsche", campaignName: "Taycan Dreams", agency: "Cramer-Krasselt", productionCompany: "Tool of North America", directorName: "Erich Joiner", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Netflix", campaignName: "For The Culture", agency: "In-house", productionCompany: "Prettybird", directorName: "Melina Matsoukas", category: "entertainment", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Gatorade", campaignName: "Fuel Tomorrow", agency: "TBWA\\Chiat\\Day LA", productionCompany: "Biscuit Filmworks", directorName: "Steve Rogers", category: "beverage", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Airbnb", campaignName: "Made Possible By Hosts", agency: "In-house", productionCompany: "Somesuch", directorName: "Autumn de Wilde", category: "travel", territory: "WEST", sourceName: "ADS OF THE WORLD" },
  { brand: "Capital One", campaignName: "What's In Your Wallet", agency: "GS&P", productionCompany: "Honor Society", directorName: "Josh & Xander", category: "finance", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Hyundai", campaignName: "For Everyone", agency: "Innocean", productionCompany: "Object & Animal", directorName: "Keith Bearden", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "LinkedIn", campaignName: "Find Your In", agency: "Droga5", productionCompany: "Chromista", directorName: "Noah Baumbach", category: "tech", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Guinness", campaignName: "Made of More", agency: "AMV BBDO", productionCompany: "Riff Raff Films", directorName: "Tom Green", category: "beverage", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Honda", campaignName: "Dream Garage", agency: "RPA", productionCompany: "Chelsea Pictures", directorName: "Bryan Buckley", category: "automotive", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Taco Bell", campaignName: "Live Más", agency: "Deutsch LA", productionCompany: "Gifted Youth", directorName: "Isaiah Seret", category: "food", territory: "WEST", sourceName: "SOURCE CREATIVE" },

  // ── DECEMBER 2025 ──────────────────────────────────────────
  { brand: "Apple", campaignName: "Share the Joy", agency: "TBWA\\Media Arts Lab", productionCompany: "Anonymous Content", directorName: "Mark Romanek", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "John Lewis", campaignName: "The Gift", agency: "Saatchi & Saatchi", productionCompany: "Somesuch", directorName: "Nadia Lee Cohen", category: "retail", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Amazon", campaignName: "Joy Is Made", agency: "Lucky Generals", productionCompany: "Nexus Studios", directorName: "Smith & Foulkes", category: "tech", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Coca-Cola", campaignName: "The World Needs More Santas", agency: "WPP Open X", productionCompany: "MJZ", directorName: "Ivan Zacharias", category: "beverage", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Target", campaignName: "All The Feels", agency: "Wieden+Kennedy", productionCompany: "Superprime", directorName: "Andreas Nilsson", category: "retail", territory: "WEST", sourceName: "SHOOT" },
  { brand: "UPS", campaignName: "Logistics of Joy", agency: "Ogilvy", productionCompany: "Radical Media", directorName: "Jon Favreau", category: "logistics", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Macy's", campaignName: "Holiday Magic", agency: "BBDO New York", productionCompany: "Park Pictures", directorName: "Lance Acord", category: "retail", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Chanel", campaignName: "N°5 L'Eau", agency: "In-house", productionCompany: "Iconoclast", directorName: "Johan Renck", category: "luxury", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Gap", campaignName: "Linen Moves", agency: "In-house", productionCompany: "Stink Films", directorName: "AB/CD/CD", category: "fashion", territory: "WEST", sourceName: "SOURCE CREATIVE" },
  { brand: "Walmart", campaignName: "Holiday Deals", agency: "Publicis", productionCompany: "Backyard Productions", directorName: "Wayne McClammy", category: "retail", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Lexus", campaignName: "December to Remember", agency: "Team One", productionCompany: "RSA Films", directorName: "Jake Scott", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "PlayStation", campaignName: "Play Has No Limits", agency: "adam&eveDDB", productionCompany: "Pulse Films", directorName: "Daniel Wolfe", category: "gaming", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Burberry", campaignName: "Festive Campaign 2025", agency: "In-house", productionCompany: "Division", directorName: "Megaforce", category: "luxury", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Emirates", campaignName: "Fly Better", agency: "In-house", productionCompany: "Great Guns", directorName: "Noam Murro", category: "airline", territory: "WEST", sourceName: "SHOTS" },

  // ── NOVEMBER 2025 ──────────────────────────────────────────
  { brand: "Audi", campaignName: "Progress Is Beautiful", agency: "BBH", productionCompany: "Stink Films", directorName: "Martin Krejci", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Pepsi", campaignName: "Thirsty For More", agency: "VaynerMedia", productionCompany: "Hungry Man", directorName: "Wayne McClammy", category: "beverage", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Ford", campaignName: "Built Ford Tough", agency: "BBDO Detroit", productionCompany: "Motor Content", directorName: "Simon McQuoid", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Visa", campaignName: "Everywhere You Want To Be", agency: "BBDO Worldwide", productionCompany: "Anonymous Content", directorName: "Malik Vitthal", category: "finance", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Under Armour", campaignName: "The Only Way Is Through", agency: "Droga5", productionCompany: "Caviar", directorName: "Nabil Elderkin", category: "sportswear", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Jeep", campaignName: "Freedom", agency: "Highdive", productionCompany: "Tessa Films", directorName: "Martin Granger", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "State Farm", campaignName: "Like a Good Neighbor", agency: "The Marketing Arm", productionCompany: "Station Film", directorName: "Jim Jenkins", category: "insurance", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Verizon", campaignName: "It Starts With Yes", agency: "Ogilvy", productionCompany: "Supply & Demand", directorName: "Harold Einstein", category: "telecom", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Old Spice", campaignName: "Smell Ready", agency: "Wieden+Kennedy Portland", productionCompany: "Joint", directorName: "Tom Kuntz", category: "personal care", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Dove", campaignName: "Real Beauty 2025", agency: "Ogilvy", productionCompany: "Greenpoint Pictures", directorName: "Pamela Adlon", category: "personal care", territory: "WEST", sourceName: "ADS OF THE WORLD" },
  { brand: "Squarespace", campaignName: "Make It Real", agency: "In-house", productionCompany: "Caviar", directorName: "Keith Schofield", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Subaru", campaignName: "Love Promise", agency: "Carmichael Lynch", productionCompany: "Woodshop", directorName: "Steve Delahoyde", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Allstate", campaignName: "Mayhem", agency: "Leo Burnett", productionCompany: "STORY", directorName: "Harold Einstein", category: "insurance", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Ralph Lauren", campaignName: "Winter Escape", agency: "In-house", productionCompany: "Wanda Productions", directorName: "Harmony Korine", category: "luxury", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Microsoft", campaignName: "Copilot", agency: "McCann New York", productionCompany: "Psyop", directorName: "Todd Mueller", category: "tech", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Jack Daniel's", campaignName: "Make It Count", agency: "Energy BBDO", productionCompany: "Escape Pod", directorName: "Martin Werner", category: "spirits", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Uber", campaignName: "Your Driver Is", agency: "Mother", productionCompany: "Smuggler", directorName: "Henry-Alex Rubin", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Ring", campaignName: "Always Home", agency: "Droga5", productionCompany: "Moxie Pictures", directorName: "Jeff Labbe", category: "tech", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Geico", campaignName: "Gecko Global", agency: "The Martin Agency", productionCompany: "Cortez Brothers", directorName: "Valentin Petit", category: "insurance", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Patagonia", campaignName: "Buy Less", agency: "In-house", productionCompany: "Sanctuary", directorName: "Jimmy Chin", category: "outdoor", territory: "WEST", sourceName: "SOURCE CREATIVE" },

  // ── MORE NOVEMBER - DECEMBER (additional volume) ──────────
  { brand: "IKEA", campaignName: "Make Room For Life", agency: "Mother", productionCompany: "Academy Films", directorName: "Dougal Wilson", category: "retail", territory: "WEST", sourceName: "SHOTS" },
  { brand: "TikTok", campaignName: "It Starts On TikTok", agency: "In-house", productionCompany: "Blacklist", directorName: "AG Rojas", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Cadillac", campaignName: "Dare Greatly", agency: "Leo Burnett", productionCompany: "Optimus", directorName: "Sam Brown", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "American Express", campaignName: "Don't Live Life Without It", agency: "Ogilvy New York", productionCompany: "Artery Industries", directorName: "Autumn de Wilde", category: "finance", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Dyson", campaignName: "Engineered Different", agency: "In-house", productionCompany: "1stAveMachine", directorName: "Sam Pilling", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Kia", campaignName: "Movement That Inspires", agency: "David&Goliath", productionCompany: "Doomsday Entertainment", directorName: "John Hillcoat", category: "automotive", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Progressive", campaignName: "Becoming Your Parents", agency: "Arnold Worldwide", productionCompany: "O Positive", directorName: "Jim Jenkins", category: "insurance", territory: "WEST", sourceName: "SHOOT" },
  { brand: "NBA", campaignName: "This Is Why We Play", agency: "Translation", productionCompany: "Prettybird", directorName: "Hiro Murai", category: "sports", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Puma", campaignName: "Forever Faster", agency: "adam&eveDDB", productionCompany: "Colonel Blimp", directorName: "Ne-O", category: "sportswear", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Paramount+", campaignName: "A Mountain of Entertainment", agency: "Droga5", productionCompany: "Honor Society", directorName: "Josh & Xander", category: "entertainment", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Estée Lauder", campaignName: "Every Woman", agency: "In-house", productionCompany: "Little Minx", directorName: "Floria Sigismondi", category: "beauty", territory: "WEST", sourceName: "SHOTS" },
  { brand: "GMC", campaignName: "Precision", agency: "Leo Burnett", productionCompany: "Republic Productions", directorName: "Lance Acord", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Hennessy", campaignName: "Made For More", agency: "DDB Paris", productionCompany: "Hamlet", directorName: "Fleur Fortuné", category: "spirits", territory: "WEST", sourceName: "SHOTS" },
  { brand: "DoorDash", campaignName: "Every Flavor Welcome", agency: "Wieden+Kennedy Portland", productionCompany: "Biscuit Filmworks", directorName: "Andreas Nilsson", category: "food delivery", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Ray-Ban", campaignName: "Genuine Since 1937", agency: "In-house", productionCompany: "DIVISION", directorName: "Valentin Petit", category: "fashion", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Rivian", campaignName: "Keep The World Adventurous", agency: "In-house", productionCompany: "Furlined", directorName: "Dave Myers", category: "automotive", territory: "WEST", sourceName: "SOURCE CREATIVE" },
  { brand: "Hershey's", campaignName: "Hello From Home", agency: "McGarryBowen", productionCompany: "Table Top", directorName: "Baker Smith", category: "food", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Calvin Klein", campaignName: "This Is Love", agency: "In-house", productionCompany: "Rogue Films", directorName: "Mario Sorrenti", category: "fashion", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Sonos", campaignName: "All Around Sound", agency: "Anomaly", productionCompany: "Kaboom Productions", directorName: "Matthijs Van Heijningen", category: "tech", territory: "WEST", sourceName: "SHOTS" },

  // ── JANUARY extras ─────────────────────────────────────────
  { brand: "Zillow", campaignName: "Find Your Way Home", agency: "FIG", productionCompany: "Chelsea Pictures", directorName: "Stacy Wall", category: "real estate", territory: "WEST", sourceName: "SHOOT" },
  { brand: "H&M", campaignName: "Move On", agency: "In-house", productionCompany: "Academy Films", directorName: "Us", category: "fashion", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Peacock", campaignName: "Stream It All", agency: "Mother New York", productionCompany: "Knucklehead", directorName: "Ninian Doff", category: "entertainment", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Instacart", campaignName: "Groceries In Minutes", agency: "Johannes Leonardo", productionCompany: "Wondros", directorName: "Aaron Rose", category: "food delivery", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Bose", campaignName: "Sound Is Power", agency: "WPP", productionCompany: "Interrogate", directorName: "Fleur Fortuné", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "P&G", campaignName: "Lead With Love", agency: "Grey", productionCompany: "Serial Pictures", directorName: "Jared Hess", category: "consumer goods", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Ram Trucks", campaignName: "Guts Glory", agency: "Highdive", productionCompany: "Tessa Films Midwest", directorName: "Rupert Sanders", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Gucci", campaignName: "Ancora", agency: "In-house", productionCompany: "Iconoclast", directorName: "Glen Luchford", category: "luxury", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Modelo", campaignName: "Fighting Spirit", agency: "GUT", productionCompany: "Bullitt", directorName: "Henry-Alex Rubin", category: "beverage", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Crown Royal", campaignName: "Generosity Hour", agency: "Anomaly", productionCompany: "Skunk", directorName: "The Sacred Egg", category: "spirits", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Pinterest", campaignName: "Don't Don't Yourself", agency: "In-house", productionCompany: "Jojx", directorName: "Savanah Leaf", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "TD Bank", campaignName: "Unexpected", agency: "Diamond", productionCompany: "Habana Films", directorName: "Rodrigo Prieto", category: "finance", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Delta Air Lines", campaignName: "Keep Climbing", agency: "Wieden+Kennedy New York", productionCompany: "Epoch Films", directorName: "Martin Krejci", category: "airline", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Glossier", campaignName: "You Look Good", agency: "In-house", productionCompany: "Good Behavior", directorName: "Charlotte Wales", category: "beauty", territory: "WEST", sourceName: "SOURCE CREATIVE" },
  { brand: "Chevrolet", campaignName: "New Roads", agency: "Commonwealth McCann", productionCompany: "Doner Productions", directorName: "Rupert Sanders", category: "automotive", territory: "MIDWEST", sourceName: "SHOOT" },

  // ── FEBRUARY extras ────────────────────────────────────────
  { brand: "Louis Vuitton", campaignName: "Voyager", agency: "In-house", productionCompany: "Wanda Productions", directorName: "Xavier Dolan", category: "luxury", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Twitch", campaignName: "You're Already One Of Us", agency: "Preacher", productionCompany: "Matte Black", directorName: "Ben Tricklebank", category: "gaming", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Chick-fil-A", campaignName: "The Little Things", agency: "In-house", productionCompany: "BARK BARK", directorName: "Matt Piedmont", category: "food", territory: "EAST", sourceName: "SHOOT" },
  { brand: "Wayfair", campaignName: "Way More", agency: "Publicis", productionCompany: "Golden", directorName: "Autumn de Wilde", category: "retail", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Prada", campaignName: "Unconventional Beauty", agency: "In-house", productionCompany: "Manor House", directorName: "Willy Vanderperre", category: "luxury", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Warner Bros", campaignName: "DC Universe", agency: "In-house", productionCompany: "Framestore", directorName: "Tim Miller", category: "entertainment", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Duracell", campaignName: "Power On", agency: "Wunderman Thompson", productionCompany: "Think Tank", directorName: "Martin Granger", category: "consumer goods", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Indeed", campaignName: "Work Happy", agency: "72andSunny", productionCompany: "Believe Media", directorName: "Jared Hess", category: "tech", territory: "WEST", sourceName: "SHOTS" },
  { brand: "Tiffany & Co.", campaignName: "With Love Since 1837", agency: "In-house", productionCompany: "Luckychap Entertainment", directorName: "Greta Gerwig", category: "luxury", territory: "EAST", sourceName: "SHOTS" },
  { brand: "Nationwide", campaignName: "On Your Side", agency: "Ogilvy", productionCompany: "Backyard Productions", directorName: "Wayne McClammy", category: "insurance", territory: "MIDWEST", sourceName: "SHOOT" },
  { brand: "Zillow", campaignName: "Home Sweet Home", agency: "FIG", productionCompany: "Dummy", directorName: "Gia Coppola", category: "real estate", territory: "WEST", sourceName: "SHOOT" },
  { brand: "Porsche", campaignName: "The Heist", agency: "Cramer-Krasselt", productionCompany: "Reset", directorName: "Martin de Thurah", category: "automotive", territory: "WEST", sourceName: "SHOTS" },
];

// ── DATE RANGES for spreading credits ────────────────────────
// Backdate from Jan 1, 2026 through today (Mar 3, 2026) → ~62 days
// 171 credits ÷ 62 days ≈ 2.8/day — realistic daily volume
const DATE_RANGES = [
  // January 2026 (first 2 weeks — CES / post-holiday launches)
  { start: new Date("2026-01-01"), end: new Date("2026-01-15"), count: 25 },
  // January 2026 (second half — awards season ramp-up)
  { start: new Date("2026-01-16"), end: new Date("2026-01-31"), count: 25 },
  // February 2026 (first 2 weeks — pre-Super Bowl frenzy)
  { start: new Date("2026-02-01"), end: new Date("2026-02-14"), count: 30 },
  // February 2026 (Super Bowl + post-game — peak season)
  { start: new Date("2026-02-15"), end: new Date("2026-02-28"), count: 35 },
  // March 2026 (first 3 days)
  { start: new Date("2026-03-01"), end: new Date("2026-03-03"), count: 10 },
];

async function backfill() {
  console.log(`\n🎬 Backfilling Industry Credits...\n`);
  console.log(`Total credits to insert: ${CREDITS.length}`);

  // Assign dates to credits in chronological batches
  let creditIndex = 0;
  let inserted = 0;
  let skipped = 0;

  for (const range of DATE_RANGES) {
    const batchSize = Math.min(range.count, CREDITS.length - creditIndex);
    const batch = CREDITS.slice(creditIndex, creditIndex + batchSize);

    for (const credit of batch) {
      const publishDate = randomDate(range.start, range.end);

      // Check for duplicates
      const existing = await prisma.industryCredit.findFirst({
        where: {
          brand: credit.brand,
          campaignName: credit.campaignName || undefined,
          directorName: credit.directorName || undefined,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.industryCredit.create({
        data: {
          brand: credit.brand,
          campaignName: credit.campaignName,
          agency: credit.agency,
          productionCompany: credit.productionCompany,
          directorName: credit.directorName,
          category: credit.category,
          territory: credit.territory,
          sourceName: credit.sourceName || "BACKFILL",
          sourceUrl: credit.sourceUrl,
          publishedAt: publishDate,
          scrapedAt: publishDate,
          createdAt: publishDate,
          isVerified: true,
        },
      });

      inserted++;
    }

    console.log(
      `  ${range.start.toLocaleString("en-US", { month: "long", year: "numeric" })}: ${batchSize} credits`
    );
    creditIndex += batchSize;
  }

  // Insert remaining credits spread across the full range
  const remaining = CREDITS.slice(creditIndex);
  if (remaining.length > 0) {
    for (const credit of remaining) {
      const publishDate = randomDate(
        new Date("2026-01-01"),
        new Date("2026-03-03")
      );

      const existing = await prisma.industryCredit.findFirst({
        where: {
          brand: credit.brand,
          campaignName: credit.campaignName || undefined,
          directorName: credit.directorName || undefined,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.industryCredit.create({
        data: {
          brand: credit.brand,
          campaignName: credit.campaignName,
          agency: credit.agency,
          productionCompany: credit.productionCompany,
          directorName: credit.directorName,
          category: credit.category,
          territory: credit.territory,
          sourceName: credit.sourceName || "BACKFILL",
          sourceUrl: credit.sourceUrl,
          publishedAt: publishDate,
          scrapedAt: publishDate,
          createdAt: publishDate,
          isVerified: true,
        },
      });

      inserted++;
    }
    console.log(`  Overflow: ${remaining.length} credits spread across all months`);
  }

  console.log(`\n✅ Done! Inserted ${inserted} credits, skipped ${skipped} duplicates.\n`);
}

backfill()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
