// CẤU HÌNH BASE_URL CHO URL API GỐC -- XÉT THỜI GIAN CHỜ CỦA AXIOS
//  -- X_API_KEY: KHOÁ CỒNG KẾT NỐI MÁY CHỦ NẾU MÁY CHỦ YÊU CẦU

import "dotenv/config";

type Env = Readonly<{
  BASE_URL: string; // Địa chỉ IP máy chủ
  X_API_KEY: string; // API để kết nối với server
  TIME_OUT: number; // Thời gian tối đa APP đang chạy
  DEBUG: boolean; // Trạng thái xem app chạy thử
}>;

const DEFAULTT_TIMEOUT = Number(process.env.DEFAULTT_TIMEOUT);

// Hàm giúp làm sạch lại URL khi nhập sai
function normalizeBaseUrl(url: string): string {
  const u = (url ?? "").trim();
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

const rawBaseUrl = process.env.RAW_BASE_URL as string;
const rawApiKey = process.env.RAW_API_KEY as string;
const rawTimeOut = DEFAULTT_TIMEOUT;

const BASE_URL = normalizeBaseUrl(rawBaseUrl);
const X_API_KEY = (rawApiKey ?? "").trim();
const TIME_OUT =
  typeof rawTimeOut === "number" &&
  Number.isFinite(rawTimeOut) &&
  rawTimeOut > 0
    ? rawTimeOut
    : DEFAULTT_TIMEOUT;
const DEBUG: boolean = !!process.env.DEBUG;

// Hàm dùng để kiểm tra xem URL có bắt đầu bàng http không và kiểm tra thời gian
function assertEnv() {
  if (!BASE_URL.startsWith("http")) {
    console.warn(
      `[ENV] BASE_URL looks invalid: "${BASE_URL}". Example: "http://10.10.0.2:1206/swagger/client#/".`,
    );
  }
  if (!TIME_OUT || TIME_OUT < 1000) {
    console.warn(`[ENV] TIMEOUT is too small: ${TIME_OUT}ms.`); // Một giây
  }
}

assertEnv();

export const ENV: Env = Object.freeze({
  BASE_URL,
  X_API_KEY,
  TIME_OUT,
  DEBUG,
});
