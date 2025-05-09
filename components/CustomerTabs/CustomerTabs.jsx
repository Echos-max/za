import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import request from '../../api/index'; // 封装的请求模块
import ListIndex from '../ListMovie/index'; // 列表项组件
import MultiFilter from './MultiFilter'; // 导入多维度筛选组件

const CategoryTabs = ({ navigation }) => {
  // 分类数据（可根据API动态获取）
  const categories = [
    { id: '39', name: '电影' },
    { id: '40', name: '电视' },
    { id: '41', name: '综艺' },
    { id: '42', name: '动漫' },
  ];

  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id); // 当前选中分类
  const [categoryId, setCategoryId] = useState(0); // 当前选中子分类ID
  const [datalist, setDatalist] = useState([]);       // 列表数据
  const [isLoading, setIsLoading] = useState(false);  // 加载状态
  const [page, setPage] = useState(1);                // 当前页码
  const [hasMore, setHasMore] = useState(true);       // 是否有更多数据

  /**
   * 获取数据函数
   * @param {string} categoryPid - 父分类ID，如电影、电视的ID
   * @param {number} childCategoryId - 子分类ID，如动作片、喜剧片的ID，0表示全部
   * @param {number} pageNum - 要请求的页码
   * @param {boolean} isLoadMore - 是否是加载更多操作
   */
  const fetchData = useCallback(async (
    categoryPid, 
    childCategoryId = 0, 
    pageNum = 1, 
    isLoadMore = false
  ) => {
    // 如果没有更多数据且是加载更多操作，直接返回
    if (!hasMore && isLoadMore) return;
    
    try {
      setIsLoading(true); // 开始加载
      
      // 构建请求参数
      const params = {
        categoryPid: parseInt(categoryPid), // 父分类ID - 电影、电视等
        page: pageNum,
        limit: 10
      };
      
      // 添加子分类筛选
      if (childCategoryId !== 0) {
        params.categoryId = childCategoryId; // 子分类ID - 动作片、喜剧片等
      }
      
      console.log('发送请求参数:', params); // 调试输出
      
      // 发起API请求
      const response = await request.get(`/openapi/template/vod`, { params });
      console.log('API响应状态:', response.status); // 调试输出
      
      const newData = response.data.list || []; // 获取新数据
      console.log(`获取到${newData.length}条数据`); // 调试输出
      
      // 更新数据列表
      if (isLoadMore) {
        // 加载更多：合并新旧数据
        setDatalist(prev => [...prev, ...newData]);
      } else {
        // 首次加载或切换筛选：直接替换数据
        setDatalist(newData);
      }

      // 判断是否还有更多数据（假设每页10条，不足10条说明是最后一页）
      setHasMore(newData.length >= 10);
      
      // 更新页码（加载成功后页码+1）
      setPage(pageNum + 1);
    } catch (err) {
      console.error('请求失败:', err);
      // 这里可以添加错误提示（如Toast）
    } finally {
      setIsLoading(false); // 无论成功失败都结束加载状态
    }
  }, [hasMore]); // 依赖hasMore保证状态最新

  /**
   * 加载更多处理函数
   */
  const loadMore = () => {
    // 满足条件时发起请求
    if (hasMore && !isLoading) {
      fetchData(selectedCategory, categoryId, page, true);
    }
  };

  // 处理筛选变化
  const handleFilterChange = (filters) => {
    const childId = filters.categoryId;
    console.log('选择了子分类:', childId); // 调试输出
    
    setCategoryId(childId);
    
    // 重置分页参数，从第一页开始获取新数据
    setPage(1);
    setHasMore(true);
    fetchData(selectedCategory, childId, 1, false);
  };

  // 分类切换时的副作用
  useEffect(() => {
    // 重置分页相关状态
    setPage(1);
    setHasMore(true);
    setCategoryId(0); // 重置子分类选择为"全部"
    
    // 加载新分类的第一页数据
    fetchData(selectedCategory, 0, 1, false);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      {/* 分类标签栏 - 水平滚动 */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.tabItem,
              selectedCategory === category.id && styles.activeTabItem
            ]}
          >
            <Text style={[
              styles.tabText,
              selectedCategory === category.id && styles.activeTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 筛选区域 - 仅显示API返回的子分类 */}
      <MultiFilter 
        categoryId={selectedCategory}
        onFilterChange={handleFilterChange}
      />

      {/* 内容列表 - 使用FlatList优化性能 */}
      <FlatList
        data={datalist}
        keyExtractor={(item) => item.id.toString()}  // 确保唯一key
        renderItem={({ item }) => (
          <ListIndex 
            item={item}
            onPress={() => navigation.navigate('Detail', { itemId: item.id })}
          />
        )}
        numColumns={3}                             // 三列布局
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}                    // 触底加载回调
        onEndReachedThreshold={0.2}                // 触底阈值（距离底部20%时触发）
        ListFooterComponent={() => (               // 底部加载指示器
          isLoading && 
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="balck" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
        ListEmptyComponent={                       // 空状态显示
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? '正在加载...' : '暂无数据'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

// 样式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  // 分类标签栏样式
  tabScroll: {
    maxHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tabContainer: {
    paddingHorizontal: 10
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15
  },
  activeTabItem: {
    borderBottomWidth: 2,
  },
  tabText: {
    height: 40,  // 保持点击区域高度
    color: '#666'
  },
  activeTabText: {
    fontWeight: 'bold'
  },
  // 列表容器
  listContainer: {
    marginTop: 2,
    flexDirection: 'row', 
    flexWrap: 'wrap',
  },
  // 加载指示器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  loadingText: {
    color: '#FF6D3B',
    fontSize: 12,
    marginTop: 5
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200
  },
  emptyText: {
    fontSize: 16
  }
});

export default CategoryTabs;