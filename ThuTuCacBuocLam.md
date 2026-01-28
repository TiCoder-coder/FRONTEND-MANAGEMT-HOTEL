# 🚀 Project Implementation Roadmap

Dưới đây là lộ trình triển khai chi tiết cho dự án, được sắp xếp theo trình tự ưu tiên để đảm bảo hệ thống vận hành trơn tru từ core đến giao diện.

---

## 🏗️ Phase 1: Core Configuration & Security

### 1️⃣ Cấu hình ENV trước (Quan trọng nhất)

- **📁 Path:** `src/core/config/`
- **📄 File:** `env.ts`
- **⚙️ Nội dung:** Set `BASE_URL`, `X_API_KEY`, `TIMEOUT`
- **🎯 Mục tiêu:** Vì toàn bộ call API sống chết nằm ở đây.

### 2️⃣ Làm SecureStore cho token

- **📁 Path:** `src/core/storage/secureStore.ts`
- **🛠 Chức năng:**
  - 📥 `saveToken()`
  - 📤 `getToken()`
  - 🧹 `clearToken()`
- **🎯 Mục tiêu:** Để sau login lưu JWT lại, lần sau mở app không cần login lại.

---

## 🌐 Phase 2: API Networking & Testing

### 3️⃣ Làm Axios client + interceptor (x-api-key + Bearer)

- **📁 Path:** `src/api/client.ts` (+ `errors.ts` nếu muốn chuẩn hóa)
- **🛠 Chức năng:**
  - 🔑 Tự gắn header: `x-api-key` & `Authorization: Bearer <token>`
  - 🚫 Bắt lỗi `401` để đá về login.
- **✅ Kết quả:** Làm xong bước này = module nào gọi API cũng “auto chạy”.

### 4️⃣ Làm Health-check để test pipeline gọi API

- **📁 Path:** `src/features/health/`
- **📄 Thành phần:**
  - 📡 `api.ts` → gọi `/health` hoặc endpoint thầy đưa.
  - 🖥️ `HealthDebugScreen.tsx` → có nút **“Ping backend / Test API”**.
- **🎯 Mục tiêu:** Bấm cái là biết API có ăn không. Nếu health chạy OK => `baseURL` + `API key` chuẩn.

---

## 🔑 Phase 3: Authentication & Flow

### 5️⃣ Làm Auth (Login) cho ra token

- **📁 Path:** `src/features/auth/`
- **📄 Thành phần:** \* 📋 `types.ts` (LoginRequest / LoginResponse)
  - 🔌 `api.ts` (login)
  - 💾 `store.ts` (giữ token/user)
  - 🎨 `LoginScreen.tsx` (UI login)
- **🔄 Luồng xử lý:**
  1. Nhập tài khoản.
  2. Gọi login API.
  3. Nhận token → save `SecureStore`.
  4. Update store → chuyển qua tabs.

### 6️⃣ Làm useAppInit để auto redirect

- **📁 Path:** `src/core/hooks/useAppInit.ts`
- **🎯 Mục tiêu:**
  - 🔍 App mở lên → đọc token từ `SecureStore`.
  - ✅ Nếu có token → vào `(tabs)`.
  - ❌ Nếu không → về `(auth)/login`.

---

## 📦 Phase 4: Feature Modules

### 7️⃣ Làm module mẫu end-to-end: Tables

- **📁 Path:** `src/features/tables/`
- **📄 Thành phần:** \* 🏷️ `types.ts`
  - 🔌 `api.ts` (list + detail)
  - 🎣 `hooks.ts` (useTableList/useTableDetail)
  - 🖼️ `screens/TableListScreen.tsx`
  - 🖼️ `screens/TableDetailScreen.tsx`
- **💡 Ghi chú:** Vì Tables có list/detail rất phù hợp để bạn “copy pattern” cho mọi module khác.

---

## 🎨 Phase 5: Finalizing UI

### 8️⃣ Lúc này mới code Home “đẹp”

- **📍 Path:** `app/(tabs)/home/index.tsx` → import `HomeScreen`
- **📁 Folder:** `src/features/home/screens/HomeScreen.tsx`
- **🏠 Home nên hiển thị:**
  - 📊 **Tổng quan:** Số bàn / trạng thái.
  - 📰 **Site-sections:** News (nếu có).
  - ⚡ **Shortcut:** Sang `tables` / `reviews` / `uploads`… (Thêm các icon trực quan).

---

## 📄 License

Private / Internal use.

👤 Maintainer / Profile Info

- 🧑‍💻 Maintainer: Võ Anh Nhật

- 🎓 University: UTH

- 📧 Email: voanhnhat1612@gmmail.com

- 📞 Phone: 0335052899

- Last updated: 24/12/2006

---

<div align="center">
  <sub>🍽️ Restaurant/Hotel Client App (React Native + Expo)</sub>
</div>
