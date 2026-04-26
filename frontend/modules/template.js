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
            <div class="role-summary-card">
                <div class="module-eyebrow">模块4</div>
                <strong>{{ roleDisplayName }}视图</strong>
                <p class="text-muted">当前菜单、数据卡片与分析入口已按角色组织。</p>
            </div>
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
            <div class="module-banner">
                <div>
                    <div class="module-eyebrow">{{ activeModule.module }}</div>
                    <div class="module-heading-row">
                        <h3>{{ activeModule.heading }}</h3>
                        <span class="module-badge">{{ roleDisplayName }}视图</span>
                    </div>
                    <p class="module-description">{{ activeModule.description }}</p>
                </div>
                <div class="module-badges">
                    <span v-for="tag in activeModule.tags" :key="tag" class="module-badge">{{ tag }}</span>
                </div>
            </div>

            ${studentTemplate}
            ${teacherTemplate}
        </main>
    </div>

    ${modalsTemplate}
</div>
`;
