// ĐỊNH NGHĨA CÁC HÀM DÙNG ĐỂ THAO TÁC VỚI TOKEN

import * as SecureStore from "expo-secure-store";

const KEY_ACCESS_TOKEN = "auth.accessToken";
const KEY_REFRESH_TOKEN = "auth.refreshToken";
const KEY_USER = "auth.user";

// Dữ liệu này có thể được truy cập sau khi người dùng đẫ mowrr khoá điện thoại ít nhất một lần.
// Giúp cần bằng hiệu suất và app chạy ngầm
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

// Hàm xử lý dữ liệu an toàn
function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T; // Chuyển từ JSON sang một object để lưu
  } catch {
    return null;
  }
}

// Hàm dùng để lấy AccessToken
export async function getAccessToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(KEY_ACCESS_TOKEN, OPTIONS);
  return token?.trim() || null;
}

// Hàm dùng để lưu AccessToken
export async function saveAccessToken(token: string): Promise<void> {
  if (!token?.trim()) {
    return;
  }
  await SecureStore.setItemAsync(KEY_ACCESS_TOKEN, token.trim(), OPTIONS);
}

// Hàm dùng để lấy RefreshToken
export async function getRefreshToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(KEY_REFRESH_TOKEN, OPTIONS);
  return token?.trim() || null;
}

// Hàm dùng để lưu RefreshToken
export async function saveRefreshToken(token: string): Promise<void> {
  if (!token?.trim()) {
    return;
  }
  await SecureStore.setItemAsync(KEY_REFRESH_TOKEN, token.trim(), OPTIONS);
}

// Hàm dùng để xoá AccessToken (và các auth-related keys nếu có)
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_ACCESS_TOKEN, OPTIONS);
  await SecureStore.deleteItemAsync(KEY_REFRESH_TOKEN, OPTIONS);
  await SecureStore.deleteItemAsync(KEY_USER, OPTIONS);
}

// Hàm dùng để lưu thông tin user
export async function saveUser<T extends object>(user: T): Promise<void> {
  await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user), OPTIONS);
}

// Hàm dùng để lấy thông tin user
export async function getUser<T extends object>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(KEY_USER, OPTIONS);
  return safeJsonParse<T>(raw);
}
