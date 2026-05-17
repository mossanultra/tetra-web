"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type CalendarWidgetProps = {
  value: Value;
  onChange: (value: Value) => void;
};

export const CalendarWidget = ({ value, onChange }: CalendarWidgetProps) => {
  return (
    <div className="calendar-container">
      <Calendar
        onChange={onChange}
        value={value}
        selectRange={true}
        locale="ja-JP"
        className="w-full border-none"
      />
      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .react-calendar__navigation {
          display: flex;
          margin-bottom: 1rem;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__navigation button:disabled {
          background-color: transparent;
          color: #9ca3af;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          max-width: 100%;
          padding: 0.75rem 0.5rem;
          background: none;
          text-align: center;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
        }
        .react-calendar__tile--now {
          background-color: #E8F5F2;
          color: #1A6B5A;
          font-weight: 600;
        }
        .react-calendar__tile--now:enabled:hover,
        .react-calendar__tile--now:enabled:focus {
          background-color: #d1eee7;
        }
        .react-calendar__tile--active {
          background-color: #1A6B5A !important;
          color: white !important;
          font-weight: 600;
        }
        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background-color: #135245 !important;
          color: white !important;
          font-weight: 600;
        }
        .react-calendar__tile--rangeStart,
        .react-calendar__tile--rangeEnd {
          background-color: #1A6B5A !important;
          color: white !important;
        }
        .react-calendar__tile--range {
          background-color: #E8F5F2 !important;
          color: #1A6B5A !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #d1d5db;
        }
        .react-calendar__year-view .react-calendar__tile,
        .react-calendar__decade-view .react-calendar__tile,
        .react-calendar__century-view .react-calendar__tile {
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};
