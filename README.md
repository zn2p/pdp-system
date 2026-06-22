# GrowthLink — 大学生成长规划系统 (PDP-System)

## 0. 先看这里：最快运行方式

第一次打开项目的老师/助教，请按下面顺序操作。

### 推荐运行步骤

1. **安装 Python 3.11**（如已安装可跳过）
   - 下载地址：https://www.python.org/downloads/release/python-3119/
   - 安装时务必勾选：`Add python.exe to PATH`
   - 本项目不支持 Python 3.12 / 3.13 / 3.14

2. **解压项目到全英文路径**
   - 推荐：`C:\pdp-system\`
   - 不推荐：`C:\Users\用户名\桌面\期末大作业\`

3. **双击项目根目录下的 `start.bat` 启动系统**
   - 首次启动会自动创建 `.venv311` 虚拟环境
   - 首次启动会自动安装依赖，需要联网，可能等待 3-5 分钟
   - 启动后会出现黑色命令行窗口，请不要关闭

4. **浏览器访问系统**

```text
http://127.0.0.1:8001
```

5. **使用演示账号登录**

| 用户名 | 密码 | 说明 |
|---|---|---|
| UIBE | 123 | 学生 / 教师演示账号 |

> 如启动失败，请关闭所有黑色命令行窗口后，双击 `repair_and_start.bat` 一键修复。

API 接口文档（架构展示）：

```text
http://127.0.0.1:8001/docs
```

---

## 1. 环境要求

| 环境 | 要求 |
|---|---|
| 操作系统 | Windows 10 / Windows 11 |
| Python | Python 3.11 |
| 浏览器 | Chrome / Edge 均可 |
| 网络 | 首次启动需要联网安装依赖 |

可在 PowerShell 中执行以下命令确认 Python 3.11 是否可用：

```powershell
py -3.11 --version
```

---

## 2. 一键启动说明（推荐）

确认已经安装 Python 3.11 后，直接双击项目根目录下的：

```text
start.bat
```

`start.bat` 会自动完成以下工作：

1. 自动进入项目根目录
2. 如果没有 `.venv311/`，自动创建 Python 3.11 虚拟环境
3. 自动安装 `requirements.txt` 中的依赖
4. 自动初始化数据库
5. 自动启动单服务应用（后端和前端都在 8001 端口）

启动成功后，在浏览器访问：

```text
http://127.0.0.1:8001
```

请注意：启动后出现的黑色命令行窗口是服务器窗口，使用系统期间不要关闭。

---

## 3. 修复启动方式

如果出现以下情况：

- 后端窗口报错
- 能打开网页但无法登录
- `.venv311` 使用了错误的 Python 版本
- 误用了 Python 3.14
- 依赖安装不完整
- 演示账号无法登录

请先关闭所有黑色命令行窗口，然后双击项目根目录下的：

```text
repair_and_start.bat
```

`repair_and_start.bat` 会自动完成：

1. 检查 Python 3.11 是否可用
2. 检查 `.venv311` 是否使用 Python 3.11
3. 如果 `.venv311` 不是 Python 3.11，则自动删除并重建
4. 重新安装依赖
5. 初始化数据库
6. 重新启动系统

简单来说：

```text
正常运行：start.bat
出问题：repair_and_start.bat
```

---

## 4. 手动部署方式（备用）

如果不想使用批处理脚本，也可以手动部署。

### 4.1 进入项目根目录

假设项目解压在：

```text
C:\pdp-system\
```

则在 PowerShell 中执行：

```powershell
cd C:\pdp-system
```

### 4.2 创建 Python 3.11 虚拟环境

```powershell
py -3.11 -m venv .venv311
```

如果电脑里只有 Python 3.11，也可以使用：

```powershell
python -m venv .venv311
```

### 4.3 激活虚拟环境

```powershell
.venv311\Scripts\activate
```

### 4.4 安装依赖

```powershell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 4.5 初始化数据库

```powershell
python -m app.db.init_db
```

### 4.6 启动应用

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

然后浏览器访问：

