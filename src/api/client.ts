// CHECK TOKEN LOOXII 401

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ENV } from "../core/config/env";
import { clearToken, getAccessToken } from "../core/storage/secureStore";
import { toApiError } from "./errors";

// Tạo ra một biến toàn cục để khi mà người dùng gặp lỗi 401 thì điều hướng về logout/ mà hình login
let unauthorizedHandler: (() => void) | null = null;

// Hàm dùng để thêm một hành động bên ngoài vào trong client
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

// Hàm dùng để kiểm traxem request hiện tại có phải là gửi file (ảnh, vvideo hay không
function isMultipart(config: AxiosRequestConfig) {
  const h = (config.headers ?? {}) as Record<string, any>; // Lấy danh sách header ra và ép kiểu tạm thời để dễ kiểm tra
  const ct = h["Content-Type"] || h["content-type"]; // Tìm xem trong header có trường Content-type hay không
  // Trả về true nếu nội dung gửi đi là dữ liệu đa phần
  return (
    typeof ct === "string" &&
    ct.toLocaleLowerCase().includes("multipart/form-data")
  );
}

// Khởi tạo một instance
export const api: AxiosInstance = axios.create({
  baseURL: ENV.BASE_URL, // Địa chỉ gốc
  timeout: ENV.TIME_OUT, // Đặt thời gian tối đa
  headers: { Accept: "application/json" }, // Để cho app biết dữ liệu đang ở kiểu json
});

// Hàm dùng để kiểm tra request trước khi gửi cho client
api.interceptors.request.use(
  async (config) => {
    // Nếu có khai báo X_API_KEY trong ENV, nó sẽ tự động dán vào header mang tên x-api-key
    if (ENV.X_API_KEY && !config.headers["x-api-key"]) {
      config.headers["x-api-key"] = ENV.X_API_KEY;
    }

    const token = await getAccessToken(); // Lấy token đăng nhập
    // Nếu có token thì nó tự gán vào header theo cú pháp chuẩn là Bearer + token
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu không gửi file nó sẽ tự động thêm Conent-type để server biết app đang gửi dữ liệu dạng text/json
    if (!isMultipart(config) && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // Nếu đang ở chế độ code thử, nó sẽ console.log ra phương thức get/post với url để theo dõi
    if (ENV.DEBUG) {
      const method = (config.method || "GET").toUpperCase();
      const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
      console.log(`[API] ${method} ${url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Kiểm tra dữ liệu từ server về cho app
api.interceptors.response.use(
  // Nếu nó ổn đinh nó sẽ tiếp tục dược hoạt động
  (res) => res,

  // Nếu có lỗi thì xử lí
  async (error) => {
    const status = error?.response?.status; // Lấy trạng thái lỗi
    if (status === 401) {
      // Nếu là lỗi 401 thì xoá token
      await clearToken();
    }
    if (unauthorizedHandler) {
      // Sau khi xoá xong thì trả người dùng về trang logim
      unauthorizedHandler();
    }

    // Đưa qua bộ lọc để trả về một API sạch
    return Promise.reject(toApiError(error));
  },
);
