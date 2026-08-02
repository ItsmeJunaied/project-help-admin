/**
 * GA4's `country` dimension names don't always match world-atlas/Natural Earth's
 * short names (e.g. "United States" vs "United States of America"). Maps the GA
 * name (lowercased) to the topojson feature name it should color.
 */
export const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "united states": "United States of America",
  "russia": "Russia",
  "czech republic": "Czechia",
  "ivory coast": "Côte d'Ivoire",
  "myanmar (burma)": "Myanmar",
  "congo - brazzaville": "Congo",
  "republic of the congo": "Congo",
  "congo - kinshasa": "Dem. Rep. Congo",
  "democratic republic of the congo": "Dem. Rep. Congo",
  "north macedonia": "Macedonia",
  "macedonia (fyrom)": "Macedonia",
  "eswatini": "eSwatini",
  "bosnia & herzegovina": "Bosnia and Herz.",
  "bosnia and herzegovina": "Bosnia and Herz.",
  "trinidad & tobago": "Trinidad and Tobago",
  "dominican republic": "Dominican Rep.",
  "central african republic": "Central African Rep.",
  "equatorial guinea": "Eq. Guinea",
  "south sudan": "S. Sudan",
  "solomon islands": "Solomon Is.",
  "united republic of tanzania": "Tanzania",
  "tanzania": "Tanzania",
  "united kingdom": "United Kingdom",
  "syrian arab republic": "Syria",
  "lao pdr": "Laos",
  "brunei darussalam": "Brunei",
  "moldova, republic of": "Moldova",
  "korea, republic of": "South Korea",
  "korea, democratic people's republic of": "North Korea",
  "viet nam": "Vietnam",
  "papua new guinea": "Papua New Guinea",
  "cape verde": "Cape Verde",
  "state of palestine": "Palestine",
  "palestinian territories": "Palestine",
  "hong kong": "Hong Kong",
  "u.s. virgin islands": "United States of America",
};

/** Normalizes a GA country name to the world-atlas feature name it should color, or null if unmapped. */
export function normalizeCountryName(gaName: string): string {
  const key = gaName.trim().toLowerCase();
  return COUNTRY_NAME_ALIASES[key] ?? gaName.trim();
}
