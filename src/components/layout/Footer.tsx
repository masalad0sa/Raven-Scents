import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-primary)",
        color: "var(--color-ivory)",
        padding: "4rem 0 2rem",
      }}
    >
      <div className="container">
        {/* Top Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand block */}
          <div style={{ gridColumn: "span 1" }}>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                fontWeight: 400,
                marginBottom: "1rem",
                letterSpacing: "0.03em",
                color: "var(--color-gold)",
              }}
            >
              RAVEN
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                lineHeight: 1.85,
                color: "rgba(250,246,238,0.55)",
                maxWidth: 240,
                marginBottom: "1.5rem",
              }}
            >
              An independent perfume house. Every fragrance is crafted in-house
              with intention, sourced ethically, and made in small batches.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  style={{
                    width: 34,
                    height: 34,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(250,246,238,0.5)",
                    transition: "all 0.25s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-gold)";
                    el.style.color = "var(--color-gold)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,255,255,0.15)";
                    el.style.color = "rgba(250,246,238,0.5)";
                  }}
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "1.25rem",
              }}
            >
              Shop
            </h4>
            {[
              { label: "All Fragrances", to: "/shop" },
              { label: "New Arrivals", to: "/shop?filter=new" },
              { label: "Bestsellers", to: "/shop?filter=bestseller" },
              { label: "Feminine", to: "/shop?gender=feminine" },
              { label: "Masculine", to: "/shop?gender=masculine" },
              { label: "Unisex", to: "/shop?gender=unisex" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "rgba(250,246,238,0.55)",
                  textDecoration: "none",
                  marginBottom: "0.65rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-gold)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(250,246,238,0.55)")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Company links */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "1.25rem",
              }}
            >
              Company
            </h4>
            {[
              { label: "About Us", to: "/about" },
              { label: "Our Process", to: "/about" },
              { label: "Sustainability", to: "/about" },
              { label: "Contact", to: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "rgba(250,246,238,0.55)",
                  textDecoration: "none",
                  marginBottom: "0.65rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-gold)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "rgba(250,246,238,0.55)")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact / promise block */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.62rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: "1.25rem",
              }}
            >
              Get In Touch
            </h4>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "rgba(250,246,238,0.55)",
                lineHeight: 1.8,
                marginBottom: "1rem",
              }}
            >
              Questions about a fragrance? We'd love to help you find your
              perfect scent.
            </p>
            <a
              href="mailto:hello@ravenscents.com"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--color-gold)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(212,175,55,0.4)",
                paddingBottom: "2px",
                transition: "border-color 0.2s",
              }}
            >
              hello@ravenscents.com
            </a>
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 6,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  marginBottom: "0.4rem",
                }}
              >
                Our Promise
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "rgba(250,246,238,0.5)",
                  lineHeight: 1.7,
                }}
              >
                Authentic. In-house crafted. Free shipping over ₹5000. Easy
                returns.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "rgba(250,246,238,0.28)",
            }}
          >
            © 2025 Raven. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "rgba(250,246,238,0.28)",
                    textDecoration: "none",
                    transition: "color 0.25s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--color-ivory)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(250,246,238,0.28)")
                  }
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
