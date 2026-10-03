// 서버 액션/API 응답 공통 래퍼 타입

export enum ApiErrorCode {
  UNAUTHORIZED = "unauthorized",
  VALIDATION_ERROR = "validation_error",
  NOTION_UNAUTHORIZED = "notion_unauthorized",
  NOTION_OBJECT_NOT_FOUND = "notion_object_not_found",
  // invoice/Items 스키마 불일치 양쪽에 공용 (구분은 메시지 문구로)
  NOTION_SCHEMA_MISMATCH = "notion_schema_mismatch",
  NOTION_ITEMS_UNAUTHORIZED = "notion_items_unauthorized",
  NOTION_ITEMS_NOT_FOUND = "notion_items_not_found",
  NOT_FOUND = "not_found",
  FORBIDDEN = "forbidden",
  INTERNAL_ERROR = "internal_error",
}

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: ApiErrorCode
    message: string
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiError
