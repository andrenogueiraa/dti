"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { CalendarHeader } from "./calendar-header";
import { TeamRow } from "./team-row";
import { TeamColumn } from "./team-column";
import { MonitoringLegend } from "./legend";
import { MONITORING_CALENDAR_CONSTANTS } from "./constants";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { TeamMonitoringData } from "./server-actions";

interface MonitoringCalendarProps {
  teams: TeamMonitoringData[];
  calendarStartDate: Date;
  calendarEndDate: Date;
}

const { PIXELS_PER_DAY, ROW_HEIGHT } = MONITORING_CALENDAR_CONSTANTS;

export function MonitoringCalendar({
  teams,
  calendarStartDate,
  calendarEndDate,
}: MonitoringCalendarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate calendar width
  const calendarWidth = useMemo(() => {
    const diffTime = calendarEndDate.getTime() - calendarStartDate.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return totalDays * PIXELS_PER_DAY;
  }, [calendarStartDate, calendarEndDate]);

  // Calculate position for a date (absolute from timeline start)
  const getDatePosition = useCallback(
    (date: Date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      const calendarStartTime = calendarStartDate.getTime();
      const dateTime = normalizedDate.getTime();
      const diffDays = Math.floor(
        (dateTime - calendarStartTime) / (1000 * 60 * 60 * 24)
      );
      return Math.max(0, diffDays * PIXELS_PER_DAY);
    },
    [calendarStartDate]
  );

  // Calculate "Today" position
  const todayPosition = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getDatePosition(today);
  }, [getDatePosition]);

  // Check if "Today" is visible in viewport
  const [isTodayVisible, setIsTodayVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const checkTodayVisibility = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const viewportWidth = scrollContainer.clientWidth;
      const isVisible =
        todayPosition >= scrollLeft &&
        todayPosition <= scrollLeft + viewportWidth;
      setIsTodayVisible(isVisible);
    };

    checkTodayVisibility();
    scrollContainer.addEventListener("scroll", checkTodayVisibility);
    return () =>
      scrollContainer.removeEventListener("scroll", checkTodayVisibility);
  }, [todayPosition]);

  // Auto-scroll to center on "Today" on mount
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Center on today
    const scrollToToday = () => {
      const viewportWidth = scrollContainer.clientWidth;
      scrollContainer.scrollLeft = todayPosition - viewportWidth / 2;
    };

    // Use multiple timeouts to ensure scroll completes
    const timeout1 = setTimeout(scrollToToday, 50);
    const timeout2 = setTimeout(scrollToToday, 200);
    const rafId = requestAnimationFrame(scrollToToday);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      cancelAnimationFrame(rafId);
    };
  }, [todayPosition]);

  // Convert vertical mouse wheel scrolling to horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical scrolling (deltaY)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Prevent default vertical scrolling
        e.preventDefault();
        // Convert vertical scroll to horizontal scroll
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma equipe encontrada para monitoramento.
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Frozen Team Column - fixed position */}
      <div className="flex-shrink-0 border-r bg-background/75">
        <div className="sticky top-0 z-20 bg-background border-b">
          <div
            className="text-sm tracking-wide p-4"
            style={{ height: `${ROW_HEIGHT}px` }}
          >
            <span className="text-muted-foreground">Acompanhamento</span>
            <br />
            <span className="font-medium text-primary uppercase">
              Sprint Reviews
            </span>
          </div>
        </div>
        <div className="bg-card">
          {teams.map((team) => (
            <div key={team.id} style={{ height: `${ROW_HEIGHT}px` }}>
              <TeamColumn team={team} height={ROW_HEIGHT} />
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Calendar Area - only horizontal scroll */}
      <div className="flex-1 relative min-w-0">
        {/* Legend */}
        <MonitoringLegend />

        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-x-auto overflow-y-hidden relative"
        >
          {/* "Today" Vertical Marker */}
          {todayPosition >= 0 && todayPosition <= calendarWidth && (
            <div
              className="absolute top-0 bottom-0 border-l-2 border-primary z-30 pointer-events-none"
              style={{ left: `${todayPosition}px` }}
            >
              <div className="absolute -top-0 -left-6 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm font-semibold whitespace-nowrap">
                HOJE
              </div>
            </div>
          )}

          <div
            className="inline-block"
            style={{ minWidth: `${calendarWidth}px` }}
          >
            {/* Calendar Header */}
            <div
              className="sticky top-0 z-10 bg-background border-b"
              style={{ height: `${ROW_HEIGHT}px` }}
            >
              <CalendarHeader
                startDate={calendarStartDate}
                endDate={calendarEndDate}
                pixelsPerDay={PIXELS_PER_DAY}
              />
            </div>

            {/* Calendar Rows */}
            <div className="bg-muted">
              {teams.map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  startDate={calendarStartDate}
                  getDatePosition={getDatePosition}
                  pixelsPerDay={PIXELS_PER_DAY}
                  rowHeight={ROW_HEIGHT}
                />
              ))}
            </div>
          </div>
        </div>

        {/* "Back to Today" Floating Button */}
        {!isTodayVisible && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 z-50 rounded-full shadow-xl h-12 w-12"
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  left:
                    todayPosition - scrollContainerRef.current.clientWidth / 2,
                  behavior: "smooth",
                });
              }
            }}
            title="Voltar para hoje"
          >
            <ArrowRightIcon className="h-10 w-10" />
          </Button>
        )}
      </div>
    </div>
  );
}

