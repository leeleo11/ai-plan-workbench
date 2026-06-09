# AI 计划工作台 - 移动端

基于 Expo 的跨平台移动应用，支持 iOS 和 Android。

## 📱 快速开始

### 1. 安装依赖
```bash
cd ai-plan-mobile
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

然后：
- 按 `a` 打开 Android 模拟器
- 按 `i` 打开 iOS 模拟器
- 扫描二维码在真机上测试（需要 Expo Go app）

## 🚀 部署上线

### 方式一：使用 EAS Build（推荐）

#### 步骤 1：安装 EAS CLI
```bash
npm install -g eas-cli
```

#### 步骤 2：登录 Expo 账号
```bash
eas login
```

#### 步骤 3：配置项目
```bash
eas build:configure
```

#### 步骤 4：构建 APK（Android）
```bash
# 预览版本（快速测试）
eas build -p android --profile preview

# 生产版本
eas build -p android --profile production
```

#### 步骤 5：构建 IPA（iOS）
```bash
# 需要 Apple Developer 账号
eas build -p ios --profile production
```

#### 步骤 6：下载并安装
构建完成后，你会收到下载链接，可以：
- 直接在手机上安装 APK
- 通过 TestFlight 分发 iOS 版本

### 方式二：本地构建 APK

```bash
# 安装依赖
npm install -g @expo/ngrok

# 构建 APK
npx expo build:android -t apk

# 或者使用 Expo Application Services
eas build -p android --profile preview
```

## 🌐 后端 API 部署

### 部署到 Vercel（推荐）

#### 1. 在 Vercel 上部署 Next.js 后端
```bash
cd ../ai-plan-workbench
npm install -g vercel
vercel
```

#### 2. 获取部署 URL
部署成功后，Vercel 会给你一个 URL，例如：
```
https://ai-plan-workbench.vercel.app
```

#### 3. 配置移动端 API 地址
在 `ai-plan-mobile/lib/api.ts` 中更新：
```typescript
const API_BASE_URL = 'https://ai-plan-workbench.vercel.app';
```

## 📦 构建配置

### Android
- **包名**：`com.aiplan.mobile`
- **版本**：1.0.0
- **构建类型**：APK（适合直接分发）

### iOS
- **Bundle ID**：`com.aiplan.mobile`
- **版本**：1.0.0
- **需要**：Apple Developer 账号

## 🎨 主题配色

移动端已同步网页端的优化配色：
- ✅ 自然的琥珀黄色系
- ✅ 高对比度的深色主题
- ✅ 柔和的视觉效果

## 🔧 环境配置

### 开发环境
```bash
# 启动 Expo 开发服务器
npm start

# 或指定平台
npm run android  # Android
npm run ios      # iOS
npm run web      # 网页版
```

### 生产环境
1. 确保后端 API 已部署
2. 更新 `lib/api.ts` 中的 API URL
3. 运行 `eas build` 构建应用

## 📝 发布流程

### Android（Google Play）
1. 构建生产版 APK/AAB
2. 注册 Google Play 开发者账号（$25 一次性）
3. 在 Google Play Console 上传应用
4. 填写应用信息、截图
5. 提交审核

### iOS（App Store）
1. 注册 Apple Developer 账号（$99/年）
2. 构建生产版 IPA
3. 通过 App Store Connect 上传
4. 提交审核

## 🐛 常见问题

### Q: 构建失败怎么办？
A: 检查 `eas.json` 配置，确保所有资源文件存在。

### Q: 如何测试 APK？
A: 构建完成后，直接在 Android 手机上安装 APK 文件。

### Q: iOS 需要什么？
A: 需要 Apple Developer 账号，以及 Mac 电脑（用于本地构建）。

## 📚 更多资源

- [Expo 文档](https://docs.expo.dev/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [React Native 文档](https://reactnative.dev/)

## 🆘 支持

如有问题，请查看：
1. Expo 官方文档
2. 项目 Issues
3. React Native 社区
