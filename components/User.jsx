/**
 * User.jsx
 * 
 * 用户页面组件
 * 显示用户相关信息和功能，目前为开发占位
 */
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

/**
 * 获取设备屏幕尺寸
 * 用于适配不同屏幕大小
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
 * 用户页面组件
 * 显示用户相关信息，如个人资料、收藏内容等
 * 
 * @returns {React.Component} 用户页面组件
 */
export default function User(){
  return(
    <>
    <View style={styles.container}>
      <Text style={styles.text}>用户页面开发中</Text>
    </View>
    </>
  );
}

/**
 * 组件样式表
 * 定义用户页面样式
 */
const styles = StyleSheet.create({
  /**
   * 容器样式 - 整个页面的容器
   * 占满整个屏幕，居中显示内容
   */
  container: {
    flex: 1, // 弹性布局填充整个空间
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#fff', // 背景色
    // 根据设备类型调整内边距
    padding: isTablet() ? 30 : 20,
    // 为iOS设备添加安全区域顶部内边距
    paddingTop: Platform.OS === 'ios' ? (isTablet() ? 40 : 50) : 20,
  },
  
  /**
   * 文本样式 - 页面标题文本
   * 显示在页面中央
   */
  text: {
    // 根据设备类型调整字体大小
    fontSize: isTablet() ? 24 : 20,
    fontWeight: 'bold', // 粗体字
    color: '#333', // 文字颜色
    textAlign: 'center', // 居中对齐
    // 适配不同平台字体
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});