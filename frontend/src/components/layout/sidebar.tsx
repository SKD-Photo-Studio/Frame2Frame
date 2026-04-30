"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCircle,
  Settings,
  BookOpen,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api, TenantResponse } from "@/lib/api";
import GlobalSearch from "./global-search";
import { createClient } from "@/lib/supabase.client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Team", href: "/team", icon: UserCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const [t, u] = await Promise.all([
        api.tenant.get(), 
        api.me(undefined) // The undefined here is for the token, we'll let fetchAPI handle it
      ]);
      setTenant(t);
      setUser(u);
    } catch (err) {
      console.error("Sidebar fetch error:", err);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // If on login page or no session, hide sidebar
  if (pathname === "/login" || !session) return null;

  return (
    <>
      {/* ---- Mobile top header ---- */}
      <header 
        className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b backdrop-blur-md px-4 md:hidden"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--card), transparent 20%)', 
          borderColor: 'var(--border)' 
        }}
      >
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1 px-4 max-w-[240px]">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {tenant?.logo_url && (
            <img src={tenant.logo_url} alt="Logo" className="h-6 w-auto rounded" />
          )}
          <Link href="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-600">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-bold">
              Frame2Frame
            </span>
          </Link>
        </div>
      </header>

      {/* ---- Mobile slide-over drawer ---- */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar-bg/95 backdrop-blur-xl shadow-2xl md:hidden">
            <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Frame2Frame</h1>
                <p className="text-[10px] text-sidebar-text">v2.3.4</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-active text-sidebar-text-active"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-2">
                <ThemeToggle />
              </div>
            </nav>
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-active text-xs font-semibold text-white uppercase">
                  {user?.full_name?.charAt(0) || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.full_name && user.full_name !== "" ? user.full_name : (user?.email?.split('@')[0] || "Admin")}
                  </p>
                  <p className="truncate text-xs text-sidebar-text">
                    {user?.email || "admin@skd.com"}
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-sidebar-text hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ---- Mobile bottom tab bar ---- */}
      <nav 
        className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--card), transparent 10%)', 
          borderColor: 'var(--border)' 
        }}
      >
        <div className="flex h-16 items-stretch">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-brand-600"
                      : "opacity-40 active:opacity-100"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
                />
                {item.name}
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-10 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* ---- Desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-sidebar-bg/95 backdrop-blur-xl border-r border-white/5 md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          {tenant?.logo_url && (
            <img src={tenant.logo_url} alt="Logo" className="h-8 w-auto rounded" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xs font-bold text-white uppercase tracking-wider">
              {tenant?.company_name || "SKD Photo Studio"}
            </h1>
            <Link href="/" className="mt-0.5 flex items-center gap-2 group transition-opacity hover:opacity-80">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-brand-600">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-bold text-sidebar-text-active">Frame2Frame</span>
            </Link>
          </div>
        </div>

        <div className="px-3 pt-4 pb-1">
          <GlobalSearch variant="dark" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-active text-sidebar-text-active"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sm font-semibold text-white uppercase">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.full_name && user.full_name !== "" ? user.full_name : (user?.email?.split('@')[0] || "Admin")}</p>
              <p className="truncate text-[10px] text-sidebar-text">
                {user?.email || "admin@skd.com"}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-sidebar-text hover:text-white transition-colors rounded-lg hover:bg-sidebar-hover"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
