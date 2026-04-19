import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";

export type DatePickerProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DatePickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-1 relative items-center mb-2 px-10",
        caption_label: cn("text-sm font-medium", props.captionLayout === "dropdown" && "hidden"),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 w-full",
        weekday: "text-gray-500 text-center font-normal text-[0.8rem] h-9 flex items-center justify-center",
        week: "grid grid-cols-7 w-full mt-1",
        day: cn(
          "h-9 w-full p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-all inline-flex items-center justify-center cursor-pointer"
        ),
        dropdown: "rounded-md border border-gray-200 bg-white px-1.5 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer hover:bg-gray-50",
        nav: "flex items-center",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md border border-gray-200 transition-opacity absolute left-1 top-1"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md border border-gray-200 transition-opacity absolute right-1 top-1"
        ),
        day_selected:
          "bg-brand-600 text-white hover:bg-brand-600 hover:text-white focus:bg-brand-600 focus:text-white font-medium",
        today: "bg-gray-100 text-gray-900 font-bold",
        outside:
          "text-gray-400 opacity-20 aria-selected:bg-brand-50/50 aria-selected:text-gray-400 aria-selected:opacity-30",
        disabled: "text-gray-400 opacity-20",
        range_middle:
          "aria-selected:bg-brand-50 aria-selected:text-brand-900",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
