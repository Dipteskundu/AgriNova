/**
 * Admin Portal API Service Layer (Admin Oversight Only)
 * All operations strictly restricted to administrative monitoring, audits,
 * disputes, and compliance. Data is served by the FarmPath backend and
 * wrapped in the shared ApiResponse envelope.
 */

import { api } from '@/lib/api';
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
  DisputeCase,
  FarmVerificationRequest,
  MasterCrop,
  AgronomicAdvisory,
  MarketCommodityPrice,
  SystemAuditLog,
  AdminDashboardSummary,
  ApiResponse,
  WeatherData,
} from '@/types';

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

type MicroclimateAlert = WeatherData['microclimateAlerts'][number];

// 1. Admin Dashboard
export async function getAdminDashboardMetrics(): Promise<
  ApiResponse<{
    kpis: AdminKpiMetrics;
    recentUsers: AdminUser[];
    recentDisputes: DisputeCase[];
    recentEscrowOrders: OrderAuditAdminView[];
    activeColdChainAlerts: LogisticsFleetAdminView[];
  }>
> {
  return ok(
    await api.get<{
      kpis: AdminKpiMetrics;
      recentUsers: AdminUser[];
      recentDisputes: DisputeCase[];
      recentEscrowOrders: OrderAuditAdminView[];
      activeColdChainAlerts: LogisticsFleetAdminView[];
    }>('/admin/dashboard')
  );
}

export async function getAdminDashboardSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
  return ok(await api.get<AdminDashboardSummary>('/admin/dashboard/summary'));
}

// 2. User Management
export async function getAdminUsers(roleFilter?: string): Promise<ApiResponse<AdminUser[]>> {
  const query =
    roleFilter && roleFilter !== 'All' ? `?role=${encodeURIComponent(roleFilter)}` : '';
  return ok(await api.get<AdminUser[]>(`/admin/users${query}`));
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  phone: string;
  role: AdminUser['role'];
  region: string;
  nationalIdNumber: string;
}

export async function createAdminUser(
  input: AdminCreateUserInput
): Promise<ApiResponse<AdminUser>> {
  return ok(await api.post<AdminUser>('/admin/users', input));
}

export async function updateAdminUserStatus(
  id: string,
  status: AdminUser['status'],
  verificationBadge?: boolean
): Promise<ApiResponse<AdminUser>> {
  return ok(
    await api.patch<AdminUser>(`/admin/users/${id}/status`, {
      status,
      ...(verificationBadge !== undefined ? { verificationBadge } : {}),
    })
  );
}

// 3. Marketplace Management (Admin view only)
export async function getMarketplaceListingsAdmin(): Promise<
  ApiResponse<MarketplaceListingAdminView[]>
> {
  return ok(await api.get<MarketplaceListingAdminView[]>('/admin/marketplace/listings'));
}

export async function updateListingStatusAdmin(
  id: string,
  status: MarketplaceListingAdminView['status']
): Promise<ApiResponse<MarketplaceListingAdminView>> {
  return ok(
    await api.put<MarketplaceListingAdminView>(`/admin/marketplace/listings/${id}`, { status })
  );
}

// 4. Orders (Admin view only)
export async function getOrderAuditsAdmin(): Promise<ApiResponse<OrderAuditAdminView[]>> {
  return ok(await api.get<OrderAuditAdminView[]>('/admin/orders'));
}

// 5. Payments (Admin view only)
export async function getPaymentRecordsAdmin(): Promise<
  ApiResponse<PaymentRecordAdminView[]>
> {
  return ok(await api.get<PaymentRecordAdminView[]>('/admin/payments'));
}

export async function approvePaymentPayoutAdmin(
  id: string,
  approverName: string
): Promise<ApiResponse<PaymentRecordAdminView>> {
  return ok(
    await api.post<PaymentRecordAdminView>(`/admin/payments/${id}/approve`, { approverName })
  );
}

// 6. Quality Management (Admin view only)
export async function getQualityReportsAdmin(): Promise<
  ApiResponse<QualityReportAdminView[]>
> {
  return ok(await api.get<QualityReportAdminView[]>('/admin/quality/reports'));
}

// 7. Logistics (Admin view only)
export async function getLogisticsFleetAdmin(): Promise<
  ApiResponse<LogisticsFleetAdminView[]>
> {
  return ok(await api.get<LogisticsFleetAdminView[]>('/admin/logistics/fleet'));
}

// 8. Training Management (Admin)
export async function getAdminTrainingCourses(): Promise<
  ApiResponse<TrainingManagementAdminView[]>
