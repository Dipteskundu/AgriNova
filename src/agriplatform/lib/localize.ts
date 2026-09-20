/**
 * Display-time localization for mock data values.
 * Only strings present in BN_DATA_DICT are translated (BN mode).
 * Logic-critical fields (status, category, type, id, dates, phone,...) are intentionally
 * ABSENT from the dictionary so comparisons in module code never break.
 */

import type { Language } from './LanguageContext';
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
  "Bogura": "বগুড়া",
  "Rajshahi": "রাজশাহী",
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
  "Mirzapur": "মির্জাপুর",
  "Sherpur": "শেরপুর",

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
  "Sandy Clay Loam": "বেলে-এঁটেল দোআঁশ",
  "Reddish Clay Alluvium": "লালচে এঁটেল পলি",
  "Deep Tube Well": "গভীর নলকূপ",
  "Canal": "খাল",
  "Drip": "ড্রিপ",
  "Solar Powered Submersible Aquifer": "সোলার চালিত সাবমার্সিবল অ্যাকুইফার",
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
  "Logistics Fee": "লজিস্টিক ফি",
  "Harvest Sale Payout": "ফসল বিক্রয় পরিশোধ",
  "Subsidy Disbursement": "ভর্তুকি বিতরণ",

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