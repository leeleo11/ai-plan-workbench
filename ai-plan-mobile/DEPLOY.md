# 🚀 快速部署指南

## 一、移动端部署（15分钟）

### 准备工作
```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 登录 Expo（如果没有账号，访问 expo.dev 注册）
eas login
```

### Android APK 构建
```bash
cd ai-plan-mobile

# 配置项目（首次需要）
eas build:configure

# 构建预览版 APK（快速测试）
eas build -p android --profile preview

# 等待约 5-10 分钟，构建完成后会得到下载链接
```

### 安装测试
1. 在手机上打开 EAS 构建完成邮件中的链接
2. 下载 APK
3. 允许安装未知来源应用
4. 安装并测试

## 二、后端 API 部署（5分钟）

### 部署到 Vercel
```bash
cd ../ai-plan-workbench

# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署（会自动构建和部署）
vercel --prod
```

部署完成后，记下 URL，例如：
```
https://ai-plan-workbench-xxx.vercel.app
```

### 配置移动端 API
```bash
cd ../ai-plan-mobile

# 编辑 lib/api.ts
# 将 API_BASE_URL 改为你的 Vercel URL
```

### 重新构建移动端
```bash
# 更新 API 地址后，重新构建
eas build -p android --profile preview
```

## 三、测试部署

### 移动端测试清单
- [ ] 打开应用
- [ ] 输入目标和参数
- [ ] 生成计划
- [ ] 查看任务列表
- [ ] 打卡功能
- [ ] 日历视图
- [ ] 主题切换

### API 测试
访问：`https://your-vercel-url.vercel.app/api/plans/generate`

## 四、发布到应用商店（可选）

### Google Play
1. 注册开发者账号：$25 一次性
2. 构建生产版：`eas build -p android --profile production`
3. 在 Google Play Console 创建应用
4. 上传 AAB 文件
5. 填写信息、截图
6. 提交审核（通常 1-3 天）

### Apple App Store
1. 注册 Apple Developer：$99/年
2. 配置证书和描述文件
3. 构建生产版：`eas build -p ios --profile production`
4. 通过 App Store Connect 上传
5. 提交审核（通常 1-2 周）

## 五、成本估算

### 免费方案
- ✅ Vercel 免费套餐（够用）
- ✅ EAS Build 免费额度（每月几次构建）
- ✅ Expo 免费账号
- **总成本：$0**

### 完整发布
- Google Play 开发者账号：$25（一次性）
- Apple Developer 账号：$99/年
- EAS Build 付费计划：$29/月（可选，提供更多构建次数）
- **首年成本：$124 - $472**

## 六、快速命令参考

```bash
# 启动开发服务器
npm start

# 本地测试
npm run android  # Android 模拟器
npm run ios      # iOS 模拟器

# 构建 APK
eas build -p android --profile preview

# 构建 iOS
eas build -p ios --profile preview

# 部署后端
vercel --prod

# 查看构建状态
eas build:list
```

## 🎯 推荐部署流程（最快）

1. **先部署后端**（5分钟）
   ```bash
   cd ai-plan-workbench
   vercel --prod
   ```

2. **更新移动端 API 地址**
   编辑 `ai-plan-mobile/lib/api.ts`

3. **构建 Android APK**（10分钟）
   ```bash
   cd ai-plan-mobile
   eas build -p android --profile preview
   ```

4. **下载并测试**
   在手机上安装 APK 测试

5. **发布到应用商店**（可选）
   注册开发者账号后上传

## ⚠️ 注意事项

1. **首次构建需要配置**：运行 `eas build:configure`
2. **需要 Expo 账号**：免费注册即可
3. **API 地址务必更新**：否则移动端无法连接后端
4. **测试完整流程**：构建前在开发模式下测试所有功能
5. **图标和启动页**：确保 `assets/` 文件夹中有所需资源

## 📞 遇到问题？

常见问题：
1. **构建失败**：检查 `app.json` 配置
2. **API 连不上**：确认 Vercel URL 正确
3. **安装被阻止**：允许安装未知来源应用
4. **Expo 登录失败**：使用邮箱注册账号
