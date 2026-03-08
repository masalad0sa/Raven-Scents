import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";
import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className="container">
        {/* Top Grid */}
        <div className={s.topGrid}>
          {/* Brand block */}
          <div>
            <div className={s.brandName}>RAVEN</div>
            <p className={s.brandDesc}>
              An independent perfume house. Every fragrance is crafted in-house
              with intention, sourced ethically, and made in small batches.
            </p>
            <div className={s.socialRow}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className={s.socialLink}
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className={s.columnTitle}>Shop</h4>
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
                className={s.columnLink}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Company links */}
          <div>
            <h4 className={s.columnTitle}>Company</h4>
            {[
              { label: "About Us", to: "/about" },
              { label: "Our Process", to: "/about" },
              { label: "Sustainability", to: "/about" },
              { label: "Contact", to: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={s.columnLink}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact / promise block */}
          <div>
            <h4 className={s.columnTitle}>Get In Touch</h4>
            <p className={s.contactText}>
              Questions about a fragrance? We'd love to help you find your
              perfect scent.
            </p>
            <a href="mailto:hello@ravenscents.com" className={s.emailLink}>
              hello@ravenscents.com
            </a>
            <div className={s.promiseBox}>
              <p className={s.promiseLabel}>Our Promise</p>
              <p className={s.promiseText}>
                Authentic. In-house crafted. Free shipping over ₹5000. Easy
                returns.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={s.bottomBar}>
          <p className={s.copyright}>
            © 2025 Raven. All rights reserved.
          </p>
          <div className={s.legalLinks}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className={s.legalLink}
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
