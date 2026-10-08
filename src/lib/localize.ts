/**
 * Display-time localization for mock data values.
 * Only strings present in BN_DATA_DICT are translated (BN mode).
 * Logic-critical fields (status, category, type, id, dates, phone,...) are intentionally
 * ABSENT from the dictionary so comparisons in module code never break.
 */

import type { Language } from '@/contexts/LanguageContext';
import { UI_DICT } from './uiDict';

let activeLang: Language = 'bn';

export function setAppLanguage(lang: Language): void {
  activeLang = lang;
}

export function getAppLanguage(): Language {
  return activeLang;
}

export function tr(str: string): string {
  if (activeLang !== 'bn') return str;
  return UI_DICT[str] ?? BN_DATA_DICT[str] ?? str;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Translates a user-typed phrase (e.g. a demand's product/variety/description):
// exact match first, then any known multi-word phrase inside the text, then any
// individual known word. Bits that have no dictionary entry stay untouched.
let phraseKeysCache: string[] | null = null;
let singleWordCache: Map<string, string> | null = null;

function buildCaches(): void {
  if (phraseKeysCache && singleWordCache) return;
  const keys = [...new Set([...Object.keys(UI_DICT), ...Object.keys(BN_DATA_DICT)])];
  phraseKeysCache = keys.filter((k) => k.trim().includes(' ')).sort((a, b) => b.length - a.length);
  const single = new Map<string, string>();
  for (const k of keys) {
    if (k.trim().includes(' ')) continue;
    single.set(k.toLocaleLowerCase(), UI_DICT[k] ?? BN_DATA_DICT[k]);
  }
  singleWordCache = single;
}

export function trPhrase(input: string): string {
  if (activeLang !== 'bn') return input;
  const exact = UI_DICT[input] ?? BN_DATA_DICT[input];
  if (exact) return exact;

  buildCaches();
  let out = input;
  for (const k of phraseKeysCache!) {
    if (!out.toLocaleLowerCase().includes(k.toLocaleLowerCase())) continue;
    out = out.replace(new RegExp(escapeRegExp(k), 'gi'), UI_DICT[k] ?? BN_DATA_DICT[k]);
  }

  return out
    .split(' ')
    .map((w) => {
      const core = w.replace(/^[^A-Za-z০-৯]+|[^A-Za-z০-৯]+$/g, '');
      if (!core) return w;
      const start = w.indexOf(core);
      const end = start + core.length;
      const pre = w.slice(0, start);
      const post = w.slice(end);
      const hit = singleWordCache!.get(core.toLocaleLowerCase());
      return pre + (hit ?? core) + post;
    })
    .join(' ');
}

export const BN_DATA_DICT: Record<string, string> = {
  // -------- Crops --------
  "Aman Rice": "আমন ধান",
  "Boro Rice": "বোরো ধান",
  "Boro Rice (BRRI Dhan-28)": "বোরো ধান (ব্রি ধান-২৮)",
  "Boro Rice (BRRI Dhan-89)": "বোরো ধান (ব্রি ধান-৮৯)",
  "Cavendish Banana": "ক্যাভেন্ডিশ কলা",
  "Cavendish Banana (G9 Variety)": "ক্যাভেন্ডিশ কলা (জি-৯ জাত)",
  "Hybrid Maize": "হাইব্রিড ভুট্টা",
  "Mustard": "সরিষা",
  "Mustard (BARI Sharisha-14)": "সরিষা (বারি সরিষা-১৪)",
  "Mustard (High Oil Content)": "সরিষা (উচ্চ তেল উপাদান)",
  "Mustard Oilseed": "সরিষা",
  "Summer Mungbean": "গ্রীষ্মকালীন মুগ ডাল",
  "Sweet Corn": "মিষ্টি ভুট্টা",
  "Wheat": "গম",
  "Wheat (BARI Gom-33)": "গম (বারি গম-৩৩)",
  "Winter Potato (Table & Processing)": "শীতকালীন আলু (টেবিল ও প্রক্রিয়াজাত)",
  "Yellow Hybrid Maize": "হলুদ হাইব্রিড ভুট্টা",
  "Yellow Maize": "হলুদ ভুট্টা",
  "Yellow Maize (Pacific 999)": "হলুদ ভুট্টা (প্যাসিফিক ৯৯৯)",
  "Zinc Wheat": "জিংক গম",
  "High-Yield Wheat (BARI Gom-33)": "উচ্চ ফলনশীল গম (বারি গম-৩৩)",
  "Winter Potato (Diamant & Cardinal)": "শীতকালীন আলু (ডায়ামন্ট ও কার্ডিনাল)",
  "Mustard / Rapeseed": "সরিষা / রেপসিড",
  "Summer Maize / Corn": "গ্রীষ্মকালীন ভুট্টা / কর্ন",
  "Local Improved Variety": "স্থানীয় উন্নত জাত",

  // -------- Recommendation engine sentences --------
  "Low pest pressure under standard IPM": "স্ট্যান্ডার্ড আইপিএম-এ পোকামাকড়ের চাপ কম",
  "Winter Potato": "শীতকালীন আলু",
  "Rice (Paddy)": "ধান (চালের কাঁচা ধান)",
  "Tomato": "টমেটো",
  "Potato": "আলু",
  "Semi-ripe, grade A": "অর্ধ-পাকা, গ্রেড এ",
  "Semi-ripe": "অর্ধ-পাকা",
  "Grade A": "গ্রেড এ",
  "Grade B": "গ্রেড বি",
  "Grade C": "গ্রেড সি",
  "Any Grade": "যেকোনো গ্রেড",
  "Any": "যেকোনো",
  "Diamant": "ডায়ামন্ট",
  "BRRI-28 ধান": "ব্রি ধান-২৮",
  "BRRI-28": "ব্রি ধান-২৮",
  "BRRI-29": "ব্রি ধান-২৯",
  "BRRI Dhan29": "ব্রি ধান-২৯",
  "BRRI dhan-71": "ব্রি ধান-৭১",
  "BRRI dhan-72": "ব্রি ধান-৭২",
  "BRRI dhan-56": "ব্রি ধান-৫৬",
  "BRRI dhan-68": "ব্রি ধান-৬৮",
  "BRRI dhan-74": "ব্রি ধান-৭৪",
  "Moog": "মুগ",
  "uniform size": "সমান আকার",
  "no bruises": "ক্ষতহীন",
  "no damaged grains": "নষ্ট দানা নেই",
  "Fresh": "তাজা",
  "Ripe": "পাকা",
  "Unripe": "কাঁচা",
  "Organic": "জৈব",
  "Fully Mature": "সম্পূর্ণ পরিপক্ব",
  "Mature": "পরিপক্ব",
  "Well matched to current rainfall, soil pH and season":
    "বর্তমান বৃষ্টিপাত, মাটির পিএইচ ও মৌসুমের সাথে ভালোভাবে মানানসই",
  "Requires supplemental irrigation or soil amendment to perform reliably":
    "নির্ভরযোগ্য ফলনের জন্য অতিরিক্ত সেচ বা মাটি সংশোধন প্রয়োজন",
  "kg/acre": "কেজি/একর",
  "the currently planned crop rotation": "চলমান ফসল ঘূর্ণন পরিকল্পনা",

  // -------- Farmer profile certifications --------
  "Good Agricultural Practices (GAP) Certified": "ভালো কৃষি চর্চা (জিএপি) স্বীকৃতিপ্রাপ্ত",
  "Department of Agricultural Extension (DAE)": "কৃষি সম্প্রসারণ অধিদপ্তর (ডিএই)",
  "Integrated Pest Management (IPM) Master Trainer":
    "সমন্বিত পোকামাকড় ব্যবস্থাপনা (আইপিএম) মাস্টার প্রশিক্ষক",
  "Bangladesh Agricultural Research Institute (BARI)":
    "বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (বারি)",
  "Organic Soil Stewardship Award": "জৈব মাটি ব্যবস্থাপনা পুরস্কার",
  "Krishi Gobeshona Foundation": "কৃষি গবেষণা ফাউন্ডেশন",

  // -------- Farm & Field names --------
  "Green Valley Agro Estate": "গ্রিন ভ্যালি এগ্রো এস্টেট",
  "Karatoya River Basin Fields": "করতোয়া নদী অববাহিকা ক্ষেত",
  "North Highland Agro Orchards": "উত্তর হাইল্যান্ড এগ্রো বাগান",
  "Plot A1 - Paddy Terraces": "প্লট এ-১ - ধানের টেরেস",
  "Plot A2 - Hybrid Maize Sector": "প্লট এ-২ - হাইব্রিড ভুট্টা সেক্টর",
  "Plot A3 - Green Fallow & Compost": "প্লট এ-৩ - সবুজ পতিত ও কম্পোস্ট",
  "Plot B1 - Winter Wheat Bed": "প্লট বি-১ - শীতকালীন গম বেড",
  "Plot B2 - Mustard Oilseed": "প্লট বি-২ - সরিষা",
  "Plot C1 - Commercial Cavendish Banana": "প্লট সি-১ - বাণিজ্যিক ক্যাভেন্ডিশ কলা",

  // -------- Locations --------
  "Mirzapur, Sherpur, Bogura": "মির্জাপুর, শেরপুর, বগুড়া",
  "Khabashpur, Sherpur, Bogura": "খাবারশপুর, শেরপুর, বগুড়া",
  "Ranirhat, Bogura Sadar": "রণীরহাট, বগুড়া সদর",
  "Sherpur, Bogura (Rajshahi)": "শেরপুর, বগুড়া (রাজশাহী)",
  "Sherpur Upazila, Bogura": "শেরপুর উপজেলা, বগুড়া",
  "Sherpur": "শেরপুর",
  "Adamdighi": "আদমদীঘি",
  "Dhunat": "ধুনট",
  "Gabtoli": "গাবতলী",
  "Kahalu": "কাহালু",
  "Nandigram": "নন্দীগ্রাম",
  "Sariakandi": "সারিয়াকান্দি",
  "Sonatala": "সোনাতলা",
  "Shibganj": "শিবগঞ্জ",
  "Mirzapur": "মির্জাপুর",
  "Bogura": "বগুড়া",
  "Rajshahi": "রাজশাহী",
  "Demo Buyer": "ডেমো ক্রেতা",
  "Mymensingh": "ময়মনসিংহ",
  "Khulna (Jessore)": "খুলনা (যশোর)",
  "Dhaka Central HQ": "ঢাকা কেন্দ্রীয় সদর দপ্তর",
  "Rajshahi (Bogura)": "রাজশাহী (বগুড়া)",
  "Rajshahi (Natore)": "রাজশাহী (নাটোর)",
  "Rangpur & Dinajpur Hub": "রংপুর ও দিনাজপুর হাব",
  "National (All Upazilas)": "জাতীয় (সব উপজেলা)",
  "Barind & Northern High Terraces": "বরেন্দ্র ও উত্তরাঞ্চল উঁচু ভূমি",
  "Haor & Southern Coastal Wetland Districts": "হাওর ও দক্ষিণ উপকূলীয় জলাভূমি জেলাসমূহ",
  "Special Agro-Export Processing Zones": "বিশেষ কৃষি-রপ্তানি প্রক্রিয়াজাত অঞ্চল",
  "All Divisions (National)": "সব বিভাগ (জাতীয়)",
  "Dhaka": "ঢাকা",
  "Manikganj": "মানিকগঞ্জ",
  "Naogaon": "নওগাঁ",
  "Singair": "সিঙ্গাইর",
  "Badalgachhi": "বদলগাছি",

  // -------- Farm verification (initialFarmVerifications) --------
  "Al-Madina Agro Complex": "আল-মদিনা এগ্রো কমপ্লেক্স",
  "Padma Delta Organic Green": "পদ্মা ডেল্টা অর্গানিক গ্রিন",
  "Barendra High-Yield Farm": "বরেন্দ্র উচ্চ-ফলনশীল খামার",
  "Land records verified against Upazila Land Registry. GPS coordinates validated on GIS map.":
    "উপজেলা জমি নিবন্ধন রেজিস্ট্রির বিপরীতে জমির রেকর্ড যাচাই করা হয়েছে। জিআইএস মানচিত্রে জিপিএস স্থানাঙ্ক বৈধতা নিশ্চিত করা হয়েছে।",
  "Land Registration Porcha (Deed)": "জমি নিবন্ধন পর্চা (দলিল)",
  "DAE Union Cadastral Map": "ডিএই ইউনিয়ন জরিপ মানচিত্র",
  "National ID Card Copy": "জাতীয় পরিচয়পত্রের কপি",
  "Upazila Land Revenue Dakhila": "উপজেলা জমি রাজস্ব দাখিলা",
  "Khatian 1192 Verified Copy": "খতিয়ান ১১৯২ যাচাইকৃত কপি",
  "Khatian 882, Mouza Chalk-Paharpur": "খতিয়ান ৮৮২, মৌজা চক-পাহাড়পুর",
  "Khatian 304, Mouza Char-Singair": "খতিয়ান ৩০৪, মৌজা চর-সিঙ্গাইর",
  "Khatian 1192": "খতিয়ান ১১৯২",
  "Plot 412, 413, 415/B": "প্লট ৪১২, ৪১৩, ৪১৫/বি",
  "Plot 108, 109, 110": "প্লট ১০৮, ১০৯, ১১০",
  "Plot 77, 78, 80": "প্লট ৭৭, ৭৮, ৮০",

  // -------- Varieties --------
  "BARI Gom-33": "বারি গম-৩৩",
  "BARI Gom-33 (Biofortified Zinc)": "বারি গম-৩৩ (বায়োফর্টিফায়েড জিংক)",
  "BARI Mung-6 Green": "বারি মুগ-৬ সবুজ",
  "BARI Sharisha-14": "বারি সরিষা-১৪",
  "BARI Sharisha-14 Golden": "বারি সরিষা-১৪ গোল্ডেন",
  "BRRI Dhan-28": "ব্রি ধান-২৮",
  "BRRI Dhan-28 Premium": "ব্রি ধান-২৮ প্রিমিয়াম",
  "BRRI Dhan-49 Supreme": "ব্রি ধান-৪৯ সুপ্রিম",
  "Grand Nain (Tissue Cultured)": "গ্র্যান্ড নেইন (টিস্যু কালচার)",
  "Pacific 999": "প্যাসিফিক ৯৯৯",
  "Pacific 999 High Starch": "প্যাসিফিক ৯৯৯ হাই স্টার্চ",
  "Pacific 999 Pioneer": "প্যাসিফিক ৯৯৯ পাইওনিয়ার",
  "Sugar 75 Hybrid": "সুগার ৭৫ হাইব্রিড",
  "Tossa High Sheen": "টসা হাই শিন",
  "Clean Milled Long Grain": "পরিষ্কার মিলড লম্বা দানা",
  "Grade 1 Processing": "গ্রেড-১ প্রক্রিয়াজাত",

  // -------- Inputs / materials --------
  "Prilled Urea (Nitrogen source)": "প্রিলড ইউরিয়া (নাইট্রোজেন উৎস)",
  "Muriate of Potash - MOP (Potassium source)": "মিউরেট অব পটাশ - এমওপি (পটাশিয়াম উৎস)",
  "Zinc Sulphate Heptahydrate (21% Zn)": "জিংক সালফেট হেপ্টাহাইড্রেট (২১% জিংক)",
  "Trichoderma Enriched Vermicompost": "ট্রাইকোডার্মা সমৃদ্ধ ভার্মিকম্পোস্ট",
  "Neem Extract 5%": "নিম নির্যাস ৫%",
  "MOP Fertilizer": "এমওপি সার",
  "Bt Bio-pesticide + Spreader": "বিটি বায়ো-পেস্টিসাইড + স্প্রেডার",
  "Manual labor tools": "ম্যানুয়াল শ্রম সরঞ্জাম",
  "Drip System Grid C": "ড্রিপ সিস্টেম গ্রিড সি",

  // -------- Soil / irrigation / water --------
  "Alluvial Loam (High Fertility)": "পলিমাটি দোআঁশ (উচ্চ উর্বরতা)",
  "Alluvial Loam": "পলিমাটি দোআঁশ",
  "Sandy Clay Loam": "বেলে-এঁটেল দোআঁশ",
  "Reddish Clay Alluvium": "লালচে এঁটেল পলি",
  "Deep Tube Well": "গভীর নলকূপ",
  "Canal": "খাল",
  "Drip": "ড্রিপ",
  "Solar Powered Submersible Aquifer": "সোলার চালিত সাবমার্সিবল অ্যাকুইফার",
  "Solar Powered Submersible": "সোলারচালিত সাবমার্সিবল পাম্প",
  "Karatoya River Irrigation Canal": "করতোয়া নদী সেচ খাল",
  "Rainwater Retention Pond + Borewell": "বৃষ্টির পানি সংরক্ষণ পুকুর + বোরওয়েল",

  // -------- Weather conditions --------
  "Clear & Warm": "পরিষ্কার ও উষ্ণ",
  "Partly Cloudy": "আংশিক মেঘলা",
  "Partly Cloudy with Humid Breeze": "আংশিক মেঘলা ও আর্দ্র হাওয়া",
  "Passing Showers": "ক্ষণস্থায়ী বৃষ্টি",
  "Bright Sunshine": "উজ্জ্বল রোদ",
  "Scattered Clouds": "ছড়ানো মেঘ",
  "Isolated Showers": "বিচ্ছিন্ন বৃষ্টি",
  "Moderate Rain & Thunderstorms": "মাঝারি বৃষ্টি ও দানা বাঁধা ঝড়",
  "Sunny": "রোদোজ্জ্বল",
  "Cloudy": "মেঘলা",
  "Light Rain": "হালকা বৃষ্টি",
  "Heavy Rain": "ভারী বৃষ্টি",
  "Rain Showers": "বৃষ্টির ঝরা",
  "Thunderstorm": "দানা বাঁধা ঝড়",
  "Humid & Overcast": "আর্দ্র ও মেঘাচ্ছন্ন",
  "Clear Sky": "পরিষ্কার আকাশ",
  "Clear": "পরিষ্কার",
  "Humid": "আর্দ্র",
  "Windy": "ঝড়ো হাওয়া",
  "Foggy": "কুয়াশাচ্ছন্ন",

  // -------- Growth / season / difficulty / days --------
  "Maturity": "পরিপক্বতা",
  "Flowering": "ফুল ধরা পর্যায়",
  "Vegetative": "কান্ড বৃদ্ধি পর্যায়",
  "Grain Filling": "শস্য পূরণ পর্যায়",
  "Winter Rabi": "শীতকালীন রবি",
  "Rabi / Summer": "রবি / গ্রীষ্ম",
  "Winter Window": "শীতকালীন সময়",
  "Rabi / Pre-Kharif": "রবি / প্রি-খরিফ",
  "Beginner": "শিক্ষানবিশ",
  "Advanced": "উন্নত",
  "Intermediate": "মাঝারি",
  "Sunday": "রবিবার",
  "Monday": "সোমবার",
  "Tuesday": "মঙ্গলবার",
  "Wednesday": "বুধবার",
  "Thursday": "বৃহস্পতিবার",
  "Friday": "শুক্রবার",
  "Saturday": "শনিবার",
  "Today": "আজ",
  "Sun": "রবিবার",
  "Mon": "সোমবার",
  "Tue": "মঙ্গলবার",
  "Wed": "বুধবার",
  "Thu": "বৃহস্পতিবার",
  "Fri": "শুক্রবার",
  "Sat": "শনিবার",
  "Ideal window for irrigation and fertilizer application.": "সেচ ও সার প্রয়োগের উপযুক্ত সময়।",
  "Delay foliar spray - rain wash-off risk is elevated.": "পাতায় স্প্রে করা পিছিয়ে দিন—বৃষ্টিতে ধুয়ে যাওয়ার ঝুঁকি বেশি।",
  "Good day for land preparation and weeding operations.": "জমি প্রস্তুত ও আগাছা পরিষ্কারের জন্য ভালো দিন।",
  "Monitor field humidity - fungal pressure rising.": "মাঠের আর্দ্রতা পর্যবেক্ষণ করুন—ছত্রাকের সংক্রমণের ঝুঁকি বাড়ছে।",
  "Secure harvested produce; sudden squalls possible.": "কাটা ফসল নিরাপদে রাখুন; হঠাৎ দমকা হাওয়া হতে পারে।",

  // -------- Titles (notifications / advisory / training) --------
  "Heavy Rainfall Warning (Sherpur & Bogura Sadar)": "ভারী বৃষ্টির সতর্কতা (শেরপুর ও বগুড়া সদর)",
  "Plot A1 Irrigation Schedule Due": "প্লট এ-১ সেচ সময়সূচি নিকটবর্তী",
  "High Humidity & Stem Borer Spore Advisory": "উচ্চ আর্দ্রতা ও কান্ডমাজরা ছত্রাক পরামর্শ",
  "Market Spike: High Yield Maize +12%": "বাজার চড়া: উচ্চ ফলনশীল ভুট্টা +১২%",
  "Government Solar Pump Incentive 2026": "সরকারি সোলার পাম্প প্রণোদনা ২০২৬",
  "GAP Certification Inspection Passed": "জিএপি সার্টিফিকেশন পরিদর্শন উত্তীর্ণ",
  "Precipitation Alert: 35mm Expected": "বৃষ্টিপাত সতর্কতা: ৩৫ মিমি প্রত্যাশিত",
  "Precision Micro-Drip & Solar Irrigation Engineering": "প্রিসিশন মাইক্রো-ড্রিপ ও সোলার সেচ প্রকৌশল",
  "Advanced Integrated Pest Management (IPM) & Bio-agents": "উন্নত সমন্বিত কীটপতঙ্গ ব্যবস্থাপনা (আইপিএম) ও জৈব প্রযুক্তি",
  "Soil Organic Carbon Restoration & Microbial Inoculants": "মাটির জৈব কার্বন পুনরুদ্ধার ও অণুজীব ইনোকুল্যান্ট",
  "Post-Harvest Hermetic Storage & Export Quality Grading": "ফসলোত্তর হারমেটিক সংরক্ষণ ও রপ্তানি মান গ্রেডিং",
  "Barind Tract Groundwater Table & Micro-Nutrient Depletion Index": "বরেন্দ্র অঞ্চলের ভূগর্ভস্থ পানির স্তর ও ক্ষুদ্র-পুষ্টি হ্রাস সূচক",
  "Fall Armyworm & Aphid Satellite Infestation Radar Map": "শুঁয়োপোকা ও জাব পোকা স্যাটেলাইট আক্রমণ রাডার মানচিত্র",
  "Farmer Digital Escrow Settlement & Mobile Payout Speed Audit": "কৃষকের ডিজিটাল এসক্রো নিষ্পত্তি ও মোবাইল পেমেন্ট গতি নিরীক্ষা",
  "Northern Division Rabi Seasonal Yield & Food Reserve Projections": "উত্তরাঞ্চলের রবি মৌসুম ফলন ও খাদ্য মজুদ প্রাক্কলন",
  "Climate Resilient Floating Hydroponics in Flood Basins": "বন্যা অববাহিকায় জলবায়ু-সহনশীল ভাসমান হাইড্রোপনিক্স",
  "Dr. Md. Rafiqul Islam (Senior Entomologist, BARI)": "ডা. মো. রফিকুল ইসলাম (সিনিয়র কীটতত্ত্ববিদ, বারি)",
  "Engr. Sultana Razia (Water Management Specialist, DAE)": "ইঞ্জি. সুলতানা রাজিয়া (পানি ব্যবস্থাপনা বিশেষজ্ঞ, ডিএই)",
  "Prof. AKM Zahid Hossain (BAU Mymensingh)": "অধ্যাপক একেএম জাহিদ হোসেন (বিএইউ ময়মনসিংহ)",
  "Kazi Mahbubul Alam (Quality Assurance Lead, Hortex Foundation)": "কাজী মাহবুবুল আলম (কোয়ালিটি অ্যাসিওরেন্স লিড, হর্টেক্স ফাউন্ডেশন)",

  // -------- Farmer notifications messages --------
  "Isolated heavy rain with localized thunderstorms forecasted within the next 48 hours for Sherpur region.":
    "শেরপুর অঞ্চলে আগামী ৪৮ ঘণ্টায় বিচ্ছিন্ন ভারী বৃষ্টি ও স্থানীয় দানা বাঁধা ঝড়ের পূর্বাভাস।",
  "Meteorological Department radars predict 35-50mm rainfall over the weekend with localized gusts up to 45 km/h.":
    "আবহাওয়া অধিদপ্তরের রাডার সপ্তাহান্তে ৩৫-৫০ মিমি বৃষ্টি এবং স্থানীয়ভাবে ৪৫ কিমি/ঘণ্টা পর্যন্ত ঝোড়ো হাওয়ার পূর্বাভাস দিচ্ছে।",
  "Persistent 75%+ relative humidity creates favorable micro-climate for Yellow Stem Borer incubation.":
    "টানা ৭৫%+ আপেক্ষিক আর্দ্রতা হলুদ কান্ডমাজরা পোকার বিস্তারের অনুকূল পরিবেশ তৈরি করছে।",
  "Plot A1 paddy is entering grain filling. Maintain optimal shallow water layer as recorded in Crop Calendar.":
    "প্লট এ-১ এর ধান শস্য পূরণ পর্যায়ে প্রবেশ করছে। ফসল ক্যালেন্ডারে উল্লেখিত অনুকূল অগভীর পানির স্তর বজায় রাখুন।",
  "Upazila Agricultural Extension Office is accepting applications for 65% subsidized solar irrigation pumps.":
    "উপজেলা কৃষি সম্প্রসারণ অফিস ৬৫% ভর্তুকিযুক্ত সোলার সেচ পাম্পের জন্য আবেদন গ্রহণ করছে।",
  "Wholesale buyers in Bogura industrial feed mill depot are offering BDT 28.50/kg for dry maize lots (>14% moisture).":
    "বগুড়া শিল্প ফিড মিল ডিপোর পাইকারি ক্রেতারা শুকনো ভুট্টা (১৪% এর বেশি আর্দ্রতা) ২৮.৫০ টাকা/কেজি দরে নিচ্ছেন।",
  "Your field audit for Plot C1 Cavendish Banana has passed Good Agricultural Practice criteria with Grade A rating.":
    "প্লট সি-১ ক্যাভেন্ডিশ কলার ফিল্ড অডিট ভালো কৃষি চর্চা (জিএপি) মানদণ্ডে গ্রেড-এ রেটিংসহ উত্তীর্ণ হয়েছে।",

  // -------- Crop log notes --------
  "Band application along ridge base followed by light furrow irrigation.":
    "বেডের গোড়ায় ব্যান্ড প্রয়োগের পর হালকা সেচ।",
  "Critical 21-day stage for crown root initiation.":
    "মূল গঠনের গুরুত্বপূর্ণ ২১ দিনের পর্যায়।",
  "Ensure honeybee boxes are healthy to maximize seed setting rates.":
    "বীজ গঠনের হার সর্বোচ্চ করতে মৌমাছির বাক্সগুলো সুস্থ রাখুন।",
  "Prepare paddy ground for drying 15 days before harvest machine entry.":
    "হারভেস্ট মেশিন প্রবেশের ১৫ দিন আগে ধানের জমি শুকানোর জন্য প্রস্তুত করুন।",
  "Target 180 mature bunch harvest with padded transport crates to prevent bruising.":
    "নষ্ট রোধে প্যাডেড পরিবহন বাক্সে ১৮০টি পরিপক্ব থোপা তুলে ফেলার লক্ষ্য নির্ধারণ করুন।",

  // -------- Training descriptions --------
  "Learn rapid vermicomposting, Trichoderma enrichment, green manuring with Dhaincha, and reversing soil acidity.":
    "দ্রুত ভার্মিকম্পোস্টিং, ট্রাইকোডার্মা সমৃদ্ধকরণ, ঢ্যাঁচা দিয়ে সবুজ সার এবং মাটির অম্লতা ঠিক করার কৌশল শিখুন।",
  "Master non-chemical biological pest controls, Trichogramma wasp parasite releases, pheromone lures, and reducing pesticide residue.":
    "রাসায়নিকবিহীন জৈব কীট ব্যবস্থাপনা, ট্রাইকোগ্রামা পোকা নির্গমন, ফেরোমন ফাঁদ ও কীটনাশক অবশিষ্টাংশ কমানোর পদ্ধতি আয়ত্ত করুন।",
  "Reduce storage grain losses to <1% using SuperGrain bags, moisture meters, cold-chain pre-cooling, and GAP traceability tags.":
    "সুপারগ্রেইন ব্যাগ, আর্দ্রতা মিটার, কোল্ড-চেইন প্রি-কুলিং ও জিএপি ট্রেসেবিলিটি ট্যাগ ব্যবহার করে মজুদ শস্যের ক্ষতি ১% এর নিচে আনুন।",
  "Save 50% water and 40% energy with sensor-driven drip emitters, solar pump sizing, and automated fertigation systems.":
    "সেন্সর-নির্ভর ড্রিপ, সোলার পাম্প সাইজিং ও স্বয়ংক্রিয় ফার্টিগেশন ব্যবস্থায় ৫০% পানি ও ৪০% জ্বালানি বাঁচান।",

  // -------- Storage conditions --------
  "Silo": "সাইলো",
  "Ambient Warehouse": "শুষ্ক গুদাম",
  "Cold Storage": "কোল্ড স্টোরেজ",

  // -------- Admin: produce types --------
  "Paddy Rice": "ধান",
  "Raw Jute Fibers": "কাঁচা পাট তন্তু",
  "Yellow Feed Maize": "হলুদ ফিড ভুট্টা",
  "Boro Rice (BRRI-28)": "বোরো ধান (ব্রি-২৮)",
  "Winter Potato (Diamant)": "শীতকালীন আলু (ডায়ামন্ট)",

  // -------- Admin: hubs & depots --------
  "Mymensingh Cold Depot": "ময়মনসিংহ কোল্ড ডিপো",
  "Natore Trading Mandi": "নাটোর ট্রেডিং মণ্ডী",
  "Dinajpur Grain Terminal": "দিনাজপুর শস্য টার্মিনাল",
  "Mymensingh Cold Complex Hub": "ময়মনসিংহ কোল্ড কমপ্লেক্স হাব",
  "Bogura Central Agritech Silo Hub": "বগুড়া কেন্দ্রীয় এগ্রিটেক সাইলো হাব",
  "Bogura Agro Consolidation Terminal": "বগুড়া কৃষি সমন্বয় টার্মিনাল",
  "Dhaka Tejgaon Central Wholesale Market": "ঢাকা তেজগাঁও কেন্দ্রীয় পাইকারি বাজার",
  "Chattogram Agrabad Superstore Depot": "চট্টগ্রাম আগ্রাবাদ সুপারস্টোর ডিপো",
  "Rajshahi Flour Mill Siding": "রাজশাহী আটা কল সাইডিং",
  "Dhaka Wholesale Agro Syndicate": "ঢাকা পাইকারি কৃষি সিন্ডিকেট",
  "Bogura Regional Grain Testing Lab": "বগুড়া আঞ্চলিক শস্য পরীক্ষণ ল্যাব",
  "Natore Mandi Testing Center": "নাটোর মণ্ডী পরীক্ষণ কেন্দ্র",
  "Dinajpur Grain Quality Station": "দিনাজপুর শস্য মান নিয়ন্ত্রণ কেন্দ্র",
  "Central Farm Silo 1, Sherpur": "কেন্দ্রীয় খামার সাইলো ১, শেরপুর",
  "Cold Room Depot, Bogura Hub": "কোল্ড রুম ডিপো, বগুড়া হাব",
  "Airtight Moisture Proof Bags, Sherpur": "এয়ারটাইট আর্দ্রতা-প্রতিরোধী ব্যাগ, শেরপুর",

  // -------- Admin: payment / purpose --------
  "Nagad Direct": "নগদ ডাইরেক্ট",
  "bKash Merchant": "বিকাশ মার্চেন্ট",
  "BEFTN Bank Transfer": "বিইএফটিএন ব্যাংক ট্রান্সফার",
  "Nagad": "নগদ",
  "Rocket": "রকেট",
  "BEFTN": "বিইএফটিএন",
  "Admin HQ": "প্রশাসনিক সদর দপ্তর",
  "Logistics Fee": "লজিস্টিক ফি",
  "Harvest Sale Payout": "ফসল বিক্রয় পরিশোধ",
  "Subsidy Disbursement": "ভর্তুকি বিতরণ",
  "National Cold Van Logistics": "ন্যাশনাল কোল্ড ভ্যান লজিস্টিকস",
  "Sherpur Farmers Collective (32 farmers)": "শেরপুর কৃষক সমিতি (৩২ জন কৃষক)",

  // -------- Admin: fleet & cargo --------
  "Open Bed Truck": "ওপেন বেড ট্রাক",
  "Refrigerated 5-Ton": "রেফ্রিজারেটেড ৫-টন",
  "Cold-Storage Electric": "কোল্ড-স্টোরেজ ইলেকট্রিক",
  "4°C - 8°C (Chilled)": "৪°সে - ৮°সে (ঠাণ্ডা)",
  "Ambient Dry (<32°C)": "শুষ্ক পরিবেশ (<৩২°সে)",
  "16°C - 22°C (Dry Ambient)": "১৬°সে - ২২°সে (শুষ্ক পরিবেশ)",
  "15 Tons Yellow Feed Maize": "১৫ টন হলুদ ফিড ভুট্টা",
  "12 Tons Milled Rice (BRRI-28)": "১২ টন মিলড চাল (ব্রি-২৮)",
  "8 Tons Organic Fresh Vegetables & Papaya": "৮ টন জৈব তাজা সবজি ও পেঁপে",

  // -------- Admin: dispute reasons (caseStatus stays English for logic) --------
  "Payment Delay": "পেমেন্ট বিলম্ব",
  "Weight Shortage": "ওজন ঘাটতি",
  "Moisture Mismatch": "আর্দ্রতার অমিল",
  "Delivery Transit Spoilage": "পরিবহনে পণ্য নষ্ট",

  // -------- Admin: long audit texts --------
  "Consignment weighbridge slip discrepancy of 320 kg between origin and terminal weigh station.":
    "উৎপত্তিস্থল ও টার্মিনাল ওজন স্টেশনের মধ্যে ৩২০ কেজির ঘাটতির উইব্রিজ স্লিপ অসঙ্গতি।",
  "Escrow auto-release triggered upon digital delivery receipt confirmation after 48h buyer inactivity window expired.":
    "ক্রেতার ৪৮ ঘণ্টার নিষ্ক্রিয়তা শেষে ডিজিটাল ডেলিভারি রসিদ নিশ্চিত হলে এসক্রো স্বয়ংক্রিয়ভাবে মুক্ত হয়েছে।",
  "Reefer compressor failure confirmed via IoT temperature telemetry. Carrier insurance disbursed full BDT 32,000 compensation.":
    "আইওটি তাপমাত্রা টেলিমেট্রির মাধ্যমে রিফার কম্প্রেসার ত্রুটি নিশ্চিত হয়েছে। ক্যারিয়ার বীমা থেকে পূর্ণ ৩২,০০০ টাকা ক্ষতিপূরণ প্রদান করা হয়েছে।",
  "Lab moisture test confirmed 22.4% moisture vs contract specification of 16.0%. Negotiating 15% discount or return to origin.":
    "ল্যাব পরীক্ষায় চুক্তিতে নির্ধারিত ১৬.০% বনাম ২২.৪% আর্দ্রতা পাওয়া গেছে। ১৫% মূল্য ছাড় বা ফেরত নিয়ে আলোচনা চলছে।",
  "Early warning containment successfully capped damage in Bogura and Natore maize belts to under 2.1% economic loss.":
    "প্রারম্ভিক সতর্কতা ব্যবস্থা বগুড়া ও নাটোরের ভুট্টা অঞ্চলের ক্ষয়ক্ষতি ২.১% অর্থনৈতিক ক্ষতির নিচে সীমাবদ্ধ করেছে।",
  "High potassium deficit identified across 42% of tested parcels; recommending targeted MOP subsidies to counter yield caps.":
    "পরীক্ষিত প্লটের ৪২%-এ উচ্চ পটাশিয়াম ঘাটতি চিহ্নিত করা হয়েছে; ফলন সীমাবদ্ধতা মোকাবিলায় টার্গেটেড এমওপি ভর্তুকি সুপারিশ করা হচ্ছে।",
  "Favorable rainfall and increased BARI Gom-33 adoption project a 14.8% higher cereal harvest compared to the 5-year moving average.":
    "অনুকূল বৃষ্টিপাত ও বারি গম-৩৩ গ্রহণ বৃদ্ধির কারণে ৫ বছরের গড়ের তুলনায় ১৪.৮% বেশি শস্য ফলন প্রক্ষেপণ করা হচ্ছে।",
  "Average settlement time to smallholder accounts reduced from 14 days in legacy wholesale mandis to under 3.2 hours via direct escrow.":
    "প্রচলিত পাইকারি মণ্ডীতে ১৪ দিনের নিষ্পত্তিকাল ডাইরেক্ট এসক্রোর মাধ্যমে ক্ষুদ্র কৃষকের অ্যাকাউন্টে ৩.২ ঘণ্টার নিচে নামিয়ে আনা হয়েছে।",

  // -------- Agritech report reporting periods --------
  "Q3 - Q4 2026": "তৃতীয় - চতুর্থ ত্রৈমাসিক ২০২৬",
  "August 2026": "আগস্ট ২০২৬",
  "First Half September 2026": "সেপ্টেম্বর ২০২৬ প্রথমার্ধ",
  "FY 2026 YTD": "বছর ২০২৬ চলতি-এ-পর্যন্ত",

  // -------- Farm expenses (initialFarmExpenses data values) --------
  "Fertilizers": "সার ক্রয়",
  "Pesticides": "কীটনাশক",
  "Labor Wages": "শ্রমিকের মজুরি",
  "Irrigation Energy": "সেচ ও বিদ্যুৎ",
  "Machinery & Fuel": "যন্ত্রপাতি ও জ্বালানি",
  "Seeds & Seedlings": "বীজ ও চারা",
  "Transport & Storage": "পরিবহন ও সংরক্ষণ",
  "Other": "অন্যান্য",
  "Cash": "নগদ",
  "Mobile Banking (bKash/Nagad)": "মোবাইল ব্যাংকিং (বিকাশ/নগদ)",
  "Bank Transfer": "ব্যাংক ট্রান্সফার",
  "Purchase of 3 bags MOP and 2 bags TSP from BADC authorized dealer":
    "বিএডিসি অনুমোদিত ডিলার থেকে ৩ বস্তা এমওপি ও ২ বস্তা টিএসপি সার ক্রয়",
  "Bt Organic suspension and bio-fungicide bottles":
    "বিটি জৈব সাসপেনশন ও জৈব-ছত্রাকনাশক বোতল",
  "Labor payment for manual intercultural weeding and ridge reshaping (4 workers)":
    "হাতে নিড়ানি ও আইল ঠিক করার কাজের মজুরি (৪ শ্রমিক)",
  "Monthly solar inverter maintenance and grid backup tariff electricity":
    "মাসিক সোলার ইনভার্টার রক্ষণাবেক্ষণ ও গ্রিড ব্যাকআপ বিদ্যুৎ বিল",
  "Power tiller diesel and rotary blade servicing for Plot B2 bed preparation":
    "প্লট বি-২ এর বেড প্রস্তুতিতে পাওয়ার টিলারের ডিজেল ও রোটারি ব্লেড সার্ভিসিং",
  "BARI Sharisha-14 foundation seed procurement":
    "বারি সরিষা-১৪ ফাউন্ডেশন বীজ সংগ্রহ",

  // -------- Crop logs (initialCropLogs data values) --------
  "Fertilizer Application": "সার প্রয়োগ",
  "Pest & Disease Spray": "কীট ও রোগ নিয়ন্ত্রণ স্প্রে",
  "Weeding": "আগাছা নিধন ও মাটি খোঁচা",
  "Irrigation": "সেচ প্রদান",
  "Soil Scouting": "মাটি পরিদর্শন ও পর্যবেক্ষণ",
  "Growth Observation": "গাছের বৃদ্ধি পর্যবেক্ষণ",
  "Applied Muriate of Potash (MOP) to accelerate grain filling panicle firmness.":
    "শস্য পূরণের সময় কাণ্ড মজবুত করতে মিউরিয়েট অফ পটাশ (এমওপি) প্রয়োগ করা হয়েছে।",
  "Preventive biocontrol spraying against Fall Armyworm using Bacillus thuringiensis (Bt).":
    "ফল আর্মিওয়ার্ম (শুঁয়োপোকা) দমনে ব্যাসিলাস থুরিনজিয়েনসিস (বিটি) দিয়ে প্রতিরোধমূলক জৈব-স্প্রে প্রয়োগ।",
  "Manual hand hoeing and weed removal of broadleaf weeds.":
    "চওড়া পাতার আগাছা দূর করতে হাত দিয়ে কোদালে মাটি খোঁচা ও আগাছা পরিষ্কার।",
  "Organic cold-pressed neem oil emulsion applied to prevent early aphid colonies.":
    "প্রাথমিক এফিড (জাবপোকা) দমনে জৈব কোল্ড-প্রেসড নিম তেল ইমালসন প্রয়োগ।",
  "Micro-drip irrigation run for 2.5 hours providing targeted root hydration.":
    "মূল পর্যন্ত পানি পৌঁছাতে ২.৫ ঘণ্টার মাইক্রো-ড্রিপ সেচ চালানো হয়েছে।",
  "Clear skies, 29°C, mild breeze": "পরিষ্কার আকাশ, ২৯°সে, মৃদু বাতাস",
  "Overcast, 27°C, low wind speed": "মেঘলা আকাশ, ২৭°সে, কম বাতাসের গতি",
  "Sunny, 31°C": "রোদেলা দিন, ৩১°সে",
  "Partly cloudy, 28°C": "আংশিক মেঘলা, ২৮°সে",
  "Hot, 33°C": "গরম আবহাওয়া, ৩৩°সে",

  // -------- Profitability (initialProfitabilityMetrics data values) --------
  "Mungbean": "মুগ ডাল",
  "Fertilizers & Nutrients": "সার ও পুষ্টি উপাদান",
  "Seeds & Propagation": "বীজ ও চারা-উৎপাদন",
  "Irrigation & Electricity": "সেচ ও বিদ্যুৎ",
  "Pest Control & Scouting": "কীটনাশক ও পরিদর্শন",
  "Apr 2026": "এপ্রিল ২০২৬",
  "May 2026": "মে ২০২৬",
  "Jun 2026": "জুন ২০২৬",
  "Jul 2026": "জুলাই ২০২৬",
  "Aug 2026": "আগস্ট ২০২৬",
  "Sep 2026": "সেপ্টেম্বর ২০২৬",

  // -------- Crop calendar task titles (initialCalendarTasks) --------
  "Monitor Panicle Moisture & Drain Standing Water":
    "শীষের আর্দ্রতা পর্যবেক্ষণ ও দাঁড়ানো পানি নিষ্কাশন করুন",
  "Second Nitrogen Side-Dressing (Urea)":
    "দ্বিতীয় ধাপের নাইট্রোজেন সাইড-ড্রেসিং (ইউরিয়া)",
  "Flower Bud Inspection & Pollinator Bee Box Check":
    "ফুলের মুকুল পরিদর্শন ও পরাগায়নকারী মৌমাছির বাক্স পরীক্ষা",
  "First Batch Bunches Harvesting (Ready Tier)":
    "প্রথম ব্যাচের থোড় কাটা (পাকা পর্যায়)",
  "Crown Root Irrigation Stage Check":
    "মূল—শিকড় গঠনের সেচ ধাপ পরীক্ষা",

  // -------- UI labels (sporadic English literals from module pages) --------
  "Instructor: ": "প্রশিক্ষক: ",
  "Total Minutes": "মোট মিনিট",
  "e.g. Severe Nor'wester (Kalbaishakhi) Storm Warning":
    "যেমন: তীব্র উত্তর-পশ্চিম (কালবৈশাখী) ঝড় সতর্কতা",

  // -------- System audit log (admin dashboard feed + ledger) --------
  "HARVEST_LOT_RECORDED": "ফসল তোলা লট নথিভুক্ত",
  "FARM_CADASTRAL_VERIFIED": "খতিয়ান যাচাই সম্পন্ন",
  "COLD_CHAIN_ALERT_TRIGGERED": "কোল্ড চেইন সতর্কতা সক্রিয়",
  "ADVISORY_BROADCAST": "পরামর্শ সম্প্রচার",
  "HarvestRecord": "ফসল তোলার রেকর্ড",
  "FarmVerification": "খামার যাচাইকরণ",
  "LogisticsFleet": "লজিস্টিকস বহর",
  "AgronomicAdvisory": "কৃষি পরামর্শ",
  "Farmer": "কৃষক",
  "Extension Officer": "সম্প্রসারণ কর্মকর্তা",
  "Automated Daemon": "স্বয়ংক্রিয় সিস্টেম",
  "Agronomist": "কৃষিবিদ",
  "UPDATE": "আপডেট",
  "SYSTEM_EVENT": "সিস্টেম ইভেন্ট",
  "system": "সিস্টেম",
  "CREATE": "তৈরি",
  "DELETE": "মুছে ফেলা",
  "RATE": "রেটিং",
  "Logged 4,200 kg Boro Paddy harvest batch at Sherpur Grain Silo B3":
    "শেরপুর গ্রেইন সাইলো B3-এ ৪,২০০ কেজি বোরো ধান তোলার লট লগ করা হয়েছে",
  "Verified cadastral deed 304 for farmer Abdul Malek Sarker (12 acres)":
    "কৃষক আব্দুল মালেক সরকারের (১২ একর) খতিয়ান দলিল ৩০৪ যাচাই করা হয়েছে",
  "Temperature sensor in Van DHA-11-9021 exceeded threshold (+14.2°C)":
    "ভ্যান DHA-11-9021-এর তাপমাত্রা সেন্সর নির্ধারিত মাত্রা (+১৪.২°সে) ছাড়িয়ে গেছে",
  "Dispatched BPH hopper burn alert across Bogura and Naogaon districts":
    "বগুড়া ও নওগাঁ জেলায় বিএফএইচ হপার বার্ন সতর্কতা প্রেরণ করা হয়েছে",

  // -------- Produce marketplace catalogue (/products seed data) --------
  "Mung Bean (Moog)": "মুগ ডাল (মুগ)",
  "Mustard Seeds": "সরিষা বীজ",
  "Himsagar Mango": "হিমসাগর আম",
  "BRRI dhan-71 Paddy": "ব্রি ধান-৭১",
  "Onion (B_paree)": "পেঁয়াজ (বি-পারী)",
  "Chickpeas (Booter Chola)": "ছোলা",
  "Sesame Seeds (Til)": "তিল বীজ",
  "Sugarcane (JW-76)": "আখ (JW-৭৬)",
  "BARI Mung-6": "বারি মুগ-৬",
  "Rajshahi Orchard Grade": "রাজশাহী বাগানের মান",
  "Late Season Aus": "শেষ মৌসুমের আউশ",
  "BPI Agree-1": "বিপিআই এগ্রি-১",
  "Desi Brown": "দেশি বাদামি",
  "White Til": "সাদা তিল",
  "High Recovery": "উচ্চ রিকভারি",
  "Rangpur Pulse Collection Centre": "রংপুর ডাল সংগ্রহ কেন্দ্র",
  "Jessore Oilseed Crushing Yard": "যশোর তেলবীজ নিষ্পেষণ ইয়ার্ড",
  "Rangpur Agri Produce Collection Centre": "রংপুর কৃষিপণ্য সংগ্রহ কেন্দ্র",
  "Cumilla Rice Mill Cluster": "কুমিল্লা চালকল ক্লাস্টার",
  "Pabna Vegetable Wholesale Hub": "পাবনা সবজি পাইকারি হাব",
  "Bogura Pulse Collection Centre": "বগুড়া ডাল সংগ্রহ কেন্দ্র",
  "Jamalpur Oilseed Collection Point": "জামালপুর তেলবীজ সংগ্রহ কেন্দ্র",
  "Kushtia Sugar Mill Gate": "কুষ্টিয়া চিনিকল গেট",
  "Dinajpur": "দিনাজপুর",
  "Rangpur": "রংপুর",
  "Jashore": "যশোর",
  "Cumilla": "কুমিল্লা",
  "Pabna": "পাবনা",
  "Jamalpur": "জামালপুর",
  "Kushtia": "কুষ্টিয়া",
  "Natore": "নাটোর",

  // -------- Produce catalogue descriptions --------
  "Machine-harvested Boro paddy, sun-dried to 12% moisture and stored at the Bogura silo hub. Uniform long grain with low broken percentage.":
    "মেশিনে কাটা বোরো ধান, ১২% আর্দ্রতায় রোদে শুকিয়ে বগুড়া সাইলো হাবে সংরক্ষিত। সমান লম্বা দানা এবং কম ভাঙা হার।",
  "Cold-stored Diamant seed stock with consistent tuber size. Suitable for both fresh market and chipping-grade processing.":
    "কোল্ড-স্টোরে রাখা ডায়ামন্ট বীজ আলু, কন্দের আকারে সমান। তাজা বাজার ও চিপিং-গ্রেড প্রক্রিয়াজাতকরণ—উভয়ের জন্য উপযুক্ত।",
  "High-starch yellow maize for poultry and cattle feed. Awaiting moisture re-test before release to buyers.":
    "হাঁস-মুরগি ও গবাদি পশুর খাবারের জন্য উচ্চ-স্টার্চ হলুদ ভুট্টা। ক্রেতার কাছে ছাড়ার আগে আর্দ্রতা পুনঃপরীক্ষা চলছে।",
  "Retted tossa jute with good lustre. Flagged pending a root-level grading re-inspection of this consignment.":
    "জাগ দেওয়া টসা পাট, উজ্জ্বল আভাসহ। এই চালানের মূল লেভেল গ্রেডিং পুনরীক্ষার জন্য অপেক্ষমাণ।",
  "Hand-cleaned mung beans, machine-graded and double-winnowed. Consistent size with no weevil damage.":
    "হাতে পরিষ্কার করা মুগ ডাল, মেশিনে গ্রেড ও দ্বিগুণ উড়ানো। আকারে সমান, কোনো পোকামাকড়ের ক্ষতি নেই।",
  "High-oil-content mustard seed at 41% extraction rate. Ideal for local crushing mills and oil expellers.":
    "৪১% তেল নিষ্কাশন হারের উচ্চ-তেলযুক্ত সরিষা বীজ। স্থানীয় তেলকল এবং এক্সপেলার মিলের জন্য আদর্শ।",
  "Naturally ripened Himsagar with high Brix and fibre-free flesh. Packed in ventilated crates for transit.":
    "উচ্চ ব্রিক্স এবং আঁশমুক্ত ফলে প্রাকৃতিকভাবে পাকা হিমসাগর আম। পরিবহনের জন্য বাতাস চলাচলকারী বাক্সে প্যাকেজ করা।",
  "Late-season aus paddy with good milling recovery. Awaiting third-party residue certification.":
    "ভালো মিলিং রিকভারি সম্পন্ন দেরি মৌসুমের আউশ ধান। তৃতীয় পক্ষের অবশিষ্টাংশ সার্টিফিকেশনের অপেক্ষায়।",
  "Cured and neck-trimmed onion with tight scales. Stores well through the rabi season in ventilated bags.":
    "শুকানো ও ঘাড়-ছাঁটা পেঁয়াজ, মজবুত খোসাসহ। বাতাস চলাচলকারী বস্তায় রবি মৌসুমজুড়ে ভালো সংরক্ষণ হয়।",
  "Air-dried desi chickpeas at 10% moisture. Ready for milling or direct retail packing.":
    "১০% আর্দ্রতায় বাতাসে শুকানো দেশি ছোলা। মিলিং অথবা সরাসরি খুচরা প্যাকেজিংয়ের জন্য প্রস্তুত।",
  "Float-cleaned white sesame with low extraneous matter. Awaiting grade confirmation before release.":
    "ফ্লোট-পরিষ্কারকৃত সাদা তিল, কম বিদেশি বস্তুসহ। বিক্রির আগে গ্রেড নিশ্চিতকরণের অপেক্ষায়।",
  "High-recovery cane delivered direct to the mill gate. Rejected — scheduling conflict with the current crushing run.":
    "মিল গেটে সরাসরি পৌঁছানো উচ্চ-রিকভারি আখ। বাতিল — চলমান নিষ্পেষণ প্রক্রিয়ার সাথে সময়সূচি সংঘাত।",

  // -------- Inputs marketplace catalogue (/inputs seed data) --------
  "Urea 50kg Bag": "ইউরিয়া ৫০ কেজির বস্তা",
  "TSP 50kg Bag": "টিএসপি ৫০ কেজির বস্তা",
  "Magnesium Sulphate 5kg": "ম্যাগনেসিয়াম সালফেট ৫ কেজি",
  "BRRI dhan-28 Seed 20kg": "ব্রি ধান-২৮ বীজ ২০ কেজি",
  "Hybrid Onion Seed 100g": "হাইব্রিড পেঁয়াজ বীজ ১০০ গ্রাম",
  "Hybrid Tomato Seed 50g": "হাইব্রিড টমেটো বীজ ৫০ গ্রাম",
  "Neem Oil 1L": "নিম তেল ১ লিটার",
  "Mancozeb 1kg": "ম্যানকোজেব ১ কেজি",
  "Pruning Shear": "ডাল ছাঁটাই কাঁচি",
  "Knapsack Sprayer 16L": "ন্যাপস্যাক স্প্রেয়ার ১৬ লিটার",
  "Drip Irrigation Kit 100m": "ড্রিপ সেচ কিট ১০০ মিটার",
  "Vented Produce Crate": "বাতাস চলাচলকারী ফলের বাক্স",
  "bag": "বস্তা",
  "piece": "পিস",
  "liter": "লিটার",
  "set": "সেট",
  "kg": "কেজি",
  "Granular urea, 46% nitrogen. The workhorse basal dose for paddy and maize.":
    "দানাদার ইউরিয়া, ৪৬% নাইট্রোজেন। ধান ও ভুট্টার জন্য প্রধান বেজাল ডোজ।",
  "Triple superphosphate, 46% P₂O₅. Applied at transplanting for root vigour.":
    "ট্রিপল সুপারফসফেট, ৪৬% P₂O₅। শিকড়ের জোর বাড়াতে রোপণের সময় প্রয়োগ করা হয়।",
  "Corrects interveinal chlorosis in vegetable and fruit crops.":
    "শিরার মধ্যবর্তী হলুদাভ রোগ (ক্লোরোসিস) ঠিক করে — সবজি ও ফলের ফসলে।",
  "Certified aman paddy seed, 105–110 days, drought tolerant.":
    "সার্টিফায়েড আমন ধানের বীজ, ১০৫-১১০ দিন, খরা-সহনশীল।",
  "Atlas hybrid onion seed, 100g sachet, ~8,000 plants.":
    "অ্যাটলাস হাইব্রিড পেঁয়াজ বীজ, ১০০ গ্রাম প্যাকেট, প্রায় ৮,০০০ চারা।",
  "Mintoo Super determinate tomato, disease resistant.":
    "মিন্টু সুপার ডিটারমিনেট টমেটো, রোগ-প্রতিরোধী।",
  "Cold-pressed botanical pesticide. Effective against aphids and mites.":
    "কোল্ড-প্রেসড উদ্ভিজ্জ কীটনাশক। জাব পোকা ও মাইট দমনে কার্যকর।",
  "Protectant fungicide, 80% WP. Blight and leaf-spot programmes.":
    "প্রতিরোধী ছত্রাকনাশক, ৮০% ডব্লিউপি। ব্লাইট ও পাতা-দাগ নিয়ন্ত্রণ প্রোগ্রামে ব্যবহৃত।",
  "Drop-forged bypass shear with sap groove. Suits up to 20mm green wood.":
    "স্যাপ গ্রুভসহ ড্রপ-ফোর্জড বাইপাস কাঁচি। ২০ মিমি পর্যন্ত সবুজ ডালের জন্য উপযুক্ত।",
  "Pressure-indicator knapsack sprayer, 16L, brass nozzle set included.":
    "চাপ-নির্দেশক ন্যাপস্যাক স্প্রেয়ার, ১৬ লিটার, পিতলের নজল সেটসহ।",
  "100m mainline with 20 emitters and filter — covers roughly 0.1 acre of vegetables.":
    "২০টি ইমিটার ও ফিল্টারসহ ১০০ মিটার মেইনলাইন — প্রায় ০.১ একর সবজির জন্য।",
  "Stackable 25kg vented crate for tomato and onion handling.":
    "টমেটো ও পেঁয়াজ পরিবহনের জন্য স্ট্যাকযোগ্য ২৫ কেজির বাতাস চলাচলকারী বাক্স।",
  "pc": "পিস",
  "pack": "প্যাক",
  "Jute Sack (50kg)": "পাটের বস্তা (৫০ কেজি)",
  "Drip Irrigation Kit (1-acre)": "ড্রিপ সেচ কিট (১ একর)",
  "Walk-Behind Power Tiller": "ওয়াক-বিহাইন্ড পাওয়ার টিলার",
  "Field Spade": "ক্ষেতের কোদাল",
  "Pruning Shears (Steel)": "ডাল ছাঁটাই কাঁচি (স্টিল)",
  "Glyphosate 41% SL": "গ্লাইফোসেট ৪১% এসএল",
  "Malathion 57% EC": "ম্যালাথিয়ন ৫৭% ইসি",
  "Organic Compost (50kg)": "জৈব কম্পোস্ট (৫০ কেজি)",
  "DAP Fertilizer": "ডিএপি সার",
  "High-Yield Tomato Seed Pack": "উচ্চ ফলনশীল টমেটো বীজ প্যাক",
  "Hybrid Paddy Seed (BRRI dhan-28)": "হাইব্রিড ধান বীজ (ব্রি ধান-২৮)",
  "Hand-woven 50kg jute sack for paddy, wheat and maize haulage. Breathable, tear-resistant and fully biodegradable, with reinforced stitching that stands up to repeated farm use.":
    "ধান, গম ও ভুট্টা পরিবহনের জন্য হাতে বোনা ৫০ কেজির পাটের বস্তা। টেকসই, ছিঁড়ে না এমন ও সম্পূর্ণ জীবাণুবিয়োজ্য — খামারে বারবার ব্যবহারের উপযোগী মজবুত সেলাইসহ।",
  "Complete drip kit for roughly one acre of vegetables - mainline, laterals, emitter line, filter and all fittings included. Delivers water straight to the root zone, cutting water use by up to 60% and keeping foliage dry to suppress disease.":
    "প্রায় এক একর সবজির জন্য সম্পূর্ণ ড্রিপ কিট — মেইনলাইন, ল্যাটারাল, ইমিটার লাইন, ফিল্টার ও সব ফিটিংসসহ। পানি সরাসরি শিকড়ে পৌঁছায়, পানির ব্যবহার ৬০% পর্যন্ত কমায় এবং পাতা শুকনো রাখায় রোগ দমন হয়।",
  "7HP petrol rotary tiller with reversing gear - tills, ploughs and beds in a single pass. Lightweight enough for one operator, with a 2-year warranty and spare parts readily available.":
    "রিভার্সিং গিয়ারসহ ৭ এইচপি পেট্রোল রোটারি টিলার — এক ধাপেই চাষ, জমি তৈরি ও বেড। একজন অপারেটরের জন্য যথেষ্ট হালকা, ২ বছরের ওয়ারেন্টি ও সহজলভ্য খুচরা যন্ত্রাংশসহ।",
  "Wooden-handle field spade with a hardened steel blade for digging, lifting and planting row after row. A sturdy all-round garden and field tool with a comfortable grip and durable riveted head.":
    "শক্ত ইস্পাতের ফলাসহ কাঠের হাতল কোদাল — সারিবদ্ধভাবে খনন, উত্তোলন ও রোপণের জন্য। আরামদায়ক গ্রিপ ও টেকসই রিভেটেড মাথাসহ সর্ব-উদ্দেশ্য বাগান ও ক্ষেতের সরঞ্জাম।",
  "Drop-forged carbon-steel bypass pruner with a precision-ground sap groove. Slices cleanly through branches up to 20mm without crushing the stem, while the non-slip grip and self-opening spring keep the action smooth all season.":
    "প্রিসিশন-গ্রাউন্ড স্যাপ গ্রুভসহ ড্রপ-ফোর্জড কার্বন-স্টিল বাইপাস প্রুনার। কাণ্ড না চ্যাপ্টা করে ২০ মিমি পর্যন্ত ডাল পরিষ্কার কাটে; নন-স্লিপ গ্রিপ ও সেলফ-ওপেনিং স্প্রিং পুরো মৌসুমে মসৃণ ব্যবহার নিশ্চিত করে।",
  "Non-selective systemic herbicide for pre-plant and inter-row weed control. Kills annual and perennial weeds to the root within 4-7 days; a 1L bottle covers roughly one bigha of cropland.":
    "রোপণের আগে ও সারি-মাঝে আগাছা দমনের জন্য নন-সিলেক্টিভ সিস্টেমিক হার্বিসাইড। ৪-৭ দিনের মধ্যে বার্ষিক ও বহুবর্ষজীবী আগাছাকে শিকড়সহ মেরে ফেলে; ১ লিটার বোতল প্রায় এক বিঘা জমির জন্য যথেষ্ট।",
  "Broad-spectrum contact insecticide for aphids, jassids and fruit borers on vegetables and pulses. Low residual risk - safe to spray up to a week before harvest.":
    "সবজি ও ডালে জাব পোকা, সাদামাছি ও ফল-ছিদ্রকারী পোকা দমনের ব্রড-স্পেকট্রাম কন্ট্যাক্ট কীটনাশক। কম অবশিষ্টাংশের ঝুঁকি — ফসল তোলার এক সপ্তাহ আগেও স্প্রে করা নিরাপদ।",
  "Fully decomposed poultry-marsh compost rich in organic matter and balanced NPK. Improves soil structure, water retention and microbial life for vegetable and fruit beds.":
    "জৈব পদার্থ ও সুষম এনপিকে সমৃদ্ধ সম্পূর্ণ পচানো হাঁস-মুরগির কম্পোস্ট। সবজি ও ফলের বেডে মাটির গঠন, পানি ধারণ ক্ষমতা ও অণুজীব কার্যক্রম উন্নত করে।",
  "Di-ammonium phosphate (18-46-0) for the basal dose at transplanting and sowing. Supplies phosphorus for strong root development alongside a nitrogen boost - ideal for paddy, maize and oilseed.":
    "রোপণ ও বপনের সময় বেজাল ডোজের জন্য ডাই-অ্যামোনিয়াম ফসফেট (১৮-৪৬-০)। নাইট্রোজেন বুস্টসহ শিকড়ের দৃঢ় বৃদ্ধিতে ফসফরাস সরবরাহ করে — ধান, ভুট্টা ও তেলবীজের জন্য আদর্শ।",
  "Hybrid tomato seed, 10g pack (~500 seeds). Determinate and disease-tolerant against viral and bacterial wilt, with high fruit set and good shelf life for market growers.":
    "হাইব্রিড টমেটো বীজ, ১০ গ্রাম প্যাক (~৫০০ বীজ)। ডিটারমিনেট ও ভাইরাল/ব্যাকটেরিয়াল উইল্ট-সহনশীল; উচ্চ ফলন ও ভালো শেলফ-লাইফ, বাজার-ভিত্তিক চাষিদের জন্য।",
  "Certified BRRI dhan-28 hybrid paddy seed with 92% germination. Short-duration aman variety (105-110 days), drought-tolerant and the preferred choice of local millers.":
    "৯২% অঙ্কুরোদগমসহ সার্টিফায়েড ব্রি ধান-২৮ হাইব্রিড ধান বীজ। স্বল্প-মেয়াদি আমন জাত (১০৫-১১০ দিন), খরা-সহনশীল ও স্থানীয় চালকলের পছন্দ।",

  "Reusable 25kg vented crate that protects tomato, onion and chili in transit. Side ventilation keeps the load cool and reduces bruising, while the stackable design rides steady in the vehicle and empties easily at the market.": "টমেটো, পেঁয়াজ ও মরিচ পরিবহনে সুরক্ষা দেয় এমন পুনর্ব্যবহারযোগ্য ২৫ কেজির বাতাস চলাচলকারী বাক্স। পাশের বাতাস চলাচল লোড ঠান্ডা রাখে ও আঠা-চাপ কমায়; স্ট্যাকযোগ্য ডিজাইন গাড়িতে স্থির থাকে এবং বাজারে সহজে খালি হয়।",
  "100m drip line with 20 emitters and an inline filter, ready to water roughly 0.1 acre of vegetables. Delivers a measured flow straight to the roots — cutting water use and keeping foliage dry — ideal for onion, chili and gourds.": "২০টি ইমিটার ও ইনলাইন ফিল্টারসহ ১০০ মিটার ড্রিপ লাইন — প্রায় ০.১ একর সবজির জন্য প্রস্তুত। শিকড় পর্যন্ত পরিমাপকৃত প্রবাহ পৌঁছায় — পানির ব্যবহার কমায় ও পাতা শুকনো রাখে — পেঁয়াজ, মরিচ ও কুমড়াজাতীয় ফসলের জন্য আদর্শ।",
  "16L knapsack sprayer with a pressure indicator and full brass nozzle set. Effortless, even pumping keeps pressure steady for uniform coverage of pesticide, herbicide or foliar feed on vegetables, pulses and small orchards.": "চাপ নির্দেশক ও পূর্ণ পিতল-নজল সেটসহ ১৬ লিটার ন্যাপস্যাক স্প্রেয়ার। সহজ ও সমান পাম্পিং চাপ স্থির রাখে, ফলে সবজি, ডাল ও ছোট বাগানে কীটনাশক, হার্বিসাইড বা ফলিয়ার ফিডের সমান ছিটানো হয়।",
  "Drop-forged bypass shear with a sap groove that stays sharp through heavy cutting. Slices cleanly through green wood up to 20mm, with a comfortable grip for day-long pruning of fruit trees and vines.": "ভারী কাটাতেও ধারালো থাকা স্যাপ গ্রুভসহ ড্রপ-ফোর্জড বাইপাস কাঁচি। ফলের গাছ ও লতায় সারাদিন ছাঁটাইয়ের আরামদায়ক গ্রিপসহ ২০ মিমি পর্যন্ত সবুজ ডাল পরিষ্কারভাবে কাটে।",
  "Water-dispersible protectant fungicide (80% WP) for blight, leaf spot and rust on potato, tomato and vegetables. Forms a protective film over the foliage — apply regularly as part of a preventive spray programme.": "আলু, টমেটো ও সবজিতে ব্লাইট, পাতা-দাগ ও মরিচা রোগের জন্য পানি-মিশ্রণযোগ্য প্রতিরোধী ছত্রাকনাশক (৮০% ডব্লিউপি)। পাতায় প্রতিরক্ষামূলক স্তর তৈরি করে — প্রতিরোধমূলক স্প্রে কর্মসূচির অংশ হিসেবে নিয়মিত প্রয়োগ করুন।",
  "Cold-pressed neem oil botanical pesticide effective against aphids, mites and whitefly. A safe, eco-friendly choice that disrupts pest feeding and development on vegetables and ornamentals without harsh chemical residues.": "জাব পোকা, মাইট ও সাদামাছি দমনে কার্যকর কোল্ড-প্রেসড নিম তেল-উদ্ভিজ্জ কীটনাশক। কঠিন রাসায়নিক অবশিষ্টাংশ ছাড়াই সবজি ও শোভাবর্ধক গাছে পোকার খাদ্য গ্রহণ ও বৃদ্ধি বাধা দেয় — নিরাপদ ও পরিবেশবান্ধব।",
  "Mintoo Super determinate hybrid tomato — vigorous, disease-resistant and heavy setting. The compact plant habit suits both trellised and stake-free field growing, with firm fruit that grades well for the market.": "মিন্টু সুপার ডিটারমিনেট হাইব্রিড টমেটো — উদ্যমী, রোগ-প্রতিরোধী ও প্রচুর ফলধারী। কমপ্যাক্ট গাছ ট্রেলিসযুক্ত ও বিনা ট্রেলিস উভয় পদ্ধতিতে চাষের উপযুক্ত; বাজারে ভালো গ্রেড পাওয়া শক্ত ফল।",
  "Atlas hybrid onion seed, 100g sachet raising roughly 8,000 plants. Produces uniform bulbs with tight skin and good pungency, bred for the short-day winter season and prized for excellent keeping quality.": "অ্যাটলাস হাইব্রিড পেঁয়াজ বীজ, ১০০ গ্রাম প্যাকেট — প্রায় ৮,০০০ চারা। মজবুত খোসা ও ভালো তীক্ষ্ণতাসহ সমান আকারের কন্দ উৎপন্ন করে; স্বল্প-দিনের শীত মৌসুমের জন্য উদ্ভাবিত এবং দীর্ঘ সংরক্ষণক্ষমতার জন্য খ্যাত।",
  "Certified BRRI dhan-28 aman paddy seed — the short-duration (105–110 day) variety that fits the late-planting window perfectly. Drought-tolerant and well adapted to rain-fed fields, giving a dependable yield of miller-preferred grain.": "সার্টিফায়েড ব্রি ধান-২৮ আমন ধানের বীজ — দেরিতে রোপণের উইন্ডোতে মানানসই স্বল্প-মেয়াদি (১০৫–১১০ দিন) জাত। খরা-সহনশীল ও বৃষ্টি-নির্ভর মাঠের উপযুক্ত, চালকল-পছন্দের শস্যের নির্ভরযোগ্য ফলন দেয়।",
  "Water-soluble magnesium sulphate (Epsom salt) that corrects interveinal chlorosis — yellowing between the veins — in vegetables and fruit. Boosts chlorophyll for deeper green growth, and works equally well as a soil drench or foliar spray.": "সবজি ও ফলে শিরার মধ্যবর্তী হলদে ভাব (ক্লোরোসিস) ঠিক করে এমন পানি-দ্রবণীয় ম্যাগনেসিয়াম সালফেট (ইপসম সল্ট)। গাঢ় সবুজ বৃদ্ধির জন্য ক্লোরোফিল বাড়ায়; মাটিতে প্রয়োগ বা ফলিয়ার স্প্রে — দুভাবেই সমান কার্যকর।",
  "Triple superphosphate (46% P₂O₅) for the basal dose, spread at transplanting or sowing to drive vigorous rooting. Its high phosphorus content suits paddy, wheat and pulse establishment, especially on phosphorus-poor soils.": "রোপণ বা বপনের সময় ছড়িয়ে শক্তিশালী শিকড় গঠনে সহায়তা করা বেজাল ডোজের ট্রিপল সুপারফসফেট (৪৬% P₂O₅)। উচ্চ ফসফরাস উপাদান ধান, গম ও ডালের চারা গঠনে উপযুক্ত, বিশেষত ফসফরাস-স্বল্প মাটিতে।",
  "Granular urea with 46% nitrogen — the workhorse basal and top-dressing fertilizer for paddy and maize. Quick-release nitrogen fuels strong vegetative growth, while the even granule size spreads and dissolves uniformly in the field.": "ধান ও ভুট্টার প্রধান বেজাল ও টপ-ড্রেসিং সার — ৪৬% নাইট্রোজেনসমৃদ্ধ দানাদার ইউরিয়া। দ্রুত-মুক্ত নাইট্রোজেন সবল কান্ড-পাতার বৃদ্ধি চালায়; সমান দানার আকার মাঠে সমভাবে ছড়িয়ে ও গলে যায়।",
  "Complete drip kit for roughly one acre of vegetables — mainline, laterals, emitter line, filter and all fittings included. Delivers water straight to the root zone, cutting water use by up to 60% and keeping foliage dry to suppress disease.": "প্রায় এক একর সবজির জন্য সম্পূর্ণ ড্রিপ কিট — মেইনলাইন, ল্যাটারাল, ইমিটার লাইন, ফিল্টার ও সব ফিটিংসসহ। পানি সরাসরি শিকড়ে পৌঁছায়, পানির ব্যবহার ৬০% পর্যন্ত কমায় এবং পাতা শুকনো রাখায় রোগ দমন হয়।",
  "7HP petrol rotary tiller with reversing gear — tills, ploughs and beds in a single pass. Lightweight enough for one operator, with a 2-year warranty and spare parts readily available.": "রিভার্সিং গিয়ারসহ ৭ এইচপি পেট্রোল রোটারি টিলার — এক ধাপেই চাষ, জমি তৈরি ও বেড। একজন অপারেটরের জন্য যথেষ্ট হালকা, ২ বছরের ওয়ারেন্টি ও সহজলভ্য খুচরা যন্ত্রাংশসহ।",
  "Non-selective systemic herbicide for pre-plant and inter-row weed control. Kills annual and perennial weeds to the root within 4–7 days; a 1L bottle covers roughly one bigha of cropland.": "রোপণের আগে ও সারি-মাঝে আগাছা দমনের জন্য নন-সিলেক্টিভ সিস্টেমিক হার্বিসাইড। ৪–৭ দিনের মধ্যে বার্ষিক ও বহুবর্ষজীবী আগাছাকে শিকড়সহ মেরে ফেলে; ১ লিটার বোতল প্রায় এক বিঘা জমির জন্য যথেষ্ট।",
  "Broad-spectrum contact insecticide for aphids, jassids and fruit borers on vegetables and pulses. Low residual risk — safe to spray up to a week before harvest.": "সবজি ও ডালে জাব পোকা, সাদামাছি ও ফল-ছিদ্রকারী পোকা দমনের ব্রড-স্পেকট্রাম কন্ট্যাক্ট কীটনাশক। কম অবশিষ্টাংশের ঝুঁকি — ফসল তোলার এক সপ্তাহ আগেও স্প্রে করা নিরাপদ।",
  "Di-ammonium phosphate (18-46-0) for the basal dose at transplanting and sowing. Supplies phosphorus for strong root development alongside a nitrogen boost — ideal for paddy, maize and oilseed.": "রোপণ ও বপনের সময় বেজাল ডোজের জন্য ডাই-অ্যামোনিয়াম ফসফেট (১৮-৪৬-০)। নাইট্রোজেন বুস্টসহ শিকড়ের দৃঢ় বৃদ্ধিতে ফসফরাস সরবরাহ করে — ধান, ভুট্টা ও তেলবীজের জন্য আদর্শ।",
  "Certified BRRI dhan-28 hybrid paddy seed with 92% germination. Short-duration aman variety (105–110 days), drought-tolerant and the preferred choice of local millers.": "৯২% অঙ্কুরোদগমসহ সার্টিফায়েড ব্রি ধান-২৮ হাইব্রিড ধান বীজ। স্বল্প-মেয়াদি আমন জাত (১০৫–১১০ দিন), খরা-সহনশীল ও স্থানীয় চালকলের পছন্দ।",

  // -------- Demand board: product & variety vocabulary --------
  "Rice": "ধান",
  "Paddy": "ধান",
  "Aman": "আমন",
  "Boro": "বোরো",
  "Aus": "আউশ",
  "Parboiled Rice": "আটাশ চাল",
  "Premium Rice": "প্রিমিয়াম চাল",
  "Chinigura Rice": "চিনিগুড়া ধান",
  "Kalijira Rice": "কালিজিরা ধান",
  "Aromatic Rice": "সুগন্ধি চাল",
  "Hybrid Rice": "হাইব্রিড ধান",
  "Maize": "ভুট্টা",
  "Corn": "ভুট্টা",
  "Barley": "যব",
  "Pearl Millet": "বাজরা",
  "Sorghum": "জোয়ার",
  "Onion": "পেঁয়াজ",
  "Garlic": "রসুন",
  "Ginger": "আদা",
  "Chili": "মরিচ",
  "Green Chili": "কাঁচা মরিচ",
  "Red Chili": "লাল মরিচ",
  "Brinjal": "বাইগন",
  "Eggplant": "বাইগন",
  "Okra": "ঢেঁড়স",
  "Ladies Finger": "ঢেঁড়স",
  "Cucumber": "শসা",
  "Cauliflower": "ফুলকপি",
  "Cabbage": "বাঁধাকপি",
  "Radish": "মুলা",
  "Carrot": "গাজর",
  "Beetroot": "বিটরুট",
  "Spinach": "পালং শাক",
  "Amaranth": "লাল শাক",
  "Drumstick": "সজনে ডাঁটা",
  "Capsicum": "ক্যাপসিকাম",
  "Sweet Pepper": "মিষ্টি মরিচ",
  "Coriander": "ধনেপাতা",
  "Fenugreek": "মেথি",
  "Bitter Gourd": "করলা",
  "Pointed Gourd": "পটল",
  "Snake Gourd": "চিচিঙ্গা",
  "Bottle Gourd": "লাউ",
  "Ridge Gourd": "ঝিঙে",
  "Pumpkin": "কুমড়া",
  "Sweet Potato": "মিষ্টি আলু",
  "Taro": "কচু",
  "Mango": "আম",
  "Banana": "কলা",
  "Pineapple": "আনারস",
  "Papaya": "পেঁপে",
  "Guava": "পেয়ারা",
  "Litchi": "লিচু",
  "Jackfruit": "কাঁঠাল",
  "Watermelon": "তরমুজ",
  "Muskmelon": "খরমুজ",
  "Melon": "খরমুজ",
  "Coconut": "ডাব",
  "Betel Nut": "সুপারি",
  "Orange": "কমলা",
  "Apple": "আপেল",
  "Grapes": "আঙুর",
  "Pomegranate": "বেদানা",
  "Pear": "নাশপাতি",
  "Peach": "পিচ",
  "Custard Apple": "শরিফা",
  "Rose Apple": "জাম",
  "Wood Apple": "বেল",
  "Strawberry": "স্ট্রবেরি",
  "Mung Bean": "মুগ ডাল",
  "Lentil": "মসুর ডাল",
  "Masoor": "মসুর ডাল",
  "Chickpea": "ছোলা",
  "Bengal Gram": "কালাই ডাল",
  "Black Gram": "কালো ডাল",
  "Cowpea": "বরবটি",
  "Peas": "মটরশুঁটি",
  "Pea": "মটরশুঁটি",
  "Pigeon Pea": "কালাই ডাল",
  "Grass Pea": "খেসারি",
  "Soybean": "সয়াবিন",
  "Soyabean": "সয়াবিন",
  "Groundnut": "বাদাম",
  "Peanut": "বাদাম",
  "Sesame": "তিল",
  "Sunflower": "সূর্যমুখী",
  "Jute": "পাট",
  "Cotton": "কাপাস",
  "Sugarcane": "আখ",
  "Tobacco": "তামাক",
  "Tea": "চা",
  "Turmeric": "হলুদ",
  "Cumin": "জিরা",
  "Cardamom": "এলাচ",
  "Cinnamon": "দারুচিনি",
  "Black Pepper": "কালো মরিচ",
  "Cloves": "লবঙ্গ",
  "Nutmeg": "জয়ফল",
  "Mushroom": "মাশরুম",
  "Honey": "মধু",
  "Vegetables": "সবজি",
  "Vegetable": "সবজি",
  "Fruits": "ফল",
  "Fruit": "ফল",
  "Spices": "মসলা",
  "Spice": "মসলা",
  "Pulses": "ডাল",
  "Oilseeds": "তৈলবীজ",
  "Grains": "শস্য",
  "Grain": "শস্য",
  "Crop": "ফসল",
  "Crops": "ফসল",
  "Seed": "বীজ",
  "Seeds": "বীজ",
  "Potato Seed": "আলু বীজ",
  "Vegetable Seed": "সবজির বীজ",
  "Premium": "প্রিমিয়াম",
  "High Quality": "উচ্চ মান",
  "Good Quality": "ভালো মান",
  "Export Quality": "রপ্তানি মান",
  "Premium Grade": "প্রিমিয়াম গ্রেড",
  "Local": "স্থানীয়",
  "Selected": "নির্বাচিত",
  "Hybrid": "হাইব্রিড",
  "Improved": "উন্নত",
  "Variety": "জাত",
  "Quality": "মান",
  "Clean": "পরিষ্কার",
  "Dry": "শুকনো",
  "Dried": "শুকনো",
  "Large": "বড়",
  "Medium": "মাঝারি",
  "Small": "ছোট",
  "Size": "আকার",
  "Grade": "গ্রেড",
  "Winter": "শীতকালীন",
  "Summer": "গ্রীষ্মকালীন",
  "Rainy": "বর্ষাকালীন",
  "Farm Fresh": "খামারের তাজা",
  "Hand-picked": "হাতে বাছাই",
  "Sorted": "বাছাই করা",
  "Moisture": "আর্দ্রতা",
  "Low Moisture": "কম আর্দ্রতা",

  // -------- Produce catalogue tags --------
  "paddy": "ধান",
  "boro": "বোরো",
  "irrigated": "সেচকৃত",
  "potato": "আলু",
  "cold-stored": "কোল্ড-স্টোর",
  "winter": "শীতকাল",
  "maize": "ভুট্টা",
  "feed": "ফিড",
  "high-starch": "উচ্চ-স্টার্চ",
  "jute": "পাট",
  "tossa": "টসা",
  "fiber": "তন্তু",
  "mung": "মুগ",
  "pulse": "ডাল",
  "protein": "প্রোটিন",
  "mustard": "সরিষা",
  "oilseed": "তেলবীজ",
  "crushing": "নিষ্পেষণ",
  "mango": "আম",
  "himsagar": "হিমসাগর",
  "fresh": "তাজা",
  "aus": "আউশ",
  "milling": "মিলিং",
  "onion": "পেঁয়াজ",
  "cured": "শুকানো",
  "storage": "সংরক্ষণ",
  "chickpea": "ছোলা",
  "desi": "দেশি",
  "sesame": "তিল",
  "til": "তিল",
  "sugarcane": "আখ",
  "mill-grade": "মিল-গ্রেড",
};

function localizeString(value: string): string {
  const mapped = BN_DATA_DICT[value];
  return mapped ?? value;
}

export function localizeDeep<T>(data: T): T {
  if (typeof data === 'string') {
    return localizeString(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => localizeDeep(item)) as unknown as T;
  }
  if (data && typeof data === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      out[key] = localizeDeep((data as Record<string, unknown>)[key]);
    }
    return out as unknown as T;
  }
  return data;
}