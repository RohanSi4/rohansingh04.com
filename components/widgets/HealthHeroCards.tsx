"use client";

import { useState } from "react";
import type { HealthSummary } from "@/lib/types";
import { formatDate } from "@/lib/dates";

interface Props {
  data: HealthSummary;
}

const DESTINATIONS = [
  { city: "richmond, va", miles: 70 },
  { city: "washington, dc", miles: 120 },
  { city: "baltimore, md", miles: 145 },
  { city: "philadelphia, pa", miles: 240 },
  { city: "pittsburgh, pa", miles: 290 },
  { city: "new york city", miles: 380 },
  { city: "boston, ma", miles: 610 },
  { city: "chicago, il", miles: 770 },
];

function getCityEquivalent(miles: number): string | null {
  let best: (typeof DESTINATIONS)[number] | null = null;
  for (const d of DESTINATIONS) {
    if (miles >= d.miles) best = d;
  }
  return best ? `cville → ${best.city}` : null;
}

function WeekBars({ bars }: { bars: number[] }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-widest text-muted mb-2">by week</p>
      <div className="flex items-end gap-1.5 h-12">
        {bars.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted font-mono leading-none">
              {m > 0 ? `${m}m` : ""}
            </span>
            <div
              className="w-full bg-accent/70 rounded-sm"
              style={{ height: `${Math.max((m / max) * 28, m > 0 ? 2 : 0)}px` }}
            />
            <span className="text-[9px] text-muted leading-none">w{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type CardId = "month" | "year" | "streak" | "alltime";

interface StatCardProps {
  id: CardId;
  open: CardId | null;
  onToggle: (id: CardId) => void;
  label: string;
  value: string;
  sub: string;
  children: React.ReactNode;
}

function StatCard({ id, open, onToggle, label, value, sub, children }: StatCardProps) {
  const isOpen = open === id;
  return (
    <div
      className={`border rounded-lg p-4 bg-surface cursor-pointer transition-colors ${
        isOpen ? "border-accent/60" : "border-border hover:border-accent/30"
      }`}
      onClick={() => onToggle(id)}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
        <span className="text-muted text-sm leading-none select-none">
          {isOpen ? "−" : "+"}
        </span>
      </div>
      <p className="text-3xl font-mono font-medium text-fg leading-none">{value}</p>
      <p className="text-xs text-muted mt-1.5">{sub}</p>
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

export default function HealthHeroCards({ data }: Props) {
  const [open, setOpen] = useState<CardId | null>(null);
  const onToggle = (id: CardId) => setOpen((prev) => (prev === id ? null : id));
  const { thisMonth, thisYear, allTime, streak } = data;
  const cityLabel = getCityEquivalent(thisYear.distanceMi);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      <StatCard
        id="month"
        open={open}
        onToggle={onToggle}
        label="this month"
        value={String(thisMonth.activeDays)}
        sub="active days"
      >
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">distance</span>
            <span className="font-mono text-fg">{thisMonth.distanceMi.toFixed(1)} mi</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">calories</span>
            <span className="font-mono text-fg">{thisMonth.activeCalories.toLocaleString()} cal</span>
          </div>
          <WeekBars bars={thisMonth.weeklyMinutes} />
        </div>
      </StatCard>

      <StatCard
        id="year"
        open={open}
        onToggle={onToggle}
        label="this year"
        value={`${thisYear.distanceMi.toFixed(1)} mi`}
        sub={`${thisYear.activeDays} active days`}
      >
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">avg per active day</span>
            <span className="font-mono text-fg">
              {thisYear.activeDays > 0
                ? (thisYear.distanceMi / thisYear.activeDays).toFixed(1)
                : "0"}{" "}
              mi
            </span>
          </div>
          {cityLabel && (
            <p className="text-muted pt-0.5">
              {cityLabel} on foot
            </p>
          )}
        </div>
      </StatCard>

      <StatCard
        id="streak"
        open={open}
        onToggle={onToggle}
        label="streak"
        value={`${streak.currentDays}d`}
        sub="days in a row"
      >
        <div className="text-xs">
          <div className="flex justify-between">
            <span className="text-muted">personal best</span>
            <span className="font-mono text-fg">{streak.bestDays} days</span>
          </div>
        </div>
      </StatCard>

      <StatCard
        id="alltime"
        open={open}
        onToggle={onToggle}
        label="all time"
        value={String(allTime.activeDays)}
        sub="active days"
      >
        <div className="text-xs">
          <div className="flex justify-between">
            <span className="text-muted">tracking since</span>
            <span className="font-mono text-fg">{formatDate(allTime.sinceDate.slice(0, 7))}</span>
          </div>
        </div>
      </StatCard>
    </div>
  );
}
