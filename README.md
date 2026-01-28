# 🍽️ Restaurant/Hotel Client App (React Native + Expo)

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="44" alt="React" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" height="44" alt="TypeScript" />
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/android/android-original.svg" height="44" alt="Android" />
</p>

<p align="center">
  <b>Frontend Mobile (Client)</b> cho hệ thống quản lý nhà hàng/khách sạn — kết nối Swagger API (CLIENT) theo module: Auth, Order, Payment, Review, Table, Upload, v.v.
</p>

<p align="center">
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="react-native" src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="expo" src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="android" src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
</p>

---

## ✨ Mục tiêu

- Xây dựng **frontend React Native** theo chuẩn production: dễ mở rộng, tách lớp rõ ràng, tối ưu workflow theo **module API**.
- Đồng bộ Swagger API (CLIENT) gồm: **Auth, Bill, Branch, BusinessLicense, Cart, Category, Company, CompanyProfile, Contact, DeviceToken, Discount, Employee, GoogleAuth, Item, MemberLevel, News, Notification, Order, Payment, PaymentMethod, Review, SettingPoint, SiteSection, Table, Upload, WorkExperience, WorkingTime, Health-Check**.

---

## ✅ Highlights

- **Feature-based architecture**: `src/features/<module>` tách riêng mỗi nghiệp vụ
- **API layer chuẩn**: 1 axios client dùng chung + interceptors (JWT + x-api-key)
- **Token lưu an toàn**: SecureStore/Keychain (không lưu token “thường”)
- **Dễ scale**: thêm module mới chỉ việc tạo `api.ts`, `types.ts`, `hooks.ts`, `screens/`
- **Chuẩn mobile UX**: loading/empty/error state tách component

---

## 🧰 Tech Stack

- **React Native + TypeScript (TS/TSX)**
- **Expo** (dev server + build)
- Navigation: `@react-navigation/native`, `native-stack`, `bottom-tabs`
- Networking: `axios`
- State: `zustand` (Auth + app state)
- Data fetching/caching: `@tanstack/react-query` (list/pagination/mutation)
- Forms: `react-hook-form` + `zod`
- Secure token storage: `expo-secure-store`

---

## ✅ Prerequisites (Ubuntu)

- Node.js (khuyên dùng v20+)
- Android Studio (SDK + Emulator)
- (Khuyên) KVM bật để emulator chạy mượt

---

# 👋 Welcome to your Expo app

This is an **Expo** project created with `create-expo-app`.

> Lưu ý: Template Expo đôi khi nhắc tới “app directory / file-based routing”.  
> Project này **code nghiệp vụ nằm trong `src/`** theo kiến trúc feature-based, còn entry thường là `App.tsx`.

---

## 🚀 Get started

### 1) Install dependencies

```bash
npx create-expo-app@latest .
npm install
```

### 2) Start the app

```bash
npx expo start --android
```

✅ Tip: Khi `npx expo start` đang chạy, bạn có thể nhấn **a** để mở app trên **Android emulator**.

---

## 🤖 Chạy Android Emulator (Android Studio) + chạy app

### Bước 1: Mở giả lập trước

1. Mở **Android Studio**
2. Chọn **More Actions → Device Manager**
3. Chọn 1 máy ảo (AVD) → bấm **▶ Play** để chạy emulator
4. Chờ emulator boot xong (vào màn hình Home)

### Bước 2: Chạy Expo & mở app

```bash
npx expo start
```

Sau đó:

- Nhấn **a** trong terminal để mở app trên emulator  
  **HOẶC** chạy trực tiếp:

```bash
npx expo start --android
```

Check nhanh emulator đã được adb nhận chưa:

```bash
adb devices
```

---

## 🧯 Trường hợp project chưa có `package.json` (tạo Expo project vào folder có sẵn `src/`)

