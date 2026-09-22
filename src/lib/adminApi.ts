/**
 * Admin Portal API Service Layer (Admin Oversight Only)
 * All operations strictly restricted to administrative monitoring, audits, disputes, and compliance.
 * // TODO: Replace with real API endpoint when ready
 */

import {
  AdminKpiMetrics,
  AdminUser,
  MarketplaceListingAdminView,
  OrderAuditAdminView,
  PaymentRecordAdminView,
  QualityReportAdminView,
  LogisticsFleetAdminView,
  TrainingManagementAdminView,
  AgritechReportAdminView,
  DisputeCaseAdminView,
  FarmVerificationRequest,
  MasterCrop,
  AgronomicAdvisory,
  MarketCommodityPrice,
  SystemAuditLog,
  AdminDashboardSummary,
  ApiResponse,
} from '@/types';

import { simulateApiCall } from '@/lib/apiClient';
import {
  initialAdminKpiMetrics,
  initialAdminUsers,
  initialMarketplaceAdminListings,
  initialOrderAudits,
  initialPaymentRecords,
  initialQualityReports,
  initialLogisticsFleet,
  initialAdminTrainingManagement,
  initialAgritechReports,
  initialDisputes,
} from '@/lib/data/adminData';

let adminKpiState = { ...initialAdminKpiMetrics };
let adminUsersState = [...initialAdminUsers];
let marketplaceListingsState = [...initialMarketplaceAdminListings];
let orderAuditsState = [...initialOrderAudits];
let paymentRecordsState = [...initialPaymentRecords];
let qualityReportsState = [...initialQualityReports];
let logisticsFleetState = [...initialLogisticsFleet];
let adminTrainingState = [...initialAdminTrainingManagement];
let agritechReportsState = [...initialAgritechReports];
let disputesState = [...initialDisputes];

// 1. Admin Dashboard
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/dashboard)
export async function getAdminDashboardMetrics(): Promise<
  ApiResponse<{
    kpis: AdminKpiMetrics;
    recentUsers: AdminUser[];
    recentDisputes: DisputeCaseAdminView[];
    recentEscrowOrders: OrderAuditAdminView[];
    activeColdChainAlerts: LogisticsFleetAdminView[];
  }>
> {
  const data = {
    kpis: adminKpiState,
    recentUsers: adminUsersState.slice(0, 4),
    recentDisputes: disputesState.filter((d) => d.caseStatus.includes('Open') || d.caseStatus.includes('Mediation')),
    recentEscrowOrders: orderAuditsState.slice(0, 4),
    activeColdChainAlerts: logisticsFleetState.filter((l) => l.coldChainIntegrity !== 'Optimal'),
  };
  return simulateApiCall(data, 200);
}

// 2. User Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/users)
export async function getAdminUsers(roleFilter?: string): Promise<ApiResponse<AdminUser[]>> {
  const filtered = roleFilter && roleFilter !== 'All'
    ? adminUsersState.filter((u) => u.role === roleFilter)
    : adminUsersState;
  return simulateApiCall(filtered, 150);
}

// TODO: Replace with real API endpoint when ready (PATCH /api/v1/admin/users/:id/status)
export async function updateAdminUserStatus(
  id: string,
  status: AdminUser['status'],
  verificationBadge?: boolean
): Promise<ApiResponse<AdminUser>> {
  adminUsersState = adminUsersState.map((u) =>
    u.id === id
      ? { ...u, status, verificationBadge: verificationBadge ?? u.verificationBadge }
      : u
  );
  const updated = adminUsersState.find((u) => u.id === id)!;
  return simulateApiCall(updated, 200);
}

// 3. Marketplace Management (Admin view only)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/marketplace/listings)
export async function getMarketplaceListingsAdmin(): Promise<
  ApiResponse<MarketplaceListingAdminView[]>
> {
  return simulateApiCall(marketplaceListingsState, 150);
}

