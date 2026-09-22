/**
 * Global TypeScript Interfaces & Types for Agriculture Platform
 * Strict typing across Farmer Portal (16 modules) & Admin Portal (10 modules)
 */

// ==========================================
// COMMON / CORE TYPES
// ==========================================

export type PortalType = 'farmer' | 'marketplace' | 'operations' | 'support' | 'admin';

export type UserRole = 'farmer' | 'buyer' | 'supplier' | 'inspector' | 'logistics' | 'support' | 'admin';

export type StatusType = 'active' | 'pending' | 'completed' | 'cancelled' | 'warning' | 'in_progress' | 'verified' | 'rejected' | 'resolved';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  error?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// FARMER PORTAL DOMAIN TYPES
// ==========================================

export interface FarmerProfile {
  id: string;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  avatarUrl: string;
  dateOfBirth: string;
  farmingExperienceYears: number;
  primaryLocation: {
    division: string;
    district: string;
    upazila: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
  };
  certifications: Array<{
    name: string;
    issuingAuthority: string;
    issuedYear: number;
    verified: boolean;
  }>;
  farmerClub: string;
  totalAcreage: number;
  registeredSince: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  totalAreaAcres: number;
  soilClassification: string;
  irrigationType: 'Drip' | 'Canal' | 'Deep Tube Well' | 'Sprinkler' | 'Rainfed';
  waterSource: string;
  activeFieldsCount: number;
  registeredDate: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'fallow' | 'under_lease';
}

export interface Field {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  sizeAcres: number;
  currentCrop?: string;
  soilPh: number;
  nitrogenLevelKgPerHa: number;
  phosphorusLevelKgPerHa: number;
  potassiumLevelKgPerHa: number;
  moisturePercentage: number;
  ndviScore: number; // 0.0 - 1.0 (Normalized Difference Vegetation Index)
  irrigationStatus: 'Optimal' | 'Needed' | 'Over-watered' | 'Scheduled';
  lastSoilTested: string;
  status: 'cultivated' | 'prepared' | 'resting';
}

export interface CropBatch {
  id: string;
  fieldId: string;
  fieldName: string;
  cropName: string;
  variety: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Vegetable' | 'Fruit' | 'Cash Crop';
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Grain Filling' | 'Maturity';
  growthProgressPercent: number;
  targetYieldKg: number;
  healthRating: 'Excellent' | 'Good' | 'Moderate' | 'Stressed';
  seedSource: string;
  lastAction: string;
  lastActionDate: string;
}

export interface CropLog {
  id: string;
  cropBatchId: string;
  cropName: string;
  fieldName: string;
  activityType: 'Fertilizer Application' | 'Pest & Disease Spray' | 'Weeding' | 'Irrigation' | 'Soil Scouting' | 'Growth Observation';
  date: string;
  details: string;
  inputUsed?: string;
  dosageQuantity?: string;
  costIncurred: number;
  operatorName: string;
  weatherConditionAtApplication: string;
  photoUrl?: string;
}