```bash
cd /media/voanhnhat/SDD_OUTSIDE5/FRONTEND-MANAGEMT-HOTEL

mkdir -p ../_bak_FRONTEND-MANAGEMT-HOTEL
mv README.md package-lock.json src ../_bak_FRONTEND-MANAGEMT-HOTEL/ 2>/dev/null

ls -la

npx create-expo-app@latest .

npm install

Tải thêm thư viện dùng để  lưu trữ: npx expo install expo-secure-store
Tải thêm thư  viện axios: npm i axios

npx expo start --android
```

Đưa `src/` về lại:

```bash
rm -rf src
mv ../_bak_FRONTEND-MANAGEMT-HOTEL/src ./src
mv -f ../_bak_FRONTEND-MANAGEMT-HOTEL/README.md ./README.md 2>/dev/null
```

---

## ⚙️ Config & Environment

- `src/core/config/env.ts` — `BASE_URL`, `X_API_KEY`, `TIMEOUT…`
- `src/core/config/constants.ts` — hằng số dùng chung

Gợi ý:

```ts
export const ENV = {
  BASE_URL: "https://your-domain.com",
  X_API_KEY: "your-x-api-key",
  TIMEOUT_MS: 20000,
};
```

> Backend chạy local:

- Android emulator dùng `http://10.0.2.2:<port>` thay cho `localhost`.

---

## 🔐 Authentication (quan trọng)

- `Authorization: Bearer <JWT_TOKEN>`
- `x-api-key: <API_KEY>`

---

## 🌐 API Client (axios) — nơi gắn header JWT + x-api-key

Tập trung tại: `src/api/client.ts`

```ts
import axios from "axios";
import { ENV } from "../core/config/env";
import { tokenStorage } from "../core/storage/secureStore";

export const api = axios.create({
  baseURL: ENV.BASE_URL,
  timeout: ENV.TIMEOUT_MS,
});

api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};
  config.headers["x-api-key"] = ENV.X_API_KEY;

  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === 401) {
      await tokenStorage.remove();
    }
    return Promise.reject(err);
  },
);
```

---

## 🔒 Secure token storage

Tập trung tại: `src/core/storage/secureStore.ts`

```ts
import * as SecureStore from "expo-secure-store";

const KEY = "ACCESS_TOKEN";

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  remove: () => SecureStore.deleteItemAsync(KEY),
};
```

---

## 🗂️ Project Structure

