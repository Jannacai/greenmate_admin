/**
 * hooks/ — custom React hooks dùng chung admin.
 *
 * | Hook | Dùng cho |
 * |------|----------|
 * | useDebounce | Giá trị sau khi user ngừng gõ |
 * | useDebouncedCallback | Gọi hàm debounce (search inline) |
 * | useListUrlFilters | Filter bar: search draft + URL searchParams |
 * | useStaffStatusUpdate | Cập nhật trạng thái nhân viên |
 *
 * Filter bar danh sách: ưu tiên useListUrlFilters + nút «Tìm» / Enter — không auto-debounce URL.
 */

export {};
