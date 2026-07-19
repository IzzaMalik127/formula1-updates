// Live F1 data layer — uses the free Jolpica (Ergast) mirror and official F1 media CDN.
// All helpers are safe to call from the browser.

import mercedesLogo from "@/assets/mercedes-logo.jpg.asset.json";
import ferrariLogo from "@/assets/ferrari-logo.jpg.asset.json";
import mclarenLogo from "@/assets/mclaren-logo.jpg.asset.json";
import cadillacLogo from "@/assets/cadillac-logo.jpg.asset.json";
import driverAntonelli from "@/assets/driver-antonelli.jpg.asset.json";
import driverBortoleto from "@/assets/driver-bortoleto.jpg.asset.json";
import driverHulkenberg from "@/assets/driver-hulkenberg.jpg.asset.json";

export const JOLPICA = "https://api.jolpi.ca/ergast/f1";

/* ---------- Types ---------- */
export type Driver = {
  pos: number;
  posText: string;
  driverId: string;
  code?: string;
  number?: number;
  firstName: string;
  lastName: string;
  fullName: string;
  team: string;
  teamId: string;
  color: string;
  pts: number;
  wins: number;
  countryCode?: string;
  nationality: string;
  headshot?: string;
};

export type Constructor = {
  pos: number;
  constructorId: string;
  name: string;
  nationality: string;
  countryCode?: string;
  pts: number;
  wins: number;
  color: string;
  logo?: string;
  car?: string;
};

export type ScheduleRace = {
  round: number;
  season: string;
  name: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  countryCode: string;
  date: string;      // ISO YYYY-MM-DD
  time?: string;     // "HH:MM:SSZ"
  startsAt: Date;
  finished: boolean;
  url: string;
};

export type RaceResult = {
  pos: number;
  driverName: string;
  driverCode?: string;
  driverId: string;
  team: string;
  teamColor: string;
  pts: number;
  time?: string;
  status: string;
  headshot?: string;
};

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  image?: string;
  summary?: string;
};

/* ---------- Team metadata ---------- */
export type TeamInfo = {
  id: string;
  name: string;
  color: string;
  logo: string;
  car?: string;
  countryCode: string;
};

// Keyed by Ergast constructorId (stable) + friendly display name lookups.
export const TEAMS: Record<string, TeamInfo> = {
  mercedes: {
    id: "mercedes", name: "Mercedes", color: "#27F4D2", countryCode: "de",
    logo: mercedesLogo.url,
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes.png",
  },
  ferrari: {
    id: "ferrari", name: "Ferrari", color: "#E8002D", countryCode: "it",
    logo: ferrariLogo.url,
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari.png",
  },
  mclaren: {
    id: "mclaren", name: "McLaren", color: "#FF8000", countryCode: "gb",
    logo: mclarenLogo.url,
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren.png",
  },
  red_bull: {
    id: "red_bull", name: "Red Bull", color: "#3671C6", countryCode: "at",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing.png",
  },
  alpine: {
    id: "alpine", name: "Alpine", color: "#0093CC", countryCode: "fr",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine.png",
  },
  rb: {
    id: "rb", name: "RB", color: "#6692FF", countryCode: "it",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/rb.png",
  },
  haas: {
    id: "haas", name: "Haas", color: "#B6BABD", countryCode: "us",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/haas.png",
  },
  williams: {
    id: "williams", name: "Williams", color: "#64C4FF", countryCode: "gb",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/williams.png",
  },
  audi: {
    id: "audi", name: "Audi", color: "#00E700", countryCode: "de",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber.png",
  },
  sauber: {
    id: "sauber", name: "Kick Sauber", color: "#52E252", countryCode: "ch",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber.png",
  },
  aston_martin: {
    id: "aston_martin", name: "Aston Martin", color: "#229971", countryCode: "gb",
    logo: "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png",
    car: "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin.png",
  },
  cadillac: {
    id: "cadillac", name: "Cadillac", color: "#E5E5E5", countryCode: "us",
    logo: cadillacLogo.url,
  },
};