```txt
├── 📁 app                                                # ROUTES (Expo Router) – chỉ dùng để định tuyến
│   ├── 📁 (auth)                                         # Nhóm route cho xác thực (Auth Flow)
│   │   └── 📄 login.tsx                                  # Route Login (import LoginScreen từ src/features/auth/screens)
│   ├── 📁 (tabs)                                         # Nhóm route chính dạng Tab (Main App)
│   │   ├── 📁 uploads                                    # Tab Uploads (route)
│   │   │   └── 📄 index.tsx                              # Trang Upload (import screen/component từ src/features/uploads)
│   │   ├── 📁 debug                                      # Tab Debug (route)
│   │   │   └── 📄 health.tsx                             # Màn hình test backend/health-check (import HealthDebugScreen)
│   │   ├── 📁 home                                       # Tab Home (route)
│   │   │   └── 📄 index.tsx                              # Trang Home (import HomeScreen trong tương lai)
│   │   ├── 📁 reviews                                    # Tab Reviews (route)
│   │   │   ├── 📄 [id].tsx                               # Chi tiết review theo id (dynamic route)
│   │   │   ├── 📄 create.tsx                             # Tạo review
│   │   │   └── 📄 index.tsx                              # Danh sách review
│   │   ├── 📁 site-sections                              # Tab Site Sections (route)
│   │   │   └── 📄 index.tsx                              # Danh sách site section (theo slug/status/company_id)
│   │   ├── 📁 tables                                     # Tab Tables (route)
│   │   │   ├── 📄 [id].tsx                               # Chi tiết bàn theo id (dynamic route)
│   │   │   └── 📄 index.tsx                              # Danh sách bàn (filter/status/branch)
│   │   ├── 📁 work-experience                            # Tab Work Experience (route)
│   │   │   └── 📄 index.tsx                              # Kinh nghiệm làm việc (theo userId)
│   │   ├── 📁 working-time                               # Tab Working Time (route)
│   │   │   └── 📄 index.tsx                              # Thời gian làm việc (list/detail)
│   │   └── 📄 _layout.tsx                                # Tab layout: cấu hình Tabs, icons, options, header
│   ├── 📄 _layout.tsx                                    # Root layout: Stack + Providers (Auth/Theme/Query) cho toàn app
│   └── 📄 modal.tsx                                      # Route modal (popup screen) nếu cần
│
├── 📁 assets                                             # Tài nguyên tĩnh (dùng cho icon/ảnh splash…)
│   ├── 📁 icons                                          # Icons của app (tab icons, action icons, logo…)
│   └── 📁 images                                         # Images (banner, placeholder, background…)
│
├── 📁 scripts                                            # Script hỗ trợ dự án
│   └── 📄 reset-project.js                               # Script reset starter Expo (tùy chọn)
│
├── 📁 src                                                # TOÀN BỘ LOGIC APP (sạch – module hóa – dễ mở rộng)
│   ├── 📁 api                                            # Tầng API dùng chung toàn app
│   │   ├── 📄 client.ts                                  # Axios client + interceptors (x-api-key + Bearer JWT + handle 401)
│   │   ├── 📄 endpoints.ts                               # Danh sách endpoint chuẩn hóa (tránh hardcode URL rải rác)
│   │   ├── 📄 errors.ts                                  # Chuẩn hóa lỗi backend (message/status/fields)
│   │   └── 📄 types.ts                                   # Types dùng chung (BaseResponse, pagination, common DTO)
│   │
│   ├── 📁 components                                     # Components tái sử dụng ở nhiều màn hình
│   │   ├── 📁 layout                                     # Layout components (khung màn hình)
│   │   │   ├── 📄 Header.tsx                             # Header dùng chung (title/back/action)
│   │   │   └── 📄 Screen.tsx                             # Wrapper Screen (SafeArea/padding/Scroll/loading)
│   │   └── 📁 ui                                         # UI kit mini (design system)
│   │       ├── 📄 Button.tsx                             # Button chuẩn (primary/secondary/loading/disabled)
│   │       ├── 📄 Card.tsx                               # Card hiển thị item/list/detail
│   │       ├── 📄 EmptyState.tsx                         # UI empty list/no data
│   │       ├── 📄 Input.tsx                              # Input chuẩn (label/error/secureText)
│   │       └── 📄 Loading.tsx                            # Loading indicator (full/inline)
│   │
│   ├── 📁 core                                           # Core hệ thống (config/theme/utils/storage/hooks)
│   │   ├── 📁 config                                     # Config môi trường/hằng số
│   │   │   ├── 📄 constants.ts                           # Hằng số dùng chung (keys, default limit, enums…)
│   │   │   └── 📄 env.ts                                 # ENV config (BASE_URL, X_API_KEY, TIMEOUT…)
│   │   ├── 📁 hooks                                      # Custom hooks dùng chung toàn app
│   │   │   ├── 📄 useAppInit.ts                          # Hook init app (load token, preload config, bootstrap)
│   │   │   └── 📄 useDebounce.ts                         # Hook debounce (search input, filter…)
│   │   ├── 📁 storage                                    # Local storage (an toàn)
│   │   │   └── 📄 secureStore.ts                         # Lưu/đọc/xóa token bằng SecureStore/Keychain
│   │   ├── 📁 theme                                      # Theme hệ thống
│   │   │   ├── 📄 ThemeProvider.tsx                      # Provider theme (light/dark)
│   │   │   ├── 📄 colors.ts                              # Bảng màu chuẩn toàn app
│   │   │   ├── 📄 spacing.ts                             # Quy ước spacing (padding/margin/gap)
│   │   │   └── 📄 typography.ts                          # Quy ước font (size/weight/lineHeight)
│   │   └── 📁 utils                                      # Tiện ích dùng chung
│   │       ├── 📄 format.ts                              # Format date/currency/number…
│   │       ├── 📄 guard.ts                               # Validator/guard (check token/role/inputs)
│   │       └── 📄 logger.ts                              # Logger tập trung (debug theo env)
│   │
│   └── 📁 features                                       # Modules nghiệp vụ (map theo Swagger CLIENT)
│       ├── 📁 auth                                       # Module Auth (Login/Logout/Refresh token…)
│       │   ├── 📁 screens                                # UI screens của auth
│       │   │   └── 📄 LoginScreen.tsx                    # Màn hình đăng nhập (gọi API + lưu token)
│       │   ├── 📄 api.ts                                 # Hàm gọi API auth (login/logout/refresh…)
│       │   ├── 📄 hooks.ts                               # Hooks auth (useLogin/useLogout/useMe…)
│       │   ├── 📄 store.ts                               # Store auth (token/user/company_id/role…)
│       │   └── 📄 types.ts                               # Types auth (LoginRequest/TokenResponse…)
│       │
│       ├── 📁 health                                     # Module health-check/debug backend
│       │   ├── 📁 screens                                # UI debug
│       │   │   └── 📄 HealthDebugScreen.tsx              # Screen hiển thị kết quả /health để test API
│       │   ├── 📄 api.ts                                 # API health-check (/restaurants/v1, /restaurants/v1/health)
│       │   └── 📄 hooks.ts                               # Hook useHealthCheck() để test nhanh
│       │
│       ├── 📁 reviews                                    # Module Review (CRUD)
│       │   ├── 📁 screens                                # UI screens reviews
│       │   │   ├── 📄 ReviewCreateScreen.tsx             # Tạo review (rate/content/type/target_id…)
│       │   │   ├── 📄 ReviewDetailScreen.tsx             # Chi tiết review (update/delete/restore)
│       │   │   └── 📄 ReviewListScreen.tsx               # Danh sách review (filter/search/pagination)
│       │   ├── 📄 api.ts                                 # API reviews (list/create/detail/update/delete/restore…)
│       │   ├── 📄 hooks.ts                               # Hooks reviews (useReviewList/useCreateReview…)
│       │   └── 📄 types.ts                               # Types/DTO reviews
│       │
│       ├── 📁 settingPoint                               # Module Setting Point (thiết lập điểm tích luỹ)
│       │   ├── 📄 api.ts                                 # API setting-point (get theo company_id / get theo id)
│       │   ├── 📄 hooks.ts                               # Hooks setting-point
│       │   └── 📄 types.ts                               # Types/DTO setting-point
│       │
│       ├── 📁 siteSection                                # Module Site Section (section nội dung theo slug/status)
│       │   ├── 📄 api.ts                                 # API site-section (list + detail)
│       │   ├── 📄 hooks.ts                               # Hooks site-section (useSiteSections…)
│       │   └── 📄 types.ts                               # Types/DTO site-section
│       │
│       ├── 📁 tables                                     # Module Tables (bàn ăn)
│       │   ├── 📁 screens                                # UI tables
│       │   │   ├── 📄 TableDetailScreen.tsx              # Chi tiết bàn (status/branch/info…)
│       │   │   └── 📄 TableListScreen.tsx                # Danh sách bàn (filter/status/branch)
│       │   ├── 📄 api.ts                                 # API tables (list + detail)
│       │   ├── 📄 hooks.ts                               # Hooks tables (useTableList/useTableDetail…)
│       │   └── 📄 types.ts                               # Types/DTO tables
│       │
│       ├── 📁 uploads                                    # Module Upload (multipart/form-data)
│       │   ├── 📁 components                             # Component dùng lại cho upload
│       │   │   └── 📄 UploadPicker.tsx                   # Chọn ảnh/file + preview + submit upload
│       │   ├── 📄 api.ts                                 # API upload (upload/get by target/reorder/delete…)
│       │   ├── 📄 hooks.ts                               # Hooks upload (useUploadByTarget/useUploadDelete…)
│       │   └── 📄 types.ts                               # Types/DTO uploads
│       │
│       ├── 📁 workExperience                             # Module Work Experience
│       │   ├── 📄 api.ts                                 # API work-experience (get theo userId / get theo id)
│       │   ├── 📄 hooks.ts                               # Hooks work-experience
│       │   └── 📄 types.ts                               # Types/DTO work-experience
│       │
│       └── 📁 workingTime                                # Module Working Time
│           ├── 📄 api.ts                                 # API working-time (list + detail)
│           ├── 📄 hooks.ts                               # Hooks working-time (useWorkingTimeList/useWorkingTimeDetail)
│           └── 📄 types.ts                               # Types/DTO working-time
│
├── ⚙️ .gitignore                                         # File ignore cho Git
├── 📝 README.md                                          # Tài liệu dự án (cách chạy, cấu trúc, mapping API…)
├── ⚙️ app.json                                           # Cấu hình Expo (name, icon, splash, permissions…)
├── 📄 eslint.config.js                                   # Cấu hình ESLint
├── ⚙️ package-lock.json                                  # Lock dependency (npm)
├── ⚙️ package.json                                       # Scripts + dependencies
└── ⚙️ tsconfig.json                                      # Cấu hình TypeScript path alias, strict mode…

```

