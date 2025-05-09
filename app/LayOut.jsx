/**
 * LayOut.jsx
 * 
 * 应用程序的主导航布局
 * 管理底部标签导航和堆栈导航器，处理页面跳转和导航结构
 */

import { faIgloo, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // 导入Font Awesome图标
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // 导入Font Awesome组件
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // 导入底部标签导航器
import { createStackNavigator } from '@react-navigation/stack'; // 导入堆栈导航器
import { Dimensions, Platform, StyleSheet } from 'react-native'; // 导入React Native组件
import HomeScreen from '../components/HomeScreen'; // 导入首页组件
import Detail from '../components/ListMovie/DetailScreen'; // 导入详情页组件
import SearchScreen from '../components/Search/SearchScreen'; // 导入搜索页组件
import User from '../components/User'; // 导入用户页组件

/**
 * 获取设备屏幕尺寸
 * 用于适配不同屏幕大小
 */
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
 * 创建底部标签导航器
 * 用于在主要视图之间切换（首页、用户页等）
 */
const Tab = createBottomTabNavigator();

/**
 * 创建堆栈导航器
 * 用于管理页面的层级关系，支持页面间的前进后退
 */
const Stack = createStackNavigator();

/**
 * 主标签导航组件
 * 定义底部标签栏的外观和行为，包括图标、颜色和标签项
 * 
 * @returns {React.Component} 底部标签导航组件
 */
function MainTabs() {
  // 根据设备类型和平台调整底部导航栏的高度和样式
  const tabBarHeight = Platform.OS === 'ios' 
    ? (isTablet() ? 90 : 80) // iOS设备上平板较大，手机较小
    : (isTablet() ? 85 : 70); // Android设备上平板较大，手机较小

  // 根据设备类型调整图标大小
  const iconSize = isTablet() ? 28 : 22;

  // 根据设备类型调整文字大小
  const labelSize = isTablet() ? 14 : 12;

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false, // 隐藏所有子页面的标题栏
        tabBarIcon: ({ color, size }) => {
          // 根据路由名称动态选择图标
          let icon;
          if (route.name === 'Home') {
            icon = faIgloo; // 首页图标
          } else if (route.name === 'User') {
            icon = faUserCircle; // 用户图标
          }

          // 返回图标组件，使用响应式尺寸
          return <FontAwesomeIcon 
            icon={icon} 
            size={iconSize} 
            color={color}
            style={styles.tabIcon} // 应用额外样式，如需要
          />; 
        },
        // 激活状态的颜色（当前选中的标签）
        tabBarActiveTintColor: '#2678FF',
        // 非激活状态的颜色（其他标签）
        tabBarInactiveTintColor: 'gray',
        // 底部导航样式自定义，使用动态高度
        tabBarStyle: {
          height: tabBarHeight, // 动态高度
          paddingBottom: Platform.OS === 'ios' ? 20 : 10, // iOS底部安全区域
          paddingTop: 5, // 顶部填充
          backgroundColor: '#FFFFFF', // 背景色
          borderTopWidth: 1, // 上边框
          borderTopColor: '#E0E0E0', // 上边框颜色
          // 为不同设备添加阴影
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        // 标签文字样式
        tabBarLabelStyle: {
          fontSize: labelSize, // 动态文字大小
          marginBottom: Platform.OS === 'ios' ? 0 : 5, // Android底部边距
        }
      })}
    >
      {/* 首页标签 */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: '首页',
        }}
      />
      
      {/* 用户页标签 */}
      <Tab.Screen 
        name="User" 
        component={User} 
        options={{ 
          tabBarLabel: '我的',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * 应用程序主导航组件
 * 定义整个应用的导航结构，包括底部标签页和详情页
 * 
 * @returns {React.Component} 应用程序导航组件
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // 自定义屏幕过渡效果
        cardStyle: { backgroundColor: '#FFFFFF' },
        // 根据平台自定义过渡效果
        ...Platform.select({
          ios: {
            gestureEnabled: true, // iOS上启用手势导航
            gestureResponseDistance: { horizontal: SCREEN_WIDTH * 0.75 }, // 响应手势的距离
          },
          android: {
            gestureEnabled: false, // Android上禁用手势导航
          },
        }),
      }}
    >
      {/* 主页面（包含底部标签导航） */}
      <Stack.Screen 
        name="Main" 
        component={MainTabs} 
        options={{ 
          headerShown: false, // 隐藏导航头部
        }} 
      />
      
      {/* 详情页面 - 当用户点击电影项时导航到此页面 */}
      <Stack.Screen 
        name="Detail" 
        component={Detail} 
        options={{ 
          headerShown: false, // 隐藏导航头部
        }} 
      />
      {/* 搜索页面 - 用户点击搜索图标导航到此页面 */}
      <Stack.Screen
        name='SearchScreen'
        component={SearchScreen}
        options={{
          headerShown: false, // 隐藏导航头部
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * 组件样式表
 * 定义组件样式
 */
const styles = StyleSheet.create({
  /**
   * 标签图标样式
   * 根据平台调整位置和样式
   */
  tabIcon: {
    marginTop: Platform.OS === 'ios' ? 0 : 5, // Android上增加上边距
  },
});
