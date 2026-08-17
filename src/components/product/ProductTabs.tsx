import { useEffect, useState } from "react";
import { reviewsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import type { Product, Review } from "../../types";
import s from "./ProductTabs.module.css";

const MAIN_TABS = ["Description", "How to Wear", "Reviews"] as const;
type MainTab = (typeof MAIN_TABS)[number];

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
        {tiers.map((tier, index) => (
          <div
            key={tier.label}
            style={{ width: tier.width, position: "relative" }}
          >
            <div
              style={{
                borderRadius:
                  index === 2
                    ? "0 0 6px 6px"
                    : index === 0
                      ? "6px 6px 0 0"
                      : "0",
                padding: "0.6rem 1rem",
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${
                  index === 0
                    ? "#d4af37, #e8c94f"
                    : index === 1
                      ? "#8a7e6b, #9a9590"
                      : "#0d0d0d, #1a1a1a"
                })`,
                color: index === 2 ? "#ffffff" : "#0d0d0d",
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
  const [activeTab, setActiveTab] = useState<MainTab>("Description");
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
    if (!product?.id) return;

    setReviewLoading(true);
    reviewsApi
      .getByProduct(product.id)
      .then((data) => setReviews(data))
      .finally(() => setReviewLoading(false));
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
    } catch (error: unknown) {
      setReviewError(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className={s.wrap}>
      <div className={s.layout}>
        <section className={s.mainPanel}>
          <div className={`${s.tabBar} no-scrollbar`}>
            {MAIN_TABS.map((tab) => (
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
            style={{ padding: isMobile ? "1.25rem 0" : "2rem 0" }}
          >
            {activeTab === "Description" && (
              <p className={s.descText}>{product.description}</p>
            )}

            {activeTab === "How to Wear" && (
              <div className={s.howToWear}>
                <p>
                  Apply to pulse points: wrists, neck, behind ears, and inside
                  elbows. These warm spots will help the fragrance bloom and
                  project naturally.
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
                <div className={s.ratingSummary}>
                  <div style={{ textAlign: "center" }}>
                    <div className={s.ratingBig}>
                      {reviews.length > 0
                        ? (
                            reviews.reduce(
                              (sum, review) => sum + review.rating,
                              0,
                            ) / reviews.length
                          ).toFixed(1)
                        : product.rating}
                    </div>
                    <div className={s.ratingStarsRow}>
                      {[1, 2, 3, 4, 5].map((index) => {
                        const avg =
                          reviews.length > 0
                            ? reviews.reduce(
                                (sum, review) => sum + review.rating,
                                0,
                              ) / reviews.length
                            : product.rating;

                        return (
                          <span
                            key={index}
                            className={s.ratingStar}
                            style={{
                              color:
                                index <= Math.round(avg)
                                  ? "var(--color-gold)"
                                  : "#444",
                            }}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>
                    <div className={s.ratingCount}>
                      {reviews.length}{" "}
                      {reviews.length === 1 ? "Review" : "Reviews"}
                    </div>
                  </div>
                </div>

                {user ? (
                  <div className={s.reviewForm}>
                    <h4 className={s.reviewFormTitle}>Write a Review</h4>
                    <div className={s.ratingPicker}>
                      {[1, 2, 3, 4, 5].map((index) => (
                        <button
                          key={index}
                          onClick={() => setReviewRating(index)}
                          className={s.ratingPickerBtn}
                          style={{
                            color:
                              index <= reviewRating
                                ? "var(--color-gold)"
                                : "#444",
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
                    {reviewError && (
                      <p className={s.reviewError}>{reviewError}</p>
                    )}
                    {reviewSuccess && (
                      <p className={s.reviewSuccess}>
                        Review submitted successfully!
                      </p>
                    )}
                    <button
                      onClick={handleSubmitReview}
                      className={`${s.submitBtn} btn btn-primary`}
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                ) : (
                  <div className={s.loginPrompt}>
                    Please{" "}
                    <a href="/login" className={s.loginLink}>
                      log in
                    </a>{" "}
                    to write a review.
                  </div>
                )}

                {reviewLoading ? (
                  <div className={s.loadingText}>Loading reviews...</div>
                ) : reviews.length > 0 ? (
                  <div>
                    {reviews.map((review) => (
                      <div key={review.id} className={s.reviewItem}>
                        <div className={s.reviewItemHeader}>
                          <div>
                            <div className={s.reviewerRow}>
                              <h5 className={s.reviewerName}>
                                {review.profiles?.full_name || "Verified Buyer"}
                              </h5>
                              {review.verified && <span>✓</span>}
                            </div>
                            <div className={s.reviewStars}>
                              {[1, 2, 3, 4, 5].map((index) => (
                                <span
                                  key={index}
                                  className={s.ratingStar}
                                  style={{
                                    color:
                                      index <= review.rating
                                        ? "var(--color-gold)"
                                        : "#444",
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className={s.reviewMeta}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {review.title && (
                          <h6 className={s.reviewTitle}>{review.title}</h6>
                        )}
                        {review.body && (
                          <p className={s.reviewBody}>{review.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={s.loadingText}>No reviews yet.</div>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className={s.pyramidPanel}>
          <div className={s.panelLabel}>Fragrance Pyramid</div>
          <FragrancePyramid notes={product.notes} />
        </aside>
      </div>
    </div>
  );
}