## 🧠 Kiến trúc & Luồng chạy (Expo Router + Feature-based)

Dự án này kết hợp 2 lớp rõ ràng:

- 🗺️ **`app/` (Routes)**: định tuyến theo _file-based routing_ (Expo Router). Mỗi file trong `app/` tương ứng **1 route/màn hình**.
- 🧱 **`src/` (Implementation)**: nơi bạn code thật: **UI screens, gọi API, state, theme, utils…**

### 🔄 Runtime flow (từ lúc bấm chạy đến lúc có dữ liệu lên UI)

1. ▶️ Bạn chạy: `npx expo start --android`
2. 📦 Expo Router scan thư mục **`app/`** để dựng navigation:
   - `app/_layout.tsx` (Root layout) → cấu hình **Stack + Providers**
   - `app/(tabs)/_layout.tsx` → cấu hình **Bottom Tabs**
   - các file như `app/(tabs)/tables/index.tsx`, `app/(auth)/login.tsx`… → là **route** cụ thể
3. 🖥️ Route thường chỉ “mỏng”: **import Screen thật** từ `src/features/.../screens` và `export default`
4. 🪝 Screen gọi **hooks** để lấy dữ liệu (loading/error/cache)
5. 🌐 Hooks gọi **api.ts** (hàm request)
6. ⚡ `api.ts` dùng `src/api/client.ts` (Axios client)
7. 🔐 Axios interceptor tự gắn header:
   - `x-api-key: <API_KEY>`
   - `Authorization: Bearer <JWT_TOKEN>` (lấy từ `src/core/storage/secureStore.ts`)
