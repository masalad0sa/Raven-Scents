import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Upload, X, Package } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  adminApi,
  AdminProductPayload,
  AdminVariantPayload,
} from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

// ── Types ─────────────────────────────────────────────────────
interface VariantForm {
  size: string;
  unit: string;
  price: string;
  stock: string;
  sku: string;
}

interface AdminForm {
  name: string;
  brand: string;
  slug: string;
  short_desc: string;
  description: string;
  price: string;
  compare_price: string;
  images: string[];
  category: string;
  gender: string;
  scent_family: string;
  concentration: string;
  sillage: string;
  longevity: string;
  tags: string;
  notes_top: string;
  notes_middle: string;
  notes_base: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  variants: VariantForm[];
}

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES = [
  "eau-de-parfum",
  "eau-de-toilette",
  "parfum",
  "cologne",
  "body-mist",
];
const GENDERS = ["masculine", "feminine", "unisex"];
const SILLAGES = ["light", "moderate", "heavy"];

const EMPTY_FORM: AdminForm = {
  name: "",
  brand: "RAVEN",
  slug: "",
  short_desc: "",
  description: "",
  price: "",
  compare_price: "",
  images: [],
  category: "eau-de-parfum",
  gender: "unisex",
  scent_family: "",
  concentration: "EDP",
  sillage: "moderate",
  longevity: "",
  tags: "",
  notes_top: "",
  notes_middle: "",
  notes_base: "",
  is_featured: false,
  is_bestseller: false,
  is_new: true,
  variants: [{ size: "50", unit: "ml", price: "", stock: "0", sku: "" }],
};

// ── Style helpers ─────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%",
  background: "#1a1a1a",
  border: "1.5px solid #2a2a2a",
  borderRadius: 4,
  padding: "0.7rem 0.9rem",
  color: "#e8e4dc",
  fontFamily: "var(--font-sans)",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.58rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#9a9590",
  marginBottom: "0.4rem",
  display: "block",
};

const sec: React.CSSProperties = {
  background: "#111",
  border: "1px solid rgba(212,175,55,0.1)",
  borderRadius: 8,
  padding: "1.5rem",
  marginBottom: "1.25rem",
};

const secTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.62rem",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "#d4af37",
  marginBottom: "1.25rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid rgba(212,175,55,0.15)",
};

