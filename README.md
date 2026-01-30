# 合财测试 💰

> ta的理财建议适合你吗？用八字算一算

## 功能

- 🔮 输入双方生辰八字
- 📅 选择讨论日期
- 📈 选择投资标的（BTC、黄金、英伟达等）
- ✨ 获得命理契合度分析

---

## 🚀 完整发布教程（小白版）

### 第一步：下载项目文件

1. 把这些文件全部下载到电脑上
2. 在电脑上新建一个文件夹，比如叫 `hecai-test`
3. 把所有文件放进去，保持这个结构：

```
hecai-test/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    └── App.jsx
```

---

### 第二步：注册 GitHub 账号

1. 打开 [github.com](https://github.com)
2. 点击右上角 **Sign up**
3. 输入邮箱、设置密码、取个用户名
4. 验证邮箱，完成注册

---

### 第三步：创建新仓库

1. 登录 GitHub 后，点击右上角的 **+** 号
2. 选择 **New repository**
3. 填写信息：
   - **Repository name**: `hecai-test`（或者你喜欢的名字）
   - **Description**: `合财测试 - 八字命理投资契合度测试`
   - 选择 **Public**（公开，免费部署需要）
   - **不要勾选** "Add a README file"（我们已经有了）
4. 点击 **Create repository**

---

### 第四步：上传文件到 GitHub

#### 方法 A：网页直接上传（最简单）👈 推荐新手

1. 在刚创建的仓库页面，点击 **uploading an existing file**
2. 把你电脑上 `hecai-test` 文件夹里的**所有文件和文件夹**拖进去
3. 页面下方的 "Commit changes" 区域：
   - 第一行写：`first commit`
4. 点击绿色按钮 **Commit changes**
5. 等待上传完成 ✅

> ⚠️ 注意：网页上传时，需要把 `src` 文件夹单独拖进去，确保文件结构正确

#### 方法 B：用 GitHub Desktop（更方便管理）

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 安装并登录你的 GitHub 账号
3. 点击 **File → Add Local Repository**
4. 选择你的 `hecai-test` 文件夹
5. 会提示 "create a repository"，点击 **create a repository**
6. 填写 Name：`hecai-test`，点击 **Create Repository**
7. 点击右上角 **Publish repository**
8. 确保 "Keep this code private" **不勾选**
9. 点击 **Publish Repository**

#### 方法 C：用命令行（程序员方式）

需要先安装 [Git](https://git-scm.com/downloads)，然后打开终端：

```bash
# 进入项目文件夹
cd hecai-test

# 初始化 git
git init

# 添加所有文件
git add .

# 提交
git commit -m "first commit"

# 连接到你的 GitHub 仓库（把 YOUR_USERNAME 换成你的用户名）
git remote add origin https://github.com/YOUR_USERNAME/hecai-test.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### 第五步：部署到 Vercel（让全世界都能访问）

1. 打开 [vercel.com](https://vercel.com)
2. 点击 **Sign Up** → 选择 **Continue with GitHub**
3. 授权 Vercel 访问你的 GitHub
4. 登录后，点击 **Add New...** → **Project**
5. 在列表中找到你的 `hecai-test` 仓库，点击 **Import**
6. 配置页面：
   - **Framework Preset**: 自动识别为 Vite（不用改）
   - 其他都不用改
7. 点击 **Deploy**
8. 等待 1-2 分钟，部署完成！🎉

---

### 第六步：获取你的网址

部署成功后，Vercel 会给你一个网址，类似：

```
https://hecai-test.vercel.app
```

这就是你的应用地址，可以分享给任何人了！

---

## 🔧 后续更新

以后想改代码：

1. 修改本地文件
2. GitHub Desktop：点击 **Commit to main** → **Push origin**
3. 或命令行：`git add . && git commit -m "更新" && git push`
4. Vercel 会自动重新部署，几十秒后生效

---

## 💡 常见问题

**Q: 上传时 src 文件夹没了？**
A: 网页上传需要保持文件夹结构，建议用 GitHub Desktop

**Q: Vercel 部署失败？**
A: 检查文件结构是否正确，特别是 `src/App.jsx` 路径

**Q: 想换个域名？**
A: Vercel 项目设置里可以绑定自定义域名

---

## 技术栈

- React 18
- Vite 5
- 纯 CSS（无 UI 框架）

## 免责声明

⚠️ 本应用仅供娱乐，不构成任何投资建议。投资有风险，入市需谨慎。
