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

运行测试：

```bash
pytest -q
```

