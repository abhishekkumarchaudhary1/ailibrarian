"use client";

import { Button } from "@/components/ui/Button";

export function BorrowButton({ bookId }: { bookId: string }) {
  async function borrow() {
    const res = await fetch("/api/loans/borrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    if (res.ok) window.location.reload();
    else {
      const d = await res.json();
      alert(d.error ?? "Could not borrow");
    }
  }

  return (
    <Button size="sm" onClick={borrow}>
      Borrow
    </Button>
  );
}