8. ✅ Backend trả data → hooks trả `data/loading/error` → Screen render UI

> 📌 Công thức nhớ nhanh:  
> **Route (`app/`) → Screen (`src/features/*/screens`) → Hook (`hooks.ts`) → API (`api.ts`) → Axios client (`src/api/client.ts`) → Backend**

---

## 🧩 Vì sao module nào cũng có `api.ts` / `hooks.ts` / `types.ts`?

Đây là chuẩn **feature-based architecture**: mỗi cụm API Swagger tương ứng một **module** trong `src/features/<module>`.

### 🧾 `types.ts` — “Bộ từ điển dữ liệu” của module

✅ Chứa TypeScript types/interfaces/enums cho request/response DTO:

- giúp code **đúng field**, có autocomplete
- tránh bug sai tên thuộc tính
- tái sử dụng ở `api.ts`, `hooks.ts`, `screens/`

Ví dụ: `Table`, `TableStatus`, `GetTableListParams`, `ReviewDTO`, `CreateReviewBody`…

### 🌐 `api.ts` — “Nơi viết hàm gọi API”

✅ Tách toàn bộ request ra khỏi UI:

- gom hàm theo endpoint: `list()`, `detail(id)`, `create()`, `update()`, `delete()`
- dễ thay đổi endpoint/params mà không đụng UI
- UI không bị “bẩn” vì vừa layout vừa fetch

