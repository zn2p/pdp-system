export const loginTemplate = `
<div v-if="!isLoggedIn" class="login-container">
    <div class="brand-login">🎓 GrowthLink</div>
    <div style="color: var(--text-tertiary, #87867f); margin-bottom: 32px;">学生 · 教师 · 数据驱动成长</div>
    <div><label class="input-label">用户名</label><input v-model="loginForm.displayName" class="input-field" placeholder="你的姓名"></div>
    <div><label class="input-label">账号</label><input v-model="loginForm.username" class="input-field" placeholder="学号/工号"></div>
    <div><label class="input-label">密码</label><input v-model="loginForm.password" type="password" class="input-field" placeholder="密码"></div>
    <label class="input-label">身份</label>
    <div class="role-switch">
        <button class="role-option" :class="{active: loginForm.role === 'student'}" @click="loginForm.role='student'">🧑‍🎓 学生</button>
        <button class="role-option" :class="{active: loginForm.role === 'staff'}" @click="loginForm.role='staff'">👩‍🏫 教师</button>
    </div>
    <button class="btn btn-brand" @click="handleLogin">登录 · 进入系统</button>
    <div style="margin-top: 24px; font-size: 13px; color: var(--text-tertiary); text-align: center;">演示: student / 123  ·  staff / 123</div>
    <div class="module-overview-grid compact-grid">
        <div v-for="item in loginHighlights" :key="item.title" class="module-tile">
            <div class="module-eyebrow">{{ item.module }}</div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
        </div>
    </div>
</div>
`;
