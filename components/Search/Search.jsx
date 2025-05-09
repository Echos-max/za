/**
 * Search.jsx
 * 
 * 搜索栏组件
 * 提供搜索功能入口，点击后导航到搜索页面
 */
import { faHistory, faSearch } from '@fortawesome/free-solid-svg-icons'; // 导入搜索图标
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // 导入Font Awesome组件
import { useNavigation } from "@react-navigation/native"; // 导入导航钩子
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'; // 导入React Native组件

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
 * 搜索栏组件
 * 点击后导航到搜索页面
 * 
 * @returns {React.Component} 搜索栏组件
 */
function Search(){
    const navigation = useNavigation(); // 获取导航对象
    
    // 根据设备类型调整搜索图标大小
    const iconSize = isTablet() ? 14 :14 ;
    
    return(
        <View style={styles.maincointenty}>
            <View style={styles.main}>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => navigation.navigate('SearchScreen')}
                    activeOpacity={0.7} // 点击时的不透明度变化，提供触摸反馈
                >
                    <FontAwesomeIcon
                        icon={faSearch} // 搜索图标
                        size={iconSize} // 根据设备类型动态调整大小
                        color="#797979"
                        style={styles.searchIcon}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.history}>
                <TouchableOpacity>
                <FontAwesomeIcon
                        icon={faHistory} // 搜索图标
                        size={iconSize} // 根据设备类型动态调整大小
                        color="#797979"
                        style={styles.searchIcons}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/**
 * 组件样式表
 * 定义搜索栏和图标样式
 */
const styles = StyleSheet.create({
    // 主要
    maincointenty:{
        width:"100%",
        height:60,
        padding:"4.5%",
        flexDirection:'row',
    },
    // 左侧搜索
    main:{
        width:"90%",
        height:35,
        borderRadius:14,
        backgroundColor:"#F6F6F6"
    },
    searchIcon:{
        marginLeft:"3%",
        marginTop:"3%"
    },
    // 历史
    history:{
        marginTop:"2%",
        marginLeft:"2%",
    },
    searchIcons:{
        arginLeft:"3%",
        marginTop:"3%",
    }
});

export default Search;