/**
 * HomeScreen.jsx
 * 
 * 首页屏幕组件
 * 应用程序的主页面，包含搜索栏和内容标签页
 */
import { Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import TopTabs from '../components/CustomerTabs/CustomerTabs'; // 导入内容标签页组件
import SearchBar from '../components/Search/Search'; // 导入搜索栏组件

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
 * 根据设备类型计算安全区域顶部填充
 * @returns {number} 顶部填充值
 */
const getStatusBarPadding = () => {
  // 根据平台和设备类型返回不同的填充值
  if (Platform.OS === 'ios') {
    return isTablet() ? 20 : 45; // iOS平板和手机的填充
  } else {
    return isTablet() ? 20 : 25; // Android平板和手机的填充
  }
};

/**
 * 首页组件
 * 包含搜索栏和内容标签页，是用户打开应用后看到的第一个页面
 * 
 * @returns {React.Component} 首页组件
 */
function HomePages(){
    return(
        <SafeAreaView style={Styles.container}>
            {/* 状态栏设置 */}
            <StatusBar
                backgroundColor="transparent" // 透明背景
                barStyle="dark-content"      // 深色图标（适合浅色背景）
                translucent={true}           // 半透明效果
            />
            
            {/* 主要内容区域（搜索栏和标签页） */}
            <View style={Styles.Sort}>
                {/* 搜索栏组件 */}
                <SearchBar />
                
                {/* 内容标签页组件 */}
                <TopTabs/>
            </View>
        </SafeAreaView>
    )
}

/**
 * 组件样式表
 * 定义组件样式，包括容器和内容区域样式
 */
const Styles = StyleSheet.create({
    /**
     * 容器样式 - 整个页面的容器
     * 占满整个屏幕，使用动态计算的填充确保在不同设备上布局正确
     */
    container: {
        width: "100%",        // 宽度占满整个屏幕
        height: "100%",       // 高度占满整个屏幕
        flex: 1,              // 弹性布局占满可用空间
        backgroundColor: "#fff", // 背景色为白色
        // 根据平台和设备类型动态适配顶部填充
        paddingTop: getStatusBarPadding(),
        // 为大屏设备设置水平内边距，提高可读性
        paddingHorizontal: isTablet() ? 15 : 0,
    },
    
    /**
     * 内容区域样式 - 包含搜索栏和标签页的区域
     * 占满剩余空间
     */
    Sort: {
        width: '100%',    // 宽度占满容器
        height: '100%',   // 高度占满容器
        // 根据设备大小调整内边距
        paddingHorizontal: Platform.select({
            ios: isTablet() ? 10 : 5,
            android: isTablet() ? 8 : 0,
        }),
    },
});

export default HomePages;