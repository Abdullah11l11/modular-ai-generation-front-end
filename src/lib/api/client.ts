import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, Method, RawAxiosRequestHeaders } from 'axios'
import { env } from '@/config/env'

export type ApiQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

export type ApiRequestOptions<Body = unknown> = {
  body?: Body
  headers?: RawAxiosRequestHeaders
  params?: ApiQueryParams
  signal?: AbortSignal
}

export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const authTokenKey = 'mgf.authToken'

const readAuthToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(authTokenKey)
}

const axiosClient = axios.create({
  baseURL: `${env.apiBaseUrl.replace(/\/$/, '')}/`,
  headers: {
    Accept: 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = readAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const getErrorMessage = (payload: unknown) => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message
  }

  return 'API request failed'
}

const request = async <Response, Body = unknown>(
  method: Method,
  path: string,
  options: ApiRequestOptions<Body> = {},
): Promise<Response> => {
  const config: AxiosRequestConfig<Body> = {
    method,
    url: path,
    data: options.body,
    headers: options.headers,
    params: options.params,
    signal: options.signal,
  }

  try {
    const response = await axiosClient.request<Response>(config)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      const status = axiosError.response?.status ?? 0
      const details = axiosError.response?.data ?? axiosError.message

      throw new ApiError(getErrorMessage(details), status, details)
    }

    throw error
  }
}

export const apiClient = {
  get: <Response>(path: string, options?: ApiRequestOptions) =>
    request<Response>('GET', path, options),
  post: <Response, Body = unknown>(
    path: string,
    body?: Body,
    options?: Omit<ApiRequestOptions<Body>, 'body'>,
  ) => request<Response, Body>('POST', path, { ...options, body }),
  put: <Response, Body = unknown>(
    path: string,
    body?: Body,
    options?: Omit<ApiRequestOptions<Body>, 'body'>,
  ) => request<Response, Body>('PUT', path, { ...options, body }),
  delete: <Response = void>(path: string, options?: ApiRequestOptions) =>
    request<Response>('DELETE', path, options),
  auth: {
    setToken(token: string) {
      window.localStorage.setItem(authTokenKey, token)
    },
    clearToken() {
      window.localStorage.removeItem(authTokenKey)
    },
  },
}