> {
  return ok(await api.get<TrainingManagementAdminView[]>('/admin/training'));
}

export async function createAdminTrainingCourse(
  input: Omit<
    TrainingManagementAdminView,
    'id' | 'enrolledCount' | 'completionRatePercent' | 'lastUpdated' | 'feedbackScore'
  >
): Promise<ApiResponse<TrainingManagementAdminView>> {
  return ok(await api.post<TrainingManagementAdminView>('/admin/training', input));
}

export async function deleteAdminTrainingCourse(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/admin/training/${id}`));
}

// 9. Reports (Admin)
export async function getAgritechReportsAdmin(): Promise<
  ApiResponse<AgritechReportAdminView[]>
> {
  return ok(await api.get<AgritechReportAdminView[]>('/admin/reports'));
}

// 10. Disputes (Admin)
export async function getDisputesAdmin(): Promise<ApiResponse<DisputeCase[]>> {
  return ok(await api.get<DisputeCase[]>('/admin/disputes'));
}

export async function resolveDisputeAdmin(
  id: string,
  newStatus: DisputeCase['caseStatus'],
  resolutionNotes: string
): Promise<ApiResponse<DisputeCase>> {
  return ok(
    await api.post<DisputeCase>(`/admin/disputes/${id}/resolve`, {
      caseStatus: newStatus,
      resolutionNotes,
    })
  );
}

// 11. Farm Verifications
export async function getPendingFarmVerifications(): Promise<ApiResponse<FarmVerificationRequest[]>> {
  return ok(await api.get<FarmVerificationRequest[]>('/admin/verifications?status=pending'));
}

export async function getFarmVerificationRequests(): Promise<ApiResponse<FarmVerificationRequest[]>> {
  return ok(await api.get<FarmVerificationRequest[]>('/admin/verifications'));
}

export async function reviewFarmVerification(
  id: string,
  status: 'verified' | 'rejected',
  notes: string,
  officerName: string
): Promise<ApiResponse<FarmVerificationRequest>> {
  return ok(
    await api.post<FarmVerificationRequest>(`/admin/verifications/${id}/review`, {
      status,
      notes,
      officerName,
    })
  );
}

// 12. Master Crop Catalog
export async function getMasterCrops(): Promise<ApiResponse<MasterCrop[]>> {
  return ok(await api.get<MasterCrop[]>('/admin/master-crops'));
}

export async function createMasterCrop(
  cropInput: Omit<MasterCrop, 'id'>
): Promise<ApiResponse<MasterCrop>> {
  return ok(await api.post<MasterCrop>('/admin/master-crops', cropInput));
}

// 13. Agronomic Advisories
export async function getAdminAdvisories(): Promise<ApiResponse<AgronomicAdvisory[]>> {
  return ok(await api.get<AgronomicAdvisory[]>('/admin/advisories'));
}

export async function publishAdvisory(
  input: Omit<AgronomicAdvisory, 'id' | 'issueDate'>
): Promise<ApiResponse<AgronomicAdvisory>> {
  return ok(await api.post<AgronomicAdvisory>('/admin/advisories', input));
}

// 14. Market Commodity Prices
export async function getMarketCommodityPrices(): Promise<ApiResponse<MarketCommodityPrice[]>> {
  return ok(await api.get<MarketCommodityPrice[]>('/admin/market-prices'));
}

export async function updateCommodityPrice(
  id: string,
  updates: Partial<MarketCommodityPrice>
): Promise<ApiResponse<MarketCommodityPrice>> {
  return ok(await api.put<MarketCommodityPrice>(`/admin/market-prices/${id}`, updates));
}

// 15. System Audit Logs
export async function getSystemAuditLogs(): Promise<ApiResponse<SystemAuditLog[]>> {
  return ok(await api.get<SystemAuditLog[]>('/admin/audit-logs'));
}

// 16. Weather Alert Broadcasts
export async function getWeatherAlerts(): Promise<ApiResponse<MicroclimateAlert[]>> {
  return ok(await api.get<MicroclimateAlert[]>('/admin/weather-alerts'));
}

export async function broadcastWeatherAlert(
  alert: Omit<MicroclimateAlert, 'id'>
): Promise<ApiResponse<MicroclimateAlert>> {
  return ok(await api.post<MicroclimateAlert>('/admin/weather-alerts', alert));
}

export async function deleteWeatherAlert(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/admin/weather-alerts/${id}`));
}