// TODO: Replace with real API endpoint when ready (PATCH /api/v1/admin/marketplace/listings/:id/status)
export async function updateListingStatusAdmin(
  id: string,
  status: MarketplaceListingAdminView['status']
): Promise<ApiResponse<MarketplaceListingAdminView>> {
  marketplaceListingsState = marketplaceListingsState.map((l) =>
    l.id === id ? { ...l, status } : l
  );
  const updated = marketplaceListingsState.find((l) => l.id === id)!;
  return simulateApiCall(updated, 200);
}

// 4. Orders (Admin view only)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/orders)
export async function getOrderAuditsAdmin(): Promise<ApiResponse<OrderAuditAdminView[]>> {
  return simulateApiCall(orderAuditsState, 150);
}

// 5. Payments (Admin view only)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/payments)
export async function getPaymentRecordsAdmin(): Promise<
  ApiResponse<PaymentRecordAdminView[]>
> {
  return simulateApiCall(paymentRecordsState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/admin/payments/:id/approve)
export async function approvePaymentPayoutAdmin(
  id: string,
  approverName: string
): Promise<ApiResponse<PaymentRecordAdminView>> {
  paymentRecordsState = paymentRecordsState.map((p) =>
    p.id === id
      ? {
          ...p,
          payoutStatus: 'Completed',
          approvedBy: approverName,
        }
      : p
  );
  const updated = paymentRecordsState.find((p) => p.id === id)!;
  return simulateApiCall(updated, 250);
}

// 6. Quality Management (Admin view only)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/quality/reports)
export async function getQualityReportsAdmin(): Promise<
  ApiResponse<QualityReportAdminView[]>
> {
  return simulateApiCall(qualityReportsState, 150);
}

// 7. Logistics (Admin view only)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/logistics/fleet)
export async function getLogisticsFleetAdmin(): Promise<
  ApiResponse<LogisticsFleetAdminView[]>
> {
  return simulateApiCall(logisticsFleetState, 150);
}

// 8. Training Management (Admin)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/training)
export async function getAdminTrainingCourses(): Promise<
  ApiResponse<TrainingManagementAdminView[]>
> {
  return simulateApiCall(adminTrainingState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/admin/training)
export async function createAdminTrainingCourse(
  input: Omit<TrainingManagementAdminView, 'id' | 'enrolledCount' | 'completionRatePercent' | 'lastUpdated' | 'feedbackScore'>
): Promise<ApiResponse<TrainingManagementAdminView>> {
  const newCourse: TrainingManagementAdminView = {
    ...input,
    id: `TRN-ADM-${String(adminTrainingState.length + 1).padStart(2, '0')}`,
    enrolledCount: 0,
    completionRatePercent: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    feedbackScore: 5.0,
  };
  adminTrainingState = [newCourse, ...adminTrainingState];
  return simulateApiCall(newCourse, 250);
}

// 9. Reports (Admin)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/reports)
export async function getAgritechReportsAdmin(): Promise<
  ApiResponse<AgritechReportAdminView[]>
> {
  return simulateApiCall(agritechReportsState, 150);
}

// 10. Disputes (Admin)
// TODO: Replace with real API endpoint when ready (GET /api/v1/admin/disputes)
export async function getDisputesAdmin(): Promise<ApiResponse<DisputeCaseAdminView[]>> {
  return simulateApiCall(disputesState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/admin/disputes/:id/resolve)
export async function resolveDisputeAdmin(
  id: string,
  newStatus: DisputeCaseAdminView['caseStatus'],
  resolutionNotes: string
): Promise<ApiResponse<DisputeCaseAdminView>> {
  disputesState = disputesState.map((d) =>
    d.id === id ? { ...d, caseStatus: newStatus, resolutionNotes } : d
  );
  const updated = disputesState.find((d) => d.id === id)!;
  return simulateApiCall(updated, 250);
}

// Additional Admin Service Functions

let farmVerificationsState: FarmVerificationRequest[] = [
  {
    id: 'FVR-2026-01',
    farmerId: 'USR-101',
    farmerName: 'Mohiuddin Khan',
    farmName: 'Al-Madina Agro Complex',
    division: 'Rajshahi',
    district: 'Bogura',
    upazila: 'Sherpur',
    totalAcreage: 18.5,
    cadastralPlotNumbers: 'Plot 412, 413, 415/B',
    mouzaKhatianNumber: 'Khatian 882, Mouza Chalk-Paharpur',
    submissionDate: '2026-03-12',
    status: 'pending',
    evidenceDocuments: [
      { name: 'Land Registration Porcha (Deed)', type: 'PDF', url: '/docs/deed-882.pdf' },
      { name: 'DAE Union Cadastral Map', type: 'JPG', url: '/docs/map-sherpur.jpg' },
      { name: 'National ID Card Copy', type: 'PDF', url: '/docs/nid-mohiuddin.pdf' },
    ],
  },
  {
    id: 'FVR-2026-02',
    farmerId: 'USR-104',
    farmerName: 'Abdul Malek Sarker',
    farmName: 'Padma Delta Organic Green',
    division: 'Dhaka',
    district: 'Manikganj',
    upazila: 'Singair',
    totalAcreage: 12.0,
    cadastralPlotNumbers: 'Plot 108, 109, 110',
    mouzaKhatianNumber: 'Khatian 304, Mouza Char-Singair',
    submissionDate: '2026-03-14',
    status: 'verified',
    assignedOfficerName: 'Nasreen Akhter',
    officerNotes: 'Land records verified against Upazila Land Registry. GPS coordinates validated on GIS map.',
    evidenceDocuments: [
      { name: 'Upazila Land Revenue Dakhila', type: 'PDF', url: '/docs/dakhila-304.pdf' },
    ],
  },
  {
    id: 'FVR-2026-03',
    farmerId: 'USR-105',
    farmerName: 'Fazlur Rahman',
    farmName: 'Barendra High-Yield Farm',
    division: 'Rajshahi',
    district: 'Naogaon',
    upazila: 'Badalgachhi',
    totalAcreage: 24.2,
    cadastralPlotNumbers: 'Plot 77, 78, 80',
    mouzaKhatianNumber: 'Khatian 1192',
    submissionDate: '2026-03-16',
    status: 'pending',
    evidenceDocuments: [
      { name: 'Khatian 1192 Verified Copy', type: 'PDF', url: '/docs/khatian-1192.pdf' },
    ],
  },
];

let masterCropsState: MasterCrop[] = [
  {
    id: 'CROP-01',
    cropName: 'Boro Rice',
    scientificName: 'Oryza sativa',
    category: 'Cereal',
    recommendedSeason: 'Rabi (Winter - Dec to May)',
    optimalSoilPhRange: '5.5 - 6.8',
    minRainfallMm: 1000,
    maxRainfallMm: 1500,
    averageMaturityDays: 145,
    standardYieldKgPerAcre: 2400,
    benchmarkPriceBdtPerKg: 32,
    approvedVarieties: ['BRRI Dhan-28', 'BRRI Dhan-29', 'BRRI Dhan-89', 'Bangabandhu Dhan-100'],
    pestVulnerabilities: ['Stem Borer', 'Brown Planthopper (BPH)', 'Bacterial Leaf Blight'],
  },
  {
    id: 'CROP-02',
    cropName: 'Aman Rice',
    scientificName: 'Oryza sativa var. aman',
    category: 'Cereal',
    recommendedSeason: 'Kharif-2 (Monsoon - Jul to Nov)',
    optimalSoilPhRange: '5.8 - 7.0',
    minRainfallMm: 1200,
    maxRainfallMm: 2000,
    averageMaturityDays: 135,
    standardYieldKgPerAcre: 2100,
    benchmarkPriceBdtPerKg: 30,
    approvedVarieties: ['BRRI Dhan-49', 'BRRI Dhan-71', 'BRRI Dhan-87', 'Binadhan-17'],
    pestVulnerabilities: ['Sheath Blight', 'False Smut', 'Leaf Folder'],
  },
  {
    id: 'CROP-03',
    cropName: 'Winter Potato (Diamant & Cardinal)',
    scientificName: 'Solanum tuberosum',
    category: 'Vegetable',
    recommendedSeason: 'Rabi (Winter - Nov to Feb)',
    optimalSoilPhRange: '5.2 - 6.5',
    minRainfallMm: 400,
    maxRainfallMm: 600,
    averageMaturityDays: 90,
    standardYieldKgPerAcre: 10500,
    benchmarkPriceBdtPerKg: 18,
    approvedVarieties: ['Diamant', 'Cardinal', 'Asterix', 'BARI Alu-7'],
    pestVulnerabilities: ['Late Blight (Phytophthora)', 'Potato Tuber Moth', 'Scab'],
  },
  {
    id: 'CROP-04',
    cropName: 'Mustard / Rapeseed',
    scientificName: 'Brassica campestris',
    category: 'Oilseed',
    recommendedSeason: 'Rabi (Winter - Oct to Jan)',
    optimalSoilPhRange: '6.0 - 7.5',
    minRainfallMm: 300,
    maxRainfallMm: 500,
    averageMaturityDays: 85,
    standardYieldKgPerAcre: 750,
    benchmarkPriceBdtPerKg: 95,
    approvedVarieties: ['BARI Sarisha-14', 'BARI Sarisha-17', 'Binasharisha-9'],
    pestVulnerabilities: ['Mustard Aphid', 'Alternaria Blight'],
  },
  {
    id: 'CROP-05',
    cropName: 'Summer Maize / Corn',
    scientificName: 'Zea mays',
    category: 'Cereal',
    recommendedSeason: 'Kharif-1 (Feb to Jun)',
    optimalSoilPhRange: '6.0 - 7.2',
    minRainfallMm: 600,
    maxRainfallMm: 900,
    averageMaturityDays: 130,
    standardYieldKgPerAcre: 3800,
    benchmarkPriceBdtPerKg: 26,
    approvedVarieties: ['NK-40', 'Pacific-984', 'BARI Maize-9', 'Super Shine-27'],
    pestVulnerabilities: ['Fall Armyworm', 'Stem Borer'],
  },
];

let advisoriesState: AgronomicAdvisory[] = [
  {
    id: 'ADV-2026-01',
    title: 'Brown Planthopper (BPH) Outbreak Alert in Bogura & Naogaon',
    targetCrops: ['Boro Rice', 'Aman Rice'],
    targetDistricts: ['Bogura', 'Naogaon', 'Joypurhat'],
    severity: 'high',
    category: 'Pest Alert',
    issueDate: '2026-03-15',
    validUntil: '2026-03-30',
    advisoryText: 'High relative humidity (82%) coupled with elevated night temperatures has accelerated BPH hopper burn across late vegetative paddy plots. Field scouting mandatory at base of stems.',
    recommendedTreatments: [
      'Drain standing water from plots for 3 days to eliminate micro-humidity',
      'Spray Pymetrozine 50 WDG @ 0.6g/L or Dinotefuran 20 SG @ 0.4g/L directly targeting paddy stem base',
      'Avoid excessive synthetic Nitrogen application which triggers succulent vegetative growth',
    ],
    issuingAuthority: 'DAE Regional Plant Quarantine & Protection Wing',
  },
  {
    id: 'ADV-2026-02',
    title: 'Late Blight Preventive Fungicide Protocol for Commercial Potato',
    targetCrops: ['Winter Potato (Diamant & Cardinal)'],
    targetDistricts: ['Rangpur', 'Dinajpur', 'Bogura', 'Munshiganj'],
    severity: 'medium',
    category: 'Pest Alert',
    issueDate: '2026-03-10',
    validUntil: '2026-04-05',
    advisoryText: 'Persistent early morning fog followed by cloudy afternoons creates conditions for Phytophthora infestans zoospore germination.',
    recommendedTreatments: [
      'Prophylactic contact spray with Mancozeb 75 WP @ 2.5g/L',
      'If lesions appear on leaf tips, switch to systemic Cymoxanil + Mancozeb @ 2g/L',
    ],
    issuingAuthority: 'Bangladesh Agricultural Research Institute (BARI)',
  },
];

let marketPricesState: MarketCommodityPrice[] = [
  {
    id: 'MP-01',
    commodityName: 'Boro Paddy (Dry Standard 14% Moisture)',
    variety: 'BRRI Dhan-28',
    marketLocation: 'Fateh Ali Bazar, Bogura',
    division: 'Rajshahi',
    wholesaleMinPriceBdt: 31.5,
    wholesaleMaxPriceBdt: 34.0,
    wholesaleModalPriceBdt: 33.0,
    retailPriceBdt: 37.0,
    priceTrend: 'up',
    recordedDate: '2026-03-17',
    volumeTradedMetricTons: 1450,
  },
  {
    id: 'MP-02',
    commodityName: 'Boro Paddy (Aromatic / Super Fine)',
    variety: 'Kataribhog / BRRI Dhan-34',
    marketLocation: 'Dinajpur Sadar Mokam',
    division: 'Rangpur',
    wholesaleMinPriceBdt: 62.0,
    wholesaleMaxPriceBdt: 68.0,
    wholesaleModalPriceBdt: 65.0,
    retailPriceBdt: 74.0,
    priceTrend: 'stable',
    recordedDate: '2026-03-17',
    volumeTradedMetricTons: 420,
  },
  {
    id: 'MP-03',
    commodityName: 'Commercial White Potato',
    variety: 'Diamant Table Potato',
    marketLocation: 'Sherpur Cold Storage Hub, Bogura',
    division: 'Rajshahi',
    wholesaleMinPriceBdt: 18.0,
    wholesaleMaxPriceBdt: 21.0,
    wholesaleModalPriceBdt: 19.5,
    retailPriceBdt: 26.0,
    priceTrend: 'down',
    recordedDate: '2026-03-17',
    volumeTradedMetricTons: 3200,
  },
  {
    id: 'MP-04',
    commodityName: 'Mustard Seeds (High Oil 42%)',
    variety: 'BARI Sarisha-14',
    marketLocation: 'Sirajganj Railway Mokam',
    division: 'Rajshahi',
    wholesaleMinPriceBdt: 94.0,
    wholesaleMaxPriceBdt: 102.0,
    wholesaleModalPriceBdt: 98.0,
    retailPriceBdt: 110.0,
    priceTrend: 'up',
    recordedDate: '2026-03-17',
    volumeTradedMetricTons: 680,
  },
];

let systemAuditLogsState: SystemAuditLog[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-03-17 14:32:10 BST',
    actorName: 'Mohiuddin Khan',
    actorRole: 'Farmer',
    actionType: 'HARVEST_LOT_RECORDED',
    targetEntity: 'HarvestRecord',
    entityId: 'HARV-2026-01',
    ipAddress: '103.14.88.21',
    status: 'success',
    details: 'Logged 4,200 kg Boro Paddy harvest batch at Sherpur Grain Silo B3',
  },
  {
    id: 'AUD-902',
    timestamp: '2026-03-17 12:15:45 BST',
    actorName: 'Nasreen Akhter',
    actorRole: 'Extension Officer',
    actionType: 'FARM_CADASTRAL_VERIFIED',
    targetEntity: 'FarmVerification',
    entityId: 'FVR-2026-02',
    ipAddress: '119.30.34.112',
    status: 'success',
    details: 'Verified cadastral deed 304 for farmer Abdul Malek Sarker (12 acres)',
  },
  {
    id: 'AUD-903',
    timestamp: '2026-03-17 10:04:18 BST',
    actorName: 'Admin Security System',
    actorRole: 'Automated Daemon',
    actionType: 'COLD_CHAIN_ALERT_TRIGGERED',
    targetEntity: 'LogisticsFleet',
    entityId: 'FLEET-03',
    ipAddress: '10.0.4.18',
    status: 'warning',
    details: 'Temperature sensor in Van DHA-11-9021 exceeded threshold (+14.2°C)',
  },
  {
    id: 'AUD-904',
    timestamp: '2026-03-17 08:30:00 BST',
    actorName: 'Dr. Shahinur Alam',
    actorRole: 'Agronomist',
    actionType: 'ADVISORY_BROADCAST',
    targetEntity: 'AgronomicAdvisory',
    entityId: 'ADV-2026-01',
    ipAddress: '103.205.71.4',
    status: 'success',
    details: 'Dispatched BPH hopper burn alert across Bogura and Naogaon districts',
  },
];

// Admin Dashboard Summary
export async function getAdminDashboardSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
  const summary: AdminDashboardSummary = {
    kpis: adminKpiState,
    totalPendingVerifications: farmVerificationsState.filter((v) => v.status === 'pending').length,
    totalActiveAdvisories: advisoriesState.length,
    averageCropYieldIndex: 94.2,
    totalWeeklyMarketVolumeTons: marketPricesState.reduce((acc, m) => acc + m.volumeTradedMetricTons, 0),
    regionalFarmerDistribution: [
      { region: 'Rajshahi Division (Bogura, Naogaon)', farmerCount: 1840, acreage: 14200 },
      { region: 'Rangpur Division (Dinajpur, Rangpur)', farmerCount: 1220, acreage: 9800 },
      { region: 'Dhaka Division (Manikganj, Gazipur)', farmerCount: 780, acreage: 6400 },
      { region: 'Khulna & Barishal Coastal Belt', farmerCount: 440, acreage: 4450 },
    ],
    recentAuditLogs: systemAuditLogsState.slice(0, 5),
  };
  return simulateApiCall(summary, 200);
}

export async function getPendingFarmVerifications(): Promise<ApiResponse<FarmVerificationRequest[]>> {
  return simulateApiCall(
    farmVerificationsState.filter((v) => v.status === 'pending'),
    150
  );
}

export async function getFarmVerificationRequests(): Promise<ApiResponse<FarmVerificationRequest[]>> {
  return simulateApiCall(farmVerificationsState, 150);
}

export async function reviewFarmVerification(
  id: string,
  status: 'verified' | 'rejected',
  notes: string,
  officerName: string
): Promise<ApiResponse<FarmVerificationRequest>> {
  farmVerificationsState = farmVerificationsState.map((v) =>
    v.id === id
      ? {
          ...v,
          status,
          officerNotes: notes,
          assignedOfficerName: officerName,
        }
      : v
  );
  const updated = farmVerificationsState.find((v) => v.id === id)!;
  return simulateApiCall(updated, 250);
}

export async function getMasterCrops(): Promise<ApiResponse<MasterCrop[]>> {
  return simulateApiCall(masterCropsState, 150);
}

export async function createMasterCrop(
  cropInput: Omit<MasterCrop, 'id'>
): Promise<ApiResponse<MasterCrop>> {
  const newCrop: MasterCrop = {
    ...cropInput,
    id: `CROP-${String(masterCropsState.length + 1).padStart(2, '0')}`,
  };
  masterCropsState = [newCrop, ...masterCropsState];
  return simulateApiCall(newCrop, 250);
}

export async function getAdminAdvisories(): Promise<ApiResponse<AgronomicAdvisory[]>> {
  return simulateApiCall(advisoriesState, 150);
}

export async function publishAdvisory(
  input: Omit<AgronomicAdvisory, 'id' | 'issueDate'>
): Promise<ApiResponse<AgronomicAdvisory>> {
  const newAdvisory: AgronomicAdvisory = {
    ...input,
    id: `ADV-${Date.now().toString().slice(-4)}`,
    issueDate: new Date().toISOString().split('T')[0],
  };
  advisoriesState = [newAdvisory, ...advisoriesState];
  return simulateApiCall(newAdvisory, 250);
}

export async function getMarketCommodityPrices(): Promise<ApiResponse<MarketCommodityPrice[]>> {
  return simulateApiCall(marketPricesState, 150);
}

export async function updateCommodityPrice(
  id: string,
  updates: Partial<MarketCommodityPrice>
): Promise<ApiResponse<MarketCommodityPrice>> {
  marketPricesState = marketPricesState.map((p) => (p.id === id ? { ...p, ...updates } : p));
  const updated = marketPricesState.find((p) => p.id === id)!;
  return simulateApiCall(updated, 200);
}

export async function getSystemAuditLogs(): Promise<ApiResponse<SystemAuditLog[]>> {
  return simulateApiCall(systemAuditLogsState, 150);
}

export async function broadcastWeatherAlert(
  alert: any
): Promise<ApiResponse<boolean>> {
  return simulateApiCall(true, 200);
}

