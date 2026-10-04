/**
 * Support Staff Portal API — mock data layer.
 */
import { ApiResponse, SupportDisputeCase, HelpTicket, EscalationRecord } from "@/types";

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

let MOCK_TICKETS: HelpTicket[] = [
  { id: "tkt-001", ticketNumber: "TKT-2026-001", requesterName: "Abdul Malek", requesterRole: "Farmer", subject: "Cannot upload harvest photos", description: "I am trying to upload harvest photos but the upload button is not working on my Android phone.", category: "Technical", priority: "medium", status: "open", openedAt: "2026-09-27T09:00:00Z", lastUpdatedAt: "2026-09-27T09:00:00Z", assignedAgentName: "Demo Support", messages: [{ sender: "Abdul Malek", message: "I am trying to upload harvest photos but the upload button is not working on my Android phone.", timestamp: "2026-09-27T09:00:00Z" }] },
  { id: "tkt-002", ticketNumber: "TKT-2026-002", requesterName: "Rahim Trading Co.", requesterRole: "Buyer", subject: "Wrong amount charged for order MP-2026-002", description: "I was charged ৳11,500 but the order total should be ৳11,000.", category: "Payment", priority: "high", status: "in_progress", openedAt: "2026-09-26T14:00:00Z", lastUpdatedAt: "2026-09-27T11:00:00Z", assignedAgentName: "Demo Support", messages: [{ sender: "Rahim Trading Co.", message: "I was charged ৳11,500 but the order total should be ৳11,000.", timestamp: "2026-09-26T14:00:00Z" }, { sender: "Demo Support", message: "Thank you for contacting us. We are investigating the payment discrepancy.", timestamp: "2026-09-27T11:00:00Z" }] },
  { id: "tkt-003", ticketNumber: "TKT-2026-003", requesterName: "Fatema Khatun", requesterRole: "Farmer", subject: "How to list my tomatoes for sale?", description: "I have completed the quality inspection. How do I list my tomatoes on the marketplace?", category: "Account", priority: "low", status: "resolved", openedAt: "2026-09-24T10:00:00Z", lastUpdatedAt: "2026-09-24T15:00:00Z", assignedAgentName: "Demo Support", messages: [{ sender: "Fatema Khatun", message: "How do I list my tomatoes on the marketplace?", timestamp: "2026-09-24T10:00:00Z" }, { sender: "Demo Support", message: "Go to your dashboard > Harvest Management > click 'List to Marketplace' on your verified harvest lot.", timestamp: "2026-09-24T12:00:00Z" }, { sender: "Fatema Khatun", message: "Thank you! It worked.", timestamp: "2026-09-24T15:00:00Z" }] },
  { id: "tkt-004", ticketNumber: "TKT-2026-004", requesterName: "Karim Agro Suppliers", requesterRole: "Supplier", subject: "My product listing was removed", description: "My neem oil pesticide listing was removed without notice. Please restore it.", category: "Account", priority: "high", status: "waiting_user", openedAt: "2026-09-28T08:00:00Z", lastUpdatedAt: "2026-09-28T16:00:00Z", assignedAgentName: "Demo Support", messages: [{ sender: "Karim Agro Suppliers", message: "My neem oil pesticide listing was removed without notice.", timestamp: "2026-09-28T08:00:00Z" }, { sender: "Demo Support", message: "Your listing was paused due to missing DAE registration certificate. Please upload the certificate to restore.", timestamp: "2026-09-28T16:00:00Z" }] },
  { id: "tkt-005", ticketNumber: "TKT-2026-005", requesterName: "Jamal Hossain", requesterRole: "Farmer", subject: "Inspector did not arrive for scheduled inspection", description: "My inspection was scheduled for Sep 29 at 9 AM but the inspector did not arrive.", category: "Order", priority: "urgent", status: "open", openedAt: "2026-09-29T11:00:00Z", lastUpdatedAt: "2026-09-29T11:00:00Z", assignedAgentName: "Demo Support", messages: [{ sender: "Jamal Hossain", message: "My inspection was scheduled for Sep 29 at 9 AM but the inspector did not arrive.", timestamp: "2026-09-29T11:00:00Z" }] },
];

const MOCK_DISPUTES: SupportDisputeCase[] = [
  { id: "dsp-001", caseNumber: "DSP-2026-001", plaintiff: { name: "Fresh Foods Ltd.", role: "Buyer", phone: "01711-100100" }, defendant: { name: "Fatema Khatun", role: "Farmer", phone: "01823-456789" }, relatedOrderCode: "MP-2026-002", disputeType: "Produce Grade Degradation", disputedAmountBdt: 11000, status: "open", openedAt: "2026-09-27T10:00:00Z", assignedAgentName: "Demo Support", evidenceCount: 3 },
  { id: "dsp-002", caseNumber: "DSP-2026-002", plaintiff: { name: "Rahim Trading Co.", role: "Buyer", phone: "01711-200200" }, defendant: { name: "Demo Logistics", role: "Logistics Partner", phone: "01822-002002" }, relatedOrderCode: "MP-2026-001", disputeType: "Delivery Transit Spoilage", disputedAmountBdt: 3600, status: "under_review", openedAt: "2026-09-20T08:00:00Z", assignedAgentName: "Demo Support", evidenceCount: 5 },
  { id: "dsp-003", caseNumber: "DSP-2026-003", plaintiff: { name: "Abdul Malek", role: "Farmer", phone: "01712-345678" }, defendant: { name: "Mirpur Grocers", role: "Buyer", phone: "01733-300300" }, relatedOrderCode: "MP-2026-003", disputeType: "Payment Delay", disputedAmountBdt: 14400, status: "mediation", openedAt: "2026-09-15T09:00:00Z", assignedAgentName: "Demo Support", evidenceCount: 2 },
  { id: "dsp-004", caseNumber: "DSP-2026-004", plaintiff: { name: "Nasrin Akter", role: "Farmer", phone: "01611-678901" }, defendant: { name: "Potato Processing Ltd.", role: "Buyer", phone: "01744-400400" }, relatedOrderCode: "MP-2026-H01", disputeType: "Weight Shortage", disputedAmountBdt: 5400, status: "resolved", openedAt: "2026-09-10T07:00:00Z", assignedAgentName: "Demo Support", evidenceCount: 4, resolutionNotes: "Buyer agreed to compensate for 30 kg shortage. Payment of ৳540 transferred to farmer." },
];

