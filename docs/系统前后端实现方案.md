# 系统前后端实现方案

> **项目名称**: pdp-system（个人成长数据可视化系统）  
> **文档日期**: 2026-04-26

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术栈总览](#2-技术栈总览)
3. [后端实现](#3-后端实现)
   - [项目结构](#31-项目结构)
   - [入口与启动](#32-入口与启动)
   - [数据库模型](#33-数据库模型)
   - [API 接口设计](#34-api-接口设计)
   - [认证与安全](#35-认证与安全)
   - [数据初始化](#36-数据初始化)
4. [前端实现](#4-前端实现)
   - [项目结构](#41-项目结构)
   - [入口与挂载](#42-入口与挂载)
   - [状态管理](#43-状态管理)
   - [API 通信层](#44-api-通信层)
   - [业务逻辑（Composables）](#45-业务逻辑composables)
   - [页面模板](#46-页面模板)
5. [前后端交互流程](#5-前后端交互流程)
6. [部署方案](#6-部署方案)
7. [环境配置](#7-环境配置)

---

## 1. 系统概述

本系统面向**高校学生与教师**，提供个人成长数据的录入、可视化与横向比较分析。核心功能分为两个角色：

| 角色 | 功能 |
|------|------|
| **学生（student）** | 录入课程/成绩、管理成就、生成简历、查看成长对比 |
| **教师/管理员（staff）** | 管理学生列表、导入基准数据、发起群体横向对比分析 |

---

## 2. 技术栈总览

| 层次 | 技术选型 |
|------|---------|
| **后端框架** | FastAPI 0.95.2 |
| **ASGI 服务器** | Uvicorn 0.22.0 |
| **数据库** | SQLite（文件 `pdp.db`） |
| **ORM** | SQLAlchemy 1.4.49 + SQLModel 0.0.8 |
| **数据验证** | Pydantic 1.10.12 |
| **认证** | JWT（python-jose，HS256 算法） |
| **密码哈希** | Passlib（pbkdf2_sha256 + bcrypt 双算法） |
| **前端框架** | Vue 3.2.47（CDN，无构建工具） |
| **图表库** | Chart.js 4.4.0 |
| **图标** | FontAwesome 6.0.0 |
| **容器化** | Docker（python:3.11-slim） |

---

## 3. 后端实现

### 3.1 项目结构

```
app/
├── main.py              # FastAPI 应用入口
├── api/
│   └── v1/
│       ├── routes.py    # 健康检查 & Item CRUD
│       ├── auth.py      # 注册 & 登录
│       ├── students.py  # 学生管理
│       ├── courses.py   # 课程管理
│       ├── achievements.py  # 成就管理
│       ├── teachers.py  # 教师功能
│       └── files.py     # 文件上传
├── core/
│   ├── config.py        # 全局配置（Pydantic Settings）
│   └── security.py      # JWT & 密码工具
├── db/
│   ├── session.py       # 数据库会话工厂
│   └── init_db.py       # 建表 & 种子数据
├── models/              # SQLAlchemy 数据模型
└── schemas/
    └── schemas.py       # Pydantic 请求/响应 Schema
```

### 3.2 入口与启动

**[app/main.py](app/main.py)**

```python
app = FastAPI(title="pdp-system")

# CORS 配置（允许前端开发服务器跨域）
origins = ["http://127.0.0.1:5500", "http://localhost:5500"]
app.add_middleware(CORSMiddleware, allow_origins=origins, ...)

# 注册 API 路由（统一前缀 /api/v1）
app.include_router(auth_router, prefix="/api/v1")
app.include_router(students_router, prefix="/api/v1")
# ... 其余路由

# SPA 静态文件托管（404 → index.html）
app.mount("/", SPAStaticFiles(directory="frontend", html=True))

# 启动事件：自动建表
@app.on_event("startup")
def startup():
    init_db()
```

- 监听端口：**8000**
- 开发模式下开启热重载（`--reload`）
- 通过自定义 `SPAStaticFiles` 处理器，将 Vue 单页路由的 404 请求重定向到 `frontend/index.html`

### 3.3 数据库模型

#### User（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `username` | String | 用户名（索引） |
| `password_hash` | String | 密码哈希 |
| `display_name` | String? | 显示名称 |
| `role` | String | `student` / `staff`，默认 `student` |
| `email` | String? | 邮箱 |
| **约束** | UNIQUE(username, role) | 同角色用户名唯一 |

#### Student（学生信息表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `user_id` | FK → users.id | 关联用户 |
| `student_id` | String | 学号（唯一） |
| `school` | String? | 学校 |
| `major` | String? | 专业 |
| `grad_year` | String? | 毕业年份 |
| `phone` | String? | 电话 |
| `photo_path` | String? | 头像路径 |

#### Course（课程表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `student_id` | FK → students.id | 关联学生 |
| `name` | String | 课程名称（必填） |
| `code` | String? | 课程代码 |
| `semester` | String? | 学期 |
| `credit` | Float? | 学分 |
| `grade` | Float? | 成绩（0-100） |
| `teacher` | String? | 授课教师 |
| `rank` | String? | 班级排名 |
| `note` | String? | 备注 |

#### Achievement（成就表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `student_id` | FK → students.id | 关联学生 |
| `name` | String | 成就名称（必填） |
| `type` | String? | 类型：竞赛/项目/证书/实习 |
| `date` | String? | 时间 |
| `org` | String? | 颁发机构/组织 |
| `level` | String? | 级别：中级/省级等 |
| `description` | Text? | 详细描述 |
| `tags` | String? | 标签（逗号分隔） |
| `attachment_path` | String? | 附件路径 |

#### File（文件表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `owner_id` | FK → users.id | 所有者 |
| `path` | String | 文件存储路径 |
| `filename` | String | 原始文件名 |
| `mime` | String? | MIME 类型 |
| `size` | Integer? | 文件大小（字节） |

#### TeacherStudent（师生关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer PK | 主键 |
| `teacher_id` | FK → users.id | 教师 |
| `student_id` | FK → students.id | 学生 |
| **约束** | UNIQUE(teacher_id, student_id) | 防止重复绑定 |

### 3.4 API 接口设计

所有业务接口统一前缀：`/api/v1/`

#### 认证模块（`auth.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| POST | `/auth/register` | 注册（学生同时创建 Student 记录） | 无 |
| POST | `/auth/login` | 登录，返回 JWT Token | 无 |

**登录响应**：
```json
{
  "access_token": "<JWT>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 学生模块（`students.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| GET | `/students` | 分页查询（`?page=1&limit=20&q=搜索`） | 可选 |
| POST | `/students` | 创建学生记录 | 可选 |
| GET | `/students/{student_id}` | 学生详情（含课程与成就） | 可选 |

#### 课程模块（`courses.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| GET | `/students/{student_id}/courses` | 获取该学生所有课程 | 可选 |
| POST | `/students/{student_id}/courses` | 新增课程 | 可选 |

#### 成就模块（`achievements.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| GET | `/students/{student_id}/achievements` | 获取成就列表 | 可选 |
| POST | `/students/{student_id}/achievements` | 新增成就 | 可选 |
| PUT | `/students/{student_id}/achievements/{id}` | 修改成就（动态字段更新） | 可选 |
| DELETE | `/students/{student_id}/achievements/{id}` | 删除成就 | 可选 |

#### 文件模块（`files.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| POST | `/files/upload` | 上传文件至 `./uploads/`，返回 URL 和元数据 | 可选 |

#### 教师模块（`teachers.py`）
| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| GET | `/teachers/available-students` | 查询所有可绑定的学生用户 | **Bearer Token 必填** |
| GET | `/teachers/my-students` | 获取当前教师已绑定的学生 | **Bearer Token 必填** |
| POST | `/teachers/my-students` | 绑定学生（`{student_record_id}`） | **Bearer Token 必填** |

#### 系统模块（`routes.py`）
| Method | Path | 描述 |
|--------|------|------|
| GET | `/health` | 健康检查，返回 `{status: "ok"}` |

### 3.5 认证与安全

**[app/core/security.py](app/core/security.py)**

- **密码存储**：Passlib 多算法上下文（pbkdf2_sha256 为主，bcrypt 为回退），不存储明文
- **JWT 生成**：
  - Payload：`{sub: user_id, exp: 过期时间戳}`
  - 签名算法：HS256
  - 默认有效期：60 分钟
- **接口保护**：教师接口使用 `HTTPBearer` 依赖注入进行 Token 校验

```python
# 核心函数
verify_password(plain_text, hashed)   → bool
get_password_hash(password)            → str
create_access_token(subject, expires)  → JWT string
```

> ⚠️ **注意**：`SECRET_KEY` 默认值为 `change-me-in-production`，生产部署前必须通过 `.env` 文件替换为随机强密钥。

### 3.6 数据初始化

**[app/db/init_db.py](app/db/init_db.py)** 在应用启动时执行：

1. 调用 `Base.metadata.create_all()` 建立所有数据表
2. 若数据库为空，写入默认种子用户：
   - 学生账号：`username=UIBE / password=123 / role=student`
   - 教师账号：`username=UIBE / password=123 / role=staff`

---

## 4. 前端实现

### 4.1 项目结构

```
frontend/
├── index.html           # SPA 入口，引入 CDN 依赖
├── app.js               # Vue 应用创建与挂载
├── styles.css           # 全局样式
├── serve.py             # 开发用本地静态服务（端口 5500）
└── modules/
    ├── app.js           # 根组件（路由切换 + 导航）
    ├── state.js         # 全局状态编排层（useAppState）
    ├── template.js      # 模板工具函数
    ├── constants.js     # 初始化数据 & 常量
    ├── composables/     # 业务逻辑 Composables
    │   ├── useAuth.js
    │   ├── useCourses.js
    │   ├── useAchievements.js
    │   ├── useResume.js
    │   ├── useCompare.js
    │   ├── useTeacher.js
    │   ├── useCharts.js
    │   └── useToasts.js
    ├── templates/        # 页面 HTML 模板字符串
    │   ├── login.js
    │   ├── register.js
    │   ├── modals.js
    │   ├── student.js
    │   └── teacher.js
    └── shared/
        ├── api.js        # Fetch 工厂函数
        └── constants.js  # 共享元数据
```

### 4.2 入口与挂载

**[frontend/index.html](frontend/index.html)**

```html
<!-- CDN 依赖加载 -->
<script src="https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- API Base 配置 -->
<script>window.__API_BASE__ = window.location.origin || "http://127.0.0.1:8001"</script>

<div id="app"></div>
<script type="module" src="./app.js"></script>
```

**[frontend/app.js](frontend/app.js)**

```js
import App from './modules/app.js'
Vue.createApp(App).mount('#app')
```

### 4.3 状态管理

**[frontend/modules/state.js](frontend/modules/state.js)** — 组合式状态中心

采用 **Vue 3 Composition API** 的 Composables 模式（无 Vuex / Pinia），通过 `useAppState()` 将所有子 Composable 组合并对外暴露统一状态树：

```
useAppState()
├── useAuth()          → token, currentUser, currentRole, login/logout
├── useCourses()       → courses[], GPA 计算, CRUD
├── useAchievements()  → achievements[], 分类过滤, CRUD
├── useResume()        → basicInfo, 简历完整度, 预览/导出
├── useCompare()       → 对比维度选择, 群体对比分析
├── useTeacher()       → 师生管理, 教师对比功能
├── useCharts()        → Chart.js 实例管理
├── useToasts()        → 全局通知消息
└── currentPage        → 当前页面路由（字符串状态机）
```

**Token 持久化**：登录后 JWT 存入 `localStorage`（键：`pdp_token`），页面刷新后自动恢复登录状态。

**菜单动态计算**：
```js
const menuItems = computed(() => {
  if (currentRole.value === 'staff') return ['home', 'students', 'compare']
  return ['home', 'courses', 'achievements', 'resume', 'compare']
})
```

### 4.4 API 通信层

**[frontend/modules/shared/api.js](frontend/modules/shared/api.js)**

```js
export function createApiFetch(tokenRef) {
  return async function apiFetch(path, options = {}) {
    const headers = {}
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    if (tokenRef.value) {
      headers['Authorization'] = `Bearer ${tokenRef.value}`
    }
    const res = await fetch(`${window.__API_BASE__}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  }
}
```

特性：
- 自动注入 `Content-Type: application/json`（FormData 请求除外）
- 自动附加 `Authorization: Bearer <token>`
- 响应自动按 Content-Type 解析为 JSON 或文本
- 非 2xx 响应抛出带状态码的错误

### 4.5 业务逻辑（Composables）

#### useAuth.js
- **职责**：用户认证状态管理
- **核心状态**：`token`、`isLoggedIn`、`currentUser`、`currentRole`
- **核心方法**：
  - `performLogin()` → POST `/api/v1/auth/login` → 写入 token 和 role
  - `handleRegister()` → POST `/api/v1/auth/register`
  - `clearAuthState()` → 清空 token + localStorage

#### useCourses.js
- **职责**：课程数据管理与 GPA 计算
- **GPA 换算规则**：

  | 成绩区间 | GPA |
  |---------|-----|
  | ≥ 90 | 4.0 |
  | ≥ 85 | 3.7 |
  | ≥ 82 | 3.3 |
  | ≥ 78 | 3.0 |
  | ≥ 75 | 2.7 |
  | ≥ 72 | 2.3 |
  | ≥ 68 | 2.0 |
  | < 68 | 1.0 |

- **计算属性**：`totalGpa`、`avgScore`、`totalCredits`、`highestCourse`、`courseOverviewStats`
- **核心方法**：`saveCourse()`（新增/编辑）、`deleteCourse()`、`toggleCourseDetail()`

#### useAchievements.js
- **职责**：成就数据管理（竞赛、项目、证书、实习四类）
- **分类过滤计算属性**：`awardItems`、`projectItems`、`certItems`、`internshipItems`
- **核心方法**：`saveAchievement()`（含附件上传）、`deleteAchievement()`、`handleAttachment()`

#### useResume.js
- **职责**：简历信息管理与完整度评估
- **基础信息**：`name`、`gender`、`phone`、`email`、`jobTarget`、`school`、`major`、`degree`、`gradYear`、`photo`
- **完整度计算**：5 个必填字段（姓名、电话、邮箱、学校、专业）占比
- **核心方法**：`saveBasicInfo()`、`handlePhoto()`、`previewFullResume()`、`exportResume(format)`

#### useCompare.js
- **职责**：学生维度横向对比分析
- **对比维度**：`gpa`（GPA 排名）、`course`（课程修读）、`competition`（竞赛经历）、`internship`（实习经历）、`award`（获奖情况）、`cert`（证书持有）
- **核心方法**：`handleBenchmarkFile()`（上传基准数据）、`importBenchmark()`、`runComparison()`

#### useTeacher.js
- **职责**：教师视角下的学生管理与群体对比
- **核心方法**：
  - `openAddStudentModal()` → 调用 `GET /api/v1/teachers/available-students`
  - `addNewStudent()` → 调用 `POST /api/v1/teachers/my-students`
  - `runTeacherComparison()` → 教师发起的群体对比分析

#### useCharts.js
- **职责**：Chart.js 图表实例的创建与更新
- **图表**：
  - `#studentGpaChart`：柱状图，按学期展示 GPA 趋势（学生端）
  - `#compareChart`：柱状图，个人 vs 群体均值对比（学生端）
  - `#teacherCompareChart`：柱状图，教师端群体对比结果

#### useToasts.js
- **职责**：全局 Toast 通知
- `showToast(message, duration?, type?)` → 自动消失的消息提示

### 4.6 页面模板

所有 UI 以 **ES6 模板字符串** 形式定义，在 Vue `template` 选项中动态绑定，无 `.vue` 单文件组件。

| 模板文件 | 覆盖页面 |
|---------|---------|
| [templates/login.js](frontend/modules/templates/login.js) | 登录表单（用户名/密码/角色切换） |
| [templates/register.js](frontend/modules/templates/register.js) | 注册表单（含角色选择） |
| [templates/student.js](frontend/modules/templates/student.js) | 学生端全页面：首页/课程/成就/简历/对比 |
| [templates/teacher.js](frontend/modules/templates/teacher.js) | 教师端全页面：首页/学生列表/对比分析 |
| [templates/modals.js](frontend/modules/templates/modals.js) | 所有弹窗：课程编辑/成就编辑/基础信息/简历预览/选学生 |

**学生端页面结构**：
- **首页**：GPA 概览 Hero + 功能入口卡片（课程、成就、简历）
- **课程页**：成绩统计卡片、GPA 计算方式切换、课程列表（展开/编辑/删除）、GPA 趋势图
- **成就页**：按类型分区展示、附件预览支持
- **简历页**：模板选择（单栏/双栏）、信息完整度检测、预览与导出
- **对比页**：维度勾选、基准数据导入（Excel/CSV）、对比运行、Chart.js 结果展示

**教师端页面结构**：
- **首页**：统计卡片（学生数、对比次数）
- **学生页**：简历卡片式展示（姓名、求职意向、学校、GPA、实习/项目/获奖数量）
- **对比页**：学生选择、基准文件上传、维度/时间范围配置、群体对比图表

---

## 5. 前后端交互流程

### 5.1 登录流程

```
用户输入账号密码 & 角色
    ↓
前端 performLogin()
    ↓ POST /api/v1/auth/login {username, password, role}
后端验证用户名+角色+密码
    ↓ 返回 {access_token, token_type, expires_in}
前端写入 localStorage(pdp_token)
前端根据 role 切换菜单与页面
```

### 5.2 学生数据流程

```
登录后进入学生端
    ↓
GET /api/v1/students/{student_id}   →  加载学生基础信息
GET /api/v1/students/{student_id}/courses  →  加载课程列表
GET /api/v1/students/{student_id}/achievements  →  加载成就列表
    ↓
Vue computed 属性自动计算 GPA / 统计 / 图表数据
    ↓
用户增删改 → POST/PUT/DELETE API → 后端落库 → 前端响应式更新
```

### 5.3 教师管理学生流程

```
教师登录（role=staff）
    ↓
GET /api/v1/teachers/my-students   →  加载已绑定学生列表
    ↓ （教师添加学生时）
GET /api/v1/teachers/available-students  →  查询可选学生（需 Bearer Token）
POST /api/v1/teachers/my-students {student_record_id}  →  建立师生绑定
```

---

## 6. 部署方案

### 6.1 本地开发

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 启动后端（端口 8000）
uvicorn app.main:app --reload --port 8000

# 3. 前端通过后端直接托管（SPA StaticFiles）
# 访问 http://127.0.0.1:8000
```

或使用快捷脚本：

```bash
# Windows
.\start.bat
```

### 6.2 Docker 部署

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t pdp-system .
docker run -p 8000:8000 pdp-system
```

> 注意：SQLite 数据库文件 `pdp.db` 存储在容器内，需挂载 Volume 持久化：  
> `docker run -p 8000:8000 -v $(pwd)/data:/app pdp-system`

---

## 7. 环境配置

配置项通过 `app/core/config.py`（Pydantic BaseSettings）管理，支持 `.env` 文件覆盖：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `PROJECT_NAME` | `pdp-system` | 项目名称 |
| `SECRET_KEY` | `change-me-in-production` | JWT 签名密钥（**生产环境必须修改**） |
| `ALGORITHM` | `HS256` | JWT 签名算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token 有效期（分钟） |
| `DATABASE_URL` | `sqlite:///./pdp.db` | 数据库连接字符串 |

**生产环境 `.env` 示例**：

```env
SECRET_KEY=your-random-64-char-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=480
DATABASE_URL=sqlite:///./data/pdp.db
```
