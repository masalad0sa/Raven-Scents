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
import type { Product, Variant } from "../../types";
import s from "./AdminProducts.module.css";

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products");
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

  const openEdit = (product: Product) => {
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
      variants: (product.variants || []).map((v: Variant) => ({
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save product.");
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
    } catch (e: unknown) {
      alert(
        "Delete failed: " + (e instanceof Error ? e.message : "Unknown error"),
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading / Access denied ────────────────────────────────
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
    (p.variants || []).every((v: Variant) => v.stock <= 0),
  ).length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className={s.page}>
      {/* Admin Header */}
      <div className={s.adminBar}>
        <span className={s.adminLogo}>
          RAVEN <span className={s.adminBadge}>ADMIN</span>
        </span>
        <span className={s.adminSep}>/</span>
        <span className={s.adminPageTitle}>Products</span>
        <div className={s.adminSpacer} />
        {view === "form" && (
          <button onClick={() => setView("list")} className={s.backBtn}>
            ← Back to List
          </button>
        )}
        <button onClick={() => navigate("/")} className={s.storeBtn}>
          View Store
        </button>
      </div>

      <div style={{ paddingTop: 60 }}>
        {/* ════════════════ LIST VIEW ════════════════ */}
        {view === "list" && (
          <div className={s.listWrap}>
            {/* Title + Add */}
            <div className={s.listHeader}>
              <div>
                <h1 className={s.listTitle}>Products</h1>
                <p className={s.listSubtext}>
                  {products.length} total &middot; {featuredCount} featured
                  &middot; {outOfStockCount} out of stock
                </p>
              </div>
              <button onClick={openNew} className={`btn btn-gold ${s.addBtn}`}>
                <Plus size={14} /> Add Product
              </button>
            </div>

            {error && <div className={s.errorBox}>{error}</div>}

            {loading ? (
              <p className={s.loadingText}>Loading products…</p>
            ) : products.length === 0 ? (
              <div className={s.emptyWrap}>
                <Package size={48} className={s.emptyIcon} />
                <p className={s.emptyTitle}>No products yet</p>
                <p className={s.emptyText}>
                  Add your first product to get started.
                </p>
              </div>
            ) : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr className={s.thead}>
                      {[
                        "Image",
                        "Product",
                        "Price",
                        "Variants / Stock",
                        "Flags",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className={s.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const oos = (product.variants || []).every(
                        (v: Variant) => v.stock <= 0,
                      );
                      return (
                        <tr key={product.id} className={s.tr}>
                          {/* Thumbnail */}
                          <td className={s.td}>
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt=""
                                className={s.thumb}
                              />
                            ) : (
                              <div className={s.thumbEmpty} />
                            )}
                          </td>
                          {/* Name */}
                          <td className={s.td}>
                            <p className={s.productName}>{product.name}</p>
                            <p className={s.productMeta}>
                              {product.brand} &middot; {product.category}
                            </p>
                          </td>
                          {/* Price */}
                          <td className={s.td}>
                            <span className={s.priceMain}>
                              ₹{product.price?.toLocaleString("en-IN")}
                            </span>
                            {product.compareAtPrice && (
                              <p className={s.priceCompare}>
                                ₹
                                {product.compareAtPrice?.toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            )}
                          </td>
                          {/* Variants */}
                          <td className={s.td}>
                            <span
                              className={s.stockText}
                              style={{ color: oos ? "#e74c3c" : "#2ecc71" }}
                            >
                              {product.variants?.length || 0} size
                              {product.variants?.length !== 1 ? "s" : ""}
                              {oos && " · out of stock"}
                            </span>
                          </td>
                          {/* Flags */}
                          <td className={s.td}>
                            <div className={s.flagsWrap}>
                              {product.isFeatured && (
                                <span className={s.flagFeatured}>FEATURED</span>
                              )}
                              {product.isBestseller && (
                                <span className={s.flagBestseller}>
                                  BESTSELLER
                                </span>
                              )}
                              {product.isNew && (
                                <span className={s.flagNew}>NEW</span>
                              )}
                            </div>
                          </td>
                          {/* Actions */}
                          <td className={s.td}>
                            <div className={s.actionsWrap}>
                              <button
                                onClick={() => openEdit(product)}
                                className={s.editBtn}
                              >
                                <Edit2 size={11} /> Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(product.id, product.name)
                                }
                                disabled={deletingId === product.id}
                                className={s.deleteBtn}
                                style={{
                                  cursor:
                                    deletingId === product.id
                                      ? "not-allowed"
                                      : "pointer",
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
          <div className={s.formWrap}>
            <h1 className={s.formTitle}>
              {editingId ? `Edit: ${form.name || "Product"}` : "New Product"}
            </h1>

            {error && <div className={s.errorBoxForm}>{error}</div>}

            {/* ── Basic Info ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Basic Info</p>
              <div className={s.formGrid2}>
                <div>
                  <label className={s.lbl}>Product Name *</label>
                  <input
                    className={s.inp}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. Noir Sauvage"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Brand</label>
                  <input
                    className={s.inp}
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                    placeholder="e.g. RAVEN"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Slug (URL) *</label>
                  <input
                    className={s.inp}
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    placeholder="raven-noir-sauvage"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Short Description</label>
                  <input
                    className={s.inp}
                    value={form.short_desc}
                    onChange={(e) => setField("short_desc", e.target.value)}
                    placeholder="One-line tagline for cards"
                  />
                </div>
              </div>
              <div className={s.mtRem}>
                <label className={s.lbl}>Full Description</label>
                <textarea
                  className={s.textarea}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Full product description shown on product detail page…"
                />
              </div>
            </div>

            {/* ── Pricing ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Pricing</p>
              <div className={s.formGrid2}>
                <div>
                  <label className={s.lbl}>Price (₹) *</label>
                  <input
                    className={s.inp}
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="9500"
                  />
                </div>
                <div>
                  <label className={s.lbl}>
                    Compare-At Price (₹) — strike-through
                  </label>
                  <input
                    className={s.inp}
                    type="number"
                    value={form.compare_price}
                    onChange={(e) => setField("compare_price", e.target.value)}
                    placeholder="Leave blank if no discount"
                  />
                </div>
              </div>
            </div>

            {/* ── Images ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Product Images</p>
              <div className={s.imgGallery}>
                {/* Already-uploaded images */}
                {form.images.map((url, i) => (
                  <div key={url + i} className={s.imgCard}>
                    <img src={url} alt="" className={s.imgThumb} />
                    {i === 0 && <div className={s.mainBadge}>MAIN</div>}
                    <button
                      onClick={() => removeUploaded(i)}
                      className={s.imgRemoveBtn}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Pending (not yet uploaded) previews */}
                {pendingPreviews.map((url, i) => (
                  <div key={url} className={s.imgCard}>
                    <img src={url} alt="" className={s.imgPendingThumb} />
                    <div className={s.pendingBadge}>PENDING</div>
                    <button
                      onClick={() => removePending(i)}
                      className={s.imgRemoveBtn}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={s.uploadBtn}
                >
                  <Upload size={18} />
                  <span className={s.uploadBtnText}>Add Image</span>
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
              <p className={s.imgHint}>
                Images are uploaded to Supabase Storage on save. The first image
                is used as the primary display image and thumbnail.
              </p>
            </div>

            {/* ── Classification ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Classification</p>
              <div className={s.formGrid3}>
                <div>
                  <label className={s.lbl}>Category</label>
                  <select
                    className={s.select}
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
                  <label className={s.lbl}>Gender</label>
                  <select
                    className={s.select}
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
                  <label className={s.lbl}>Sillage</label>
                  <select
                    className={s.select}
                    value={form.sillage}
                    onChange={(e) => setField("sillage", e.target.value)}
                  >
                    {SILLAGES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={s.lbl}>Scent Family</label>
                  <input
                    className={s.inp}
                    value={form.scent_family}
                    onChange={(e) => setField("scent_family", e.target.value)}
                    placeholder="e.g. Woody Aromatic"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Concentration</label>
                  <input
                    className={s.inp}
                    value={form.concentration}
                    onChange={(e) => setField("concentration", e.target.value)}
                    placeholder="e.g. EDP, EDT, Parfum"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Longevity</label>
                  <input
                    className={s.inp}
                    value={form.longevity}
                    onChange={(e) => setField("longevity", e.target.value)}
                    placeholder="e.g. 8–12 hours"
                  />
                </div>
              </div>
              <div className={s.mtRem}>
                <label className={s.lbl}>Tags (comma-separated)</label>
                <input
                  className={s.inp}
                  value={form.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="fresh, woody, aromatic, bergamot"
                />
              </div>
            </div>

            {/* ── Fragrance Notes ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Fragrance Notes</p>
              <div className={s.formColWrap}>
                <div>
                  <label className={s.lbl}>Top Notes (comma-separated)</label>
                  <input
                    className={s.inp}
                    value={form.notes_top}
                    onChange={(e) => setField("notes_top", e.target.value)}
                    placeholder="Bergamot, Pepper, Lavender"
                  />
                </div>
                <div>
                  <label className={s.lbl}>
                    Heart / Middle Notes (comma-separated)
                  </label>
                  <input
                    className={s.inp}
                    value={form.notes_middle}
                    onChange={(e) => setField("notes_middle", e.target.value)}
                    placeholder="Sichuan Pepper, Geranium, Jasmine"
                  />
                </div>
                <div>
                  <label className={s.lbl}>Base Notes (comma-separated)</label>
                  <input
                    className={s.inp}
                    value={form.notes_base}
                    onChange={(e) => setField("notes_base", e.target.value)}
                    placeholder="Ambroxan, Cedar, Labdanum"
                  />
                </div>
              </div>
            </div>

            {/* ── Variants ── */}
            <div className={s.sec}>
              <div className={s.variantHeader}>
                <p className={s.variantHeaderTitle}>Variants (Sizes)</p>
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
                  className={s.addSizeBtn}
                >
                  <Plus size={11} /> Add Size
                </button>
              </div>

              {/* Header row */}
              <div className={s.variantLabels}>
                {["Size", "Unit", "Price (₹)", "Stock", "SKU", ""].map((h) => (
                  <span key={h} className={s.lbl}>
                    {h}
                  </span>
                ))}
              </div>

              {form.variants.map((v, i) => (
                <div key={i} className={s.variantRow}>
                  <input
                    className={s.inp}
                    type="number"
                    value={v.size}
                    onChange={(e) => setVariantField(i, "size", e.target.value)}
                    placeholder="50"
                  />
                  <select
                    className={s.select}
                    value={v.unit}
                    onChange={(e) => setVariantField(i, "unit", e.target.value)}
                  >
                    <option value="ml">ml</option>
                    <option value="oz">oz</option>
                    <option value="g">g</option>
                  </select>
                  <input
                    className={s.inp}
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      setVariantField(i, "price", e.target.value)
                    }
                    placeholder="9500"
                  />
                  <input
                    className={s.inp}
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      setVariantField(i, "stock", e.target.value)
                    }
                    placeholder="0"
                  />
                  <input
                    className={s.inp}
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
                    className={s.variantDeleteBtn}
                    style={{
                      cursor:
                        form.variants.length === 1 ? "not-allowed" : "pointer",
                      opacity: form.variants.length === 1 ? 0.3 : 1,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Feature Flags ── */}
            <div className={s.sec}>
              <p className={s.secTitle}>Feature Flags</p>
              <div className={s.flagRow}>
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
                  <label key={key} className={s.flagLabel}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                      className={s.flagCheckbox}
                    />
                    <span className={s.flagText}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Save / Cancel ── */}
            <div className={s.saveRow}>
              <button
                onClick={() => setView("list")}
                className="btn btn-outline"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`btn btn-gold ${s.saveBtn}`}
                disabled={saving}
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
