# GrowthLink — 大学生成长规划系统 (PDP-System)

## 🚀 快速启动

> ⚠️ **本项目必须使用 Python 3.11**。不支持 Python 3.12 / 3.13 / 3.14。
> 如果没有 Python 3.11，请先从 https://www.python.org/downloads/release/python-3119/ 下载安装。

### 1. 安装 Python 3.11

请安装 Python 3.11，并在安装时勾选：

```text
Add python.exe to PATH
```

安装完成后，在 PowerShell 中检查：

```powershell
py -3.11 --version
```

看到类似下面的输出即可：

```text
Python 3.11.x
```

### 2. 启动系统

解压项目后，直接双击根目录下的：

```text
start.bat
```

`start.bat` 会自动完成：

1. 创建 `.venv311` 虚拟环境
2. 安装 `requirements.txt` 中的依赖
3. 初始化数据库
4. 启动单服务应用（后端和前端都在 8001 端口）

启动后会打开一个黑色命令行窗口，请不要关闭。

### 3. 如果启动或登录失败

如果出现以下情况：

- 后端窗口报错
- 能打开网页但无法登录
- `.venv311` 使用了错误的 Python 版本
- 误用了 Python 3.14
- 依赖安装不完整
- `123 / 123` 演示账号无法登录

请先关闭所有黑色命令行窗口，然后双击根目录下的：

```text
repair_and_start.bat
```

`repair_and_start.bat` 会自动完成：

1. 检查 Python 3.11 是否可用
2. 检查 `.venv311` 是否使用 Python 3.11
3. 如果 `.venv311` 不是 Python 3.11，则自动删除并重建
4. 重新安装依赖
5. 初始化数据库
6. 刷新 `123 / 123` 演示账号数据
7. 重新启动单服务应用

> 简单来说：**正常运行用 `start.bat`，出问题就用 `repair_and_start.bat`。**

### 4. 访问系统

浏览器打开：

```text
http://127.0.0.1:8001
```

API 文档：

```text
http://127.0.0.1:8001/docs
```

### 5. 演示账号

| 用户名 | 密码 | 说明 |
|---|---|---|
| UIBE | 123 | 学生 / 教师演示账号 |
| 123 | 123 | 第二个学生演示账号，用于大众数据对比分析 |

---

## 📦 手动部署方式

如果 `start.bat` 无法正常运行，可以手动执行以下命令。

进入项目根目录：

```powershell
cd C:\pdp-system
```

创建 Python 3.11 虚拟环境：

```powershell
py -3.11 -m venv .venv311
```

激活虚拟环境：

```powershell
.venv311\Scripts\activate
```

安装依赖：

```powershell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

初始化数据库：

```powershell
python -m app.db.init_db
```

启动应用（后端会同时托管前端页面）：

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

然后浏览器访问：

```text
http://127.0.0.1:8001
```

---

## 项目简介

项目名称：大学生成长规划系统

项目主题：围绕大学生个人成长与发展需求，帮助用户管理并分析自己的成绩与成就，与大众进行对比，从而更清晰地了解自己的水平并规划未来的发展。

## 小组成员

- 组长：李梓欣
- 成员：李晔、魏吾嘉、王颖超、薛军浩

## 主要功能

- 模块0：用户登录与身份认证
- 模块1：课程成绩管理与 GPA 计算
- 模块2：成就与经历管理
- 模块3：简历生成
- 模块4：学生 / 教师权限视图切换
- 模块5：大众数据对比分析

## 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Python + FastAPI
- 数据库：SQLite
- ORM / 数据模型：SQLModel / SQLAlchemy
- API 文档：FastAPI 自动生成 Swagger 文档

## 常见问题

### 1. 能打开网页但无法登录

这通常说明前端已经启动，但后端或数据库存在问题。请先关闭所有黑色命令行窗口，然后双击：

```text
repair_and_start.bat
```

它会自动修复 Python 虚拟环境、安装依赖、初始化数据库、刷新演示账号并重新启动系统。

---

### 2. 后端报 Pydantic / unable to infer type 错误

如果报错中出现：

```text
C:\Python314\Lib\...
pydantic.errors.ConfigError: unable to infer type for attribute "name"
```

说明误用了 Python 3.14。

解决方法：

1. 关闭所有后端 / 前端窗口
2. 删除项目根目录下的 `.venv311` 文件夹
3. 安装 Python 3.11
4. 重新双击 `start.bat`

### 3. 浏览器打不开页面

请确认：

1. 启动后的黑色命令行窗口没有关闭
2. 浏览器访问的是 `http://127.0.0.1:8001`
3. 如 Windows 防火墙弹窗，请点击“允许访问”

### 4. 端口被占用

如果 8001 端口被占用，请关闭占用端口的程序，或重启电脑后重新运行 `start.bat`。
