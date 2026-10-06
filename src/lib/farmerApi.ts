/**
 * Farmer Portal API Service Layer
 * All asynchronous data operations route through the FarmPath backend.
 * Server responses are raw payloads; they are wrapped in the shared
 * ApiResponse envelope so existing components can keep checking `res.success`.
 */

import { api } from '@/lib/api';
import {
  FarmerProfile,
  Farm,
  Field,
  CropBatch,
  CropLog,
  CalendarTask,
  CropRecommendationInput,
  CropRecommendationItem,
  CropComparisonProfile,
  HarvestRecord,
  FarmExpense,
  ProfitabilityMetrics,
  WeatherData,
  TrainingCourse,
  AiRecommendationDiagnostic,
  FarmerNotification,
  ApiResponse,
} from '@/types';

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

export interface FarmerDashboardSummary {
  profile: FarmerProfile;
  activeCropsCount: number;
  totalFarmsCount: number;
  totalFieldsCount: number;
  totalAcreage: number;
  pendingTasksCount: number;
  unreadNotificationsCount: number;
  recentLogs: CropLog[];
  upcomingTasks: CalendarTask[];
  weatherCurrent: WeatherData['current'];
}

// 1. Farmer Dashboard & Summary
export async function getFarmerDashboardSummary(): Promise<ApiResponse<FarmerDashboardSummary>> {
  return ok(await api.get<FarmerDashboardSummary>('/farmer/dashboard'));
}

// 2. Profile Management
export async function getFarmerProfile(): Promise<ApiResponse<FarmerProfile>> {
  return ok(await api.get<FarmerProfile>('/farmer/profile'));
}

export async function updateFarmerProfile(
  updated: Partial<FarmerProfile>
): Promise<ApiResponse<FarmerProfile>> {
  return ok(await api.put<FarmerProfile>('/farmer/profile', updated));
}

// 3. Farm Management
export async function getFarms(): Promise<ApiResponse<Farm[]>> {
  return ok(await api.get<Farm[]>('/farms'));
}

export async function createFarm(
  farmInput: Omit<Farm, 'id' | 'farmerId' | 'registeredDate' | 'activeFieldsCount'>
): Promise<ApiResponse<Farm>> {
  return ok(await api.post<Farm>('/farms', farmInput));
}

export async function updateFarm(
  id: string,
  updated: Partial<Farm>
): Promise<ApiResponse<Farm>> {
  return ok(await api.put<Farm>(`/farms/${id}`, updated));
}

export async function deleteFarm(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/farms/${id}`));
}

// 4. Field Management
export async function getFields(): Promise<ApiResponse<Field[]>> {
  return ok(await api.get<Field[]>('/fields'));
}

export async function createField(
  fieldInput: Omit<Field, 'id' | 'lastSoilTested'>
): Promise<ApiResponse<Field>> {
  return ok(await api.post<Field>('/fields', fieldInput));
}

export async function updateField(id: string, updated: Partial<Field>): Promise<ApiResponse<Field>> {
  return ok(await api.put<Field>(`/fields/${id}`, updated));
}

export async function deleteField(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/fields/${id}`));
}

// 5. Crop Recommendation
export async function getCropRecommendations(
  input?: CropRecommendationInput
): Promise<ApiResponse<CropRecommendationItem[]>> {
  return ok(await api.post<CropRecommendationItem[]>('/farmer/crops/recommend', input ?? {}));
}

// 6. Crop Comparison
export async function getCropComparisonProfiles(): Promise<
  ApiResponse<CropComparisonProfile[]>
> {
  return ok(await api.get<CropComparisonProfile[]>('/farmer/crops/compare'));
}

// 7. Crop Management
export async function getCropBatches(): Promise<ApiResponse<CropBatch[]>> {
  return ok(await api.get<CropBatch[]>('/crop-batches'));
}

export async function createCropBatch(
  batchInput: Omit<CropBatch, 'id' | 'growthProgressPercent' | 'lastAction' | 'lastActionDate'>
): Promise<ApiResponse<CropBatch>> {
  return ok(await api.post<CropBatch>('/crop-batches', batchInput));
}

export async function updateCropBatch(
  id: string,
  updated: Partial<CropBatch>
): Promise<ApiResponse<CropBatch>> {
  return ok(await api.put<CropBatch>(`/crop-batches/${id}`, updated));
}

