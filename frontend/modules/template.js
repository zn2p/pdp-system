import { loginTemplate } from "./templates/login.js";
import { registerTemplate } from "./templates/register.js";
import { studentTemplate } from "./templates/student.js";
import { teacherTemplate } from "./templates/teacher.js";
import { modalsTemplate } from "./templates/modals.js";

export const appTemplate = `
<div>
    <div style="position:fixed;top:28px;left:50%;transform:translateX(-50%);z-index:9999;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:10px;">
        <div v-for="t in toasts" :key="t.id"
             :style="t.type==='success'
               ? 'display:flex;align-items:center;gap:10px;padding:13px 22px;border-radius:14px;font-size:14px;font-family:inherit;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.12);border:1px solid #d1cfc5;background:#faf9f5;color:#141413;pointer-events:auto;'
               : 'display:flex;align-items:center;gap:10px;padding:13px 22px;border-radius:14px;font-size:14px;font-family:inherit;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.12);border:1px solid #f0c4bb;background:#fff5f3;color:#b53333;pointer-events:auto;'">
            <span :style="t.type==='success' ? 'color:#5a9e6f;font-size:16px;' : 'color:#b53333;font-size:16px;'">{{ t.type === 'success' ? '✓' : '✕' }}</span>
            <span>{{ t.text }}</span>
        </div>
    </div>
    ${registerTemplate}
    ${loginTemplate}

    <div v-if="isLoggedIn" class="app-layout">
        <aside class="sidebar">
            <div class="brand"><span class="brand-mark">G</span> GrowthLink</div>
            <div style="flex:1;">
                <div v-for="item in menuItems" :key="item.key" class="menu-item" :class="{active: currentPage === item.key}" @click="currentPage = item.key">
                    <i :class="item.icon"></i> {{ item.label }}
                </div>
            </div>
            <div class="user-footer">
                <div><i class="fas fa-user-circle"></i> {{ currentUser.displayName || currentUser.name }}</div>
                <div style="font-size:12px; color: var(--text-tertiary);">{{ roleDisplayName }}</div>
                <button class="btn-small" style="margin-top:16px; width:100%;" @click="logout">退出登录</button>
            </div>
        </aside>

        <main class="main-content">
            <h2 class="page-title">{{ pageTitle }}</h2>

            ${studentTemplate}
            ${teacherTemplate}
        </main>
    </div>

    ${modalsTemplate}
</div>
`;
