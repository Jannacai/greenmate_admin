/**
 * stores/ — client state toàn cục (Zustand khi cần).
 *
 * Hiện tại admin ưu tiên Server Components + URL searchParams cho list/filter.
 * Thêm store khi có state thật sự client-only, ví dụ:
 * - Giỏ / wishlist (nếu embed preview storefront)
 * - UI prefs persist (sidebar thu gọn desktop)
 *
 * Cài: npm install zustand
 * Pattern: selector riêng từng field — tránh subscribe cả store.
 */

export {};
