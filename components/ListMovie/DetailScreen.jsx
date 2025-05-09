import { useNavigation, useRoute } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import request from '../../api/index';
import Vdeio from './Vdieo';

export default function Detail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id: videoId } = route.params;
  const scrollViewRef = useRef(null);

  // 状态管理
  const [datalist, setDatalist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState({});
  const [activeSource, setActiveSource] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 监听全屏状态变化的回调函数
  const handleFullscreenChange = (newIsFullscreen) => {
    setIsFullscreen(newIsFullscreen);
    
    // 控制状态栏在全屏模式下的显示
    StatusBar.setHidden(newIsFullscreen);
  };

  // 数据请求
  const fetchData = async () => {
    try {
      const response = await request.get(`/openapi/template/vod/brief/${videoId}`);
      setDatalist(response.data);
      
      const processedSources = processPlayLines(response.data?.info?.info?.lines || []);
      setSources(processedSources);
      
      const firstSourceKey = Object.keys(processedSources)[0];
      setActiveSource(firstSourceKey);
      
      if (processedSources[firstSourceKey]?.episodes?.length > 0) {
        setCurrentEpisode(processedSources[firstSourceKey].episodes[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理播放源数据
  const processPlayLines = (playLines) => {
    return playLines.reduce((acc, line, lineIndex) => {
      const sourceKey = String.fromCharCode(65 + lineIndex);
      
      // 使用line.name作为源名称
      const sourceName = line.name || `源${lineIndex + 1}`;
      
      acc[sourceKey] = {
        name: sourceName,
        episodes: (line.playline || [])
          .filter(addr => addr?.file?.trim())
          .map((addr, addrIndex) => {
            // 生成唯一ID，结合videoID、lineIndex和addrIndex确保唯一性
            const uniqueId = `${videoId}-${lineIndex}-${addrIndex}`;
            
            // 生成完整字段
            return {
              ...addr,
              id: addr.id || 0,                  // 地址ID
              videoLineID: line.id || 0,         // 线路ID
              videoID: videoId,                  // 视频ID
              url: addr.file,                    // 文件地址
              displayName: addr.name,            // 直接使用name
              episodeId: uniqueId,               // 使用唯一ID
              episodeNumber: addrIndex + 1       // 显示的集数
            };
          })
      };

      return acc;
    }, {});
  };

  // 初始化数据加载
  useEffect(() => {
    fetchData();
    
    // 设置屏幕初始方向为纵向
    const setupScreenOrientation = async () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    };
    
    setupScreenOrientation();
    
    // 组件卸载时清理
    return () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    };
  }, [videoId]);

  // 屏幕方向处理
  const [isPortrait, setIsPortrait] = useState(
    Dimensions.get('window').height > Dimensions.get('window').width
  );
  
  useEffect(() => {
    // 检测屏幕方向变化
    const updateLayout = ({ window }) => {
      const newIsPortrait = window.height > window.width;
      setIsPortrait(newIsPortrait);
      
      // 在横屏模式下滚动到顶部
      if (!newIsPortrait && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    };
    
    const dimensionsListener = Dimensions.addEventListener('change', updateLayout);
    
    // 处理Android和iOS返回键
    const handleBackButton = () => {
      if (isFullscreen || !isPortrait) {
        // 如果是横屏或全屏状态，按返回键时先切回竖屏
        setIsFullscreen(false);
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        return true; // 阻止默认返回行为
      }
      return false; // 允许默认返回行为
    };
    
    // 添加返回键监听
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    
    // 清理函数
    return () => {
      dimensionsListener.remove();
      // 使用正确的方法移除监听器
      backHandler.remove();
    };
  }, [isPortrait, isFullscreen]);

  // 渲染剧集按钮
  const renderEpisodes = () => {
    if (!activeSource || !sources[activeSource] || !sources[activeSource].episodes) return null;

    return sources[activeSource].episodes.map((episode) => (
      <TouchableOpacity
        key={episode.episodeId}
        style={[
          styles.episodeButton,
          { width: Dimensions.get('window').width * 0.3 },
          currentEpisode?.episodeId === episode.episodeId && styles.activeEpisode
        ]}
        onPress={() => {
          setCurrentEpisode(episode);
          setIsFullscreen(false); // 切换剧集时退出全屏
          
          // 确保退出全屏时切回竖屏
          if (Platform.OS === 'ios') {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          }
          
          // 选集后滚动回视频区域
          if (scrollViewRef.current && isPortrait) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
          }
        }}
      >
        <Text style={[
          styles.episodeText,
          currentEpisode?.episodeId === episode.episodeId && styles.activeEpisodeText
        ]}>
          {episode.name || episode.subTitle || `第${episode.episodeNumber}集`}
        </Text>
      </TouchableOpacity>
    ));
  };

  // 加载状态处理
  if (loading) {
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="#2678FF" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>数据加载失败：{error}</Text>
      </View>
    );
  }

  return (
    <>
      {/* 视频容器 - 占据全屏或顶部区域 */}
      <View style={[styles.videoContainer, { 
        height: isPortrait ? 250 : Dimensions.get('window').height,
        // 全屏模式下确保视频容器在最上层
        zIndex: isFullscreen ? 999 : 1,
      }]}>
        <Vdeio 
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          navigation={navigation}
          onFullscreenChange={handleFullscreenChange}
          source={{
            // 传递所有需要的字段
            id: currentEpisode?.id,
            episodeId: currentEpisode?.id,
            videoLineID: currentEpisode?.videoLineID,
            videoID: currentEpisode?.videoID,
            url: currentEpisode?.file,
            file: currentEpisode?.file,
            // 附加信息
            episodeInfo: {
              title: datalist?.info?.name + ' - ' + (currentEpisode?.name || currentEpisode?.subTitle || `第${currentEpisode?.episodeNumber}集`),
              episodeNumber: currentEpisode?.episodeNumber,
              currentId: currentEpisode?.id
            }
          }}
        />
      </View>

      {/* 内容区域 - 仅在竖屏模式且不在全屏状态时显示 */}
      {isPortrait && !isFullscreen && (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{datalist?.info?.name}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                年份：{datalist?.info?.year}
              </Text>
            </View>
          </View>

          <View style={styles.episodeSection}>
            <Text style={styles.sectionTitle}>选集</Text>
            
            <View style={styles.sourceTabs}>
              {Object.keys(sources).map((source) => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.tabButton,
                    activeSource === source && styles.activeTab
                  ]}
                  onPress={() => {
                    setActiveSource(source);
                    if (sources[source]?.episodes?.length > 0) {
                      setCurrentEpisode(sources[source].episodes[0]);
                    }
                  }}
                >
                  <Text style={[
                    styles.tabText,
                    activeSource === source && styles.activeTabText
                  ]}>
                    {sources[source].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderEpisodes()}
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </>
  );
}
// 样式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoContainer: {
    width: '100%',
    zIndex: 999,
    backgroundColor: 'black',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#666',
    fontSize: 12,
  },
  episodeSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sourceTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#328ddc',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  episodeList: {
    paddingBottom: 8,
  },
  episodeButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  activeEpisode: {
    backgroundColor: '#328ddc',
  },
  episodeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeEpisodeText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  },
  currentInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8
  },
  currentText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4
  }
});
