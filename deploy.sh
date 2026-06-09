#!/bin/bash

# 一键部署脚本

echo "🚀 开始部署 AI 计划工作台"
echo ""

# 检查是否安装了必要的工具
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误: $1 未安装"
        echo "请运行: npm install -g $1"
        exit 1
    fi
}

echo "📋 检查依赖..."
check_dependency "vercel"
check_dependency "eas"

# 部署后端
echo ""
echo "🌐 第一步：部署后端 API..."
cd ai-plan-workbench
echo "运行: vercel --prod"
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ 后端部署失败"
    exit 1
fi

echo "✅ 后端部署成功！"
echo ""
echo "⚠️  请复制上面的 Vercel URL"
echo "⚠️  然后编辑 ai-plan-mobile/lib/api.ts"
echo "⚠️  将 API_BASE 改为你的 URL"
echo ""
read -p "按回车继续，或按 Ctrl+C 退出..."

# 构建移动端
echo ""
echo "📱 第二步：构建 Android APK..."
cd ../ai-plan-mobile

echo "运行: eas build -p android --profile preview"
eas build -p android --profile preview

if [ $? -ne 0 ]; then
    echo "❌ Android 构建失败"
    exit 1
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "📥 下载地址："
echo "   EAS 会发送邮件，包含 APK 下载链接"
echo ""
echo "📱 安装步骤："
echo "   1. 在手机上打开邮件中的链接"
echo "   2. 下载 APK 文件"
echo "   3. 允许安装未知来源应用"
echo "   4. 安装并测试"
echo ""
echo "🎉 恭喜！应用已成功部署"