```text
http://127.0.0.1:8001
```

---

## 5. 常见问题

### 5.1 双击 `start.bat` 后提示找不到 Python

原因：电脑没有安装 Python 3.11，或安装时没有勾选 `Add python.exe to PATH`。

解决方式：

1. 安装 Python 3.11
2. 安装时勾选 `Add python.exe to PATH`
3. 重新双击 `start.bat`

---

### 5.2 后端报 Pydantic / unable to infer type 错误

如果后端窗口出现类似报错：

```text
pydantic.errors.ConfigError: unable to infer type for attribute "name"
```

并且报错路径中出现：

```text
C:\Python314\Lib\...
```

说明当前虚拟环境使用了 Python 3.14。本项目依赖版本适配 Python 3.11，不支持 Python 3.14。

解决方式：

1. 关闭所有后端 / 前端 / start.bat 窗口
2. 删除项目根目录下的 `.venv311/` 文件夹
3. 安装 Python 3.11
4. 确认 Python 3.11 可用：

```powershell
py -3.11 --version
```

5. 重新双击 `start.bat`

也可以直接双击：

```text
repair_and_start.bat
```

---

### 5.3 pip install 速度很慢或失败

`start.bat` 默认使用清华镜像源安装依赖，正常情况下速度较快。

如果仍然失败，请检查网络连接，或手动执行：

```powershell
.venv311\Scripts\activate
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

### 5.4 浏览器打不开页面

请确认：

1. `start.bat` 启动后的黑色命令行窗口没有关闭
2. 浏览器访问的是：`http://127.0.0.1:8001`
3. 如果 Windows 防火墙弹窗，请点击“允许访问”

---

### 5.5 端口被占用

如果 8001 端口被其他程序占用，请先关闭占用端口的程序，或重启电脑后重新运行 `start.bat`。

---

### 5.6 能打开网页但无法登录 / 登录后没有演示数据

请确认项目根目录下存在：

```text
pdp.db
```

如果数据库不存在，可以执行：

```powershell
.venv311\Scripts\activate
python -m app.db.init_db
```

或者直接双击：

```text
repair_and_start.bat
```

---

## 6. 停止系统

关闭启动时的黑色命令行窗口即可停止系统。

也可以在命令行窗口中按：

```text
Ctrl + C
```

---

## 7. 项目简介

项目名称：大学生成长规划系统

项目主题：围绕大学生个人成长与发展需求，帮助用户管理并分析自己的成绩与成就，与大众进行对比，从而更清晰地了解自己的水平并规划未来的发展。

---

## 8. 小组成员

- 组长：李梓欣
- 成员：李晔、魏吾嘉、王颖超、薛军浩

---

## 9. 主要功能

- 模块0：用户登录与身份认证
- 模块1：课程成绩管理与 GPA 计算
- 模块2：成就与经历管理
- 模块3：简历生成
- 模块4：学生 / 教师权限视图切换
- 模块5：大众数据对比分析

---

## 10. 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Python + FastAPI
- 数据库：SQLite
- ORM / 数据模型：SQLModel / SQLAlchemy
- API 文档：FastAPI 自动生成 Swagger 文档

---

## 11. 演示数据说明

系统内置演示数据库 `pdp.db`，包含以下账号：

| 用户名 | 密码 | 说明 |
|---|---|---|
| UIBE | 123 | 学生 / 教师演示账号 |

项目根目录还提供：

```text
大众对比演示数据.csv
```

该 CSV 可用于大众数据对比分析模块导入演示。导入时需要注意：

- 如果导入时选择“同专业”，执行对比时也请选择“同专业”
- 如果导入时选择“同校”，执行对比时也请选择“同校”

即：**导入时的所属群体必须和对比时的目标群体一致**。

---

## 12. 最简运行流程

如果已经安装好 Python 3.11，最简流程为：

```text
1. 解压项目到全英文路径
2. 双击 start.bat
3. 浏览器访问 http://127.0.0.1:8001
4. 使用 UIBE / 123 登录
```
