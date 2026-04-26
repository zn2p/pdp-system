// 认证模块 —— 由负责登录/注册/权限的成员维护
// 负责：token 管理、用户身份、登录/注册/退出的 API 调用

import { createApiFetch } from "../shared/api.js";

const { ref, reactive } = window.Vue;

/**
 * @param {{ showToast: Function }} deps
 */
export function useAuth({ showToast }) {
    const token = ref(localStorage.getItem("pdp_token") || "");
    const apiFetch = createApiFetch(token);

    const isLoggedIn = ref(false);
    const showRegister = ref(false);
    const currentUser = ref({ name: "", displayName: "" });
    const currentRole = ref("student");
    const loginForm = reactive({ username: "", password: "", role: "student", displayName: "" });
    const registerForm = reactive({ username: "", password: "", confirm: "", role: "student" });
    const registerError = ref("");

    /**
     * 执行登录 API 调用并更新认证状态。
     * 返回 role 供外层编排层加载对应数据。
     * @returns {Promise<{ role: string }> | null}
     */
    async function performLogin() {
        if (!loginForm.username || !loginForm.password) {
            alert("请输入用户名和密码");
            return null;
        }
        const data = await apiFetch("/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: loginForm.username,
                password: loginForm.password,
                role: loginForm.role
            })
        });
        token.value = data.access_token;
        localStorage.setItem("pdp_token", token.value);
        currentUser.value = {
            name: loginForm.username,
            displayName: loginForm.displayName || loginForm.username
        };
        currentRole.value = loginForm.role;
        return { role: currentRole.value };
    }

    async function handleRegister() {
        registerError.value = "";
        if (!registerForm.username || !registerForm.password) {
            registerError.value = "请填写用户名和密码";
            return;
        }
        if (registerForm.password !== registerForm.confirm) {
            registerError.value = "两次密码输入不一致";
            return;
        }
        try {
            await apiFetch("/api/v1/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username: registerForm.username,
                    password: registerForm.password,
                    role: registerForm.role,
                    display_name: registerForm.username
                })
            });
            showRegister.value = false;
            Object.assign(registerForm, { username: "", password: "", confirm: "", role: "student" });
            showToast("注册成功，请登录");
        } catch (err) {
            const msg = err.message || "注册失败";
            registerError.value = msg.includes("409") ? "用户名已存在" : msg;
        }
    }

    function clearAuthState() {
        isLoggedIn.value = false;
        token.value = "";
        localStorage.removeItem("pdp_token");
        currentUser.value = { name: "", displayName: "" };
        currentRole.value = "student";
    }

    return {
        apiFetch,
        token,
        isLoggedIn,
        showRegister,
        currentUser,
        currentRole,
        loginForm,
        registerForm,
        registerError,
        performLogin,
        handleRegister,
        clearAuthState
    };
}
