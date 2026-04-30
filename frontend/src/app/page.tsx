import {
  Users,
  Calendar,
  UserCircle,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { api, DashboardResponse } from "@/lib/api";
import { formatCurrency, getEventTypeColor, cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import BulkOperationsWrapper from "@/components/ui/bulk-operations-wrapper";

export default async function DashboardPage() {
  const data: DashboardResponse = await api.dashboard();

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Overview of your business at a glance
          </p>
        </div>
        <BulkOperationsWrapper />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link href="/clients?from=dashboard" className="block"><StatCard label="Total Clients" value={data.total_clients.toString()} icon={<Users className="h-5 w-5" />} color="blue" /></Link>
        <Link href="/events?from=dashboard" className="block"><StatCard label="Total Events" value={data.total_events.toString()} icon={<Calendar className="h-5 w-5" />} color="purple" /></Link>
        <Link href="/team?from=dashboard" className="block"><StatCard label="Team Size" value={data.total_team_members.toString()} icon={<UserCircle className="h-5 w-5" />} color="teal" /></Link>
        <StatCard label="Total Package Offered" value={formatCurrency(data.total_revenue)} icon={<IndianRupee className="h-5 w-5" />} color="emerald" />
        <StatCard label="Collected from Clients" value={formatCurrency(data.total_collected)} icon={<TrendingUp className="h-5 w-5" />} color="green" />
        <StatCard label="Client Balance" value={formatCurrency(data.client_balance)} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard label="Total Expenses" value={formatCurrency(data.total_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="red" />
        <StatCard label="Total Artist Expenses" value={formatCurrency(data.total_artist_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="orange" />
        <StatCard label="Total Output Expenses" value={formatCurrency(data.total_output_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="orange" />
        <StatCard label="Paid to Team" value={formatCurrency(data.paid_to_team)} icon={<IndianRupee className="h-5 w-5" />} color="green" />
        <StatCard label="Team Balance" value={formatCurrency(data.team_balance)} icon={<Clock className="h-5 w-5" />} color="red" />
        <StatCard label="Total Savings" value={formatCurrency(data.total_savings)} icon={<TrendingUp className="h-5 w-5" />} color="brand" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div className="stat-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
            <h2 className="section-title">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.upcoming_events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}?from=dashboard`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-4 sm:px-6 sm:py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {event.client_name} | {event.event_type}
                  </p>
                  <p className="truncate text-xs opacity-60 mt-0.5">{event.date_string}</p>
                </div>
                <div className="hidden sm:grid grid-cols-3 gap-4 text-left w-64 md:w-80 flex-shrink-0 md:gap-8">
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Package</p>
                    <p className="text-xs font-semibold text-blue-600">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Expenses</p>
                    <p className="text-xs font-semibold text-red-600">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Savings</p>
                    <p className={cn("text-xs font-semibold", event.savings >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(event.savings)}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right sm:hidden">
                  <p className="text-xs font-semibold text-blue-600">{formatCurrency(event.package_value)}</p>
                  <p className={cn("text-[10px] font-medium", event.savings >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatCurrency(event.savings)}
                  </p>
                </div>
              </Link>
            ))}
            {data.upcoming_events.length === 0 && (
              <div className="px-6 py-8 text-center text-sm opacity-40">No upcoming events</div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="stat-card !p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="section-title">Recent Events</h2>
            <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.recent_events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}?from=dashboard`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-4 sm:px-6 sm:py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {event.client_name} | {event.event_type}
                  </p>
                  <p className="truncate text-xs opacity-60 mt-0.5">{event.date_string}</p>
                </div>
                <div className="hidden sm:grid grid-cols-3 gap-4 text-left w-64 md:w-80 flex-shrink-0 md:gap-8">
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Package</p>
                    <p className="text-xs font-semibold text-blue-600">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Expenses</p>
                    <p className="text-xs font-semibold text-red-600">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase opacity-50">Savings</p>
                    <p className={cn("text-xs font-semibold", event.savings >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(event.savings)}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right sm:hidden">
                  <p className="text-xs font-semibold text-blue-600">{formatCurrency(event.package_value)}</p>
                  <p className={cn("text-[10px] font-medium", event.savings >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatCurrency(event.savings)}
                  </p>
                </div>
              </Link>
            ))}
            {data.recent_events.length === 0 && (
              <div className="px-6 py-8 text-center text-sm opacity-40">No recent events</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
