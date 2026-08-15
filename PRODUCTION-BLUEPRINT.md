# GreenMate Admin — Bản đồ Production Thương mại

> **Vai trò:** Dashboard nội bộ cho **staff/admin** — quản lý sản phẩm, đơn hàng, khách, voucher, tồn kho, phân quyền; xử lý nghiệp vụ vận hành.
> **Đồng bộ hệ thống:** 1 trong 3 repo. Quyết định chung + đích tổng ở **`tipjs/PRODUCTION-BLUEPRINT.md`** (master). File này đặc tả phần **admin**.

---

## 0. CÁCH DÙNG (chống rà vô hạn)

1. Rà soát = đối chiếu file này + `.cursor/rules/production-dod.mdc` → **PASS / FAIL**, không mở hạng mục mới.
2. Mỗi domain có **DoD cố định**; xanh hết = XONG.
3. Ý tưởng ngoài DoD → §8 Backlog, không tính là "lỗi".
4. Dịch vụ ngoài → **bạn duyệt trước**.

> Đích thực tế: **RBAC là lớp bảo mật thật (không gate bằng UI) + CRUD nhất quán + đúng dữ liệu (voucher/giá enrich) + 1 người vận hành xử lý nghiệp vụ nhanh.**

---

## 1. QUYẾT ĐỊNH CHUNG ĐÃ CHỐT (khóa — theo master tipjs §1.1)

| # | Quyết định | Ảnh hưởng Admin |
|---|-----------|-----------------|
| 1 | **Single-shop** | Không quản lý đa người bán; `shop_owner_id` |
| 2 | **Payment adapter-ready** (COD giờ) | Order hiển thị phương thức COD; chừa cột/field cho gateway sau |
| 3 | **Ship nhập tay** | Staff nhập phí ship + cập nhật trạng thái giao thủ công |
| 4 | **Đổi/trả → Phase 2** | Chưa làm module refund; xử lý ngoài giai đoạn đầu |
| 5 | **Observability = nội bộ** | Không gắn dịch vụ ngoài; lỗi soi qua log/console guard |
| 6 | **Quy mô nhỏ năm đầu** | Không tối ưu quá sớm; ưu tiên đúng & nhất quán |

**Nguyên tắc bất biến:** Voucher/giá dùng field API đã enrich, **không** `.find()` voucher local (`.cursorrules §XX`). RBAC backend (`grantAccess`) là lớp bảo mật thật.

---

## 2. KIẾN TRÚC MỤC TIÊU (Admin layer)

```
Staff ─► proxy.js (verifyAdminSession + x-pathname)
          └─► (dashboard)/layout.js — RBAC guard (đọc x-pathname)
                └─► Page (Server Component) ─► lib/api/* ─► tipjs (server-only)
                      ├─ caps = getResourceCapabilities(src_name, grants)
                      └─ Mutation ─► Server Action + requirePermission ─► tipjs
                                       └─ revalidatePath/Tag
```

**RBAC 3 lớp bắt buộc:** menu/route (navConfig) → nút/UI (caps) → mutation (`requirePermission`). Backend `grantAccess` chốt cuối.

---

## 3. TRẠNG THÁI HIỆN TẠI

- ✅ Modules: product, voucher, banner, collection, inventory, order, customer, staff, RBAC.
- ✅ CRUD pattern chuẩn (`*FilterBar/*ListTable/*RowActions`), `useListUrlFilters`, `force-dynamic` + `Promise.all`.
- ✅ Order management (list/detail/stats/updateStatus với transition guard).
- 🟡 RBAC audit (rà mọi Server Action có `requirePermission`).
- ⬜ Dashboard overview; ẩn nav route chưa có page.

---

## 4. BẢN ĐỒ DOMAIN (Admin) — DoD cố định

> ✅ đạt · 🟡 một phần · ⬜ chưa · ⛔ hoãn

### A. RBAC 3 lớp — 🟡 (LÕI BẢO MẬT — ưu tiên)
- [x] Lớp 1: `navConfig` + `routePermissions` + layout guard (đọc `x-pathname`)
- [x] Lớp 2: `getResourceCapabilities` → props `canCreate/Update/Delete`
- [x] Lớp 3: `requirePermission` đầu mutation
- [ ] **Audit 1 lần cuối:** MỌI Server Action mutation có `requirePermission`; `src_name` khớp tipjs
- [ ] User read-only test: không thấy/không gọi được mutation

### B. API layer server-only — ✅
- [x] `lib/api/*` chỉ từ Server Component/Action; list admin `revalidate: 0`
- [x] Invalidate (`revalidatePath/Tag`) sau mutation
- [x] Không secret trong `NEXT_PUBLIC_*`

### C. CRUD module pattern + List UI — ✅
- [x] `ADMIN_LIST_TABLE_CLASS` + `listTableStyles`; không inline lặp
- [x] `page.js`+`loading.js`+`error.js`; import qua `@/components/admin`
- [ ] Rà module mới luôn copy pattern banner/collection/voucher (không fork)