// Also handle Ergast's alternate display names.
const TEAM_NAME_ALIASES: Record<string, string> = {
  "Red Bull": "red_bull",
  "Red Bull Racing": "red_bull",
  "McLaren": "mclaren",
  "Mercedes": "mercedes",
  "Ferrari": "ferrari",
  "Aston Martin": "aston_martin",
  "Alpine F1 Team": "alpine",
  "Williams": "williams",
  "RB F1 Team": "rb",
  "RB": "rb",
  "Kick Sauber": "sauber",
  "Sauber": "sauber",
  "Audi": "audi",
  "Haas F1 Team": "haas",
  "Haas": "haas",
  "Cadillac F1 Team": "cadillac",
  "Cadillac": "cadillac",
};

export function teamByIdOrName(idOrName: string): TeamInfo | undefined {
  if (TEAMS[idOrName]) return TEAMS[idOrName];
  const id = TEAM_NAME_ALIASES[idOrName];
  return id ? TEAMS[id] : undefined;
}

/* ---------- Driver metadata (headshots + numbers) ---------- */
// Ergast driverId -> extra display info. Headshots point to F1's media CDN
// using the driver's public headshot slug.
type DriverInfo = { number?: number; headshot?: string };

const H = (letter: string, slug: string, code: string) =>
  `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${letter}/${slug}/${code}.png.transform/2col/image.png`;

export const DRIVER_INFO: Record<string, DriverInfo> = {
  max_verstappen: { number: 1, headshot: H("M", "MAXVER01_Max_Verstappen", "maxver01") },
  norris:         { number: 4, headshot: H("L", "LANNOR01_Lando_Norris", "lannor01") },
  leclerc:        { number: 16, headshot: H("C", "CHALEC01_Charles_Leclerc", "chalec01") },
  sainz:          { number: 55, headshot: H("C", "CARSAI01_Carlos_Sainz", "carsai01") },
  perez:          { number: 11, headshot: H("S", "SERPER01_Sergio_Perez", "serper01") },
  piastri:        { number: 81, headshot: H("O", "OSCPIA01_Oscar_Piastri", "oscpia01") },
  hamilton:       { number: 44, headshot: H("L", "LEWHAM01_Lewis_Hamilton", "lewham01") },
  russell:        { number: 63, headshot: H("G", "GEORUS01_George_Russell", "georus01") },
  alonso:         { number: 14, headshot: H("F", "FERALO01_Fernando_Alonso", "feralo01") },
  stroll:         { number: 18, headshot: H("L", "LANSTR01_Lance_Stroll", "lanstr01") },
  gasly:          { number: 10, headshot: H("P", "PIEGAS01_Pierre_Gasly", "piegas01") },
  ocon:           { number: 31, headshot: H("E", "ESTOCO01_Esteban_Ocon", "estoco01") },
  albon:          { number: 23, headshot: H("A", "ALEALB01_Alexander_Albon", "alealb01") },
  colapinto:      { number: 43, headshot: H("F", "FRACOL01_Franco_Colapinto", "fracol01") },
  hulkenberg:     { number: 27, headshot: driverHulkenberg.url },
  bottas:         { number: 77, headshot: H("V", "VALBOT01_Valtteri_Bottas", "valbot01") },
  tsunoda:        { number: 22, headshot: H("Y", "YUKTSU01_Yuki_Tsunoda", "yuktsu01") },
  lawson:         { number: 30, headshot: H("L", "LIALAW01_Liam_Lawson", "lialaw01") },
  hadjar:         { number: 6, headshot: H("I", "ISAHAD01_Isack_Hadjar", "isahad01") },
  bearman:        { number: 87, headshot: H("O", "OLIBEA01_Oliver_Bearman", "olibea01") },
  antonelli:      { number: 12, headshot: driverAntonelli.url },
  bortoleto:      { number: 5, headshot: driverBortoleto.url },
  arvid_lindblad: { number: 41, headshot: H("A", "ARVLIN01_Arvid_Lindblad", "arvlin01") },
  doohan:         { number: 7, headshot: H("J", "JACDOO01_Jack_Doohan", "jacdoo01") },
};