export async function deleteCropBatch(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/crop-batches/${id}`));
}

// 8. Crop Logs
export async function getCropLogs(cropBatchId?: string): Promise<ApiResponse<CropLog[]>> {
  const query = cropBatchId ? `?cropBatchId=${encodeURIComponent(cropBatchId)}` : '';
  return ok(await api.get<CropLog[]>(`/crop-logs${query}`));
}

export async function addCropLog(
  logInput: Omit<CropLog, 'id' | 'date'>
): Promise<ApiResponse<CropLog>> {
  return ok(await api.post<CropLog>('/crop-logs', logInput));
}

export async function deleteCropLog(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/crop-logs/${id}`));
}

// 9. Crop Calendar
export async function getCalendarTasks(): Promise<ApiResponse<CalendarTask[]>> {
  return ok(await api.get<CalendarTask[]>('/calendar'));
}

export async function toggleCalendarTask(id: string): Promise<ApiResponse<CalendarTask>> {
  return ok(await api.patch<CalendarTask>(`/calendar/${id}/toggle`, {}));
}

export async function addCalendarTask(
  taskInput: Omit<CalendarTask, 'id' | 'isCompleted'>
): Promise<ApiResponse<CalendarTask>> {
  return ok(await api.post<CalendarTask>('/calendar', taskInput));
}

export async function deleteCalendarTask(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/calendar/${id}`));
}

// 10. Harvest Management
export async function getHarvestRecords(): Promise<ApiResponse<HarvestRecord[]>> {
  return ok(await api.get<HarvestRecord[]>('/harvests'));
}

export async function createHarvestRecord(
  harvestInput: Omit<HarvestRecord, 'id' | 'batchCode'>
): Promise<ApiResponse<HarvestRecord>> {
  return ok(await api.post<HarvestRecord>('/harvests', harvestInput));
}

export async function updateHarvestRecord(
  id: string,
  updated: Partial<HarvestRecord>
): Promise<ApiResponse<HarvestRecord>> {
  return ok(await api.put<HarvestRecord>(`/harvests/${id}`, updated));
}

export async function deleteHarvestRecord(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/harvests/${id}`));
}

// 11. Farm Expenses
export async function getFarmExpenses(): Promise<ApiResponse<FarmExpense[]>> {
  return ok(await api.get<FarmExpense[]>('/expenses'));
}

export async function addFarmExpense(
  expenseInput: Omit<FarmExpense, 'id'>
): Promise<ApiResponse<FarmExpense>> {
  return ok(await api.post<FarmExpense>('/expenses', expenseInput));
}

export async function updateFarmExpense(
  id: string,
  updated: Partial<FarmExpense>
): Promise<ApiResponse<FarmExpense>> {
  return ok(await api.put<FarmExpense>(`/expenses/${id}`, updated));
}

export async function deleteFarmExpense(id: string): Promise<ApiResponse<{ id: string }>> {
  return ok(await api.delete<{ id: string }>(`/expenses/${id}`));
}

// 12. Profitability Analysis
export async function getProfitabilityMetrics(): Promise<ApiResponse<ProfitabilityMetrics>> {
  return ok(await api.get<ProfitabilityMetrics>('/farmer/profitability'));
}

// 13. Weather & Alerts
export async function getWeatherData(): Promise<ApiResponse<WeatherData>> {
  return ok(await api.get<WeatherData>('/farmer/weather'));
}

// 14. Agricultural Training
export async function getTrainingCourses(): Promise<ApiResponse<TrainingCourse[]>> {
  return ok(await api.get<TrainingCourse[]>('/training'));
}

export async function toggleTrainingLesson(
  courseId: string,
  lessonIndex: number
): Promise<ApiResponse<TrainingCourse>> {
  return ok(
    await api.patch<TrainingCourse>(`/training/${courseId}/progress`, { lessonIndex })
  );
}

// 15. AI Recommendation Diagnostic Result
export async function getAiRecommendationDiagnostic(): Promise<
  ApiResponse<AiRecommendationDiagnostic>
> {
  return ok(await api.get<AiRecommendationDiagnostic>('/farmer/crops/ai-diagnostic'));
}

// 16. Farmer Notifications
export async function getFarmerNotifications(): Promise<ApiResponse<FarmerNotification[]>> {
  return ok(await api.get<FarmerNotification[]>('/notifications'));
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse<FarmerNotification>> {
  return ok(await api.patch<FarmerNotification>(`/notifications/${id}/read`, {}));
}

export async function markAllNotificationsRead(): Promise<ApiResponse<boolean>> {
  return ok(await api.post<boolean>('/notifications/mark-all-read', {}));
}