export interface CalendarTask {
  id: string;
  cropBatchId: string;
  cropName: string;
  fieldName: string;
  taskTitle: string;
  taskType: 'Sowing' | 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Scouting' | 'Harvest';
  scheduledDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

export interface CropRecommendationInput {
  soilType: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  rainfallMm: number;
  temperatureCelsius: number;
  season: 'Kharif-1 (Early Summer)' | 'Kharif-2 (Monsoon)' | 'Rabi (Winter)';
  targetLandSizeAcres: number;
}

export interface CropRecommendationItem {
  id: string;
  cropName: string;
  scientificName: string;
  suitabilityScore: number; // 0 - 100
  recommendedVariety: string;
  maturityPeriodDays: number;
  estimatedYieldKgPerAcre: number;
  estimatedCostPerAcre: number;
  expectedMarketPricePerKg: number;
  estimatedRevenuePerAcre: number;
  estimatedProfitPerAcre: number;
  roiPercentage: number;
  riskFactor: 'Low' | 'Medium' | 'High';
  waterRequirementMm: number;
  keyAdvantages: string[];
  climateResilience: string;
}

export interface CropComparisonProfile {
  id: string;
  cropName: string;
  variety: string;
  season: string;
  waterRequirementLitersPerKg: number;
  seedCostPerAcre: number;
  totalInputCostPerAcre: number;
  maturityDays: number;
  yieldKgPerAcre: number;
  marketPricePerKg: number;
  netMarginPercent: number;
  pestVulnerability: 'Low' | 'Moderate' | 'High';
  laborIntensityDays: number;
  shelfLifeDays: number;
  governmentSubsidiesEligible: boolean;
}

export interface HarvestRecord {
  id: string;
  cropBatchId: string;
  cropName: string;
  variety: string;
  fieldName: string;
  harvestDate: string;
  quantityKg: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
  moisturePercentage: number;
  storageLocation: string;
  batchCode: string;
  storageCondition: 'Ambient Warehouse' | 'Cold Storage' | 'Silo' | 'Farm Shed';
  marketReadiness: 'Ready for Sale' | 'Drying Required' | 'Sold' | 'Retained for Seeds';
  estimatedValuationBdt: number;
}

export interface FarmExpense {
  id: string;
  date: string;
  category: 'Seeds & Seedlings' | 'Fertilizers' | 'Pesticides' | 'Labor Wages' | 'Machinery & Fuel' | 'Irrigation Energy' | 'Transport & Storage' | 'Other';
  fieldOrFarm: string;
  cropName?: string;
  description: string;
  amountBdt: number;
  paymentMethod: 'Cash' | 'Mobile Banking (bKash/Nagad)' | 'Bank Transfer';
  receiptReference?: string;
}

export interface ProfitabilityMetrics {
  totalRevenueBdt: number;
  totalExpensesBdt: number;
  netProfitBdt: number;
  profitMarginPercent: number;
  revenueByCrop: Array<{ cropName: string; revenue: number; expense: number; profit: number }>;
  monthlyFinancials: Array<{ month: string; revenue: number; expense: number }>;
  costBreakdownByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

export interface WeatherData {
  current: {
    tempCelsius: number;
    feelsLike: number;
    condition: string;
    icon: string;
    humidityPercent: number;
    windSpeedKmh: number;
    precipitationProbability: number;
    uvIndex: number;
    solarRadiationWsqm: number;
    soilTempCelsius: number;
  };
  dailyForecast: Array<{
    date: string;
    dayName: string;
    tempMin: number;
    tempMax: number;
    condition: string;
    icon: string;
    rainProbability: number;
    farmingAdvisory: string;
  }>;
  microclimateAlerts: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'advisory';
    title: string;
    message: string;
    validUntil: string;
    actionRequired: string;
  }>;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'Agronomy' | 'Irrigation & Water' | 'Pest Management' | 'Soil Health' | 'Post-Harvest' | 'Agribusiness';
  instructor: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCount: number;
  completedLessonsCount: number;
  rating: number;
  thumbnail: string;
  description: string;
  syllabus: Array<{ title: string; duration: string; completed: boolean }>;
}

export interface AiRecommendationDiagnostic {
  soilDeficiencies: Array<{ nutrient: string; currentLevel: string; optimalLevel: string; status: 'Deficient' | 'Sufficient' | 'Excessive' }>;
  recommendedFertilizers: Array<{ name: string; dosagePerAcre: string; applicationWindow: string; purpose: string }>;
  riskFactors: Array<{ factor: string; impact: 'Low' | 'Medium' | 'High'; mitigationStrategy: string }>;
  agronomicRationale: string;
  yieldPotentialPrediction: { minimumYield: number; maximumYield: number; unit: string; confidenceLevel: number };
}

export interface FarmerNotification {
  id: string;
  type: 'weather' | 'crop_schedule' | 'subsidy' | 'market_price' | 'system' | 'inspection';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
  priority: 'low' | 'medium' | 'high';
}

// ==========================================
// ADMIN PORTAL DOMAIN TYPES (Admin Oversight Only)
// ==========================================

export interface AdminKpiMetrics {
  totalRegisteredFarmers: number;
  totalActiveFarms: number;
  monitoredAcreage: number;
  projectedAnnualYieldTons: number;
  enrolledTrainingFarmers: number;
  activeDisputesCount: number;
  totalPlatformTransactionsBdt: number;
  systemHealthStatus: 'Healthy' | 'Degraded' | 'Maintenance';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Farmer' | 'Agronomist' | 'Extension Officer' | 'Platform Admin';
  region: string;
  status: 'Active' | 'Pending Verification' | 'Suspended';
  registrationDate: string;
  verificationBadge: boolean;
  nationalIdNumber: string;
}

export interface MarketplaceListingAdminView {
  id: string;
  farmerName: string;
  farmerPhone: string;
  produceName: string;
  variety: string;
  category: string;
  quantityAvailableKg: number;
  askingPricePerKg: number;
  suggestedFloorPrice: number;
  suggestedCeilingPrice: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C';
  locationHub: string;
  status: 'Approved' | 'Pending Review' | 'Flagged' | 'Sold Out';
  listedDate: string;
}

export interface OrderAuditAdminView {
  id: string;
  orderCode: string;
  buyerName: string;
  farmerName: string;
  produceItem: string;
  volumeKg: number;
  totalValueBdt: number;
  escrowStatus: 'Held in Escrow' | 'Released to Farmer' | 'Refunded' | 'Disputed';
  fulfillmentStatus: 'Order Placed' | 'Quality Passed' | 'In Transit' | 'Delivered';
  orderDate: string;
  logisticsPartner: string;
}

export interface PaymentRecordAdminView {
  id: string;
  transactionRef: string;
  recipientName: string;
  recipientRole: 'Farmer' | 'Logistics Vendor' | 'Inspection Lab';
  amountBdt: number;
  purpose: 'Harvest Sale Payout' | 'Subsidy Disbursement' | 'Logistics Fee' | 'Inspection Refund';
  payoutStatus: 'Completed' | 'Pending Approval' | 'Processing' | 'Failed';
  paymentChannel: 'bKash Merchant' | 'BEFTN Bank Transfer' | 'Nagad Direct' | 'Rocket';
  initiatedAt: string;
  approvedBy?: string;
}

export interface QualityReportAdminView {
  id: string;
  batchCode: string;
  produceType: string;
  farmerName: string;
  testingLabLocation: string;
  inspectorName: string;
  assignedGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
  moistureContentPercent: number;
  moistureStandardThreshold: number;
  foreignMatterPercent: number;
  aflatoxinPpm: number;
  complianceVerdict: 'Passed' | 'Conditional Pass' | 'Rejected';
  inspectionDate: string;
  certificateNumber: string;
}

export interface LogisticsFleetAdminView {
  id: string;
  consignmentCode: string;
  originHub: string;
  destinationDepot: string;
  cargoDescription: string;
  cargoWeightKg: number;
  vehicleType: 'Refrigerated 5-Ton' | 'Insulated Van' | 'Open Bed Truck' | 'Cold-Storage Electric';
  driverName: string;
  driverPhone: string;
  temperatureCelsius: number;
  targetTempRange: string;
  transitStatus: 'Dispatched' | 'On Route' | 'Delayed' | 'Delivered';
  estimatedArrival: string;
  coldChainIntegrity: 'Optimal' | 'Warning' | 'Breached';
}

export interface TrainingManagementAdminView {
  id: string;
  courseTitle: string;
  targetRegion: string;
  enrolledCount: number;
  completionRatePercent: number;
  instructorAssigned: string;
  status: 'Published' | 'Draft' | 'Archived';
  lastUpdated: string;
  feedbackScore: number;
}

export interface AgritechReportAdminView {
  id: string;
  reportCode: string;
  title: string;
  category: 'Yield Forecast' | 'Soil Salinity & NPK' | 'Pest & Blight Radar' | 'Market Price Volatility' | 'Subsidy Impact';
  reportingPeriod: string;
  fileSizeMb: number;
  generatedDate: string;
  summaryFindings: string;
  confidentialityLevel: 'Public Agronomy' | 'Ministry Restricted' | 'Platform Internal';
}

export interface DisputeCaseAdminView {
  id: string;
  caseNumber: string;
  plaintiff: { name: string; role: 'Farmer' | 'Buyer' | 'Logistics Provider' };
  defendant: { name: string; role: 'Farmer' | 'Buyer' | 'Logistics Provider' };
  relatedOrderCode: string;
  disputeReason: 'Produce Grade Degradation' | 'Moisture Mismatch' | 'Delivery Transit Spoilage' | 'Payment Delay' | 'Weight Shortage';
  disputedAmountBdt: number;
  evidenceAttachmentsCount: number;
  caseStatus: 'Open - Under Review' | 'Mediation In Progress' | 'Resolved - Farmer Compensated' | 'Resolved - Buyer Refunded' | 'Dismissed';
  openedAt: string;
  resolutionNotes?: string;
}

export interface FarmVerificationRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  division: string;
  district: string;
  upazila: string;
  totalAcreage: number;
  cadastralPlotNumbers: string;
  mouzaKhatianNumber: string;
  submissionDate: string;
  status: 'pending' | 'verified' | 'rejected';
  assignedOfficerName?: string;
  officerNotes?: string;
  evidenceDocuments: Array<{ name: string; type: string; url: string }>;
}

