import { useState, useEffect } from "react";
import { reviewsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Review, Product } from "../../types";
import s from "./ProductTabs.module.css";

const TABS = [
  "Description",
  "Fragrance Pyramid",
  "How to Wear",
  "Reviews",
] as const;
type Tab = (typeof TABS)[number];

function FragrancePyramid({
  notes,
}: {
  notes: { top: string[]; middle: string[]; base: string[] };
}) {
  const tiers = [
    {
      label: "Top Notes",
      sublabel: "0–15 min",
      notes: notes.top,
      width: "60%",
    },
    {
      label: "Heart Notes",
      sublabel: "15–60 min",
      notes: notes.middle,
      width: "78%",
    },
    {
      label: "Base Notes",
      sublabel: "60+ min",
      notes: notes.base,
      width: "100%",
    },
  ];
  return (
    <div className={s.pyramidWrap}>
      <div className={s.pyramidCol}>
        {tiers.map((tier, i) => (
          <div
            key={tier.label}
            style={{ width: tier.width, position: "relative" }}
          >
            <div
              style={{
                borderRadius:
                  i === 2 ? "0 0 6px 6px" : i === 0 ? "6px 6px 0 0" : "0",
                padding: "0.6rem 1rem",
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${i === 0 ? "#d4af37, #e8c94f" : i === 1 ? "#8a7e6b, #9a9590" : "#0d0d0d, #1a1a1a"})`,
                color: i === 2 ? "var(--color-text)" : "#0d0d0d",
              }}
            >
              <div className={s.tierHeader}>
                <span className={s.tierLabel}>{tier.label}</span>
                <span className={s.tierSublabel}>{tier.sublabel}</span>
              </div>
              <div className={s.tierNotes}>
                {tier.notes.map((note) => (
                  <span key={note} className={s.tierNote}>
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
  product: Product;
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
      reviewsApi
        .getByProduct(product.id)
        .then((data) => {
          setReviews(data);
          setReviewLoading(false);
        })
        .catch(() => setReviewLoading(false));
    }
  }, [product?.id]);

  const handleSubmitReview = async () => {
    if (!product) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const newReview = await reviewsApi.submit(
        product.id,
        reviewRating,
        reviewTitle,
        reviewBody,
      );
      setReviews((prev) => [newReview, ...prev]);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className={s.wrap}>
      <div className={`${s.tabBar} no-scrollbar`}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        className={s.tabContent}
        style={{
          padding: isMobile ? "1.25rem 0" : "2rem 0",
        }}
      >
        {activeTab === "Description" && (
          <p className={s.descText}>{product.description}</p>
        )}
        {activeTab === "Fragrance Pyramid" && (
          <FragrancePyramid notes={product.notes} />
        )}
        {activeTab === "How to Wear" && (
          <div className={s.howToWear}>
            <p>
              Apply to pulse points: wrists, neck, behind ears, and inside
              elbows. These warm spots will help the fragrance bloom and project
              naturally.
            </p>
            <p>
              For longer wear, apply to moisturized skin — fragrance adheres
              better to hydrated skin. Consider layering with an unscented
              lotion first.
            </p>
            <p>
              Avoid rubbing the wrists together after application, as this
              breaks down the fragrance molecules and shortens longevity.
            </p>
          </div>
        )}
        {activeTab === "Reviews" && (
          <div>
            {/* Rating Summary */}
            <div className={s.ratingSummary}>
              <div style={{ textAlign: "center" }}>
                <div className={s.ratingBig}>
                  {reviews.length > 0
                    ? (
                        reviews.reduce((acc, r) => acc + r.rating, 0) /
                        reviews.length
                      ).toFixed(1)
                    : product.rating}
                </div>
                <div className={s.ratingStarsRow}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const avg =
                      reviews.length > 0
                        ? reviews.reduce((acc, r) => acc + r.rating, 0) /
                          reviews.length
                        : product.rating;
                    return (
                      <span
                        key={i}
                        className={s.ratingStar}
                        style={{
                          color:
                            i <= Math.round(avg) ? "var(--color-gold)" : "#444",
                        }}
                      >
                        ★
                      </span>
                    );
                  })}
                </div>
                <div className={s.ratingCount}>
                  {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                </div>
              </div>
            </div>

            {/* Review Form */}
            {user ? (
              <div className={s.reviewForm}>
                <h4 className={s.reviewFormTitle}>Write a Review</h4>
                <div className={s.ratingPicker}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setReviewRating(i)}
                      className={s.ratingPickerBtn}
                      style={{
                        color: i <= reviewRating ? "var(--color-gold)" : "#444",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={100}
                  className={s.reviewInput}
                />
                <textarea
                  placeholder="Share your experience with this fragrance..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  className={s.reviewTextarea}
                />
                {reviewError && <p className={s.reviewError}>{reviewError}</p>}
                {reviewSuccess && (
                  <p className={s.reviewSuccess}>
                    Review submitted successfully!
                  </p>
                )}
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting || !reviewBody.trim()}
                  className={s.submitBtn}
                  style={{
                    background:
                      reviewSubmitting || !reviewBody.trim()
                        ? "rgba(212,175,55,0.5)"
                        : "var(--color-gold)",
                    cursor:
                      reviewSubmitting || !reviewBody.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            ) : (
              <div className={s.loginPrompt}>
                <a href="/login" className={s.loginLink}>
                  Log in
                </a>{" "}
                to leave a review.
              </div>
            )}

            {/* Reviews List */}
            {reviewLoading ? (
              <p className={s.loadingText}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className={s.loadingText}>
                No reviews yet. Be the first to share your thoughts!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className={s.reviewItem}>
                  <div className={s.reviewItemHeader}>
                    <div>
                      <div className={s.reviewerRow}>
                        <p className={s.reviewerName}>
                          {review.profiles?.full_name || "Anonymous"}
                        </p>
                        {review.verified && (
                          <span className={s.verifiedBadge}>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className={s.reviewStars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={s.reviewStar}
                            style={{
                              color:
                                i <= review.rating
                                  ? "var(--color-gold)"
                                  : "#DDD",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={s.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {review.title && (
                    <p className={s.reviewTitle}>{review.title}</p>
                  )}
                  <p className={s.reviewBody}>{review.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
