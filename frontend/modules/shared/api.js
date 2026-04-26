// API 请求工具 —— 由后端对接负责人维护
// 通过工厂函数注入 token ref，避免循环依赖

const API_BASE = window.__API_BASE__ || "http://127.0.0.1:8000";

/**
 * 创建带鉴权的 fetch 封装。
 * @param {import('vue').Ref<string>} tokenRef - 响应式 token ref
 * @returns {(path: string, opts?: RequestInit) => Promise<any>}
 */
export function createApiFetch(tokenRef) {
    return async function apiFetch(path, opts = {}) {
        const headers = { ...(opts.headers || {}) };
        if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        if (tokenRef.value) {
            headers["Authorization"] = `Bearer ${tokenRef.value}`;
        }
        const res = await fetch(API_BASE + path, { ...opts, headers });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`${res.status} ${res.statusText}: ${text}`);
        }
        const ct = res.headers.get("content-type") || "";
        return ct.includes("application/json") ? res.json() : res.text();
    };
}
