/**
 * App.js
 * 
 * 应用程序入口文件
 * 初始化导航容器和应用程序根组件
 */
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler'; // 必须在导入React和Navigation之前导入手势处理库
import AppNavigator from './app/LayOut'; // 导入我们的主导航组件

/**
 * 判断当前设备是否为平板
 * 基于屏幕尺寸判断
 * @returns {boolean} 是否为平板设备
 */
const isTablet = () => {
  // 计算屏幕对角线英寸（近似值）
  const { width, height } = Dimensions.get('window');
  const screenDiagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 160; // 假设标准DPI为160
  return screenDiagonal >= 7; // 对角线大于7英寸视为平板
};

/**
 * 应用程序主组件
 * 管理应用初始化并设置导航容器
 * 
 * @returns {React.Component} 应用程序主组件
 */
export default function App() {
  // 应用初始化状态
  const [isReady, setIsReady] = useState(false);

  // 初始化应用
  useEffect(() => {
    // 简单延迟启动以确保应用正确初始化
    setTimeout(() => {
      setIsReady(true);
    }, 500);
  }, []);

  // 如果应用还没准备好，显示加载中动画
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2678FF" />
        <Text style={styles.loadingText}>正在加载应用...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 状态栏设置 */}
      <StatusBar 
        backgroundColor="transparent" // 透明背景
        barStyle="dark-content"       // 深色图标（适合浅色背景）
        translucent                   // 半透明效果
      />
      
      {/* 导航容器 - 管理整个应用的导航状态 */}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
} 

/**
 * 应用样式表
 * 包含容器和加载状态的样式
 */
const styles = StyleSheet.create({
  /**
   * 容器样式 - 整个应用的容器
   * 占满整个屏幕
   */
  container: {
    flex: 1,
    // 根据平台设置不同的背景色
    backgroundColor: Platform.OS === 'ios' ? '#FCFCFC' : '#FFFFFF',
  },
  
  /**
   * 加载容器样式 - 显示加载动画的容器
   * 居中显示加载指示器
   */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    // 为大屏设备增加内边距
    padding: isTablet() ? 20 : 0,
  },
  
  /**
   * 加载文本样式 - 加载提示文字
   * 根据设备大小调整字体大小
   */
  loadingText: {
    marginTop: 20,
    fontSize: isTablet() ? 18 : 16, // 平板设备字体稍大
    color: '#333',
    // 适配不同系统字体
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  }
}); 