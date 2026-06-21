# Python 环境部署说明

本文档用于说明如何在一台新的 Windows 电脑上部署并运行 **PDP-System 大学生成长规划系统**。

---

## 1. 环境要求

> ⚠️ **请先确认 Python 版本。** 本项目推荐使用 **Python 3.11.x**，当前开发测试环境为 **Python 3.11.9**。不建议使用 Python 3.12/3.13/3.14，其中 Python 3.14 会导致 FastAPI/Pydantic 依赖报错。
>
> 在 PowerShell 中执行以下命令检查 Python 3.11 是否可用：
>
> ```powershell
> py -3.11 --version
> ```
>
> 正常情况下应看到类似输出：
>
> ```text
> Python 3.11.x
> ```

请先确认电脑已安装以下环境：

| 环境 | 要求 |
|---|---|
| 操作系统 | Windows 10 / Windows 11 |
| Python | **必须使用 Python 3.11**（不支持 Python 3.14） |
| 浏览器 | Chrome / Edge 均可 |
| 网络 | 第一次安装依赖时需要联网 |

如果未安装 Python，请到官网下载安装：

```text
https://www.python.org/downloads/
```

安装 Python 时请务必勾选：

```text
Add python.exe to PATH
```

安装完成后，请返回本节开头，用 `py -3.11 --version` 确认 Python 3.11 是否可用。

---

## 2. 解压项目

将压缩包解压到一个**全英文路径**，例如：

```text
C:\pdp-system\
```

不建议解压到包含中文、空格或特殊符号的路径，例如：

```text
C:\Users\用户名\桌面\期末大作业\
```

---

## 3. 一键启动（推荐）

确认已经安装 Python 后，直接双击项目根目录下的：

```text
start.bat
```

如果出现以下情况：

- 后端报错
- 能打开网页但无法登录
- `.venv311` 使用了错误的 Python 版本
- 误用了 Python 3.14
- 依赖安装不完整
- `123 / 123` 演示账号无法登录

请先关闭所有黑色命令行窗口，然后直接双击项目根目录下的修复脚本：

```text
repair_and_start.bat
```

该脚本会自动检查 Python 3.11、重建虚拟环境、安装依赖、初始化数据库、刷新演示账号并启动系统。

> 简单来说：**正常启动用 `start.bat`，出问题就用 `repair_and_start.bat`。**

新版 `start.bat` 会自动完成以下工作：

1. 自动进入项目根目录
2. 如果没有 `.venv311/`，自动创建虚拟环境
3. 自动安装 `requirements.txt` 中的依赖
4. 自动初始化数据库
5. 自动启动单服务应用（后端和前端都在 8001 端口）

启动过程中第一次安装依赖可能需要等待几分钟，请耐心等待。

启动成功后会打开一个命令行窗口，用于运行系统服务。

请不要关闭这个窗口，关闭窗口会导致系统停止运行。

启动成功后，在浏览器访问：

```text
http://127.0.0.1:8001
```

API 文档地址：

```text
http://127.0.0.1:8001/docs
```

---

## 4. 演示账号

系统提供以下演示账号：

| 用户名 | 密码 | 说明 |
|---|---|---|
| UIBE | 123 | 学生 / 教师演示账号 |
| 123 | 123 | 第二个学生演示账号，用于大众数据对比分析 |

---

## 5. 手动部署方式（备用）

如果双击 `start.bat` 无法正常运行，可以按照以下步骤手动部署。

### 5.1 打开 PowerShell 并进入项目根目录

假设项目解压在：

```text
C:\pdp-system\
```

则执行：

```powershell
cd C:\pdp-system
```

### 5.2 创建虚拟环境

请优先使用 Python 3.11 创建虚拟环境：

```powershell
py -3.11 -m venv .venv311
```

如果电脑里只有 Python 3.11，也可以使用：

```powershell
python -m venv .venv311
```

### 5.3 激活虚拟环境

```powershell
.venv311\Scripts\activate
```

激活成功后，命令行前面通常会出现：

```text
(.venv311)
```

### 5.4 安装依赖

```powershell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 5.5 初始化数据库

```powershell
python -m app.db.init_db
```

如果需要重新写入第二个演示学生账号的数据，可以执行：

```powershell
python -m app.db.seed_demo_123
```

### 5.6 手动启动应用

在项目根目录执行：

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

后端会同时托管前端页面，然后在浏览器访问：

```text
http://127.0.0.1:8001
```

---

## 6. 常见问题

### 问题 1：双击 start.bat 后提示找不到 Python

原因：电脑没有安装 Python，或安装时没有勾选 `Add python.exe to PATH`。

解决方式：

1. 重新安装 Python 3.11
2. 安装时勾选 `Add python.exe to PATH`
3. 重新双击 `start.bat`

---

### 问题 2：后端窗口报 Pydantic / unable to infer type 错误

如果后端窗口出现类似报错：

```text
pydantic.errors.ConfigError: unable to infer type for attribute "name"
```

并且报错路径中出现：

```text
C:\Python314\Lib\...
```

说明当前虚拟环境是用 **Python 3.14** 创建的。本项目依赖版本适配 Python 3.11，不支持 Python 3.14。

解决方式：

1. 关闭所有后端 / 前端 / start.bat 窗口
2. 删除项目根目录下的 `.venv311/` 文件夹
3. 安装 Python 3.11
4. 在 PowerShell 中确认 Python 3.11 可用：

```powershell
py -3.11 --version
```

5. 重新双击 `start.bat`

---

### 问题 3：pip install 速度很慢或失败

`start.bat` 默认使用清华镜像源安装依赖，正常情况下速度较快。

如果仍然失败，请检查网络连接，或在 PowerShell 中手动执行：

```powershell
.venv311\Scripts\activate
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

### 问题 4：浏览器打不开页面

请确认：

1. `start.bat` 启动后的黑色窗口没有被关闭
2. 浏览器访问的是：

```text
http://127.0.0.1:8001
```

3. 如果 Windows 防火墙弹窗，请点击“允许访问”

---

### 问题 5：端口被占用

如果 8001 端口被其他程序占用，请先关闭占用端口的程序，或重启电脑后重新运行 `start.bat`。

---

### 问题 6：能打开网页但无法登录 / 登录后没有演示数据

请确认项目根目录下存在：

```text
pdp.db
```

如果数据库不存在，可以在项目根目录执行：

```powershell
.venv311\Scripts\activate
python -m app.db.init_db
python -m app.db.seed_demo_123
```

---

## 7. 停止系统

关闭启动时的命令行窗口即可停止系统。

也可以在命令行窗口中按：

```text
Ctrl + C
```

---

## 8. 项目技术栈

本项目采用：

- 前端：HTML + CSS + JavaScript
- 后端：Python + FastAPI
- 数据库：SQLite
- ORM / 数据模型：SQLModel / SQLAlchemy
- API 文档：FastAPI 自动生成 Swagger 文档

---

## 9. 最简运行流程

如果已经安装好 Python，最简运行流程为：

```text
1. 解压项目到全英文路径
2. 双击 start.bat
3. 浏览器访问 http://127.0.0.1:8001
4. 使用 UIBE / 123 登录
```