/* ---------- Nationality -> ISO country code ---------- */
export const NATIONALITY_TO_CC: Record<string, string> = {
  British: "gb", Dutch: "nl", Monegasque: "mc", Spanish: "es", Mexican: "mx",
  Australian: "au", French: "fr", German: "de", Finnish: "fi", Danish: "dk",
  Japanese: "jp", Thai: "th", Chinese: "cn", American: "us", Canadian: "ca",
  Italian: "it", Brazilian: "br", "New Zealander": "nz", Argentine: "ar",
  Austrian: "at", Belgian: "be", Polish: "pl", Swiss: "ch", Irish: "ie",
  Portuguese: "pt", Swedish: "se",
};

const COUNTRY_TO_CC: Record<string, string> = {
  UK: "gb", "United Kingdom": "gb", England: "gb", Britain: "gb",
  USA: "us", "United States": "us", "United States of America": "us",
  UAE: "ae", Bahrain: "bh", "Saudi Arabia": "sa", Qatar: "qa",
  Japan: "jp", Australia: "au", China: "cn", Monaco: "mc", Spain: "es",
  Canada: "ca", Austria: "at", Belgium: "be", Netherlands: "nl", Italy: "it",
  Azerbaijan: "az", Singapore: "sg", Mexico: "mx", Brazil: "br",
  France: "fr", Hungary: "hu", Germany: "de", Turkey: "tr", Russia: "ru",
  Portugal: "pt", Switzerland: "ch", Malaysia: "my",
};

/* ---------- Circuit metadata ---------- */
export type CircuitInfo = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  lengthKm: number;
  laps: number;
  lapRecord: { time: string; driver: string; year: number };
  firstGp: number;
  heroImage: string;   // real photo of the circuit
  trackMap: string;    // official F1 track outline PNG
};

// F1's official track outline images (verified pattern).
const TRACK_MAP = (country: string) =>
  `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1024/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${country}_Circuit.png`;