### 🪝 `hooks.ts` — “Lớp thông minh giữa UI và API”

✅ UI thường cần xử lý state khi gọi API:

- `loading`, `error`, `refetch`
- debounce search / pagination
- caching (nếu dùng React Query)

Hooks sẽ wrap các hàm trong `api.ts` để Screen chỉ việc dùng:

- `useTableList(params)`
- `useTableDetail(id)`
- `useCreateReview()`

### 🧠 Nhớ nhanh theo vai trò

- `types.ts` = **dữ liệu**
- `api.ts` = **gọi backend**
- `hooks.ts` = **logic lấy dữ liệu cho UI**
- `screens/` = **render UI**

---

## 🧪 Ví dụ flow cho 1 module (Tables)

📁 `src/features/tables/`

- 🧾 `types.ts` → định nghĩa `Table`, `TableStatus`, params…
- 🌐 `api.ts` → `tablesApi.list()`, `tablesApi.detail(id)`
- 🪝 `hooks.ts` → `useTableList()`, `useTableDetail(id)` (trả về `data/loading/error`)
- 🖥️ `screens/TableListScreen.tsx` → render list từ hook
- 🖥️ `screens/TableDetailScreen.tsx` → render detail từ hook

📁 `app/(tabs)/tables/`

- 🗺️ `index.tsx` → route danh sách bàn (import `TableListScreen`)
- 🗺️ `[id].tsx` → route chi tiết bàn theo id (import `TableDetailScreen`)

---

## 🧰 Tech Stack (khuyến nghị)

- **React Native + TypeScript (TS/TSX)**
- **Expo** (dev server + build)
- Navigation: `@react-navigation/native`, `native-stack`, `bottom-tabs`
- Networking: `axios`
- State: `zustand` (Auth + app state)
- Data fetching/caching: `@tanstack/react-query` (list/pagination/mutation)
- Forms: `react-hook-form` + `zod`
- Secure token storage: `expo-secure-store`

---

## ✅ Prerequisites (Ubuntu)

- Node.js (khuyên dùng v20+)
- Android Studio (SDK + Emulator)
- (Khuyên) KVM bật để emulator chạy mượt

---

# 👋 Welcome to your Expo app

This is an **Expo** project created with `create-expo-app`.

> Lưu ý: Template Expo đôi khi nhắc tới “app directory / file-based routing”.  
> Project này **code nghiệp vụ nằm trong `src/`** theo kiến trúc feature-based, còn entry thường là `App.tsx`.

---

---

## 🧯 Troubleshooting nhanh

### Android emulator không gọi được backend local

- Dùng `10.0.2.2` thay `localhost`

### Metro bundler lỗi cache

```bash
npx expo start -c
```

### 401 liên tục

Kiểm tra:

- Có gửi `x-api-key` chưa?
- Token có đúng format `Bearer <token>` chưa?
- Token có hết hạn không?

---

## 🧪 Reset Expo starter (tuỳ chọn)

```bash
npm run reset-project
```

---

## 📚 Learn more (Expo)

- Expo docs: https://docs.expo.dev/
- Learn Expo tutorial: https://docs.expo.dev/tutorial/introduction/
- Expo on GitHub: https://github.com/expo/expo
- Discord community: https://chat.expo.dev

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
