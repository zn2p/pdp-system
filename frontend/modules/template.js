import { loginTemplate } from "./templates/login.js";
import { studentTemplate } from "./templates/student.js";
import { teacherTemplate } from "./templates/teacher.js";
import { modalsTemplate } from "./templates/modals.js";

export const appTemplate = `
<div>
    ${loginTemplate}

    <div v-else class="app-layout">
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
