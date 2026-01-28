// FILE DÙNG ĐỂ CHUẨN HOÁ LỖI TRONG BACKEND

import axios, { AxiosError } from "axios";

// Định nghĩa một type cho api lỗi
export type ApiError = {
  status: number | null; // Trạng thái lỗi
  message: string; // Message lỗi
  code?: string | undefined; // Mã định danh lỗi
  details?: unknown;
  isNetWorkError: boolean;
  isTimeOut: boolean;
  raw?: unknown;
};

// Hàm dùng để kiểm tra từng trường hợp, nếu có message thì lấy message.... Nếu không tìm thấy thì dùng nhánh dự phòng (fallback)
function pickMessage(data: any, fallback: string) {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }
  if (typeof data?.message === "string") {
    return data.message;
  }
  if (typeof data?.error === "string") {
    return data.error;
  }
  if (typeof data?.msg === "string") {
    return data.msg;
  }

  return fallback;
}

// Hàm dùng để biên một đối tượng unknow thành API
export function toApiError(err: unknown): ApiError {
  // Kiểm tra xem có phải lỗi do Axios không
  if (!axios.isAxiosError(err)) {
    return {
      status: null,
      message: "Unexpected error",
      isNetWorkError: false,
      isTimeOut: false,
      raw: err,
    };
  }

  // Tách các đối tượng ra thành các phần nhỏ
  const axErr = err as AxiosError<any>;
  const status = axErr.response?.status ?? null;
  const data = axErr.response?.data;

  const isTimeOut =
    axErr.code === "ECONNABORTED" ||
    (typeof axErr.message === "string" &&
      axErr.message.toLowerCase().includes("timeout"));
  const isNetWorkError = !axErr.response;

  // Gom tất cả các thông tin thu thập được vào một API duy nhất
  return {
    status,
    message: pickMessage(data, axErr.message || "Request failed"),
    code: axErr.code,
    details: data,
    isNetWorkError,
    isTimeOut,
    raw: err,
  };
}
