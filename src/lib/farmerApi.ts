/**
 * Farmer Portal API Service Layer
 * All asynchronous data operations routing through simulation with typed interfaces.
 * // TODO: Replace with real API endpoint when ready
 */

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
import { simulateApiCall } from '@/lib/apiClient';
import {
  initialFarmerProfile,
  initialFarms,
  initialFields,
  initialCropBatches,
  initialCropLogs,
  initialCalendarTasks,
  initialRecommendations,
  initialComparisonProfiles,
  initialHarvestRecords,
  initialFarmExpenses,
  initialProfitabilityMetrics,
  initialWeatherData,
  initialTrainingCourses,
  initialAiRecommendationDiagnostic,
  initialFarmerNotifications,
} from '@/lib/data/farmerData';

// Mutable in-memory state for interactive session
let profileState = { ...initialFarmerProfile };
let farmsState = [...initialFarms];
let fieldsState = [...initialFields];
let cropBatchesState = [...initialCropBatches];
let cropLogsState = [...initialCropLogs];
let calendarTasksState = [...initialCalendarTasks];
let harvestRecordsState = [...initialHarvestRecords];
let farmExpensesState = [...initialFarmExpenses];
let notificationsState = [...initialFarmerNotifications];

// 1. Farmer Dashboard & Summary
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/dashboard)
export async function getFarmerDashboardSummary(): Promise<
  ApiResponse<{
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
  }>
> {
  const data = {
    profile: profileState,
    activeCropsCount: cropBatchesState.length,
    totalFarmsCount: farmsState.length,
    totalFieldsCount: fieldsState.length,
    totalAcreage: farmsState.reduce((acc, f) => acc + f.totalAreaAcres, 0),
    pendingTasksCount: calendarTasksState.filter((t) => !t.isCompleted).length,
    unreadNotificationsCount: notificationsState.filter((n) => !n.isRead).length,
    recentLogs: cropLogsState.slice(0, 4),
    upcomingTasks: calendarTasksState.filter((t) => !t.isCompleted).slice(0, 4),
    weatherCurrent: initialWeatherData.current,
  };
  return simulateApiCall(data, 200);
}

// 2. Profile Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/profile)
export async function getFarmerProfile(): Promise<ApiResponse<FarmerProfile>> {
  return simulateApiCall(profileState, 150);
}

// TODO: Replace with real API endpoint when ready (PUT /api/v1/farmer/profile)
export async function updateFarmerProfile(
  updated: Partial<FarmerProfile>
): Promise<ApiResponse<FarmerProfile>> {
  profileState = { ...profileState, ...updated };
  return simulateApiCall(profileState, 200);
}

