/**
 * Shared financial calculation utilities.
 */

/**
 * Calculates balance and payment status based on total and advance paid.
 */
export function calcBalance(total: number, paid: number) {
  const balance = total - paid;
  const status = paid > total ? "Overpaid" : paid === total && total > 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
  return { balance, status };
}