export interface MasterCrop {
  id: string;
  cropName: string;
  scientificName: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Vegetable' | 'Fruit' | 'Cash Crop';
  recommendedSeason: string;
  optimalSoilPhRange: string;
  minRainfallMm: number;
  maxRainfallMm: number;
  averageMaturityDays: number;
  standardYieldKgPerAcre: number;
  benchmarkPriceBdtPerKg: number;
  approvedVarieties: string[];
  pestVulnerabilities: string[];
}

export interface AgronomicAdvisory {
  id: string;
  title: string;
  targetCrops: string[];
  targetDistricts: string[];
  severity: 'low' | 'medium' | 'high' | 'urgent';
  category: 'Pest Alert' | 'Weather Advisory' | 'Nutrient Management' | 'Irrigation Timing';
  issueDate: string;
  validUntil: string;
  advisoryText: string;
  recommendedTreatments: string[];
  issuingAuthority: string;
}

export interface MarketCommodityPrice {
  id: string;
  commodityName: string;
  variety: string;
  marketLocation: string;
  division: string;
  wholesaleMinPriceBdt: number;
  wholesaleMaxPriceBdt: number;
  wholesaleModalPriceBdt: number;
  retailPriceBdt: number;
  priceTrend: 'up' | 'down' | 'stable';
  recordedDate: string;
  volumeTradedMetricTons: number;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  targetEntity: string;
  entityId: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'failure';
  details: string;
}

export interface AdminDashboardSummary {
  kpis: AdminKpiMetrics;
  totalPendingVerifications: number;
  totalActiveAdvisories: number;
  averageCropYieldIndex: number;
  totalWeeklyMarketVolumeTons: number;
  regionalFarmerDistribution: Array<{ region: string; farmerCount: number; acreage: number }>;
  recentAuditLogs: SystemAuditLog[];
}

