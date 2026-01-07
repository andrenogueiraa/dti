"use client";

import { useMemo } from "react";

interface CalendarHeaderProps {
  startDate: Date;
  endDate: Date;
  pixelsPerDay: number;
}

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function CalendarHeader({
  startDate,
  endDate,
  pixelsPerDay,
}: CalendarHeaderProps) {
  const { months, yearLabels } = useMemo(() => {
    const monthData: Array<{
      name: string;
      year: number;
      startDay: number;
      days: number;
      width: number;
      left: number;
    }> = [];

    const yearLabelData: Array<{
      year: number;
      left: number;
    }> = [];

    // Normalize dates to start of day for consistent calculations
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const overallStartTime = normalizedStart.getTime();

    // Start from the first day of the month that contains startDate
    let currentDate = new Date(normalizedStart);
    currentDate.setDate(1); // Start from first day of month

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Check if this is the start of a new year
      if (month === 0) {
        const yearStart = new Date(year, 0, 1);
        yearStart.setHours(0, 0, 0, 0); // Normalize to start of day
        const daysFromOverallStart = Math.floor(
          (yearStart.getTime() - overallStartTime) / (1000 * 60 * 60 * 24)
        );
        yearLabelData.push({
          year,
          left: daysFromOverallStart * pixelsPerDay,
        });
      }

      const monthStart = new Date(year, month, 1);
      monthStart.setHours(0, 0, 0, 0); // Normalize to start of day
      const monthEnd = new Date(year, month + 1, 0);
      const daysInMonth = monthEnd.getDate();

      const daysFromOverallStart = Math.floor(
        (monthStart.getTime() - overallStartTime) / (1000 * 60 * 60 * 24)
      );

      monthData.push({
        name: MONTH_NAMES[month],
        year,
        startDay: daysFromOverallStart,
        days: daysInMonth,
        width: daysInMonth * pixelsPerDay,
        left: daysFromOverallStart * pixelsPerDay,
      });

      // Move to next month
      currentDate = new Date(year, month + 1, 1);
    }

    return { months: monthData, yearLabels: yearLabelData };
  }, [startDate, endDate, pixelsPerDay]);

  // Calculate total days for day indicators
  const totalDays = useMemo(() => {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Year Labels - Sticky at top */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="relative h-8">
          {yearLabels.map((label) => (
            <div
              key={label.year}
              className="absolute top-0 bg-primary/10 border-r-2 border-r-primary px-2 py-1 h-full flex items-center"
              style={{
                left: `${label.left}px`,
              }}
            >
              <div className="text-xs font-bold text-primary">{label.year}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Month Headers */}
      <div className="flex-1 relative">
        {months.map((month, index) => (
          <div
            key={`${month.year}-${month.name}-${index}`}
            className="absolute border-r flex flex-col h-full items-center justify-start pt-2 uppercase text-xs font-medium"
            style={{
              left: `${month.left}px`,
              width: `${month.width}px`,
            }}
          >
            {month.name}
          </div>
        ))}
      </div>

      {/* Day Indicators */}
      <div className="absolute bottom-0 left-0 h-6 flex">
        {Array.from({ length: totalDays }, (_, i) => {
          // Calculate date by adding days to startDate using milliseconds to avoid date arithmetic issues
          const currentDate = new Date(
            startDate.getTime() + i * 24 * 60 * 60 * 1000
          );

          // Normalize to start of day
          currentDate.setHours(0, 0, 0, 0);

          // Skip if date is beyond endDate
          const endDateNormalized = new Date(endDate);
          endDateNormalized.setHours(23, 59, 59, 999);
          if (currentDate > endDateNormalized) return null;

          const day = currentDate.getDate();
          const month = currentDate.getMonth();
          const isFirstOfMonth = day === 1;
          const isWeekend =
            currentDate.getDay() === 0 || currentDate.getDay() === 6;

          return (
            <div
              key={i}
              className={`border-r border-r-border/50 ${
                isWeekend ? "bg-muted/20" : ""
              } ${isFirstOfMonth ? "border-l-2 border-l-primary" : ""}`}
              style={{ width: `${pixelsPerDay}px` }}
              title={`${day}/${month + 1}/${currentDate.getFullYear()}`}
            >
              {isFirstOfMonth && (
                <div className="text-[8px] text-muted-foreground px-0.5">
                  {day}
                </div>
              )}
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
}

