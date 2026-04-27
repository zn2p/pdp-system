# GrowthLink 开发参与指南

> 面向第一次参与本项目的同学，从零开始参与模块开发。

---

## 目录

1. [项目概览](#1-项目概览)
2. [环境搭建](#2-环境搭建)
3. [项目结构速览](#3-项目结构速览)
4. [启动项目](#4-启动项目)
5. [后端开发：如何新增一个接口](#5-后端开发如何新增一个接口)
6. [前端开发：如何新增一个功能模块](#6-前端开发如何新增一个功能模块)
7. [前后端联调](#7-前后端联调)
8. [调试技巧](#8-调试技巧)
9. [提交代码前检查清单](#9-提交代码前检查清单)
10. [各模块负责人与分工](#10-各模块负责人与分工)

---

## 1. 项目概览

**GrowthLink（大学生成长规划系统）** 帮助学生管理成绩、记录成就，并通过数据对比了解自身水平、规划未来。

技术栈：

| 层次 | 技术 |
|------|------|
| 后端 | Python 3.11 + FastAPI + SQLAlchemy + SQLite |
| 前端 | Vue 3（CDN 版，无需 Node.js） + 原生 JS 模块 |
| 鉴权 | JWT（python-jose） |

---

## 2. 环境搭建

### 前提条件

- 安装 [Python 3.11](https://www.python.org/downloads/)（勾选"Add to PATH"）
- 安装 [Git](https://git-scm.com/)
- 推荐使用 [VS Code](https://code.visualstudio.com/)

### 步骤

```bash
# 1. 克隆仓库
git clone <仓库地址>
cd pdp-system

# 2. 创建虚拟环境（只需做一次）
python -m venv .venv311

# 3. 激活虚拟环境
# Windows PowerShell：
.venv311\Scripts\Activate.ps1
# Windows CMD：
.venv311\Scripts\activate.bat

# 4. 安装依赖
pip install -r requirements.txt
```

> **常见问题**：PowerShell 提示"执行策略"错误时，先执行：
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`

---

## 3. 项目结构速览

```
pdp-system/
├── app/                    ← 后端（FastAPI）
│   ├── main.py             ← 应用入口，路由注册
│   ├── api/v1/             ← 各业务接口文件
│   │   ├── auth.py         ← 模块0：登录 / 注册
│   │   ├── courses.py      ← 模块1：课程成绩
│   │   ├── achievements.py ← 模块2：成就经历
│   │   ├── files.py        ← 模块3：文件上传
│   │   ├── students.py     ← 学生信息
│   │   └── teachers.py     ← 教师视图
│   ├── models/             ← 数据库表定义（SQLAlchemy ORM）
│   ├── schemas/            ← 请求 / 响应数据结构（Pydantic）
│   │   └── schemas.py
│   ├── crud/               ← 数据库增删改查封装
│   ├── core/
│   │   ├── config.py       ← 配置项
│   │   └── security.py     ← 密码哈希、JWT 生成
│   └── db/
│       ├── session.py      ← 数据库连接
│       └── init_db.py      ← 初始化表结构 & 示例数据
├── frontend/               ← 前端（Vue 3 CDN）
│   ├── index.html          ← 页面入口
│   ├── app.js              ← Vue 应用挂载
│   ├── styles.css          ← 全局样式
│   └── modules/
│       ├── app.js          ← 根组件组装
│       ├── state.js        ← 全局状态 setup()
│       ├── template.js     ← 根组件模板
│       ├── composables/    ← 各业务逻辑（每个模块一个文件）
│       │   ├── useAuth.js      ← 登录/注册
│       │   ├── useCourses.js   ← 课程成绩
│       │   ├── useAchievements.js
│       │   ├── useResume.js
│       │   ├── useCompare.js
│       │   └── useTeacher.js
│       ├── templates/      ← 各页面 HTML 模板字符串
│       └── shared/
│           ├── api.js      ← 统一 fetch 封装（含 JWT）
│           └── constants.js
├── docs/                   ← 文档
├── tests/                  ← 自动化测试
└── requirements.txt
```

---

## 4. 启动项目

### 一键启动（推荐）

双击 `start.bat`，后端和前端会同时启动。

### 手动启动

**后端：**
```bash
# 激活虚拟环境后
python -m app.db.init_db   # 初始化数据库（首次运行）
uvicorn app.main:app --reload
```

**前端：**（另开一个终端）
```bash
cd frontend
python serve.py
```

| 服务 | 地址 |
|------|------|
| 前端页面 | http://127.0.0.1:5500 |
| 后端 API | http://127.0.0.1:8000 |
| API 文档（Swagger） | http://127.0.0.1:8000/docs |

**测试账号：**
- 学生：用户名 `UIBE`，密码 `123`，选择"学生"
- 教师：用户名 `UIBE`，密码 `123`，选择"教师"

---

## 5. 后端开发：如何新增一个接口

以"新增一个获取学生 GPA 的接口"为例，走一遍完整流程。

### 第一步：在 `schemas.py` 定义数据结构

打开 `app/schemas/schemas.py`，新增请求体或响应体的 Pydantic 模型：

```python
class GpaOut(BaseModel):
    student_id: int
    gpa: float

    class Config:
        orm_mode = True
```

### 第二步：在对应的路由文件里写接口

找到对应业务的文件（如 `app/api/v1/courses.py`），添加新的路由函数：

```python
from app.schemas.schemas import GpaOut

@router.get("/gpa", response_model=GpaOut)
def get_gpa(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    courses = student.courses
    if not courses:
        return {"student_id": student_id, "gpa": 0.0}
    gpa = sum(c.grade * c.credit for c in courses if c.grade and c.credit) \
        / sum(c.credit for c in courses if c.credit)
    return {"student_id": student_id, "gpa": round(gpa, 2)}
```

### 第三步：如果需要新建数据库表，在 `models/` 下新增模型文件

```python
# app/models/my_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.base import Base

class MyModel(Base):
    __tablename__ = "my_table"
    id = Column(Integer, primary_key=True, index=True)
    # ... 其他字段
```

然后在 `app/db/init_db.py` 顶部导入这个模型（使其被 `create_all` 注册）：

```python
from app.models.my_model import MyModel
```

### 第四步：重启后端，验证接口

打开 http://127.0.0.1:8000/docs，找到新接口，点击"Try it out"测试。

---

## 6. 前端开发：如何新增一个功能模块

以"新增大众数据对比模块的某个图表"为例。

### 第一步：在对应的 composable 中添加逻辑

打开 `frontend/modules/composables/useCompare.js`，添加数据加载函数和响应式变量：

```js
const compareData = ref(null);

async function loadCompareData() {
    const data = await apiFetch("/api/v1/compare/summary");
    compareData.value = data;
}

// 在 return 中暴露出去
return { compareData, loadCompareData };
```

### 第二步：在对应的模板文件中添加 HTML

打开或新建 `frontend/modules/templates/` 下对应的模板文件，写 Vue 模板字符串：

```js
// 在模板字符串里使用响应式变量
export const compareTemplate = `
<div v-if="compareData">
    <h3>全校 GPA 分布</h3>
    <div>平均 GPA：{{ compareData.avg_gpa }}</div>
</div>
`;
```

### 第三步：在 `state.js` 中组合模块

打开 `frontend/modules/state.js`，导入并调用新的 composable：

```js
import { useCompare } from "./composables/useCompare.js";

// 在 setup 函数里：
const compare = useCompare({ apiFetch });
// 将需要暴露给模板的变量 spread 出去
return {
    ...compare,
    // ...其他模块
};
```

### 第四步：在主模板中引用

在 `frontend/modules/template.js` 中，找到合适的位置插入模板引用或组件标签。

---

## 7. 前后端联调

### API 请求统一走 `apiFetch`

前端所有 HTTP 请求都通过 `frontend/modules/shared/api.js` 中的 `createApiFetch` 封装，它会自动携带 JWT Token。**不要直接使用 `fetch`。**

```js
// 正确用法（在 composable 内）：
const data = await apiFetch("/api/v1/students/1/courses");

// 错误用法：
const data = await fetch("http://127.0.0.1:8000/api/v1/students/1/courses");
```

### 查看后端报错

- 运行后端的终端窗口会打印详细错误信息
- 浏览器 F12 → Network 面板查看请求/响应内容
- http://127.0.0.1:8000/docs 可直接测试接口，排除后端问题

### 跨域问题

已在 `app/main.py` 配置 CORS，本地开发无需额外处理。

---

## 8. 调试技巧

### 后端打印调试

```python
import logging
logger = logging.getLogger(__name__)
logger.info("这里是调试信息：%s", some_variable)
```

### 前端打印调试

```js
console.log("当前数据：", someRef.value);
```

### 查看数据库内容

项目使用 SQLite，数据库文件是根目录下的 `pdp.db`（首次运行后生成）。  
推荐安装 VS Code 插件 **SQLite Viewer** 直接打开查看。

### 数据库结构变了怎么办

本地开发时，如果修改了 `models/` 中的字段，最简单的方式是删除 `pdp.db`，重新运行：

```bash
python -m app.db.init_db
```

---

## 9. 提交代码前检查清单

- [ ] 后端新接口已在 `/docs` Swagger 页面验证通过
- [ ] 前端页面在浏览器 F12 控制台无红色报错
- [ ] 没有把 `pdp.db` 数据库文件提交到 Git（已在 `.gitignore` 中排除）
- [ ] 没有硬编码密码或 token
- [ ] 代码中无 `console.log` 遗留调试输出（或已确认是有意保留的）

---

## 10. 各模块负责人与分工

| 模块 | 功能 | 对应后端文件 | 对应前端文件 |
|------|------|-------------|-------------|
| 模块0 | 登录 / 注册 | `api/v1/auth.py` | `composables/useAuth.js`、`templates/login.js`、`templates/register.js` |
| 模块1 | 课程成绩 / GPA | `api/v1/courses.py` | `composables/useCourses.js` |
| 模块2 | 成就与经历 | `api/v1/achievements.py` | `composables/useAchievements.js` |
| 模块3 | 简历生成 | `api/v1/files.py` | `composables/useResume.js` |
| 模块4 | 教师视图 | `api/v1/teachers.py` | `composables/useTeacher.js` |
| 模块5 | 数据对比分析 | （待开发） | `composables/useCompare.js`、`composables/useCharts.js` |

> 遇到问题先查 [API 文档](http://127.0.0.1:8000/docs)，再问组长。
