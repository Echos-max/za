/**
 * index.jsx
 * 
 * 列表项组件
 * 用于展示电影/电视剧的单个项目，包含海报图片和标题
 */
import { useNavigation } from "@react-navigation/native";
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
 * 计算不同屏幕尺寸下的项目宽度
 * @returns {number} 项目宽度
 */
const getItemWidth = () => {
  // 计算每列宽度，考虑左右边距
  const columnsCount = isTablet() ? 4 : 3; // 平板显示4列，手机显示3列
  const marginPercentage = isTablet() ? 0.02 : 0.03; // 平板边距小一点，手机边距大一点
  const totalMargin = SCREEN_WIDTH * marginPercentage * (columnsCount + 1); // 两边和中间的间距
  return (SCREEN_WIDTH - totalMargin) / columnsCount;
};

/**
 * 列表项组件
 * 显示单个影片项目，包含海报和标题
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.item - 影片数据对象
 * @returns {React.Component} 列表项组件
 */
function IndexList({ item }){
  // API基础URL
  const baseUrl = 'https://zaxd.fun';
  // 获取导航对象
  const navigation = useNavigation();
  
  // 根据设备类型计算项目宽度和高度
  const itemWidth = getItemWidth();
  const itemHeight = itemWidth * 1.2; // 保持海报比例
  const titleHeight = Platform.OS === 'ios' ? itemWidth * 0.2 : itemWidth * 0.25;
  
  return(
    <>
    <View style={[
      styles.main,
      { 
        width: itemWidth,
        height: itemHeight + titleHeight, // 海报高度 + 标题高度
      }
    ]}>
      {/* 海报容器 */}
      <View style={[styles.mainHeader, { height: itemHeight }]}>
        <TouchableOpacity
          onPress={() => {
            console.log('正在传递的ID:', item.id); // 调试输出
            console.log('正在传递数据:', item); // 调试输出
            navigation.navigate("Detail", { id: item.id });
          }}
          activeOpacity={0.7} // 点击时的不透明度
        >
          {/* 海报图片 */}
          <Image 
            style={styles.poster}  
            source={{ uri: `${baseUrl}${item.horizontalPoster}` || 'https://zaxd.fun/default-cover.jpg' }}
          />
        </TouchableOpacity>
      </View>
      
      {/* 标题容器 */}
      <View style={[styles.mainContent, { height: titleHeight }]}>
        <Text 
          style={styles.title}
          numberOfLines={1} // 限制为单行
          ellipsizeMode="tail" // 超出显示...
        >
          {item.name}
        </Text>
      </View>
    </View>
    </>
  )
}

/**
 * 组件样式表
 * 定义列表项的样式
 */
const styles = StyleSheet.create({
  /**
   * 主容器样式 - 整个列表项的容器
   * 宽高在组件内动态计算
   */
  main: {
    // 宽度和高度在render中动态设置
    marginTop: "5%", // 顶部间距
    marginLeft: Platform.OS === 'ios' ? "2.5%" : "3%", // 左侧间距，iOS更紧凑
    flexWrap: 'wrap', // 允许内容换行
    borderTopLeftRadius: 10, // 顶部左圆角
    borderTopRightRadius: 10, // 顶部右圆角
    backgroundColor: "#f5f5f5", // 背景色
    // 添加阴影效果，增强立体感
  },
  
  /**
   * 海报容器样式 - 包含电影海报的容器
   * 占据列表项的主要部分
   */
  mainHeader: {
    width: "100%", // 宽度占满父容器
    // 高度在render中动态设置
  },
  
  /**
   * 海报图片样式
   * 填充整个容器，显示圆角
   */
  poster: {
    width: "100%", 
    height: "100%", 
    objectFit: "cover", // 保持图片比例
    borderTopLeftRadius: 10, // 顶部左圆角
    borderTopRightRadius: 10, // 顶部右圆角
  },
  
  /**
   * 内容容器样式 - 包含标题的容器
   * 占据列表项的底部部分
   */
  mainContent: {
    width: "100%", // 宽度占满父容器
    // 高度在render中动态设置
    justifyContent: 'center', // 垂直居中
  },
  
  /**
   * 标题文本样式
   * 居中显示，大小根据设备类型调整
   */
  title: {
    textAlign: "center", // 水平居中
    fontSize: isTablet() ? 15 : 14, // 平板字体稍大
    lineHeight: 20, // 行高
    fontSize:12,
    paddingHorizontal: 5, // 水平内边距
    color: '#333', // 文字颜色
    // 适配不同平台字体
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default IndexList;