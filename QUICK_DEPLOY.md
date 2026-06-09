# 📱 快速部署手册

## 🎯 目标
10 分钟内完成移动端上线！

---

## 第一步：部署后端（3分钟）

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 部署到 Vercel
```bash
cd ai-plan-workbench
vercel login          # 登录（首次）
vercel --prod         # 部署
```

### 3. 记录 URL
部署成功后会显示：
```
✅ Production: https://ai-plan-workbench-xxxx.vercel.app
```
**复制这个 URL，下一步要用！**

---

## 第二步：配置移动端（1分钟）

编辑 `ai-plan-mobile/lib/api.ts`，第 6 行：
```typescript
const API_BASE = __DEV__
  ? 'http://localhost:3000'
  : 'https://你的vercel地址.vercel.app';  // 👈 改成你的 URL
```

---

## 第三步：构建 APK（5分钟）

### 1. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 2. 登录 Expo
```bash
cd ai-plan-mobile
eas login             # 登录（首次需注册 expo.dev）
```

### 3. 构建 APK
```bash
eas build -p android --profile preview
```

等待 5-10 分钟，构建完成会收到邮件！

---

## 第四步：安装测试（1分钟）

1. 打开邮件中的下载链接
2. 在手机上下载 APK
3. 允许安装未知来源
4. 安装并打开

---

## ✅ 完成！

现在你的 APP 已经上线了！可以：
- 📱 分享 APK 给朋友测试
- 🚀 上传到 Google Play 商店（需要 $25 开发者账号）
- 🍎 构建 iOS 版本（需要 $99/年 Apple Developer）

---

## 🆘 遇到问题？

### Q1: Vercel 部署失败
```bash
# 检查是否在正确目录
cd ai-plan-workbench
vercel --prod
```

### Q2: EAS 构建失败
```bash
# 首次需要配置
eas build:configure

# 然后重新构建
eas build -p android --profile preview
```

### Q3: 手机无法安装 APK
- 进入设置 → 安全 → 允许安装未知来源应用
- 或者使用文件管理器打开 APK

### Q4: APP 无法连接后端
- 检查 `lib/api.ts` 中的 URL 是否正确
- 确保 Vercel 部署成功
- 重新构建 APK

---

## 💡 快捷命令

```bash
# 一键部署后端
cd ai-plan-workbench && vercel --prod

# 一键构建移动端
cd ai-plan-mobile && eas build -p android --profile preview

# 查看构建状态
eas build:list

# 本地测试
npm start
```

---

## 💰 成本

- ✅ Vercel：免费（够用）
- ✅ EAS Build：免费额度（每月几次构建）
- ✅ Expo：免费账号
- ⚠️ Google Play：$25（一次性，发布到商店）
- ⚠️ Apple Developer：$99/年（发布到 App Store）

**快速测试：完全免费！**

---

## 🎉 下一步

测试成功后，可以：

1. **发布到 Google Play**
   - 注册开发者账号
   - 构建生产版：`eas build -p android --profile production`
   - 在 Google Play Console 上传

2. **发布到 App Store**
   - 注册 Apple Developer
   - 配置证书
   - 构建：`eas build -p ios --profile production`
   - 通过 App Store Connect 提交

3. **持续更新**
   - 修改代码
   - 重新构建
   - 用户会收到更新提示

---

**祝你部署顺利！🚀**
