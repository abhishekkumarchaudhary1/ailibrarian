"use client";

import { Button } from "@/components/ui/Button";

export function ReturnLoanButton({ loanId }: { loanId: string }) {
  async function markReturned() {
    const res = await fetch("/api/loans/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId }),
    });
    if (res.ok) window.location.reload();
  }

  return (
    <Button size="sm" variant="secondary" onClick={markReturned}>
      Mark Returned
    </Button>
  );
}