### D. Forms — ✅
- [x] `react-hook-form` + `zod` + `useActionState`; Server Action trả `{ error }` (không leak stack)
- [x] `FormCard`/`FormStickyActions`; upload validate MIME+size
- [ ] Rà: mọi form dùng `AdminField/AdminInput` (không fork style)

### E. Order management (staff workflow) — 🟡
- [x] List/filter/detail/stats; updateStatus transition guard; hủy → hoàn kho
- [ ] Nhập **phí ship + trạng thái giao tay** đầy đủ (quyết định #3)
- [ ] Hiển thị phương thức thanh toán (COD; **chừa cột** gateway — quyết định #2)
- ⛔ Đổi/trả/refund — Phase 2 (quyết định #4)

### F. Dashboard overview — ⬜ (Phase 2)
- [ ] Doanh thu, đơn gần nhất, tồn kho thấp, voucher sắp hết hạn
- [ ] `use cache` cho stats khi bật cacheComponents

### G. Voucher / Giá (admin) — ✅
- [x] Picker khóa SP có voucher hẹp; conflict validate
- [x] `product_voucher` form khóa theo `active_voucher`; preview dùng field enrich
- **Bất biến:** không assume `product_voucher` = voucher đang chạy.

### H. Media / Upload — 🟡
- [x] `ImageUploader` + `bannerImageSpecs` validate size
- [ ] Rà mọi upload qua Server Action validate server-side (không lộ secret Cloudinary)

### I. Performance (admin) — ✅
- [x] `force-dynamic` list; `Promise.all` list+stats
- [ ] Chart/editor nặng `dynamic(ssr:false)`; bảng > 50 rows cân nhắc virtual

### J. Security / Proxy / Session — 🟡
- [x] `proxy.js` `verifyAdminSession` qua tipjs; cookie httpOnly; refresh
- [x] Rate limit login (tipjs), security headers, HSTS prod
- [ ] `.env.example` đầy đủ; `GREENMATE_SHOP_OWNER_ID` enforce prod

### K. Observability (admin) — ⬜ (nội bộ, quyết định #5)
- [ ] Không `console.log` production (guard/bỏ); lỗi hiển thị toast tiếng Việt
- [ ] Error boundary route dashboard

---

## 5. GAP so với chuẩn Coolmate (Admin)

1. **RBAC audit đầy đủ** (A) — bỏ sót 1 mutation = lỗ hổng thật.
2. **Order workflow giao-tay** (E) — phí ship + trạng thái cần đủ để vận hành.
3. **Dashboard overview** (F) — 1 người vận hành cần cái nhìn tổng.
4. **Ẩn nav route chưa có** — tránh 404 gây rối.

---

## 6. ROADMAP (đồng bộ Phase master)

**Phase 0 — GO-LIVE:** RBAC audit PASS (A) · order updateStatus + nhập phí ship dùng được (E) · rà `production-dod.mdc` PASS · ẩn nav route chưa có page.
**Phase 1:** Order workflow giao-tay hoàn chỉnh (E) · hiển thị phương thức thanh toán chừa gateway (E) · `.env.example` + enforce shop owner (J).
**Phase 2:** Dashboard overview (F) · module đổi/trả (E) · `use cache` stats.
**Phase 3 (theo ngưỡng):** virtual table khi rows lớn; tối ưu bundle.

---

## 7. DEFINITION OF DONE (Admin — đích cố định)

Nguồn chuẩn: `.cursor/rules/production-dod.mdc` (always-on). Một Phase XONG khi toàn bộ mục áp dụng PASS:
- [ ] RBAC 3 lớp đủ; MỌI mutation có `requirePermission`; `src_name` khớp tipjs
- [ ] `lib/api` chỉ server-side; list `revalidate:0` + invalidate sau mutation
- [ ] Form rhf+zod+useActionState; không leak stack backend
- [ ] Upload validate MIME+size; không secret `NEXT_PUBLIC_*`
- [ ] Voucher/giá dùng field enrich (không `.find()` local)
- [ ] JS/JSX only; không `console.log` prod; khác dev/prod chỉ qua env

> Xanh hết Phase hiện tại = DỪNG. Ý tưởng thêm → §8.

---

## 8. BACKLOG CÂN NHẮC (cần bạn duyệt)

- Dashboard analytics nâng cao / biểu đồ (recharts)
- Audit log UI (xem lịch sử thao tác staff)
- Category tree management, module comment/review admin
- Export báo cáo (CSV/Excel)
- Error tracking ngoài (theo master §8 — hiện log nội bộ)

---

## 9. LIÊN KẾT

- **Master (đích tổng + quyết định chung):** `tipjs/PRODUCTION-BLUEPRINT.md`
- Cách làm chi tiết: `greenmate_admin/.cursorrules` + `.cursor/rules/production-dod.mdc`
- Storefront đồng bộ: `greenmate_fe/PRODUCTION-BLUEPRINT.md`

> Cập nhật: sửa file này (đích Admin) + `.cursorrules` (cách làm). Không tạo map trùng lặp.
