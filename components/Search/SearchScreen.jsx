import { faArrowAltCircleLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from "@react-navigation/native";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import request from '../../api/index';

const SearchScreen = () => {
  const [input, setInput] = useState('');
  const [dateList, setDateList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  // 图片地址
    const baseUrl ='https://zaxd.fun'
// 搜索
  const handleSearch = async () => {
    if (!input.trim()) {
      setError('请输入搜索内容');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await request.get('/openapi/template/vod', {
        params: { keyword: input.trim() }
      });

      // 根据实际API返回数据结构调整
      const rawData = response.data;
      const listData = Array.isArray(rawData) 
        ? rawData 
        : rawData?.results || rawData?.list || [];

      if (listData.length === 0) {
        setError('没有找到相关内容');
      }
      
      setDateList(listData);
      console.log('我是',listData);
      
    } catch (err) {
      console.error('搜索请求失败:', err);
      setError('搜索失败，请检查网络连接');
      setDateList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderListItem = (item, index) => (
    <View key={`item-${index}`} style={styles.listItem}>

      <Image
        source={{  uri: `${baseUrl}${item?.verticalPoster}` || 'https://zaxd.fun/default-cover.jpg' }}
        style={styles.poster}
      />
        <TouchableOpacity
          onPress={() => {
            console.log('正在传递的ID:', item.id); // 添加这一行
            navigation.navigate("Detail", { id: item.id });
          }}
          activeOpacity={0.8}
        >
                <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title || '未知剧名'}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {item.num ? `全${item.num}集` : '集数信息暂无'}
          </Text>
          <Text style={styles.metaText}>
            {item.year || '年份未知'}
          </Text>
        </View>
      </View>
        </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <FontAwesomeIcon icon={faArrowAltCircleLeft} size={20} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <FontAwesomeIcon
            icon={faSearch}
            size={16}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="请输入剧名..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSearch}
          disabled={isLoading}
        >
          <FontAwesomeIcon 
            icon={faSearch} 
            size={20} 
            color={isLoading ? "#ccc" : "#333"} 
          />
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>搜索中...</Text>
        </View>
      ) : error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {dateList.map(renderListItem)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop:"10%",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 40,

    paddingTop:5,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  listItem: {
    height:"75%",
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',

  },
  poster: {
    width: 100,
    height: 140,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
    paddingHorizontal: 4,
  },
});

export default SearchScreen;