const MOCK_ESCALATIONS: EscalationRecord[] = [
  { id: "esc-001", caseType: "dispute", relatedId: "dsp-001", caseNumber: "DSP-2026-001", escalatedBy: "Demo Support", escalatedTo: "Senior Arbitrator", reason: "High value dispute requires senior review.", status: "pending", escalatedAt: "2026-09-28T09:00:00Z" },
  { id: "esc-002", caseType: "ticket", relatedId: "tkt-005", caseNumber: "TKT-2026-005", escalatedBy: "Demo Support", escalatedTo: "Operations Manager", reason: "Inspector no-show requires immediate action.", status: "acknowledged", escalatedAt: "2026-09-29T12:00:00Z" },
  { id: "esc-003", caseType: "dispute", relatedId: "dsp-002", caseNumber: "DSP-2026-002", escalatedBy: "Demo Support", escalatedTo: "Logistics Manager", reason: "Cold chain breach evidence needs technical review.", status: "resolved", escalatedAt: "2026-09-21T10:00:00Z" },
];

export interface SupportDashboardStats {
  openTicketsCount: number;
  pendingDisputesCount: number;
  resolvedTodayCount: number;
  activeEscalationsCount: number;
}

export async function getSupportDashboardStats(): Promise<ApiResponse<SupportDashboardStats>> {
  return ok({
    openTicketsCount: MOCK_TICKETS.filter(t => t.status === "open" || t.status === "in_progress").length,
    pendingDisputesCount: MOCK_DISPUTES.filter(d => d.status === "open" || d.status === "under_review").length,
    resolvedTodayCount: 2,
    activeEscalationsCount: MOCK_ESCALATIONS.filter(e => e.status !== "resolved").length,
  });
}

export async function getSupportDisputes(): Promise<ApiResponse<SupportDisputeCase[]>> {
  return ok(MOCK_DISPUTES);
}

export async function getDisputeById(id: string): Promise<ApiResponse<SupportDisputeCase>> {
  return ok(MOCK_DISPUTES.find(d => d.id === id) ?? MOCK_DISPUTES[0]);
}

export async function updateDisputeStatus(
  id: string,
  status: SupportDisputeCase["status"],
  notes?: string
): Promise<ApiResponse<SupportDisputeCase>> {
  const dispute = MOCK_DISPUTES.find(d => d.id === id) ?? MOCK_DISPUTES[0];
  return ok({ ...dispute, status, ...(notes ? { resolutionNotes: notes } : {}) });
}

export async function getHelpTickets(): Promise<ApiResponse<HelpTicket[]>> {
  return ok(MOCK_TICKETS);
}

export async function getTicketById(id: string): Promise<ApiResponse<HelpTicket>> {
  return ok(MOCK_TICKETS.find(t => t.id === id) ?? MOCK_TICKETS[0]);
}

export async function replyToTicket(
  id: string,
  message: string
): Promise<ApiResponse<HelpTicket>> {
  const ticket = MOCK_TICKETS.find(t => t.id === id) ?? MOCK_TICKETS[0];
  const updated: HelpTicket = {
    ...ticket,
    lastUpdatedAt: new Date().toISOString(),
    messages: [
      ...ticket.messages,
      { sender: "Demo Support", message, timestamp: new Date().toISOString() },
    ],
  };
  MOCK_TICKETS = MOCK_TICKETS.map(t => t.id === id ? updated : t);
  return ok(updated);
}

export async function getEscalations(): Promise<ApiResponse<EscalationRecord[]>> {
  return ok(MOCK_ESCALATIONS);
}

export async function getSupportNotifications(): Promise<ApiResponse<{ id: string; title: string; message: string; isRead: boolean; timestamp: string }[]>> {
  return ok([
    { id: "sn-001", title: "New Urgent Ticket", message: "Jamal Hossain filed an urgent ticket about missed inspection.", isRead: false, timestamp: "2026-09-29T11:05:00Z" },
    { id: "sn-002", title: "Escalation Acknowledged", message: "Escalation ESC-002 acknowledged by Operations Manager.", isRead: false, timestamp: "2026-09-29T12:30:00Z" },
    { id: "sn-003", title: "Dispute Resolved", message: "Dispute DSP-2026-004 has been resolved successfully.", isRead: true, timestamp: "2026-09-25T14:00:00Z" },
  ]);
}
