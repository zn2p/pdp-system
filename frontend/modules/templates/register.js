export const registerTemplate = `
<div v-if="showRegister" class="login-container">
    <div class="brand-login">🎓 GrowthLink</div>
    <div style="color: var(--text-tertiary, #87867f); margin-bottom: 32px;">创建新账号</div>
    <div><label class="input-label">用户名</label><input v-model="registerForm.username" class="input-field" placeholder="用户名"></div>
    <div v-if="registerForm.role === 'student'"><label class="input-label">学号</label><input v-model="registerForm.student_id" class="input-field" placeholder="请输入学号"></div>
    <div><label class="input-label">密码</label><input v-model="registerForm.password" type="password" class="input-field" placeholder="密码"></div>
    <div><label class="input-label">确认密码</label><input v-model="registerForm.confirm" type="password" class="input-field" placeholder="再次输入密码"></div>
    <label class="input-label">身份</label>
    <div class="role-switch">
        <button class="role-option" :class="{active: registerForm.role === 'student'}" @click="registerForm.role='student'">🧑‍🎓 学生</button>
        <button class="role-option" :class="{active: registerForm.role === 'staff'}" @click="registerForm.role='staff'">👩‍🏫 教师</button>
    </div>
    <div v-if="registerError" style="color:#b53333; font-size:13px; margin-bottom:12px;">{{ registerError }}</div>
    <button class="btn btn-brand" @click="handleRegister">注册</button>
    <div style="margin-top:16px; text-align:center; font-size:14px; color:var(--text-secondary);">
        已有账号？<span style="color:var(--color-terracotta); cursor:pointer;" @click="showRegister=false">返回登录</span>
    </div>
</div>
`;
