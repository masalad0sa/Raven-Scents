import { useState, useEffect } from "react";
import { reviewsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Review } from "../../types";

const TABS = ["Description", "Fragrance Pyramid", "How to Wear", "Reviews"] as const;
type Tab = (typeof TABS)[number];

function FragrancePyramid({ notes }: { notes: { top: string[]; middle: string[]; base: string[] } }) {
  const tiers = [
    { label: "Top Notes", sublabel: "0–15 min", notes: notes.top, width: "60%" },
    { label: "Heart Notes", sublabel: "15–60 min", notes: notes.middle, width: "78%" },
    { label: "Base Notes", sublabel: "60+ min", notes: notes.base, width: "100%" },
  ];
  return (
    <div style={{ padding: "0.75rem 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
        {tiers.map((tier, i) => (
          <div key={tier.label} style={{ width: tier.width, position: "relative" }}>
            <div
              style={{
                borderRadius: i === 2 ? "0 0 6px 6px" : i === 0 ? "6px 6px 0 0" : "0",
                padding: "0.6rem 1rem",
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${i === 0 ? "#d4af37, #e8c94f" : i === 1 ? "#8a7e6b, #9a9590" : "#0d0d0d, #1a1a1a"})`,
                color: i === 2 ? "var(--color-text)" : "#0d0d0d",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{tier.label}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", opacity: 0.7 }}>{tier.sublabel}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {tier.notes.map((note) => (
                  <span key={note} style={{ background: "rgba(255,255,255,0.25)", borderRadius: 3, padding: "0.2rem 0.6rem", fontFamily: "var(--font-sans)", fontSize: "0.75rem" }}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  product: any;
  isMobile: boolean;
}

export function ProductTabs({ product, isMobile }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (product?.id) {
      setReviewLoading(true);
      reviewsApi.getByProduct(product.id).then((data) => { setReviews(data); setReviewLoading(false); }).catch(() => setReviewLoading(false));
    }
  }, [product?.id]);

  const handleSubmitReview = async () => {
    if (!product) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const newReview = await reviewsApi.submit(product.id, reviewRating, reviewTitle, reviewBody);
      setReviews((prev) => [newReview, ...prev]);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(212,175,55,0.15)" }}>
      <div style={{ display: "flex", borderBottom: "1px solid rgba(212,175,55,0.15)", overflowX: "auto" }} className="no-scrollbar">
        {TABS.map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ padding: isMobile ? "1.25rem 0" : "2rem 0", maxWidth: isMobile ? "100%" : 700 }}>
        {activeTab === "Description" && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--color-muted)", lineHeight: 1.9 }}>
            {product.description}
          </p>
        )}
        {activeTab === "Fragrance Pyramid" && <FragrancePyramid notes={product.notes} />}
        {activeTab === "How to Wear" && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--color-muted)", lineHeight: 1.9 }}>
            <p style={{ marginBottom: "1rem" }}>Apply to pulse points: wrists, neck, behind ears, and inside elbows. These warm spots will help the fragrance bloom and project naturally.</p>
            <p style={{ marginBottom: "1rem" }}>For longer wear, apply to moisturized skin — fragrance adheres better to hydrated skin. Consider layering with an unscented lotion first.</p>
            <p>Avoid rubbing the wrists together after application, as this breaks down the fragrance molecules and shortens longevity.</p>
          </div>
        )}
        {activeTab === "Reviews" && (
          <div>
            {/* Rating Summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem", padding: "1.5rem", background: "#1a1a1a", borderRadius: 6, border: "1px solid rgba(212,175,55,0.15)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", fontWeight: 300, color: "var(--color-gold)", lineHeight: 1 }}>
                  {reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : product.rating}
                </div>
                <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
                  {[1, 2, 3, 4, 5].map((s) => {
                    const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : product.rating;
                    return <span key={s} style={{ color: s <= Math.round(avg) ? "var(--color-gold)" : "#444", fontSize: "1rem" }}>★</span>;
                  })}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>
                  {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                </div>
              </div>
            </div>

            {/* Review Form */}
            {user ? (
              <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#1a1a1a", borderRadius: 6, border: "1px solid rgba(212,175,55,0.15)" }}>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", marginBottom: "1rem" }}>Write a Review</h4>
                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: s <= reviewRating ? "var(--color-gold)" : "#444", padding: 0 }}>★</button>
                  ))}
                </div>
                <input type="text" placeholder="Review title (optional)" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} maxLength={100} style={{ width: "100%", background: "#0d0d0d", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, padding: "0.6rem 0.8rem", color: "var(--color-text)", fontFamily: "var(--font-sans)", fontSize: "0.85rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box" }} />
                <textarea placeholder="Share your experience with this fragrance..." value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} maxLength={2000} rows={3} style={{ width: "100%", background: "#0d0d0d", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 4, padding: "0.6rem 0.8rem", color: "var(--color-text)", fontFamily: "var(--font-sans)", fontSize: "0.85rem", marginBottom: "0.75rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                {reviewError && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-error)", marginBottom: "0.5rem" }}>{reviewError}</p>}
                {reviewSuccess && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-success)", marginBottom: "0.5rem" }}>Review submitted successfully!</p>}
                <button onClick={handleSubmitReview} disabled={reviewSubmitting || !reviewBody.trim()} style={{ background: reviewSubmitting || !reviewBody.trim() ? "rgba(212,175,55,0.5)" : "var(--color-gold)", color: "#0d0d0d", border: "none", borderRadius: 4, padding: "0.6rem 1.5rem", fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: reviewSubmitting || !reviewBody.trim() ? "not-allowed" : "pointer" }}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "2rem", padding: "1rem 1.5rem", background: "#1a1a1a", borderRadius: 6, border: "1px solid rgba(212,175,55,0.15)", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                <a href="/login" style={{ color: "var(--color-gold)" }}>Log in</a> to leave a review.
              </div>
            )}

            {/* Reviews List */}
            {reviewLoading ? (
              <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)", fontSize: "0.9rem" }}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)", fontSize: "0.9rem" }}>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} style={{ padding: "1.5rem 0", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
                          {review.profiles?.full_name || "Anonymous"}
                        </p>
                        {review.verified && (
                          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-success)", background: "rgba(46,204,113,0.1)", padding: "0.15rem 0.5rem", borderRadius: 3 }}>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} style={{ color: s <= review.rating ? "var(--color-gold)" : "#DDD", fontSize: "0.85rem" }}>★</span>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-muted)" }}>
                      {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {review.title && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.35rem" }}>{review.title}</p>}
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.7 }}>{review.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
