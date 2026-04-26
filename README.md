# GrowthLink — 后端骨架

快速上手：

1. 创建并激活 Python 环境（推荐 Python 3.11）

```bash
python -m venv .venv311
.venv311\Scripts\activate
pip install -r requirements.txt
```

2. 初始化数据库并创建示例用户

```bash
python -m app.db.init_db
```

示例账户：`student` / `123`

3. 运行开发服务器

```bash
uvicorn app.main:app --reload
```

打开系统首页: http://127.0.0.1:8000  
API 文档: http://127.0.0.1:8000/docs
# pdp-system
Personal Development Planning System

## 项目简介
项目名称：大学生成长规划系统
项目主题：围绕大学生个人成长与发展需求，帮助用户管理并分析自己的成绩与成就，与大众进行对比从而更清晰地了解自己的水平并规划未来的发展。

## 小组成员
- 组长：李梓欣
- 成员：李晔、魏吾嘉、王颖超、薛军浩

## 需求文档

本项目的详细业务需求、功能规格及验收标准请参阅：

- **[下载 Markdown 版本](./docs/requirements/完整需求.md)**
- **[下载 Word 版本](./docs/requirements/功能需求.docx)**

功能需求文档包含以下模块：
- 模块0：用户登录与身份认证
- 模块1：课程成绩管理（GPA计算）
- 模块2：成就与经历管理
- 模块3：简历生成
- 模块4：权限视图切换
- 模块5：大众数据对比分析

## 在线演示
- [点击预览系统原型](./docs/prototype/网页原型.html)


## 开发说明

主要使用 FastAPI + SQLModel 搭建基础骨架，包含示例路由、数据库模型、CRUD、测试与 Dockerfile。

快速运行（推荐在虚拟环境中执行）：

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

默认部署形态为**单服务部署**：FastAPI 会直接托管 `frontend` 目录下的前端静态资源，因此正式部署时只需要启动后端服务并访问根路径 `/`，不需要再单独启动一个前端静态服务器。

运行测试：

```bash
pytest -q
```

