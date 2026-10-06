/**
 * Quality-inspector API — the live half of the inspector portal.
 *
 * Backed by `GET/POST /api/quality` and its `/reports`, `/schedule`,
 * `/:id/start` and `/:id/submit` siblings (MARKETPLACE_PORTAL_PLAN Step 5).
 * One document serves as both the assignment and the report, so the endpoints
 * look unlike the standard CRUD routers: `start` and `submit` are verb-specific
 * transitions rather than `PUT`s, and the submit body uses the *database*
 * vocabulary (`assignedGrade`, `complianceVerdict`) because it lands straight
 * in a schema field.
 *
 * The mapper on the other side of the wire already emits the exact
 * `InspectionRequest` / `InspectionReport` / `InspectorScheduleEntry` shapes
 * declared in `types/index.ts`, so nothing is transformed here beyond the
 * submit payload's two renamed fields.
 */
import {
  ApiResponse,
  InspectionReport,
  InspectionRequest,
  InspectorScheduleEntry,
} from "@/types";
import { api } from "@/lib/api";

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function fail<T>(data: T, message: string): ApiResponse<T> {
  return { success: false, data, message, timestamp: new Date().toISOString() };
}

/** Shared catch-block wrapper — `err.message` when the API threw one. */
function loadFailed<T>(
  fallback: T,
  err: unknown,
  fallbackMessage: string
): ApiResponse<T> {
  return fail(fallback, err instanceof Error ? err.message : fallbackMessage);
}

export interface InspectorDashboardStats {
  /** `assigned` — in the inbox, not yet picked up. */
  pendingCount: number;
  inProgressCount: number;
  completedThisMonth: number;
  /** Scheduled entries still to come on the calendar. */
  scheduledThisWeek: number;
}

/**
 * KPIs derived from the same two endpoints the pages read, so the dashboard
 * cannot disagree with the lists it links to. `completedThisMonth` counts by
 * `inspectionDate`, not `submittedAt` — a report filed on the 1st for a lot
 * inspected last month belongs to last month.
 */
export async function getInspectorDashboardStats(): Promise<
  ApiResponse<InspectorDashboardStats>
> {
  const zero: InspectorDashboardStats = {
    pendingCount: 0,
    inProgressCount: 0,
    completedThisMonth: 0,
    scheduledThisWeek: 0,
  };

  const [inspectionsRes, scheduleRes] = await Promise.all([
    getAssignedInspections(),
    getInspectorSchedule(),
  ]);

  if (!inspectionsRes.success || !scheduleRes.success) {
    return loadFailed(
      zero,
      new Error(
        inspectionsRes.message || scheduleRes.message || "Could not load your queue."
      ),
      "Could not load your queue."
    );
  }

  const inspections = inspectionsRes.data;
  const month = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);

  return ok({
    pendingCount: inspections.filter((i) => i.status === "assigned").length,
    inProgressCount: inspections.filter((i) => i.status === "in_progress")
      .length,
    completedThisMonth: inspections.filter(
      (i) => i.status === "completed" && i.scheduledDate.startsWith(month)
    ).length,
    scheduledThisWeek: scheduleRes.data.filter(
      (s) => s.date >= today && s.status !== "done" && s.status !== "cancelled"
    ).length,
  });
}

/** The caller's work list. Admins see every record; inspectors see their own. */
export async function getAssignedInspections(options?: {
  status?: string;
}): Promise<ApiResponse<InspectionRequest[]>> {
  const qs = options?.status ? `?status=${encodeURIComponent(options.status)}` : "";
  try {
    const data = await api.get<InspectionRequest[]>(`/quality${qs}`);
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return loadFailed([], err, "Could not load inspections.");
  }
}

export async function getInspectionById(
  id: string
): Promise<ApiResponse<InspectionRequest | null>> {
  try {
    return ok(await api.get<InspectionRequest>(`/quality/${id}`));
  } catch (err) {
    return loadFailed(null, err, "Inspection not found.");
  }
}

