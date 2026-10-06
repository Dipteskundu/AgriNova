/**
 * Logistics Partner Portal API — mock data layer.
 */
import { ApiResponse, DeliveryAssignment, FleetVehicle, LogisticsEarning } from "@/types";

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

const MOCK_DELIVERIES: DeliveryAssignment[] = [
  { id: "del-001", consignmentCode: "CON-2026-001", orderCode: "MP-2026-001", farmerName: "Abdul Malek", pickupAddress: "Bogura Sadar, Bogura", buyerName: "Rahim Trading Co.", deliveryAddress: "Tejgaon, Dhaka-1215", cargoDescription: "Rice Paddy — 500 kg", cargoWeightKg: 500, vehicleType: "Open Truck", status: "delivered", scheduledPickup: "2026-09-16T08:00:00Z", estimatedDelivery: "2026-09-17T18:00:00Z", actualDelivery: "2026-09-17T15:30:00Z", specialInstructions: "Handle with care. Keep dry." },
  { id: "del-002", consignmentCode: "CON-2026-002", orderCode: "MP-2026-002", farmerName: "Fatema Khatun", pickupAddress: "Comilla Sadar, Comilla", buyerName: "Fresh Foods Ltd.", deliveryAddress: "Gulshan-2, Dhaka-1212", cargoDescription: "Tomato — 200 kg", cargoWeightKg: 200, vehicleType: "Refrigerated", status: "in_transit", scheduledPickup: "2026-09-25T07:00:00Z", estimatedDelivery: "2026-09-27T12:00:00Z", temperatureCelsius: 8, specialInstructions: "Maintain temperature 6–10°C throughout transit." },
  { id: "del-003", consignmentCode: "CON-2026-003", orderCode: "MP-2026-003", farmerName: "Jamal Hossain", pickupAddress: "Narayanganj Sadar", buyerName: "Mirpur Grocers", deliveryAddress: "Mirpur-10, Dhaka-1216", cargoDescription: "Onion — 300 kg", cargoWeightKg: 300, vehicleType: "Open Truck", status: "picked_up", scheduledPickup: "2026-09-29T09:00:00Z", estimatedDelivery: "2026-10-02T17:00:00Z", specialInstructions: "No stacking above 3 bags high." },
  { id: "del-004", consignmentCode: "CON-2026-004", orderCode: "MP-2026-004", farmerName: "Nasrin Akter", pickupAddress: "Mymensingh Sadar", buyerName: "Uttara Superstore", deliveryAddress: "Uttara, Dhaka-1230", cargoDescription: "Lentil — 150 kg", cargoWeightKg: 150, vehicleType: "Insulated Van", status: "assigned", scheduledPickup: "2026-10-01T08:00:00Z", estimatedDelivery: "2026-10-05T16:00:00Z", specialInstructions: "Sealed bags. Keep away from moisture." },
];

const MOCK_COMPLETED: DeliveryAssignment[] = [
  { id: "del-c-001", consignmentCode: "CON-2026-H01", orderCode: "MP-2026-H01", farmerName: "Rahim Chowdhury", pickupAddress: "Rangpur Sadar", buyerName: "Potato Processing Ltd.", deliveryAddress: "Tejgaon Industrial, Dhaka", cargoDescription: "Potato — 1000 kg", cargoWeightKg: 1000, vehicleType: "Open Truck", status: "delivered", scheduledPickup: "2026-09-08T07:00:00Z", estimatedDelivery: "2026-09-09T18:00:00Z", actualDelivery: "2026-09-09T17:15:00Z", specialInstructions: "" },
  { id: "del-c-002", consignmentCode: "CON-2026-H02", orderCode: "MP-2026-H02", farmerName: "Sumon Sarker", pickupAddress: "Sylhet Sadar", buyerName: "Agro Oil Mill", deliveryAddress: "Narayanganj Industrial", cargoDescription: "Mustard — 500 kg", cargoWeightKg: 500, vehicleType: "Open Truck", status: "delivered", scheduledPickup: "2026-09-05T09:00:00Z", estimatedDelivery: "2026-09-06T20:00:00Z", actualDelivery: "2026-09-06T19:30:00Z", specialInstructions: "" },
];

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

export async function getLogisticsDashboardStats(): Promise<ApiResponse<LogisticsDashboardStats>> {
  return ok({
    activeDeliveriesCount: MOCK_DELIVERIES.filter(d => d.status !== "delivered" && d.status !== "failed").length,
    onTimeRatePercent: 92,
    deliveriesThisWeek: 3,
    totalEarningsBdt: MOCK_EARNINGS.filter(e => e.paymentStatus === "paid").reduce((s, e) => s + e.feeAmountBdt, 0),
  });
}

export async function getActiveDeliveries(): Promise<ApiResponse<DeliveryAssignment[]>> {
  return ok(MOCK_DELIVERIES);
}

export async function getDeliveryById(id: string): Promise<ApiResponse<DeliveryAssignment>> {
  return ok([...MOCK_DELIVERIES, ...MOCK_COMPLETED].find(d => d.id === id) ?? MOCK_DELIVERIES[0]);
}

export async function updateDeliveryStatus(id: string, status: DeliveryAssignment["status"]): Promise<ApiResponse<DeliveryAssignment>> {
  const delivery = MOCK_DELIVERIES.find(d => d.id === id) ?? MOCK_DELIVERIES[0];
  return ok({ ...delivery, status, ...(status === "delivered" ? { actualDelivery: new Date().toISOString() } : {}) });
}

export async function getFleetVehicles(): Promise<ApiResponse<FleetVehicle[]>> {
  return ok(MOCK_FLEET);
}

export async function getDeliveryHistory(): Promise<ApiResponse<DeliveryAssignment[]>> {
  return ok(MOCK_COMPLETED);
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
