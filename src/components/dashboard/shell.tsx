import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, FileText, MessageSquare, Package,
  BarChart3, Settings, Search, Command, ChevronDown, LifeBuoy,
  Sparkles, Inbox, Trophy, ShieldCheck, Users,
} from "lucide-react";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { AdminSearch } from "@/components/admin/admin-search";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReactNode } from "react";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string };

const buyerNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/post", label: "Post Requirement", icon: PlusCircle },
  { to: "/app/requests", label: "My Requests", icon: FileText, badge: "6" },
  { to: "/app/quotes", label: "Received Quotes", icon: Inbox, badge: "12" },
  { to: "/app/compare", label: "Compare Quotes", icon: BarChart3 },
  { to: "/app/messages", label: "Messages", icon: MessageSquare, badge: "3" },
  { to: "/app/orders", label: "Orders", icon: Package },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const sellerNav: NavItem[] = [
  { to: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/leads", label: "Available Leads", icon: Sparkles, badge: "24" },
  { to: "/seller/quotations", label: "My Quotations", icon: FileText },
  { to: "/seller/deals", label: "Won Deals", icon: Trophy },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/orders", label: "Orders", icon: Package },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { to: "/admin/fraud-alerts", label: "Fraud Alerts", icon: LifeBuoy },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function DashboardShell({
  role = "buyer", breadcrumb, title, actions, children,
}: {
  role?: "buyer" | "seller" | "admin";
  breadcrumb?: string[];
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const nav = role === "seller" ? sellerNav : role === "admin" ? adminNav : buyerNav;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="fixed inset-0 -z-10 gradient-mesh opacity-40" />
      <div className="flex min-h-screen w-full">
        <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl">
          <div className="p-5">
            <Logo />
          </div>
          <div className="px-3 pb-2">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground px-2 pb-2">
              {role === "buyer" ? "Buyer Workspace" : role === "seller" ? "Seller Workspace" : "Admin"}
            </div>
            <nav className="flex flex-col gap-0.5">
              {nav.map((item, i) => {
                const active = pathname === item.to || (item.to !== "/app" && item.to !== "/seller" && item.to !== "/admin" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={`${item.to}-${i}`}
                    to={item.to}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      active
                        ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground ring-1 ring-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-3">
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/15 to-accent/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Copilot
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask anything about your procurement pipeline.
              </p>
              <Button size="sm" className="mt-3 w-full h-8 text-xs">Open Copilot</Button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 md:px-8 h-16">
              {role === "admin" ? <AdminSearch /> : <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search requests, suppliers, quotes…" className="pl-9 pr-16 h-9 bg-muted/40 border-border/60" />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </div>}
              <NotificationCenter audience={role === "seller" ? "seller" : role === "admin" ? "admin" : "buyer"} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted/60 transition">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">AR</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm">Aarav R.</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/app/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/seller">Switch to Seller</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/app">Switch to Buyer</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/admin">Admin Panel</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/">Sign out</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {(breadcrumb || title || actions) && (
              <div className="flex items-center justify-between gap-4 px-4 md:px-8 pb-5 pt-2">
                <div>
                  {breadcrumb && (
                    <div className="text-xs text-muted-foreground mb-1">
                      {breadcrumb.map((b, i) => (
                        <span key={i}>
                          {b}
                          {i < breadcrumb.length - 1 && <span className="mx-1.5 opacity-50">/</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            )}
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 px-4 md:px-8 pb-16 pt-2"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}