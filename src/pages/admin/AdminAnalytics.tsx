import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Percent,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { adminOrdersApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import AdminNav from "../../components/admin/AdminNav";
import s from "./AdminAnalytics.module.css";
import { motion, AnimatePresence } from "framer-motion";

// Helpers
function formatCurrency(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Admin gate
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Analytics Data
  const [data, setData] = useState<any>(null);
  const [hoveredTimelineIdx, setHoveredTimelineIdx] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "orders">("revenue");

  // Theme support
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("raven-theme") === "light";
  });

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("theme-light");
      localStorage.setItem("raven-theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      localStorage.setItem("raven-theme", "dark");
    }
  }, [isLight]);

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
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      const admin = profile?.is_admin === true;
      setIsAdmin(admin);
      if (admin) {
        loadAnalyticsData();
      } else {
        setLoading(false);
      }
    } catch {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await adminOrdersApi.getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null || (loading && !data)) {
    return (
      <div className={s.loadingPage}>
        <div className={s.spinner}></div>
        <p className={s.loadingText}>Loading Analytics Dashboard…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={s.deniedPage}>
        <p className={s.deniedTitle}>Access Denied</p>
        <p className={s.deniedText}>Admin privileges required.</p>
        <button onClick={() => navigate("/")} className="btn btn-outline">
          ← Back to Store
        </button>
      </div>
    );
  }

  const {
    summary = {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalDiscount: 0,
      pendingOrders: 0,
    },
    timeline = [],
    topProducts = [],
    scentFamilies = [],
    lowStockAlerts = [],
  } = data || {};

  // ── Render SVG Line Chart logic ───────────────────────────
  const chartWidth = 900;
  const chartHeight = 320;
  const paddingX = 60;
  const paddingY = 40;

  const getChartCoordinates = () => {
    if (timeline.length === 0) return [];
    
    // Choose active metric
    const values = timeline.map((d: any) => activeChartTab === "revenue" ? d.revenue : d.orders);
    const maxVal = Math.max(...values, activeChartTab === "revenue" ? 5000 : 5);
    const minVal = 0;
    const valRange = maxVal - minVal;

    const points = timeline.map((d: any, idx: number) => {
      const val = activeChartTab === "revenue" ? d.revenue : d.orders;
      // Linear scaling mapping
      const x = paddingX + (idx / (timeline.length - 1)) * (chartWidth - 2 * paddingX);
      const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - 2 * paddingY);
      return { x, y, val, date: d.date, rawData: d };
    });

    return points;
  };

  const chartPoints = getChartCoordinates();
  
  // Construct path definitions for SVG line & gradient area
  let linePathD = "";
  let areaPathD = "";
  if (chartPoints.length > 0) {
    linePathD = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const p0 = chartPoints[i - 1];
      const p = chartPoints[i];
      const cpX1 = p0.x + (p.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p.x - p0.x) / 3;
      const cpY2 = p.y;
      linePathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }

    // Gradient Area goes to baseline
    const bottomY = chartHeight - paddingY;
    areaPathD = `${linePathD} L ${chartPoints[chartPoints.length - 1].x} ${bottomY} L ${chartPoints[0].x} ${bottomY} Z`;
  }

  // Scent family chart logic
  const maxScentFamilyQty = scentFamilies.length > 0 ? Math.max(...scentFamilies.map((sf: any) => sf.qty)) : 1;

  return (
    <div className={s.page}>
      <AdminNav />

      <div className={s.content}>
        {/* Header Title */}
        <div className={s.headerSection}>
          <div>
            <h1 className={s.pageTitle}>Analytics & Insights</h1>
            <p className={s.pageSubtitle}>Monitor performance, sales timeline, and inventory health.</p>
          </div>
          <button
            onClick={() => loadAnalyticsData()}
            className={s.refreshBtn}
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Summary Grid (3 + 2 layout) */}
        <div className={s.statsRowPrimary}>
          <div className={s.statCard}>
            <div className={`${s.statIcon} ${s.iconGold}`}>
              <DollarSign size={20} />
            </div>
            <div>
              <p className={s.statLabel}>Total Revenue</p>
              <h3 className={s.statValue}>{formatCurrency(summary.totalRevenue)}</h3>
              <p className={s.statSubText}>Lifetime shop earnings</p>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={`${s.statIcon} ${s.iconGold}`}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className={s.statLabel}>Total Orders</p>
              <h3 className={s.statValue}>{summary.totalOrders}</h3>
              <p className={s.statSubText}>Orders processed</p>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={`${s.statIcon} ${s.iconGold}`}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className={s.statLabel}>Avg Order Value</p>
              <h3 className={s.statValue}>{formatCurrency(summary.avgOrderValue)}</h3>
              <p className={s.statSubText}>Revenue per transaction</p>
            </div>
          </div>
        </div>

        <div className={s.statsRowSecondary}>
          <div className={s.statCard}>
            <div className={`${s.statIcon} ${s.iconGold}`}>
              <Percent size={20} />
            </div>
            <div>
              <p className={s.statLabel}>Discounts Applied</p>
              <h3 className={s.statValue}>{formatCurrency(summary.totalDiscount)}</h3>
              <p className={s.statSubText}>Total promo values</p>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={`${s.statIcon} ${s.iconGold}`}>
              <Clock size={20} />
            </div>
            <div>
              <p className={s.statLabel}>Pending Orders</p>
              <h3 className={s.statValue}>{summary.pendingOrders}</h3>
              <p className={s.statSubText}>Awaiting action</p>
            </div>
          </div>
        </div>

        {/* Sales Trend Chart section */}
        <div className={s.chartCard}>
          <div className={s.chartHeader}>
            <div>
              <h3 className={s.chartTitle}>Sales performance</h3>
              <p className={s.chartSubtitle}>Interactive 30-day timeline analysis</p>
            </div>
            <div className={s.chartTabs}>
              <button
                onClick={() => { setActiveChartTab("revenue"); setHoveredTimelineIdx(null); }}
                className={`${s.chartTab} ${activeChartTab === "revenue" ? s.chartTabActive : ""}`}
              >
                Revenue
              </button>
              <button
                onClick={() => { setActiveChartTab("orders"); setHoveredTimelineIdx(null); }}
                className={`${s.chartTab} ${activeChartTab === "orders" ? s.chartTabActive : ""}`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className={s.chartContainer}>
            {timeline.length === 0 ? (
              <div className={s.noData}>No timeline data available for the last 30 days.</div>
            ) : (
              <div className={s.svgWrapper} style={{ position: "relative" }}>
                <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                    const y = paddingY + r * (chartHeight - 2 * paddingY);
                    const values = timeline.map((d: any) => activeChartTab === "revenue" ? d.revenue : d.orders);
                    const maxVal = Math.max(...values, activeChartTab === "revenue" ? 5000 : 5);
                    const labelVal = Math.round(maxVal - r * maxVal);

                    return (
                      <g key={i}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          className={s.gridLine}
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 4}
                          textAnchor="end"
                          className={s.gridLabel}
                        >
                          {activeChartTab === "revenue" ? formatCurrency(labelVal) : labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical grid lines & date labels */}
                  {chartPoints.map((pt: any, i: number) => {
                    // Draw vertical label every 4 points to avoid overlap
                    const showLabel = i % 4 === 0 || i === chartPoints.length - 1;
                    return (
                      <g key={i}>
                        {showLabel && (
                          <>
                            <line
                              x1={pt.x}
                              y1={paddingY}
                              x2={pt.x}
                              y2={chartHeight - paddingY}
                              className={s.gridLineVertical}
                            />
                            <text
                              x={pt.x}
                              y={chartHeight - paddingY + 20}
                              textAnchor="middle"
                              className={s.gridLabel}
                            >
                              {pt.date}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  <path d={areaPathD} fill="url(#chartGradient)" />

                  {/* Bezier curve path */}
                  <path d={linePathD} fill="none" className={s.chartLine} strokeWidth={3} />

                  {/* Hover interaction points */}
                  {chartPoints.map((pt: any, i: number) => (
                    <g key={i}>
                      {/* Invisible larger hover target circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={12}
                        fill="transparent"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredTimelineIdx(i)}
                        onMouseLeave={() => setHoveredTimelineIdx(null)}
                      />

                      {/* Display circle marker on hover */}
                      {(hoveredTimelineIdx === i) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={6}
                          fill="var(--color-gold)"
                          stroke="var(--color-surface)"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  ))}
                </svg>

                {/* Floating tooltip block */}
                {hoveredTimelineIdx !== null && chartPoints[hoveredTimelineIdx] && (
                  <div
                    className={s.chartTooltip}
                    style={{
                      left: chartPoints[hoveredTimelineIdx].x,
                      top: chartPoints[hoveredTimelineIdx].y - 80,
                    }}
                  >
                    <p className={s.tooltipDate}>{chartPoints[hoveredTimelineIdx].date}</p>
                    <p className={s.tooltipValue}>
                      {activeChartTab === "revenue" ? (
                        <>
                          Revenue: <strong>{formatCurrency(chartPoints[hoveredTimelineIdx].val)}</strong>
                        </>
                      ) : (
                        <>
                          Orders: <strong>{chartPoints[hoveredTimelineIdx].val}</strong>
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scent family breakdown and Low Stock inventory alerts */}
        <div className={s.analyticsSplit}>
          {/* Scent Family bar chart */}
          <div className={s.chartSplitCard}>
            <h3 className={s.cardTitle}>Scent Family Popularity</h3>
            <p className={s.cardSubtitle}>Distribution of units sold by scent profile</p>

            <div className={s.scentFamilyContainer}>
              {scentFamilies.length === 0 ? (
                <div className={s.noData}>No products sold yet to analyze scent families.</div>
              ) : (
                scentFamilies.map((sf: any, i: number) => {
                  const pct = Math.max(8, Math.round((sf.qty / maxScentFamilyQty) * 100));
                  return (
                    <div key={i} className={s.barRow}>
                      <div className={s.barLabelContainer}>
                        <span className={s.barFamilyName}>{sf.family}</span>
                        <span className={s.barQuantity}>{sf.qty} units ({formatCurrency(sf.revenue)})</span>
                      </div>
                      <div className={s.barTrack}>
                        <div
                          className={s.barFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className={s.chartSplitCard}>
            <div className={s.alertHeader}>
              <h3 className={s.cardTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={18} className={s.alertIcon} />
                Low Stock Alerts
              </h3>
              <span className={s.alertBadgeCount}>{lowStockAlerts.length} items</span>
            </div>
            <p className={s.cardSubtitle}>Variants with 5 or fewer items remaining</p>

            <div className={s.alertList}>
              {lowStockAlerts.length === 0 ? (
                <div className={s.noAlerts}>
                  <p>✔ All items are healthy.</p>
                </div>
              ) : (
                lowStockAlerts.map((item: any, i: number) => (
                  <div key={i} className={s.alertItem}>
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className={s.alertProductImg} />
                    ) : (
                      <div className={s.alertProductFallback}>
                        <ShoppingBag size={14} />
                      </div>
                    )}
                    <div className={s.alertInfo}>
                      <p className={s.alertName}>{item.productName}</p>
                      <p className={s.alertSku}>SKU: {item.sku || "N/A"} • Size: {item.size}{item.unit}</p>
                    </div>
                    <div className={`${s.alertStockContainer} ${item.stock === 0 ? s.stockZero : s.stockLow}`}>
                      <span>{item.stock} left</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Products List Card */}
        <div className={s.productsAnalyticsCard}>
          <div className={s.productsCardHeader}>
            <div>
              <h3 className={s.cardTitle} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Award size={18} style={{ color: "var(--color-gold)" }} />
                Top Performing Perfumes
              </h3>
              <p className={s.cardSubtitle}>Best selling fragrances sorted by units sold</p>
            </div>
          </div>

          <div className={s.tableWrapper}>
            {topProducts.length === 0 ? (
              <div className={s.noData}>No sales transactions completed yet.</div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td>
                        <div className={s.productCell}>
                          <div className={s.rankBadge}>{idx + 1}</div>
                          {p.image ? (
                            <img src={p.image} alt={p.name} className={s.prodImg} />
                          ) : (
                            <div className={s.prodFallback}>
                              <ShoppingBag size={14} />
                            </div>
                          )}
                          <span className={s.prodName}>{p.name}</span>
                        </div>
                      </td>
                      <td className={s.boldCol}>{p.qty}</td>
                      <td className={s.goldCol}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Floating golden theme toggle button */}
      <motion.button
        onClick={() => setIsLight((prev) => !prev)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={s.themeToggle}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLight ? "light" : "dark"}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
