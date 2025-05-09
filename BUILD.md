# 构建APK指南

## 前置需求

1. 确保已安装Node.js和npm
2. 安装Expo CLI: `npm install -g expo-cli`
3. 安装EAS CLI: `npm install -g eas-cli`
4. 使用Expo帐户登录: `eas login`

## 构建APK步骤

### 方法1: 使用EAS云构建（推荐）

1. 确保已登录Expo账户: `eas login`
2. 配置项目: `npm run build:configure`
3. 构建Android APK: `npm run build:android`
4. 构建过程完成后，您将收到一个下载链接，可以从Expo网站下载APK文件

### 方法2: 本地构建（需要Android开发环境）

本地构建需要您的计算机上安装以下内容:
- Android Studio
- Java Development Kit (JDK) 11或更高版本
- Android SDK

步骤:
1. 设置本地环境:
   ```
   export ANDROID_HOME=/path/to/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

2. 执行本地构建:
   ```
   npm run build:android-local
   ```

3. 构建完成后，APK文件将位于项目目录中的build目录下。

## 自定义构建配置

如果您需要自定义构建过程，可以编辑以下文件:
- `eas.json`: EAS构建配置
- `app.json`: 应用基本配置
- `app.config.js`: 动态应用配置

## 故障排除

如果遇到构建问题:

1. 确保您的`eas.json`配置正确
2. 验证`app.json`中的应用ID（package名称）是唯一的
3. 检查是否已安装所有必要的依赖: `npm install`
4. 查看EAS构建日志以获取详细错误信息

## 注意事项

- 构建过程可能需要几分钟时间
- 首次构建时需要提供Expo帐户信息
- 如果要发布到应用商店，请使用生产构建配置: `eas build -p android --profile production` 