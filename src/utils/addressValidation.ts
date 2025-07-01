export const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  // ...add more as needed
];

export const usStates = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export const caProvinces = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'
];

export const zipRegexes: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^([A-Za-z][A-Ha-hJ-Yj-y]?\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/,
  AU: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  IN: /^\d{6}$/,
};

export function validateZip(countryCode: string, zip: string): boolean {
  const regex = zipRegexes[countryCode];
  if (!regex) return true; // If no regex, skip validation
  return regex.test(zip.trim());
}

export function validateCountry(country: string): boolean {
  return countries.some(c => c.name === country || c.code === country);
}

export function validateState(countryCode: string, state: string): boolean {
  if (countryCode === 'US') return usStates.includes(state);
  if (countryCode === 'CA') return caProvinces.includes(state);
  return true; // For other countries, skip
} 