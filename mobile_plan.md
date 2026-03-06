# Mobile Responsiveness — Execution Plan

## Strategy

Add a `useIsMobile()` hook + CSS media queries at **768px** breakpoint. All pages use inline styles, so we'll use the hook for conditional styling + inject `<style>` blocks where needed.

---

## Phase 1 — Foundation

- [x] Create `useIsMobile` hook (`src/hooks/useIsMobile.ts`)

## Phase 2 — Critical Pages (Poor mobile state)

### 2.1 ProductDetail.tsx

- Stack image/info from `52%/1fr` grid → single column on mobile
- Thumbnails: vertical strip → horizontal scrollable row below main image
- Reduce padding/gaps
- Main image: remove `calc(100vh - 200px)` on mobile
- FragrancePyramid: fits naturally (percentage widths)

### 2.2 Shop.tsx

- Sidebar (240px fixed): hide by default on mobile, show as slide-out overlay
- Add filter toggle button visible on mobile
- Product grid fills full width when sidebar hidden

### 2.3 Cart.tsx

- Fix dead `.cart-layout` / `.cart-table` media query selectors (they don't match JSX)
- Stack order summary below cart items (`1fr 380px` → `1fr`)
- Cart item 5-column grid → card layout on mobile (image + info stacked)

### 2.4 Checkout.tsx

- Stack form + order summary (`1fr 360px` → `1fr`)
- Step indicator: compact on mobile
- Form fields already wrap via flexWrap ✓

### 2.5 About.tsx

- Timeline: alternating rows → single-column, vertical left-aligned
- Process section: `1fr 1fr` → `1fr` on mobile
- Reduce `gap: 5rem` → `2rem`

## Phase 3 — Partial Pages

### 3.1 Home.tsx

- Fix broken `.brand-story-section` media query selector (class not applied to element)
- Brand Story `1fr 1fr` with `5rem` gap → stack with reduced gap

### 3.2 Account.tsx

- Profile `dl` grid: `1fr 1fr` → `1fr` on mobile
- Tab bar: ensure no overflow

## Phase 4 — Component Polish

### 4.1 ProductCard.tsx

- Show "Add to Cart" button by default on touch devices (hover-only is unreachable)

---

## Priority Order

1. `useIsMobile` hook
2. ProductDetail (highest-traffic page)
3. Shop (core browsing)
4. Cart
5. Checkout
6. About
7. Home
8. ProductCard
9. Account