// ── Helpers ───────────────────────────────────────────────────
const toSlug = (name: string) =>
  "raven-" +
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const csv = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// ── Component ─────────────────────────────────────────────────
export default function AdminProducts() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Admin gate
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Data
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [form, setForm] = useState<AdminForm>(EMPTY_FORM);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const tempIdRef = useRef(crypto.randomUUID());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Effects ────────────────────────────────────────────────
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
      if (admin) loadProducts();
      else setLoading(false);
    } catch {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getAllProducts();
      setProducts(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Form helpers ───────────────────────────────────────────
  const setField = <K extends keyof AdminForm>(key: K, value: AdminForm[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !editingId) {
        next.slug = toSlug(value as string);
      }
      return next;
    });
  };

  const setVariantField = (
    idx: number,
    key: keyof VariantForm,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, [key]: value } : v,
      ),
    }));
  };

  // ── Actions ────────────────────────────────────────────────
  const openNew = () => {
    tempIdRef.current = crypto.randomUUID();
    setForm(EMPTY_FORM);
    setPendingFiles([]);
    setPendingPreviews([]);
    setEditingId(null);
    setError(null);
    setView("form");
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "RAVEN",
      slug: product.slug || "",
      short_desc: product.shortDescription || "",
      description: product.description || "",
      price: String(product.price || ""),
      compare_price: product.compareAtPrice
        ? String(product.compareAtPrice)
        : "",
      images: product.images || [],
      category: product.category || "eau-de-parfum",
      gender: product.gender || "unisex",
      scent_family: product.scentFamily || "",
      concentration: product.concentration || "",
      sillage: product.sillage || "moderate",
      longevity: product.longevity || "",
      tags: (product.tags || []).join(", "),
      notes_top: (product.notes?.top || []).join(", "),
      notes_middle: (product.notes?.middle || []).join(", "),
      notes_base: (product.notes?.base || []).join(", "),
      is_featured: product.isFeatured || false,
      is_bestseller: product.isBestseller || false,
      is_new: product.isNew || false,
      variants: (product.variants || []).map((v: any) => ({
        size: String(v.size || ""),
        unit: v.unit || "ml",
        price: String(v.price || ""),
        stock: String(v.stock ?? "0"),
        sku: v.sku || "",
      })),
    });
    setPendingFiles([]);
    setPendingPreviews([]);
    setError(null);
    setView("form");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setPendingFiles((p) => [...p, ...files]);
    setPendingPreviews((p) => [...p, ...previews]);
    e.target.value = "";
  };

  const removePending = (i: number) => {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles((p) => p.filter((_, idx) => idx !== i));
    setPendingPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeUploaded = (i: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== i),
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.price || isNaN(Number(form.price)))
      return setError("A valid price is required.");
    if (form.variants.length === 0)
      return setError("At least one variant is required.");
    setSaving(true);
    try {
      // Upload pending images
      let uploadedUrls: string[] = [];
      if (pendingFiles.length > 0) {
        setUploadingImages(true);
        const folder = `products/${editingId || tempIdRef.current}`;
        uploadedUrls = await Promise.all(
          pendingFiles.map((f) => adminApi.uploadImage(f, folder)),
        );
        setUploadingImages(false);
      }

      const payload: AdminProductPayload = {
        name: form.name.trim(),
        brand: form.brand.trim() || "RAVEN",
        slug: form.slug.trim(),
        short_desc: form.short_desc.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        images: [...form.images, ...uploadedUrls],
        category: form.category,
        gender: form.gender,
        scent_family: form.scent_family.trim(),
        concentration: form.concentration.trim(),
        sillage: form.sillage,
        longevity: form.longevity.trim(),
        tags: csv(form.tags),
        notes_top: csv(form.notes_top),
        notes_middle: csv(form.notes_middle),
        notes_base: csv(form.notes_base),
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new: form.is_new,
      };

      const variants: AdminVariantPayload[] = form.variants
        .filter((v) => v.size && v.price)
        .map((v, i) => ({
          size: Number(v.size),
          unit: v.unit || "ml",
          price: Number(v.price),
          stock: Number(v.stock || 0),
          sku: v.sku || `${payload.slug}-${v.size}${v.unit || "ml"}-${i}`,
        }));

      if (editingId) {
        await adminApi.updateProduct(editingId, payload, variants);
      } else {
        await adminApi.createProduct(payload, variants);
      }

      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
      setPendingFiles([]);
      setPendingPreviews([]);
      await loadProducts();
      setView("list");
    } catch (e: any) {
      setError(e.message || "Failed to save product.");
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading / Access denied ────────────────────────────────
  if (isAdmin === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            color: "#9a9590",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
          }}
        >
          Checking permissions…
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            color: "#e74c3c",
          }}
        >
          Access Denied
        </p>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            color: "#9a9590",
            fontSize: "0.9rem",
          }}
        >
          {user ? "You don't have admin privileges." : "Please sign in first."}
        </p>
        <button onClick={() => navigate("/")} className="btn btn-outline">
          ← Back to Store
        </button>
      </div>
    );
  }

  // ── Derived ────────────────────────────────────────────────
  const featuredCount = products.filter((p) => p.isFeatured).length;
  const outOfStockCount = products.filter((p) =>
    (p.variants || []).every((v: any) => v.stock <= 0),
  ).length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d" }}>
      {/* Admin Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(13,13,13,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 2rem",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            color: "#d4af37",
            letterSpacing: "0.05em",
          }}
        >
          RAVEN{" "}
          <span
            style={{
              color: "#9a9590",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              fontFamily: "var(--font-display)",
            }}
          >
            ADMIN
          </span>
        </span>
        <span
          style={{
            color: "rgba(212,175,55,0.3)",
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem",
          }}
        >
          /
        </span>
        <span
          style={{
            color: "#e8e4dc",
            fontFamily: "var(--font-display)",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Products
        </span>
        <div style={{ flex: 1 }} />
        {view === "form" && (
          <button
            onClick={() => setView("list")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9a9590",
              fontFamily: "var(--font-display)",
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            ← Back to List
          </button>
        )}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 4,
            cursor: "pointer",
            color: "#9a9590",
            padding: "0.35rem 0.85rem",
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
          }}
        >
          View Store
        </button>
      </div>

      <div style={{ paddingTop: 60 }}>
        {/* ════════════════ LIST VIEW ════════════════ */}
        {view === "list" && (
          <div style={{ padding: "2rem" }}>
            {/* Title + Add */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.75rem",
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.9rem",
                    fontWeight: 400,
                    color: "#e8e4dc",
                    margin: 0,
                  }}
                >
                  Products
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "#9a9590",
                    margin: "0.3rem 0 0",
                  }}
                >
                  {products.length} total &middot; {featuredCount} featured
                  &middot; {outOfStockCount} out of stock
                </p>
              </div>
              <button
                onClick={openNew}
                className="btn btn-gold"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                }}
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(231,76,60,0.1)",
                  border: "1px solid rgba(231,76,60,0.3)",
                  borderRadius: 6,
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  color: "#e74c3c",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <p
                style={{
                  color: "#9a9590",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                }}
              >
                Loading products…
              </p>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 0",
                  color: "#9a9590",
                }}
              >
                <Package
                  size={48}
                  style={{ margin: "0 auto 1rem", opacity: 0.25 }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.2rem",
                    color: "#e8e4dc",
                  }}
                >
                  No products yet
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                  }}
                >
                  Add your first product to get started.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(212,175,55,0.15)",
                      }}
                    >
                      {[
                        "Image",
                        "Product",
                        "Price",
                        "Variants / Stock",
                        "Flags",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.58rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "#9a9590",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const oos = (product.variants || []).every(
                        (v: any) => v.stock <= 0,
                      );
                      return (
                        <tr
                          key={product.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.025)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "transparent")
                          }
                        >
                          {/* Thumbnail */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                style={{
                                  width: 52,
                                  height: 52,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid rgba(212,175,55,0.15)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 52,
                                  height: 52,
                                  background: "#1a1a1a",
                                  borderRadius: 4,
                                  border: "1px solid #2a2a2a",
                                }}
                              />
                            )}
                          </td>
                          {/* Name */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <p
                              style={{
                                fontFamily: "var(--font-serif)",
                                color: "#e8e4dc",
                                fontSize: "0.95rem",
                                margin: 0,
                              }}
                            >
                              {product.name}
                            </p>
                            <p
                              style={{
                                fontFamily: "var(--font-sans)",
                                color: "#9a9590",
                                fontSize: "0.72rem",
                                margin: "0.15rem 0 0",
                              }}
                            >
                              {product.brand} &middot; {product.category}
                            </p>
                          </td>
                          {/* Price */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                color: "#d4af37",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                              }}
                            >
                              ₹{product.price?.toLocaleString("en-IN")}
                            </span>
                            {product.compareAtPrice && (
                              <p
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  color: "#9a9590",
                                  fontSize: "0.72rem",
                                  textDecoration: "line-through",
                                  margin: "0.1rem 0 0",
                                }}
                              >
                                ₹
                                {product.compareAtPrice?.toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            )}
                          </td>
                          {/* Variants */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                color: oos ? "#e74c3c" : "#2ecc71",
                                fontSize: "0.8rem",
                              }}
                            >
                              {product.variants?.length || 0} size
                              {product.variants?.length !== 1 ? "s" : ""}
                              {oos && " · out of stock"}
                            </span>
                          </td>
                          {/* Flags */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.3rem",
                                flexWrap: "wrap",
                              }}
                            >
                              {product.isFeatured && (
                                <span
                                  style={{
                                    background: "rgba(212,175,55,0.15)",
                                    color: "#d4af37",
                                    borderRadius: 3,
                                    padding: "0.15rem 0.45rem",
                                    fontSize: "0.57rem",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  FEATURED
                                </span>
                              )}
                              {product.isBestseller && (
                                <span
                                  style={{
                                    background: "rgba(212,175,55,0.08)",
                                    color: "#d4af37",
                                    borderRadius: 3,
                                    padding: "0.15rem 0.45rem",
                                    fontSize: "0.57rem",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  BESTSELLER
                                </span>
                              )}
                              {product.isNew && (
                                <span
                                  style={{
                                    background: "rgba(46,204,113,0.1)",
                                    color: "#2ecc71",
                                    borderRadius: 3,
                                    padding: "0.15rem 0.45rem",
                                    fontSize: "0.57rem",
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => openEdit(product)}
                                style={{
                                  background: "rgba(212,175,55,0.1)",
                                  border: "1px solid rgba(212,175,55,0.2)",
                                  borderRadius: 4,
                                  padding: "0.4rem 0.7rem",
                                  cursor: "pointer",
                                  color: "#d4af37",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  fontFamily: "var(--font-display)",
                                  fontSize: "0.58rem",
                                  letterSpacing: "0.08em",
                                }}
                              >
                                <Edit2 size={11} /> Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(product.id, product.name)
                                }
                                disabled={deletingId === product.id}
                                style={{
                                  background: "rgba(231,76,60,0.08)",
                                  border: "1px solid rgba(231,76,60,0.2)",
                                  borderRadius: 4,
                                  padding: "0.4rem 0.7rem",
                                  cursor:
                                    deletingId === product.id
                                      ? "not-allowed"
                                      : "pointer",
                                  color: "#e74c3c",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  fontFamily: "var(--font-display)",
                                  fontSize: "0.58rem",
                                  letterSpacing: "0.08em",
                                  opacity: deletingId === product.id ? 0.5 : 1,
                                }}
                              >
                                <Trash2 size={11} />{" "}
                                {deletingId === product.id ? "…" : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ FORM VIEW ════════════════ */}
        {view === "form" && (
          <div style={{ maxWidth: 880, margin: "0 auto", padding: "2rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.9rem",
                fontWeight: 400,
                color: "#e8e4dc",
                marginBottom: "1.75rem",
              }}
            >
              {editingId ? `Edit: ${form.name || "Product"}` : "New Product"}
            </h1>

            {error && (
              <div
                style={{
                  background: "rgba(231,76,60,0.1)",
                  border: "1px solid rgba(231,76,60,0.3)",
                  borderRadius: 6,
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "#e74c3c",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                {error}
              </div>
            )}

            {/* ── Basic Info ── */}
            <div style={sec}>
              <p style={secTitle}>Basic Info</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={lbl}>Product Name *</label>
                  <input
                    style={inp}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. Noir Sauvage"
                  />
                </div>
                <div>
                  <label style={lbl}>Brand</label>
                  <input
                    style={inp}
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                    placeholder="e.g. RAVEN"
                  />
                </div>
                <div>
                  <label style={lbl}>Slug (URL) *</label>
                  <input
                    style={inp}
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    placeholder="raven-noir-sauvage"
                  />
                </div>
                <div>
                  <label style={lbl}>Short Description</label>
                  <input
                    style={inp}
                    value={form.short_desc}
                    onChange={(e) => setField("short_desc", e.target.value)}
                    placeholder="One-line tagline for cards"
                  />
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label style={lbl}>Full Description</label>
                <textarea
                  style={{ ...inp, minHeight: 110, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Full product description shown on product detail page…"
                />
              </div>
            </div>

            {/* ── Pricing ── */}
            <div style={sec}>
              <p style={secTitle}>Pricing</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={lbl}>Price (₹) *</label>
                  <input
                    style={inp}
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="9500"
                  />
                </div>
                <div>
                  <label style={lbl}>
                    Compare-At Price (₹) — strike-through
                  </label>
                  <input
                    style={inp}
                    type="number"
                    value={form.compare_price}
                    onChange={(e) => setField("compare_price", e.target.value)}
                    placeholder="Leave blank if no discount"
                  />
                </div>
              </div>
            </div>

            {/* ── Images ── */}
            <div style={sec}>
              <p style={secTitle}>Product Images</p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                {/* Already-uploaded images */}
                {form.images.map((url, i) => (
                  <div
                    key={url + i}
                    style={{ position: "relative", width: 96, height: 96 }}
                  >
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid rgba(212,175,55,0.25)",
                      }}
                    />
                    {i === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          background: "rgba(212,175,55,0.85)",
                          borderRadius: 3,
                          padding: "0.1rem 0.4rem",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.5rem",
                          letterSpacing: "0.08em",
                          color: "#0d0d0d",
                        }}
                      >
                        MAIN
                      </div>
                    )}
                    <button
                      onClick={() => removeUploaded(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        background: "rgba(0,0,0,0.75)",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Pending (not yet uploaded) previews */}
                {pendingPreviews.map((url, i) => (
                  <div
                    key={url}
                    style={{ position: "relative", width: 96, height: 96 }}
                  >
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "2px dashed rgba(212,175,55,0.45)",
                        opacity: 0.75,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "rgba(0,0,0,0.75)",
                        borderRadius: 3,
                        padding: "0.1rem 0.4rem",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.5rem",
                        letterSpacing: "0.08em",
                        color: "#d4af37",
                      }}
                    >
                      PENDING
                    </div>
                    <button
                      onClick={() => removePending(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        background: "rgba(0,0,0,0.75)",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 96,
                    height: 96,
                    background: "#1a1a1a",
                    border: "2px dashed rgba(212,175,55,0.2)",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    color: "#9a9590",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(212,175,55,0.55)";
                    (e.currentTarget as HTMLElement).style.color = "#d4af37";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(212,175,55,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "#9a9590";
                  }}
                >
                  <Upload size={18} />
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.5rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Add Image
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "#555",
                }}
              >
                Images are uploaded to Supabase Storage on save. The first image
                is used as the primary display image and thumbnail.
              </p>
            </div>

            {/* ── Classification ── */}
            <div style={sec}>
              <p style={secTitle}>Classification</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={lbl}>Category</label>
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Gender</label>
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={form.gender}
                    onChange={(e) => setField("gender", e.target.value)}
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Sillage</label>
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={form.sillage}
                    onChange={(e) => setField("sillage", e.target.value)}
                  >
                    {SILLAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Scent Family</label>
                  <input
                    style={inp}
                    value={form.scent_family}
                    onChange={(e) => setField("scent_family", e.target.value)}
                    placeholder="e.g. Woody Aromatic"
                  />
                </div>
                <div>
                  <label style={lbl}>Concentration</label>
                  <input
                    style={inp}
                    value={form.concentration}
                    onChange={(e) => setField("concentration", e.target.value)}
                    placeholder="e.g. EDP, EDT, Parfum"
                  />
                </div>
                <div>
                  <label style={lbl}>Longevity</label>
                  <input
                    style={inp}
                    value={form.longevity}
                    onChange={(e) => setField("longevity", e.target.value)}
                    placeholder="e.g. 8–12 hours"
                  />
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label style={lbl}>Tags (comma-separated)</label>
                <input
                  style={inp}
                  value={form.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="fresh, woody, aromatic, bergamot"
                />
              </div>
            </div>

            {/* ── Fragrance Notes ── */}
            <div style={sec}>
              <p style={secTitle}>Fragrance Notes</p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={lbl}>Top Notes (comma-separated)</label>
                  <input
                    style={inp}
                    value={form.notes_top}
                    onChange={(e) => setField("notes_top", e.target.value)}
                    placeholder="Bergamot, Pepper, Lavender"
                  />
                </div>
                <div>
                  <label style={lbl}>
                    Heart / Middle Notes (comma-separated)
                  </label>
                  <input
                    style={inp}
                    value={form.notes_middle}
                    onChange={(e) => setField("notes_middle", e.target.value)}
                    placeholder="Sichuan Pepper, Geranium, Jasmine"
                  />
                </div>
                <div>
                  <label style={lbl}>Base Notes (comma-separated)</label>
                  <input
                    style={inp}
                    value={form.notes_base}
                    onChange={(e) => setField("notes_base", e.target.value)}
                    placeholder="Ambroxan, Cedar, Labdanum"
                  />
                </div>
              </div>
            </div>

            {/* ── Variants ── */}
            <div style={sec}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid rgba(212,175,55,0.15)",
                }}
              >
                <p
                  style={{
                    ...secTitle,
                    margin: 0,
                    padding: 0,
                    border: 0,
                  }}
                >
                  Variants (Sizes)
                </p>
                <button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      variants: [
                        ...prev.variants,
                        {
                          size: "",
                          unit: "ml",
                          price: "",
                          stock: "0",
                          sku: "",
                        },
                      ],
                    }))
                  }
                  style={{
                    background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 4,
                    padding: "0.35rem 0.75rem",
                    cursor: "pointer",
                    color: "#d4af37",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  <Plus size={11} /> Add Size
                </button>
              </div>

              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 70px 110px 90px 1fr 36px",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                {["Size", "Unit", "Price (₹)", "Stock", "SKU", ""].map((h) => (
                  <span key={h} style={lbl}>
                    {h}
                  </span>
                ))}
              </div>

              {form.variants.map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 70px 110px 90px 1fr 36px",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    style={inp}
                    type="number"
                    value={v.size}
                    onChange={(e) => setVariantField(i, "size", e.target.value)}
                    placeholder="50"
                  />
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={v.unit}
                    onChange={(e) => setVariantField(i, "unit", e.target.value)}
                  >
                    <option value="ml">ml</option>
                    <option value="oz">oz</option>
                    <option value="g">g</option>
                  </select>
                  <input
                    style={inp}
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      setVariantField(i, "price", e.target.value)
                    }
                    placeholder="9500"
                  />
                  <input
                    style={inp}
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      setVariantField(i, "stock", e.target.value)
                    }
                    placeholder="0"
                  />
                  <input
                    style={inp}
                    value={v.sku}
                    onChange={(e) => setVariantField(i, "sku", e.target.value)}
                    placeholder="auto-generated if blank"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        variants: prev.variants.filter((_, idx) => idx !== i),
                      }))
                    }
                    disabled={form.variants.length === 1}
                    style={{
                      width: 34,
                      height: 38,
                      background: "rgba(231,76,60,0.08)",
                      border: "1px solid rgba(231,76,60,0.15)",
                      borderRadius: 4,
                      cursor:
                        form.variants.length === 1 ? "not-allowed" : "pointer",
                      color: "#e74c3c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: form.variants.length === 1 ? 0.3 : 1,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Feature Flags ── */}
            <div style={sec}>
              <p style={secTitle}>Feature Flags</p>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {(
                  [
                    {
                      key: "is_featured" as const,
                      label: "Featured on homepage",
                    },
                    {
                      key: "is_bestseller" as const,
                      label: "Mark as Bestseller",
                    },
                    { key: "is_new" as const, label: "Mark as New" },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                      style={{
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                        accentColor: "#d4af37",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.87rem",
                        color: "#e8e4dc",
                      }}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Save / Cancel ── */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
                paddingBottom: "3rem",
              }}
            >
              <button
                onClick={() => setView("list")}
                className="btn btn-outline"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-gold"
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: 160,
                  justifyContent: "center",
                }}
              >
                {saving
                  ? uploadingImages
                    ? "Uploading images…"
                    : "Saving…"
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
