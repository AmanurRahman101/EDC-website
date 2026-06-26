"use client";

import { useMemo, useState } from "react";
import { DIVISION_NAMES, districtsForDivision } from "@/lib/bd-locations";
import { shippingForDivisionDistrict, shippingLabel } from "@/lib/shipping";
import { formatTk } from "@/lib/money";
import { isValidBdMobile } from "@/lib/validation";

type CheckoutFormProps = {
  subtotalCents: number;
  action: (formData: FormData) => void;
  defaultName?: string;
};

const PAYMENT_OPTIONS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
] as const;

export default function CheckoutForm({ subtotalCents, action, defaultName }: CheckoutFormProps) {
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");

  const districts = useMemo(() => districtsForDivision(division), [division]);

  const shippingCents = district
    ? shippingForDivisionDistrict(division, district)
    : null;
  const totalCents = subtotalCents + (shippingCents ?? 0);

  const phoneValid = isValidBdMobile(phone);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="font-label-caps text-label-caps text-secondary block mb-1">FULL NAME</label>
        <input
          name="name"
          required
          defaultValue={defaultName || ""}
          className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-secondary block mb-1">MOBILE NUMBER</label>
        <input
          name="phone"
          required
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm font-spec-data"
          placeholder="01XXXXXXXXX"
        />
        {phone.length > 0 && !phoneValid && (
          <p className="text-[10px] text-error mt-1">Enter a valid 11-digit BD mobile (e.g. 01712345678).</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-label-caps text-label-caps text-secondary block mb-1">DIVISION</label>
          <select
            name="division"
            required
            value={division}
            onChange={(e) => {
              setDivision(e.target.value);
              setDistrict("");
            }}
            className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm"
          >
            <option value="" disabled>Select division</option>
            {DIVISION_NAMES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-label-caps text-label-caps text-secondary block mb-1">DISTRICT</label>
          <select
            name="district"
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!division}
            className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="" disabled>{division ? "Select district" : "Pick division first"}</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-secondary block mb-1">AREA / THANA (optional)</label>
        <input
          name="area"
          className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm"
          placeholder="e.g. Dhanmondi, Mirpur-10"
        />
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-secondary block mb-1">DETAILED ADDRESS</label>
        <textarea
          name="address"
          required
          rows={2}
          className="w-full border border-secondary bg-surface-container-low px-3 py-2 text-sm"
          placeholder="House / Road / Block"
        />
      </div>

      <div>
        <label className="font-label-caps text-label-caps text-secondary block mb-2">PAYMENT METHOD</label>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map((opt, i) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 border border-secondary bg-surface-container-low px-3 py-2 text-sm cursor-pointer hover:border-primary"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                defaultChecked={i === 0}
                className="accent-primary"
              />
              <span>{opt.label}</span>
              {opt.value !== "COD" && (
                <span className="ml-auto text-[10px] text-secondary uppercase tracking-widest">Placeholder</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Live order summary */}
      <div className="border-t border-secondary pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">Subtotal</span>
          <span className="font-spec-data">{formatTk(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">
            Shipping{district ? ` (${shippingLabel(district)})` : ""}
          </span>
          <span className="font-spec-data">
            {shippingCents === null ? "—" : formatTk(shippingCents)}
          </span>
        </div>
        <div className="flex justify-between text-lg pt-2 border-t border-secondary/40">
          <span>Total</span>
          <span className="font-headline-sm">{formatTk(totalCents)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!phoneValid || !district}
        className="mt-2 w-full py-3 bg-on-background text-on-primary font-label-caps text-label-caps hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        PLACE ORDER
      </button>
      <p className="text-[10px] text-center text-secondary">
        Online payments are placeholders. No real charge is made.
      </p>
    </form>
  );
}
