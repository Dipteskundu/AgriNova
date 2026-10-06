/**
 * Wallet API — the seller's escrow payout layer.
 *
 * Split from `marketplaceApi` because the two answer different questions:
 * marketplaceApi describes *orders* (what was sold, where the escrow sits on a
 * given order), this describes the *ledger* those orders feed. A credit lands
 * here when escrow releases; a debit leaves when an admin approves a
 * withdrawal.
 *
 * Every function returns the `ApiResponse` envelope so the pages can branch on
 * `.success` exactly as they do for listings and orders.
 */

import { ApiResponse } from "@/types";
import { api } from "@/lib/api";

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function fail<T>(data: T, message: string): ApiResponse<T> {
  return { success: false, data, message, timestamp: new Date().toISOString() };
}

// ─── Types ────────────────────────────────────────────────────

/**
 * Mirrors the `WalletEntry` schema. `ownerName` / `ownerEmail` are present
 * only on the admin queue, where the row is populated with its owner.
 */
export interface WalletEntryView {
  id: string;
  kind: "credit" | "debit";
  amountBdt: number;
  status: "Available" | "Pending Approval" | "Completed" | "Rejected";
  label: string;
  orderCode: string;
  approvedBy: string;
  processedAt: string;
  /** `YYYY-MM-DD` the row was written. */
  date: string;
  ownerName?: string;
  ownerEmail?: string;
}

export interface WalletSummary {
  /** Credits minus *completed* debits. */
  balance: number;
  /** Debits still awaiting a decision — not yet subtracted. */
  pending: number;
  /** What a new withdrawal request may be sized against. */
  available: number;
  totalCredits: number;
  entries: WalletEntryView[];
}

// ─── Seller ───────────────────────────────────────────────────

export async function getWallet(): Promise<ApiResponse<WalletSummary>> {
  try {
    return ok(await api.get<WalletSummary>("/wallet"));
  } catch (err) {
    return fail(
      emptyWallet(),
      err instanceof Error ? err.message : "Could not load your wallet."
    );
  }
}

/**
 * Request a withdrawal. Returns the refreshed summary rather than just the new
 * row, so the balance, pending figure and ledger can all update in one pass.
 */
export async function requestWithdrawal(
  amountBdt: number,
  method?: string
): Promise<ApiResponse<WalletSummary>> {
  try {
    return ok(
      await api.post<WalletSummary>("/wallet/withdraw", { amountBdt, method })
    );
  } catch (err) {
    return fail(
      emptyWallet(),
      err instanceof Error ? err.message : "Could not request the withdrawal."
    );
  }
}

const emptyWallet = (): WalletSummary => ({
  balance: 0,
  pending: 0,
  available: 0,
  totalCredits: 0,
  entries: [],
});

// ─── Admin ────────────────────────────────────────────────────

/** Every withdrawal ever requested, newest first, with the owner resolved. */
export async function getWithdrawalRequestsAdmin(): Promise<
  ApiResponse<WalletEntryView[]>
> {
  try {
    const data = await api.get<WalletEntryView[]>("/wallet/requests");
    return ok(Array.isArray(data) ? data : []);
  } catch (err) {
    return fail(
      [],
      err instanceof Error ? err.message : "Could not load withdrawal requests."
    );
  }
}

/**
 * Approve: the debit becomes `Completed` and starts subtracting from the
 * seller's balance. Reject: it becomes `Rejected` and the money is theirs
 * again — neither path is reversible through this API, so the button is the
 * decision.
 */
export async function settleWithdrawalAdmin(
  id: string,
  action: "approve" | "reject"
): Promise<ApiResponse<WalletEntryView | null>> {
  try {
    return ok(
      await api.post<WalletEntryView>(`/wallet/${id}/${action}`, {})
    );
  } catch (err) {
    return fail(
      null,
      err instanceof Error ? err.message : "Could not settle the request."
    );
  }
}
