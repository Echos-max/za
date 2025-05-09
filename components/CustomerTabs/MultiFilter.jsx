import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import request from '../../api/index';

/**
 * 多维度筛选组件
 * 仅显示API返回的筛选选项
 * 
 * @param {Object} props 组件属性
 * @param {Function} props.onFilterChange 筛选条件变化时的回调
 * @param {string} props.categoryId 当前选中的主分类ID
 */
const MultiFilter = ({ onFilterChange, categoryId }) => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);

  // 从API获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await request.get('/openapi/template/vod/category');
        console.log('获取分类数据成功');
        const categoryData = response.data;
        
        // 根据当前主分类ID找到对应的分类
        const category = categoryData.find(item => item.id.toString() === categoryId.toString());
        
        if (category && category.children && category.children.length > 0) {
          console.log(`找到分类: ${category.name}, 子分类数量: ${category.children.length}`);
          setCurrentCategory(category);
          // 设置子分类选项 - 从API获取的子分类
          const subCats = [
            { id: 0, name: '全部' },
            ...category.children.map(child => ({
              id: parseInt(child.id), // 确保ID是数字类型
              name: child.name
            }))
          ];
          setSubCategories(subCats);
        } else {
          console.log('没有找到分类或该分类没有子分类');
          setCurrentCategory(null);
          setSubCategories([{ id: 0, name: '全部' }]);
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
        setCurrentCategory(null);
        setSubCategories([{ id: 0, name: '全部' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    
    // 重置筛选条件
    setSelectedSubCategory(0);
    
    // 通知父组件筛选条件变化
    onFilterChange && onFilterChange({
      categoryId: 0
    });
  }, [categoryId]);

  // 处理筛选选项选择
  const handleSubCategorySelect = (subCategoryId) => {
    console.log(`选择了子分类: id=${subCategoryId}`);
    setSelectedSubCategory(subCategoryId);
    
    // 通知父组件筛选条件变化
    onFilterChange && onFilterChange({
      categoryId: subCategoryId
    });
  };

  // 渲染子分类筛选选项
  const renderSubCategories = () => {
    if (!subCategories || subCategories.length <= 1) {
      return null;
    }

    return (
      <View style={styles.dimensionContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {subCategories.map((option, optionIndex) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterItem,
                selectedSubCategory === option.id && styles.selectedFilterItem,
                optionIndex === 0 && styles.firstItem
              ]}
              onPress={() => handleSubCategorySelect(option.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSubCategory === option.id && styles.selectedFilterText
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF6D3B" />
        <Text style={styles.loadingText}>加载筛选选项...</Text>
      </View>
    );
  }

  // 如果没有子分类，则不显示筛选栏
  if (!currentCategory || !subCategories || subCategories.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {renderSubCategories()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  dimensionContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  filterItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  firstItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  selectedFilterItem: {
    backgroundColor: '#eeeff1',
  },
  filterText: {
    fontSize: 14,

    color: '#666',
  },
  selectedFilterText: {
    color: '#89d79e',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  }
});

export default MultiFilter; 