/** `POST /quality/:id/start` — moves `assigned` → `in_progress`. */
export async function startInspection(
  id: string
): Promise<ApiResponse<InspectionRequest | null>> {
  try {
    return ok(await api.post<InspectionRequest>(`/quality/${id}/start`, {}));
  } catch (err) {
    return loadFailed(null, err, "Could not start that inspection.");
  }
}

/** What the inspector fills in when closing an inspection. */
export interface InspectionSubmitPayload {
  /** `Rejected` is accepted here as well as the three grades. */
  grade: InspectionReport["grade"];
  /** 0–100. The server treats 0 as absent, so record real zeros as `0`. */
  moistureContentPercent: number;
  foreignMatterPercent: number;
  aflatoxinPpm: number;
  visualCondition: InspectionReport["visualCondition"];
  recommendedAction: string;
  verdict: InspectionReport["verdict"];
  certificateNumber?: string;
  /** `YYYY-MM-DD`. Defaults to today on the server. */
  inspectionDate?: string;
  findings: string;
}

/**
 * Record the measurements and close the inspection.
 *
 * The two renames in the body are the only place the client and the schema
 * disagree: the UI calls them `grade` and `verdict` (the words that appear on
 * the certificate) while `QualityRequest` stores `assignedGrade` and
 * `complianceVerdict`. The server assigns a certificate number if one is not
 * supplied, so callers may leave it blank.
 */
export async function submitInspectionReport(
  inspectionId: string,
  data: InspectionSubmitPayload
): Promise<ApiResponse<InspectionReport | null>> {
  try {
    const report = await api.post<InspectionReport>(
      `/quality/${inspectionId}/submit`,
      {
        assignedGrade: data.grade,
        complianceVerdict: data.verdict,
        moistureContentPercent: data.moistureContentPercent,
        foreignMatterPercent: data.foreignMatterPercent,
        aflatoxinPpm: data.aflatoxinPpm,
        visualCondition: data.visualCondition,
        recommendedAction: data.recommendedAction,
        findings: data.findings,
        ...(data.certificateNumber
          ? { certificateNumber: data.certificateNumber }
          : {}),
        ...(data.inspectionDate ? { inspectionDate: data.inspectionDate } : {}),
      }
    );
    return ok(report);
  } catch (err) {
    return loadFailed(null, err, "Could not submit that report.");
  }
}

/** Completed inspections, newest first. */
export async function getCompletedReports(): Promise<
  ApiResponse<InspectionReport[]>
> {
  try {
    const data = await api.get<InspectionReport[]>("/quality/reports");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return loadFailed([], err, "Could not load reports.");
  }
}

/**
 * One report by id. There is no single-record report endpoint — `GET
 * /quality/:id` returns the *assignment* view — so this reads the completed
 * list and selects from it. The lists are small and per-inspector, so the
 * extra rows cost nothing compared with inventing a parallel route.
 */
export async function getReportById(
  id: string
): Promise<ApiResponse<InspectionReport | null>> {
  const res = await getCompletedReports();
  if (!res.success) return { ...res, data: null };
  return ok(res.data.find((r) => r.id === id) ?? null);
}

/** Dated, still-open inspections — the calendar view. */
export async function getInspectorSchedule(): Promise<
  ApiResponse<InspectorScheduleEntry[]>
> {
  try {
    const data = await api.get<InspectorScheduleEntry[]>("/quality/schedule");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return loadFailed([], err, "Could not load your schedule.");
  }
}

export interface InspectorNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

/**
 * The account's notifications — the same `GET /notifications` every other
 * portal reads. Narrowed to the four fields the inspector UI shows; the wire
 * format carries `type`, `priority` and `actionLink` too.
 */
export async function getInspectorNotifications(): Promise<
  ApiResponse<InspectorNotification[]>
> {
  try {
    const data = await api.get<
      Array<{
        id: string;
        title: string;
        message: string;
        isRead: boolean;
        timestamp: string;
      }>
    >("/notifications");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return loadFailed([], err, "Could not load notifications.");
  }
}
