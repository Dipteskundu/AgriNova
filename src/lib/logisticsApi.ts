/**
 * Logistics delivery data is live; fleet, earnings and notification modules
 * remain local fixtures until their backend endpoints are available.
 */
import { ApiResponse, DeliveryAssignment, FleetVehicle, LogisticsEarning } from "@/types";
import { api } from "@/lib/api";

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function fail<T>(data: T, message: string): ApiResponse<T> {
  return { success: false, data, message, timestamp: new Date().toISOString() };
}

const MOCK_FLEET: FleetVehicle[] = [
  { id: "fv-001", vehicleNumber: "DHK-CHA-1234", type: "Refrigerated", capacityKg: 3000, currentStatus: "on_route", lastServiceDate: "2026-08-15", nextServiceDate: "2026-11-15", currentDriverName: "Kamal Hossain", currentDriverPhone: "01811-001001" },
  { id: "fv-002", vehicleNumber: "DHK-CHA-5678", type: "Open Truck", capacityKg: 5000, currentStatus: "available", lastServiceDate: "2026-09-01", nextServiceDate: "2026-12-01", currentDriverName: "Rahim Ali", currentDriverPhone: "01822-002002" },
  { id: "fv-003", vehicleNumber: "CTG-CHA-9012", type: "Insulated Van", capacityKg: 1500, currentStatus: "on_route", lastServiceDate: "2026-07-20", nextServiceDate: "2026-10-20", currentDriverName: "Jamal Uddin", currentDriverPhone: "01833-003003" },
  { id: "fv-004", vehicleNumber: "RJH-CHA-3456", type: "Electric Van", capacityKg: 800, currentStatus: "maintenance", lastServiceDate: "2026-09-25", nextServiceDate: "2026-10-25", currentDriverName: "Sumon Das", currentDriverPhone: "01844-004004" },
];

const MOCK_EARNINGS: LogisticsEarning[] = [
  { id: "le-001", consignmentCode: "CON-2026-001", deliveryDate: "2026-09-17", distanceKm: 180, feeAmountBdt: 3600, paymentStatus: "paid", paidAt: "2026-09-18T10:00:00Z" },
  { id: "le-002", consignmentCode: "CON-2026-H01", deliveryDate: "2026-09-09", distanceKm: 220, feeAmountBdt: 5500, paymentStatus: "paid", paidAt: "2026-09-10T09:00:00Z" },
  { id: "le-003", consignmentCode: "CON-2026-H02", deliveryDate: "2026-09-06", distanceKm: 195, feeAmountBdt: 4200, paymentStatus: "paid", paidAt: "2026-09-07T11:00:00Z" },
  { id: "le-004", consignmentCode: "CON-2026-002", deliveryDate: "2026-09-27", distanceKm: 90, feeAmountBdt: 2800, paymentStatus: "pending" },
  { id: "le-005", consignmentCode: "CON-2026-003", deliveryDate: "2026-10-02", distanceKm: 30, feeAmountBdt: 1200, paymentStatus: "pending" },
  { id: "le-006", consignmentCode: "CON-2026-004", deliveryDate: "2026-10-05", distanceKm: 120, feeAmountBdt: 3000, paymentStatus: "pending" },
];

export interface LogisticsDashboardStats {
  activeDeliveriesCount: number;
  onTimeRatePercent: number;
  deliveriesThisWeek: number;
  totalEarningsBdt: number;
}

const toApiStatus: Partial<Record<DeliveryAssignment["status"], string>> = {
  assigned: "Pending",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export async function getLogisticsDashboardStats(): Promise<ApiResponse<LogisticsDashboardStats>> {
  const deliveries = await getActiveDeliveries();
  if (!deliveries.success) {
    return fail(
      { activeDeliveriesCount: 0, onTimeRatePercent: 0, deliveriesThisWeek: 0, totalEarningsBdt: 0 },
      deliveries.message || "Could not load delivery statistics."
    );
  }
  return ok({
    activeDeliveriesCount: deliveries.data.length,
    onTimeRatePercent: 92,
    deliveriesThisWeek: 3,
    totalEarningsBdt: MOCK_EARNINGS.filter((e) => e.paymentStatus === "paid")
      .reduce((sum, earning) => sum + earning.feeAmountBdt, 0),
  });
}

export async function getActiveDeliveries(): Promise<ApiResponse<DeliveryAssignment[]>> {
  try {
    const deliveries = await api.get<DeliveryAssignment[]>("/deliveries");
    return ok(deliveries.filter((delivery) => delivery.status !== "delivered"));
  } catch (error) {
    return fail([], error instanceof Error ? error.message : "Could not load deliveries.");
  }
}

export async function getDeliveryById(id: string): Promise<ApiResponse<DeliveryAssignment>> {
  const data = await api.get<DeliveryAssignment>(`/deliveries/${id}`);
  return ok(data);
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryAssignment["status"]
): Promise<ApiResponse<DeliveryAssignment>> {
  const apiStatus = toApiStatus[status];
  if (!apiStatus) throw new Error(`Unsupported delivery status: ${status}`);
  const data = await api.patch<DeliveryAssignment>(`/deliveries/${id}/status`, {
    status: apiStatus,
  });
  return ok(data);
}

export async function updateDeliveryDetails(
  id: string,
  details: { consignmentNo?: string; vehicle?: string; driver?: string }
): Promise<ApiResponse<DeliveryAssignment>> {
  const data = await api.patch<DeliveryAssignment>(`/deliveries/${id}`, details);
  return ok(data);
}

export async function getFleetVehicles(): Promise<ApiResponse<FleetVehicle[]>> {
  return ok(MOCK_FLEET);
}

export async function getDeliveryHistory(): Promise<ApiResponse<DeliveryAssignment[]>> {
  try {
    const deliveries = await api.get<DeliveryAssignment[]>("/deliveries");
    return ok(deliveries.filter((delivery) => delivery.status === "delivered"));
  } catch (error) {
    return fail([], error instanceof Error ? error.message : "Could not load delivery history.");
  }
}

export async function getLogisticsEarnings(): Promise<ApiResponse<LogisticsEarning[]>> {
  return ok(MOCK_EARNINGS);
}

export async function getLogisticsNotifications(): Promise<ApiResponse<{ id: string; title: string; message: string; isRead: boolean; timestamp: string }[]>> {
  return ok([
    { id: "ln-001", title: "New Delivery Assigned", message: "New delivery CON-2026-004 assigned. Pickup on Oct 1.", isRead: false, timestamp: "2026-09-29T10:00:00Z" },
    { id: "ln-002", title: "Payment Received", message: "Payment of ৳3,600 received for CON-2026-001.", isRead: true, timestamp: "2026-09-18T10:05:00Z" },
    { id: "ln-003", title: "Vehicle Service Due", message: "Vehicle CTG-CHA-9012 service due on Oct 20.", isRead: false, timestamp: "2026-09-28T08:00:00Z" },
  ]);
}
