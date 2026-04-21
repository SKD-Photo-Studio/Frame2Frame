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
import { createClient } from "@/lib/supabase.server";
import { formatCurrency, getEventTypeColor, cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const data: DashboardResponse = await api.dashboard(token);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Overview of your business at a glance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link href="/clients" className="block"><StatCard label="Total Clients" value={data.total_clients.toString()} icon={<Users className="h-5 w-5" />} color="blue" /></Link>
        <Link href="/events" className="block"><StatCard label="Total Events" value={data.total_events.toString()} icon={<Calendar className="h-5 w-5" />} color="purple" /></Link>
        <Link href="/team" className="block"><StatCard label="Team Size" value={data.total_team_members.toString()} icon={<UserCircle className="h-5 w-5" />} color="teal" /></Link>
        <StatCard label="Total Package offered" value={formatCurrency(data.total_revenue)} icon={<IndianRupee className="h-5 w-5" />} color="emerald" />
        <StatCard label="Collected from Clients" value={formatCurrency(data.total_collected)} icon={<TrendingUp className="h-5 w-5" />} color="green" />
        <StatCard label="Client Balance" value={formatCurrency(data.total_pending)} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard label="Total Expenses" value={formatCurrency(data.total_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="red" />
        <StatCard label="Total Artist Expenses" value={formatCurrency(data.total_artist_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="orange" />
        <StatCard label="Total Output Expenses" value={formatCurrency(data.total_output_expenses)} icon={<TrendingDown className="h-5 w-5" />} color="orange" />
        <StatCard label="Paid to Team" value={formatCurrency(data.paid_to_team)} icon={<IndianRupee className="h-5 w-5" />} color="green" />
        <StatCard label="Team Balance" value={formatCurrency(data.yet_to_pay_team)} icon={<Clock className="h-5 w-5" />} color="red" />
        <StatCard label="Total Savings" value={formatCurrency(data.total_savings)} icon={<TrendingUp className="h-5 w-5" />} color="brand" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Dates */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="section-title">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.upcoming_dates.map((item, idx) => (
              <Link
                key={idx}
                href={`/events/${item.event_id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:px-6 sm:py-3.5"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:h-12 sm:w-12">
                  <span className="text-base font-bold leading-none sm:text-lg">
                    {new Date(item.date).getDate()}
                  </span>
                  <span className="text-[9px] font-medium uppercase sm:text-[10px]">
                    {new Date(item.date).toLocaleString("en-US", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.client_name}&apos;s {item.event_type}
                  </p>
                  <p className="truncate text-xs text-gray-500">{item.display_id}</p>
                </div>
              </Link>
            ))}
            {data.upcoming_dates.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No upcoming dates</div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="section-title">Recent Events</h2>
            <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recent_events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:px-6 sm:py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {event.client_name} &mdash; {event.event_type}
                  </p>
                  <p className="truncate text-xs text-gray-500">{event.venue}, {event.city}</p>
                </div>
                <div className="hidden grid-cols-3 gap-4 text-right sm:grid md:gap-8">
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Package</p>
                    <p className="text-xs font-semibold text-gray-900">{formatCurrency(event.package_value)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Expenses</p>
                    <p className="text-xs font-semibold text-red-600">{formatCurrency(event.total_expenses)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-gray-400">Savings</p>
                    <p className={cn("text-xs font-semibold", event.savings >= 0 ? "text-brand-600" : "text-red-600")}>
                      {formatCurrency(event.savings)}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right sm:hidden">
                  <p className="text-xs font-semibold text-gray-900">{formatCurrency(event.package_value)}</p>
                  <p className={cn("text-[10px] font-medium", event.savings >= 0 ? "text-brand-600" : "text-red-600")}>
                    S: {formatCurrency(event.savings)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
