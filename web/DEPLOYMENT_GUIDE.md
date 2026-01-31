# 斗地主游戏部署指南

本指南将帮助你将斗地主游戏部署到公网，让远在他乡的好友也能在手机上玩。

## 方案一：使用GitHub Pages（推荐）

### 步骤1：创建GitHub账号
1. 访问 [GitHub官网](https://github.com)
2. 点击 "Sign up" 创建账号
3. 按照提示完成注册流程

### 步骤2：创建新仓库
1. 登录GitHub后，点击右上角的 "+" 按钮
2. 选择 "New repository"
3. 填写仓库信息：
   - Repository name: 输入一个名称，如 "doudizhu-game"
   - Description: 可选，输入游戏描述
   - 选择 "Public"（必须设置为公开）
   - 勾选 "Add a README file"（可选）
4. 点击 "Create repository"

### 步骤3：上传游戏文件
1. 进入创建的仓库
2. 点击 "Add file" -> "Upload files"
3. 点击 "choose your files" 或拖拽文件到上传区域
4. 选择 `web` 目录下的所有文件：
   - `index.html`
   - `style.css`
   - `script.js`
5. 滚动到底部，填写提交信息（如 "Add game files"）
6. 点击 "Commit changes"

### 步骤4：启用GitHub Pages
1. 在仓库页面，点击 "Settings"
2. 在左侧菜单中点击 "Pages"
3. 在 "Branch" 下拉菜单中选择 "main" 或 "master"
4. 在 "Folder" 下拉菜单中选择 "/ (root)"
5. 点击 "Save"
6. 等待几分钟，刷新页面
7. 你会看到一个绿色的提示，显示 "Your site is published at"，后面跟着你的游戏访问URL

### 步骤5：分享游戏
1. 复制生成的URL（如 `https://yourusername.github.io/doudizhu-game/`）
2. 通过微信、QQ等方式分享给好友
3. 好友在手机浏览器中打开该URL即可开始游戏

## 方案二：使用ngrok（临时分享）

### 步骤1：下载ngrok
1. 访问 [ngrok官网](https://ngrok.com)
2. 点击 "Download for Windows"
3. 解压下载的文件到任意目录

### 步骤2：启动本地服务器
1. 打开命令提示符
2. 输入：
   ```cmd
   cd d:\Downloads\Trae CN\项目\斗地主\doudizhu\web
   python -m http.server 8000
   ```
3. 服务器启动后，保持命令提示符窗口打开

### 步骤3：使用ngrok创建公网隧道
1. 打开另一个命令提示符窗口
2. 进入ngrok所在目录
3. 输入：
   ```cmd
   ngrok http 8000
   ```
4. 等待ngrok启动，你会看到一个类似这样的输出：
   ```
   Forwarding                    http://abc123.ngrok.io -> http://localhost:8000
   Forwarding                    https://abc123.ngrok.io -> http://localhost:8000
   ```

### 步骤4：分享游戏
1. 复制生成的公网URL（如 `https://abc123.ngrok.io`）
2. 通过微信、QQ等方式分享给好友
3. 好友在手机浏览器中打开该URL即可开始游戏

### 注意事项
- ngrok免费版有连接时长限制
- 每次启动ngrok都会生成新的URL
- 仅适合临时分享，不适合长期使用

## 方案三：使用云服务器（长期部署）

### 步骤1：购买云服务器
1. 选择云服务提供商（如阿里云、腾讯云等）
2. 购买一台云服务器，推荐配置：
   - CPU: 1核
   - 内存: 1GB
   - 带宽: 1Mbps
   - 系统: CentOS 7或Ubuntu 18.04

### 步骤2：部署Web服务器
1. 登录云服务器
2. 安装Nginx：
   ```bash
   # CentOS
   yum install nginx -y
   
   # Ubuntu
   apt update && apt install nginx -y
   ```
3. 启动Nginx：
   ```bash
   systemctl start nginx
   systemctl enable nginx
   ```

### 步骤3：上传游戏文件
1. 使用SCP或FTP工具将 `web` 目录上传到服务器
2. 将文件移动到Nginx默认目录：
   ```bash
   mv web/* /usr/share/nginx/html/
   ```

### 步骤4：配置服务器
1. 编辑Nginx配置文件（可选）
2. 重启Nginx：
   ```bash
   systemctl restart nginx
   ```

### 步骤5：分享游戏
1. 复制服务器的公网IP地址
2. 通过微信、QQ等方式分享给好友
3. 好友在手机浏览器中打开 `http://服务器IP` 即可开始游戏

## 游戏访问说明

### 好友访问步骤
1. 在手机上打开浏览器（如Chrome、Safari等）
2. 输入你分享的URL
3. 等待游戏加载完成
4. 点击 "开始游戏" 按钮
5. 享受游戏时光！

### 游戏功能
- 支持自定义好牌概率
- 响应式设计，适配手机屏幕
- 触摸操作支持
- 完整的斗地主游戏逻辑

## 故障排除

### GitHub Pages问题
- **页面无法访问**：确保仓库设置为公开，等待几分钟后重试
- **样式丢失**：检查文件路径是否正确，确保CSS文件已上传

### 本地服务器问题
- **服务器启动失败**：检查Python是否安装，尝试使用其他端口
- **ngrok连接失败**：检查网络连接，确保本地服务器正在运行

### 云服务器问题
- **页面无法访问**：检查Nginx是否启动，防火墙是否开放80端口
- **加载缓慢**：考虑升级服务器带宽，优化游戏文件

## 联系方式

如果遇到问题，欢迎随时咨询！