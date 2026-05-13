import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { adminOrdersApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import AdminNav from "../../components/admin/AdminNav";
import type {
  AdminOrder,
  OrderStats,
  AdminOrderFilters,
  OrderStatus,
} from "../../types";
import s from "./AdminOrders.module.css";

// ── Status Config ─────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; class: string; dot: string }
> = {
  pending_payment: { label: "Pending", class: s.statusPending, dot: "⏳" },
  confirmed: { label: "Confirmed", class: s.statusConfirmed, dot: "✓" },
  processing: { label: "Processing", class: s.statusProcessing, dot: "⚙" },
  shipped: { label: "Shipped", class: s.statusShipped, dot: "🚚" },
  delivered: { label: "Delivered", class: s.statusDelivered, dot: "✅" },
  cancelled: { label: "Cancelled", class: s.statusCancelled, dot: "✕" },
  refunded: { label: "Refunded", class: s.statusRefunded, dot: "↩" },
};

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending_payment", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

// ── Helpers ───────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

function getCustomerName(order: AdminOrder): string {
  // Try customer profile first, then shipping address
  if (order.customer?.full_name) return order.customer.full_name;
  const addr = order.shipping_addr || order.shipping_address;
  if (addr?.full_name) return addr.full_name;
  return "Guest";
}

function getCustomerEmail(order: AdminOrder): string {
  if (order.customer?.email) return order.customer.email;
  return "—";
}

// ── Component ─────────────────────────────────────────────
export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Admin gate
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Data
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AdminOrderFilters>({
    status: "all",
    search: "",
    page: 1,
    limit: 15,
    sort: "created_at",
    order: "desc",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");

  // ── Admin Check ────────────────────────────────
  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      const admin = data?.is_admin === true;
      setIsAdmin(admin);
      if (!admin) setLoading(false);
    } catch {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  // ── Load Data ──────────────────────────────────
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminOrdersApi.getAll(filters);
      setOrders(result.orders);
      setTotalPages(result.totalPages);
      setTotalOrders(result.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminOrdersApi.getStats();
      setStats(data);
    } catch {
      // Stats are non-critical
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadStats();
    }
  }, [isAdmin, loadOrders, loadStats]);

  // ── Search debounce ────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Handlers ───────────────────────────────────
  const handleStatusTab = (status: string) => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((f) => ({ ...f, page }));
  };

  const handleRowClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // ── Loading / Denied ───────────────────────────
  if (isAdmin === null) {
    return (
      <div className={s.loadingPage}>
        <p className={s.loadingText}>Checking permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={s.deniedPage}>
        <p className={s.deniedTitle}>Access Denied</p>
        <p className={s.deniedText}>
          {user ? "Admin privileges required." : "Please sign in first."}
        </p>
        <button onClick={() => navigate("/")} className="btn btn-outline">
          ← Back to Store
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────
  return (
    <div className={s.page}>
      <AdminNav />

      <div className={s.content}>
        {/* ── Stats Grid ── */}
        {stats && (
          <div className={s.statsGrid}>
            <div className={s.statCard}>
              <div className={s.statIconGold}>
                <DollarSign size={18} />
              </div>
              <p className={s.statLabel}>Total Revenue</p>
              <p className={s.statValue}>{formatCurrency(stats.totalRevenue)}</p>
              <div
                className={
                  stats.revenueTrend > 0
                    ? s.statTrendUp
                    : stats.revenueTrend < 0
                      ? s.statTrendDown
                      : s.statTrendNeutral
                }
              >
                {stats.revenueTrend > 0 ? (
                  <ArrowUpRight size={12} />
                ) : stats.revenueTrend < 0 ? (
                  <ArrowDownRight size={12} />
                ) : (
                  <Minus size={12} />
                )}
                {Math.abs(stats.revenueTrend)}% vs last month
              </div>
            </div>

            <div className={s.statCard}>
              <div className={s.statIconGreen}>
                <ShoppingBag size={18} />
              </div>
              <p className={s.statLabel}>Total Orders</p>
              <p className={s.statValue}>{stats.totalOrders}</p>
              <div className={s.statTrendNeutral}>
                {stats.todayOrders} today
              </div>
            </div>

            <div className={s.statCard}>
              <div className={s.statIconBlue}>
                <TrendingUp size={18} />
              </div>
              <p className={s.statLabel}>Avg Order Value</p>
              <p className={s.statValue}>{formatCurrency(stats.avgOrderValue)}</p>
              <div className={s.statTrendNeutral}>
                {formatCurrency(stats.thisMonthRevenue)} this month
              </div>
            </div>

            <div className={s.statCard}>
              <div className={s.statIconPurple}>
                <Clock size={18} />
              </div>
              <p className={s.statLabel}>Pending Orders</p>
              <p className={s.statValue}>{stats.pendingOrders}</p>
              <div className={s.statTrendNeutral}>Needs attention</div>
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className={s.toolbar}>
          <div className={s.toolbarLeft}>
            <div className={s.searchBox}>
              <Search size={14} className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search by order ID or customer…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={s.searchInput}
              />
            </div>
          </div>
        </div>

        {/* ── Status Tabs ── */}
        <div className={s.statusTabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusTab(tab.key)}
              className={
                filters.status === tab.key ? s.statusTabActive : s.statusTab
              }
            >
              {tab.label}
              {stats?.statusCounts && tab.key !== "all" && (
                <span className={s.tabCount}>
                  {stats.statusCounts[tab.key] || 0}
                </span>
              )}
              {tab.key === "all" && stats && (
                <span className={s.tabCount}>{stats.totalOrders}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && <div className={s.errorBox}>{error}</div>}

        {/* ── Table ── */}
        <div className={s.tableWrap}>
          {loading ? (
            <div className={s.emptyWrap}>
              <p className={s.loadingText}>Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={s.emptyWrap}>
              <Package size={48} className={s.emptyIcon} />
              <p className={s.emptyTitle}>No orders found</p>
              <p className={s.emptyText}>
                {filters.search
                  ? "Try a different search term."
                  : filters.status !== "all"
                    ? "No orders with this status."
                    : "Orders will appear here once customers make purchases."}
              </p>
            </div>
          ) : (
            <>
              <div className={s.tableScroll}>
                <table className={s.table}>
                  <thead>
                    <tr className={s.thead}>
                      {[
                        "Order ID",
                        "Date",
                        "Customer",
                        "Items",
                        "Total",
                        "Status",
                        "",
                      ].map((h) => (
                        <th key={h} className={s.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const items = order.order_items || [];
                      const firstImage = items[0]?.products?.images?.[0];
                      const sc =
                        STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;

                      return (
                        <tr
                          key={order.id}
                          className={s.tr}
                          onClick={() => handleRowClick(order.id)}
                        >
                          <td className={s.td}>
                            <span className={s.orderId}>
                              #{order.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className={s.td}>
                            <p className={s.orderDate}>
                              {formatDate(order.created_at)}
                            </p>
                            <p className={s.orderDateSub}>
                              {formatTime(order.created_at)}
                            </p>
                          </td>
                          <td className={s.td}>
                            <p className={s.customerName}>
                              {getCustomerName(order)}
                            </p>
                            <p className={s.customerEmail}>
                              {getCustomerEmail(order)}
                            </p>
                          </td>
                          <td className={s.td}>
                            <div className={s.itemsInfo}>
                              {firstImage && (
                                <img
                                  src={firstImage}
                                  alt=""
                                  className={s.itemThumb}
                                />
                              )}
                              <span className={s.itemCount}>
                                {items.length} item{items.length !== 1 && "s"}
                              </span>
                            </div>
                          </td>
                          <td className={s.td}>
                            <span className={s.orderTotal}>
                              {formatCurrency(order.total)}
                            </span>
                          </td>
                          <td className={s.td}>
                            <span className={sc.class}>
                              {sc.dot} {sc.label}
                            </span>
                          </td>
                          <td className={s.td}>
                            <button
                              className={s.viewBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(order.id);
                              }}
                            >
                              <Eye size={11} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className={s.pagination}>
                <span className={s.pageInfo}>
                  Showing {(filters.page! - 1) * filters.limit! + 1}–
                  {Math.min(filters.page! * filters.limit!, totalOrders)} of{" "}
                  {totalOrders}
                </span>
                <div className={s.pageButtons}>
                  <button
                    className={s.pageBtn}
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (filters.page! <= 3) {
                      page = i + 1;
                    } else if (filters.page! >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = filters.page! - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        className={
                          page === filters.page ? s.pageBtnActive : s.pageBtn
                        }
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    className={s.pageBtn}
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === totalPages}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