export const CIRCUITS: Record<string, CircuitInfo> = {
  bahrain: {
    id: "bahrain", name: "Bahrain International Circuit", country: "Bahrain", countryCode: "bh",
    city: "Sakhir", lengthKm: 5.412, laps: 57, firstGp: 2004,
    lapRecord: { time: "1:31.447", driver: "P. Gasly", year: 2020 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Bahrain_International_Circuit%2C_2013.jpg/1600px-Bahrain_International_Circuit%2C_2013.jpg",
    trackMap: TRACK_MAP("Bahrain"),
  },
  jeddah: {
    id: "jeddah", name: "Jeddah Corniche Circuit", country: "Saudi Arabia", countryCode: "sa",
    city: "Jeddah", lengthKm: 6.174, laps: 50, firstGp: 2021,
    lapRecord: { time: "1:30.734", driver: "L. Hamilton", year: 2021 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Jeddah_Corniche_Circuit_layout_map.png/1600px-Jeddah_Corniche_Circuit_layout_map.png",
    trackMap: TRACK_MAP("Saudi_Arabia"),
  },
  albert_park: {
    id: "albert_park", name: "Albert Park Circuit", country: "Australia", countryCode: "au",
    city: "Melbourne", lengthKm: 5.278, laps: 58, firstGp: 1996,
    lapRecord: { time: "1:19.813", driver: "C. Leclerc", year: 2024 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Melbourne_Grand_Prix_Circuit.jpg/1600px-Melbourne_Grand_Prix_Circuit.jpg",
    trackMap: TRACK_MAP("Australia"),
  },
  suzuka: {
    id: "suzuka", name: "Suzuka International Racing Course", country: "Japan", countryCode: "jp",
    city: "Suzuka", lengthKm: 5.807, laps: 53, firstGp: 1987,
    lapRecord: { time: "1:30.983", driver: "L. Hamilton", year: 2019 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Suzuka_circuit_map--2005.svg/1600px-Suzuka_circuit_map--2005.svg.png",
    trackMap: TRACK_MAP("Japan"),
  },
  shanghai: {
    id: "shanghai", name: "Shanghai International Circuit", country: "China", countryCode: "cn",
    city: "Shanghai", lengthKm: 5.451, laps: 56, firstGp: 2004,
    lapRecord: { time: "1:32.238", driver: "M. Schumacher", year: 2004 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Shanghai_International_Racing_Circuit_track_map.svg/1600px-Shanghai_International_Racing_Circuit_track_map.svg.png",
    trackMap: TRACK_MAP("China"),
  },
  miami: {
    id: "miami", name: "Miami International Autodrome", country: "United States", countryCode: "us",
    city: "Miami", lengthKm: 5.412, laps: 57, firstGp: 2022,
    lapRecord: { time: "1:29.708", driver: "M. Verstappen", year: 2023 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Miami_International_Autodrome.svg/1600px-Miami_International_Autodrome.svg.png",
    trackMap: TRACK_MAP("Miami"),
  },
  imola: {
    id: "imola", name: "Autodromo Enzo e Dino Ferrari", country: "Italy", countryCode: "it",
    city: "Imola", lengthKm: 4.909, laps: 63, firstGp: 1980,
    lapRecord: { time: "1:15.484", driver: "L. Hamilton", year: 2020 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Imola_2008.png/1600px-Imola_2008.png",
    trackMap: TRACK_MAP("Emilia_Romagna"),
  },
  monaco: {
    id: "monaco", name: "Circuit de Monaco", country: "Monaco", countryCode: "mc",
    city: "Monte Carlo", lengthKm: 3.337, laps: 78, firstGp: 1950,
    lapRecord: { time: "1:12.909", driver: "L. Hamilton", year: 2021 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circuit_de_Monaco.svg/1600px-Circuit_de_Monaco.svg.png",
    trackMap: TRACK_MAP("Monaco"),
  },
  villeneuve: {
    id: "villeneuve", name: "Circuit Gilles Villeneuve", country: "Canada", countryCode: "ca",
    city: "Montreal", lengthKm: 4.361, laps: 70, firstGp: 1978,
    lapRecord: { time: "1:13.078", driver: "V. Bottas", year: 2019 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Circuit_Gilles_Villeneuve.svg/1600px-Circuit_Gilles_Villeneuve.svg.png",
    trackMap: TRACK_MAP("Canada"),
  },
  catalunya: {
    id: "catalunya", name: "Circuit de Barcelona-Catalunya", country: "Spain", countryCode: "es",
    city: "Montmeló", lengthKm: 4.657, laps: 66, firstGp: 1991,
    lapRecord: { time: "1:16.330", driver: "M. Verstappen", year: 2023 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Circuit_de_Catalunya_moto_2021.svg/1600px-Circuit_de_Catalunya_moto_2021.svg.png",
    trackMap: TRACK_MAP("Spain"),
  },
  red_bull_ring: {
    id: "red_bull_ring", name: "Red Bull Ring", country: "Austria", countryCode: "at",
    city: "Spielberg", lengthKm: 4.318, laps: 71, firstGp: 1970,
    lapRecord: { time: "1:05.619", driver: "C. Sainz", year: 2020 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Red_Bull_Ring_-_2016.svg/1600px-Red_Bull_Ring_-_2016.svg.png",
    trackMap: TRACK_MAP("Austria"),
  },
  silverstone: {
    id: "silverstone", name: "Silverstone Circuit", country: "United Kingdom", countryCode: "gb",
    city: "Silverstone", lengthKm: 5.891, laps: 52, firstGp: 1950,
    lapRecord: { time: "1:27.097", driver: "M. Verstappen", year: 2020 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Silverstone_Circuit_2020.png/1600px-Silverstone_Circuit_2020.png",
    trackMap: TRACK_MAP("Great_Britain"),
  },
  hungaroring: {
    id: "hungaroring", name: "Hungaroring", country: "Hungary", countryCode: "hu",
    city: "Budapest", lengthKm: 4.381, laps: 70, firstGp: 1986,
    lapRecord: { time: "1:16.627", driver: "L. Hamilton", year: 2020 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Hungaroring.svg/1600px-Hungaroring.svg.png",
    trackMap: TRACK_MAP("Hungary"),
  },
  spa: {
    id: "spa", name: "Circuit de Spa-Francorchamps", country: "Belgium", countryCode: "be",
    city: "Stavelot", lengthKm: 7.004, laps: 44, firstGp: 1950,
    lapRecord: { time: "1:44.701", driver: "S. Pérez", year: 2024 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Spa-Francorchamps_of_Belgium.svg/1600px-Spa-Francorchamps_of_Belgium.svg.png",
    trackMap: TRACK_MAP("Belgium"),
  },
  zandvoort: {
    id: "zandvoort", name: "Circuit Zandvoort", country: "Netherlands", countryCode: "nl",
    city: "Zandvoort", lengthKm: 4.259, laps: 72, firstGp: 1952,
    lapRecord: { time: "1:11.097", driver: "L. Hamilton", year: 2021 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Circuit_Zandvoort.svg/1600px-Circuit_Zandvoort.svg.png",
    trackMap: TRACK_MAP("Netherlands"),
  },
  monza: {
    id: "monza", name: "Autodromo Nazionale Monza", country: "Italy", countryCode: "it",
    city: "Monza", lengthKm: 5.793, laps: 53, firstGp: 1950,
    lapRecord: { time: "1:21.046", driver: "R. Barrichello", year: 2004 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Monza_track_map.svg/1600px-Monza_track_map.svg.png",
    trackMap: TRACK_MAP("Italy"),
  },
  baku: {
    id: "baku", name: "Baku City Circuit", country: "Azerbaijan", countryCode: "az",
    city: "Baku", lengthKm: 6.003, laps: 51, firstGp: 2016,
    lapRecord: { time: "1:43.009", driver: "C. Leclerc", year: 2019 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Baku_City_Circuit_track_map.svg/1600px-Baku_City_Circuit_track_map.svg.png",
    trackMap: TRACK_MAP("Baku"),
  },
  marina_bay: {
    id: "marina_bay", name: "Marina Bay Street Circuit", country: "Singapore", countryCode: "sg",
    city: "Singapore", lengthKm: 4.940, laps: 62, firstGp: 2008,
    lapRecord: { time: "1:34.486", driver: "D. Ricciardo", year: 2024 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Marina_Bay_Street_Circuit_2023.svg/1600px-Marina_Bay_Street_Circuit_2023.svg.png",
    trackMap: TRACK_MAP("Singapore"),
  },
  americas: {
    id: "americas", name: "Circuit of the Americas", country: "United States", countryCode: "us",
    city: "Austin", lengthKm: 5.513, laps: 56, firstGp: 2012,
    lapRecord: { time: "1:36.169", driver: "C. Leclerc", year: 2019 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Circuit_of_the_Americas.svg/1600px-Circuit_of_the_Americas.svg.png",
    trackMap: TRACK_MAP("USA"),
  },
  rodriguez: {
    id: "rodriguez", name: "Autódromo Hermanos Rodríguez", country: "Mexico", countryCode: "mx",
    city: "Mexico City", lengthKm: 4.304, laps: 71, firstGp: 1963,
    lapRecord: { time: "1:17.774", driver: "V. Bottas", year: 2021 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez_track_map.svg/1600px-Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez_track_map.svg.png",
    trackMap: TRACK_MAP("Mexico"),
  },
  interlagos: {
    id: "interlagos", name: "Autódromo José Carlos Pace", country: "Brazil", countryCode: "br",
    city: "São Paulo", lengthKm: 4.309, laps: 71, firstGp: 1973,
    lapRecord: { time: "1:10.540", driver: "V. Bottas", year: 2018 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Autodromo_Jose_Carlos_Pace_%28AKA_Interlagos%29_track_map.svg/1600px-Autodromo_Jose_Carlos_Pace_%28AKA_Interlagos%29_track_map.svg.png",
    trackMap: TRACK_MAP("Brazil"),
  },
  vegas: {
    id: "vegas", name: "Las Vegas Strip Circuit", country: "United States", countryCode: "us",
    city: "Las Vegas", lengthKm: 6.201, laps: 50, firstGp: 2023,
    lapRecord: { time: "1:35.490", driver: "O. Piastri", year: 2024 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Las_Vegas_Strip_Circuit.svg/1600px-Las_Vegas_Strip_Circuit.svg.png",
    trackMap: TRACK_MAP("Las_Vegas"),
  },
  losail: {
    id: "losail", name: "Lusail International Circuit", country: "Qatar", countryCode: "qa",
    city: "Lusail", lengthKm: 5.419, laps: 57, firstGp: 2021,
    lapRecord: { time: "1:24.319", driver: "L. Hamilton", year: 2024 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Lusail_International_Circuit.svg/1600px-Lusail_International_Circuit.svg.png",
    trackMap: TRACK_MAP("Qatar"),
  },
  yas_marina: {
    id: "yas_marina", name: "Yas Marina Circuit", country: "United Arab Emirates", countryCode: "ae",
    city: "Abu Dhabi", lengthKm: 5.281, laps: 58, firstGp: 2009,
    lapRecord: { time: "1:26.103", driver: "M. Verstappen", year: 2021 },
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Yas_Marina_Circuit.svg/1600px-Yas_Marina_Circuit.svg.png",
    trackMap: TRACK_MAP("Abu_Dhabi"),
  },
};

export function circuitByIdOrName(id: string, fallbackName?: string): CircuitInfo | undefined {
  if (CIRCUITS[id]) return CIRCUITS[id];
  if (!fallbackName) return undefined;
  const lc = fallbackName.toLowerCase();
  return Object.values(CIRCUITS).find((c) => c.name.toLowerCase() === lc);
}

export function countryToCC(country: string): string {
  return COUNTRY_TO_CC[country] ?? (country?.slice(0, 2).toLowerCase() || "");
}

/* ---------- Fetchers ---------- */

export async function fetchDriverStandings(signal?: AbortSignal): Promise<Driver[]> {
  const res = await fetch(`${JOLPICA}/current/driverStandings.json`, { signal });
  if (!res.ok) throw new Error("driver-standings-failed");
  const json = await res.json();
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  return list.map((d: any, i: number): Driver => {
    const ctor = d.Constructors[0];
    const teamInfo = teamByIdOrName(ctor.constructorId) ?? teamByIdOrName(ctor.name);
    const info = DRIVER_INFO[d.Driver.driverId];
    return {
      pos: Number(d.position ?? i + 1),
      posText: d.positionText,
      driverId: d.Driver.driverId,
      code: d.Driver.code,
      number: info?.number ?? (Number(d.Driver.permanentNumber) || undefined),
      firstName: d.Driver.givenName,
      lastName: d.Driver.familyName,
      fullName: `${d.Driver.givenName} ${d.Driver.familyName}`,
      team: teamInfo?.name ?? ctor.name,
      teamId: teamInfo?.id ?? ctor.constructorId,
      color: teamInfo?.color ?? "#E8002D",
      pts: Number(d.points),
      wins: Number(d.wins ?? 0),
      countryCode: NATIONALITY_TO_CC[d.Driver.nationality],
      nationality: d.Driver.nationality,
      headshot: info?.headshot,
    };
  });
}

export async function fetchConstructorStandings(signal?: AbortSignal): Promise<Constructor[]> {
  const res = await fetch(`${JOLPICA}/current/constructorStandings.json`, { signal });
  if (!res.ok) throw new Error("constructor-standings-failed");
  const json = await res.json();
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  const mapped: Constructor[] = list.map((c: any, i: number): Constructor => {
    const t = teamByIdOrName(c.Constructor.constructorId) ?? teamByIdOrName(c.Constructor.name);
    return {
      pos: Number(c.position ?? i + 1),
      constructorId: c.Constructor.constructorId,
      name: t?.name ?? c.Constructor.name,
      nationality: c.Constructor.nationality,
      countryCode: t?.countryCode,
      pts: Number(c.points),
      wins: Number(c.wins),
      color: t?.color ?? "#E8002D",
      logo: t?.logo,
      car: t?.car,
    };
  });
  // Ensure Cadillac (joining the grid) shows even if the API hasn't listed them yet.
  if (!mapped.some((c) => c.constructorId === "cadillac" || /cadillac/i.test(c.name))) {
    const t = TEAMS.cadillac;
    mapped.push({
      pos: mapped.length + 1,
      constructorId: "cadillac",
      name: t.name,
      nationality: "American",
      countryCode: t.countryCode,
      pts: 0,
      wins: 0,
      color: t.color,
      logo: t.logo,
    });
  }
  return mapped;
}

export async function fetchSchedule(signal?: AbortSignal): Promise<ScheduleRace[]> {
  const res = await fetch(`${JOLPICA}/current.json`, { signal });
  if (!res.ok) throw new Error("schedule-failed");
  const json = await res.json();
  const list = json?.MRData?.RaceTable?.Races ?? [];
  const now = Date.now();
  return list.map((r: any): ScheduleRace => {
    const iso = r.time ? `${r.date}T${r.time}` : `${r.date}T14:00:00Z`;
    const startsAt = new Date(iso);
    const country: string = r.Circuit.Location.country;
    return {
      round: Number(r.round),
      season: r.season,
      name: r.raceName,
      circuitId: r.Circuit.circuitId,
      circuitName: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country,
      countryCode: countryToCC(country),
      date: r.date,
      time: r.time,
      startsAt,
      finished: startsAt.getTime() < now,
      url: r.url,
    };
  });
}

export function pickNextRace(schedule: ScheduleRace[]): ScheduleRace | undefined {
  const now = Date.now();
  return schedule.find((r) => r.startsAt.getTime() > now) ?? schedule[schedule.length - 1];
}

export function pickUpcoming(schedule: ScheduleRace[], count = 4): ScheduleRace[] {
  const now = Date.now();
  return schedule.filter((r) => r.startsAt.getTime() > now).slice(0, count);
}

export async function fetchLastRaceResults(signal?: AbortSignal): Promise<{ race?: ScheduleRace; results: RaceResult[] }> {
  const res = await fetch(`${JOLPICA}/current/last/results.json`, { signal });
  if (!res.ok) throw new Error("last-race-failed");
  const json = await res.json();
  const race = json?.MRData?.RaceTable?.Races?.[0];
  if (!race) return { results: [] };
  const results: RaceResult[] = (race.Results ?? []).slice(0, 10).map((r: any): RaceResult => {
    const teamInfo = teamByIdOrName(r.Constructor.constructorId) ?? teamByIdOrName(r.Constructor.name);
    const info = DRIVER_INFO[r.Driver.driverId];
    return {
      pos: Number(r.position),
      driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
      driverCode: r.Driver.code,
      driverId: r.Driver.driverId,
      team: teamInfo?.name ?? r.Constructor.name,
      teamColor: teamInfo?.color ?? "#E8002D",
      pts: Number(r.points),
      time: r.Time?.time,
      status: r.status,
      headshot: info?.headshot,
    };
  });
  const iso = race.time ? `${race.date}T${race.time}` : `${race.date}T14:00:00Z`;
  const meta: ScheduleRace = {
    round: Number(race.round),
    season: race.season,
    name: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    countryCode: countryToCC(race.Circuit.Location.country),
    date: race.date,
    time: race.time,
    startsAt: new Date(iso),
    finished: true,
    url: race.url,
  };
  return { race: meta, results };
}

export async function fetchNews(signal?: AbortSignal): Promise<NewsItem[]> {
  const res = await fetch("/api/public/news", { signal });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items ?? [];
}