// 3. Farm Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/farms)
export async function getFarms(): Promise<ApiResponse<Farm[]>> {
  return simulateApiCall(farmsState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/farms)
export async function createFarm(
  farmInput: Omit<Farm, 'id' | 'farmerId' | 'registeredDate' | 'activeFieldsCount'>
): Promise<ApiResponse<Farm>> {
  const newFarm: Farm = {
    ...farmInput,
    id: `FARM-${String(farmsState.length + 1).padStart(2, '0')}`,
    farmerId: profileState.id,
    registeredDate: new Date().toISOString().split('T')[0],
    activeFieldsCount: 0,
  };
  farmsState = [newFarm, ...farmsState];
  return simulateApiCall(newFarm, 250);
}

// TODO: Replace with real API endpoint when ready (PUT /api/v1/farmer/farms/:id)
export async function updateFarm(
  id: string,
  updated: Partial<Farm>
): Promise<ApiResponse<Farm>> {
  farmsState = farmsState.map((f) => (f.id === id ? { ...f, ...updated } : f));
  const found = farmsState.find((f) => f.id === id)!;
  return simulateApiCall(found, 200);
}

// 4. Field Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/fields)
export async function getFields(): Promise<ApiResponse<Field[]>> {
  return simulateApiCall(fieldsState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/fields)
export async function createField(
  fieldInput: Omit<Field, 'id' | 'lastSoilTested'>
): Promise<ApiResponse<Field>> {
  const newField: Field = {
    ...fieldInput,
    id: `FIELD-${String.fromCharCode(65 + fieldsState.length)}${fieldsState.length + 1}`,
    lastSoilTested: new Date().toISOString().split('T')[0],
  };
  fieldsState = [newField, ...fieldsState];
  return simulateApiCall(newField, 250);
}

// 5. Crop Recommendation
// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/crops/recommend)
export async function getCropRecommendations(
  _input?: CropRecommendationInput
): Promise<ApiResponse<CropRecommendationItem[]>> {
  return simulateApiCall(initialRecommendations, 300);
}

// 6. Crop Comparison
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/crops/compare)
export async function getCropComparisonProfiles(): Promise<
  ApiResponse<CropComparisonProfile[]>
> {
  return simulateApiCall(initialComparisonProfiles, 200);
}

// 7. Crop Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/crops)
export async function getCropBatches(): Promise<ApiResponse<CropBatch[]>> {
  return simulateApiCall(cropBatchesState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/crops)
export async function createCropBatch(
  batchInput: Omit<CropBatch, 'id' | 'growthProgressPercent' | 'lastAction' | 'lastActionDate'>
): Promise<ApiResponse<CropBatch>> {
  const newBatch: CropBatch = {
    ...batchInput,
    id: `BATCH-2026-${String(cropBatchesState.length + 1).padStart(2, '0')}`,
    growthProgressPercent: 10,
    lastAction: 'Direct Field Sowing & Seedling Bed Preparation',
    lastActionDate: new Date().toISOString().split('T')[0],
  };
  cropBatchesState = [newBatch, ...cropBatchesState];
  return simulateApiCall(newBatch, 250);
}

// 8. Crop Logs
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/crop-logs)
export async function getCropLogs(cropBatchId?: string): Promise<ApiResponse<CropLog[]>> {
  const logs = cropBatchId
    ? cropLogsState.filter((l) => l.cropBatchId === cropBatchId)
    : cropLogsState;
  return simulateApiCall(logs, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/crop-logs)
export async function addCropLog(
  logInput: Omit<CropLog, 'id' | 'date'>
): Promise<ApiResponse<CropLog>> {
  const newLog: CropLog = {
    ...logInput,
    id: `LOG-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
  };
  cropLogsState = [newLog, ...cropLogsState];
  return simulateApiCall(newLog, 250);
}

// 9. Crop Calendar
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/calendar)
export async function getCalendarTasks(): Promise<ApiResponse<CalendarTask[]>> {
  return simulateApiCall(calendarTasksState, 150);
}

// TODO: Replace with real API endpoint when ready (PATCH /api/v1/farmer/calendar/:id/toggle)
export async function toggleCalendarTask(id: string): Promise<ApiResponse<CalendarTask>> {
  calendarTasksState = calendarTasksState.map((t) =>
    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
  );
  const updated = calendarTasksState.find((t) => t.id === id)!;
  return simulateApiCall(updated, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/calendar)
export async function addCalendarTask(
  taskInput: Omit<CalendarTask, 'id' | 'isCompleted'>
): Promise<ApiResponse<CalendarTask>> {
  const newTask: CalendarTask = {
    ...taskInput,
    id: `TASK-${String(calendarTasksState.length + 1).padStart(2, '0')}`,
    isCompleted: false,
  };
  calendarTasksState = [...calendarTasksState, newTask];
  return simulateApiCall(newTask, 200);
}

// 10. Harvest Management
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/harvests)
export async function getHarvestRecords(): Promise<ApiResponse<HarvestRecord[]>> {
  return simulateApiCall(harvestRecordsState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/harvests)
export async function createHarvestRecord(
  harvestInput: Omit<HarvestRecord, 'id' | 'batchCode'>
): Promise<ApiResponse<HarvestRecord>> {
  const newHarvest: HarvestRecord = {
    ...harvestInput,
    id: `HARV-2026-${String(harvestRecordsState.length + 1).padStart(2, '0')}`,
    batchCode: `LOT-${harvestInput.cropName.toUpperCase().slice(0, 4)}-26-${harvestInput.quantityKg}`,
  };
  harvestRecordsState = [newHarvest, ...harvestRecordsState];
  return simulateApiCall(newHarvest, 250);
}

// 11. Farm Expenses
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/expenses)
export async function getFarmExpenses(): Promise<ApiResponse<FarmExpense[]>> {
  return simulateApiCall(farmExpensesState, 150);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/expenses)
export async function addFarmExpense(
  expenseInput: Omit<FarmExpense, 'id'>
): Promise<ApiResponse<FarmExpense>> {
  const newExpense: FarmExpense = {
    ...expenseInput,
    id: `EXP-${Date.now().toString().slice(-4)}`,
  };
  farmExpensesState = [newExpense, ...farmExpensesState];
  return simulateApiCall(newExpense, 200);
}

// 12. Profitability Analysis
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/profitability)
export async function getProfitabilityMetrics(): Promise<ApiResponse<ProfitabilityMetrics>> {
  return simulateApiCall(initialProfitabilityMetrics, 200);
}

// 13. Weather & Alerts
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/weather)
export async function getWeatherData(): Promise<ApiResponse<WeatherData>> {
  return simulateApiCall(initialWeatherData, 200);
}

// 14. Agricultural Training
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/training)
export async function getTrainingCourses(): Promise<ApiResponse<TrainingCourse[]>> {
  return simulateApiCall(initialTrainingCourses, 200);
}

// 15. AI Recommendation Diagnostic Result
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/crops/ai-diagnostic)
export async function getAiRecommendationDiagnostic(): Promise<
  ApiResponse<AiRecommendationDiagnostic>
> {
  return simulateApiCall(initialAiRecommendationDiagnostic, 250);
}

// 16. Farmer Notifications
// TODO: Replace with real API endpoint when ready (GET /api/v1/farmer/notifications)
export async function getFarmerNotifications(): Promise<ApiResponse<FarmerNotification[]>> {
  return simulateApiCall(notificationsState, 150);
}

// TODO: Replace with real API endpoint when ready (PATCH /api/v1/farmer/notifications/:id/read)
export async function markNotificationAsRead(id: string): Promise<ApiResponse<FarmerNotification>> {
  notificationsState = notificationsState.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  const notif = notificationsState.find((n) => n.id === id)!;
  return simulateApiCall(notif, 100);
}

// TODO: Replace with real API endpoint when ready (POST /api/v1/farmer/notifications/mark-all-read)
export async function markAllNotificationsRead(): Promise<ApiResponse<boolean>> {
  notificationsState = notificationsState.map((n) => ({ ...n, isRead: true }));
  return simulateApiCall(true, 100);
}
