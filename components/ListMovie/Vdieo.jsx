import { faCircleChevronLeft, faCompress, faExpand, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Slider from '@react-native-community/slider';
import { Audio, ResizeMode, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import request from '../../api/index';

function Vdeio({ style, resizeMode, source, navigation, onFullscreenChange }) {
  const [DateVedio, setDateVedio] = useState([]);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: 250
  });
  const [deviceOrientation, setDeviceOrientation] = useState(
    Dimensions.get('window').height > Dimensions.get('window').width ? 'portrait' : 'landscape'
  );
  
  // 格式化时间（将秒转换为 mm:ss 格式）
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds && timeInSeconds !== 0) return "00:00:00";
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 更新全屏状态并通知父组件
  const updateFullscreenState = (newState) => {
    setIsFullscreen(newState);
    // 如果存在回调函数，则通知父组件全屏状态已更改
    if (onFullscreenChange) {
      onFullscreenChange(newState);
    }
  };
  
  useEffect(() => {
    // 当有新的source传入时，打印ID信息
    if (source) {
      console.log('Vdeio组件接收到的ID:', source.id);
      console.log('Vdeio组件接收到的episodeId:', source.episodeId);
      console.log('Vdeio组件接收到的episodeInfo:', source.episodeInfo);
    }
  }, [source]);
  
  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleOrientationChange = async ({ window }) => {
      const isPortrait = window.height > window.width;
      const newOrientation = isPortrait ? 'portrait' : 'landscape';
      
      console.log('屏幕方向变化:', newOrientation, '当前全屏状态:', isFullscreen);
      
      // 更新设备方向状态
      setDeviceOrientation(newOrientation);
      
      // 如果在全屏模式下检测到设备方向变为竖屏，强制横屏
      if (isFullscreen && newOrientation === 'portrait') {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
        } catch (error) {
          console.error("锁定屏幕方向失败:", error);
          // 尝试替代方案
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        return;
      }
      
      // 根据设备方向和全屏状态调整视频尺寸
      if (isFullscreen) {
        // 全屏模式下适应屏幕尺寸
        setDimensions({
          width: Math.max(window.width, window.height),
          height: Math.min(window.width, window.height)
        });
      } else {
        // 非全屏状态下，使用固定高度的竖屏布局
        setDimensions({
          width: Dimensions.get('window').width,
          height: 250 // 固定高度
        });
      }
    };
    
    const subscription = Dimensions.addEventListener('change', handleOrientationChange);
    
    // 初始设置
    handleOrientationChange({ window: Dimensions.get('window') });
    
    return () => subscription.remove();
  }, [isFullscreen]);
  
  // 请求数据
  const ferchDate = async () => {
    try {
      const response = await request.get(`/openapi/playline/${source.id}`)
      setDateVedio(response.data.info)
      console.log('我是视频数据', response.data);
      setVideoLoading(false);
    } catch (err) {
      console.error('获取视频数据失败:', err);
      setVideoLoading(false);
    }
  }
  
  useEffect(() => {
    if (source && source.id) {
      setVideoLoading(true);
      ferchDate();
    }
  }, [source?.id]);
  
  // 声音组件设置
  const setupAudio = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true, // 关键！允许静音模式下播放
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  };

  // 初始化音频设置
  useEffect(() => {
    setupAudio();
    
    // 组件卸载时清理控制显示定时器
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // 处理全屏状态变化 (仅用于Android)
  const handleFullscreenUpdate = async ({ fullscreenUpdate }) => {
    // 仅在Android平台处理系统全屏事件
    if (Platform.OS === 'android') {
      switch (fullscreenUpdate) {
        case Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT:
          // 即将进入全屏
          console.log("进入全屏模式");
          updateFullscreenState(true);
          setShowControls(true);
          
          // 强制锁定为横屏模式
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            
            // 设置视频尺寸为全屏
            const {width, height} = Dimensions.get('window');
            setDimensions({
              width: Math.max(width, height),
              height: Math.min(width, height)
            });
          } catch (error) {
            console.error("锁定屏幕方向失败:", error);
            // 尝试替代方案
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          }
          break;
          
        case Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT:
          // 已经进入全屏
          console.log("已进入全屏模式");
          // 确保方向为横屏
          setDeviceOrientation('landscape');
          break;
          
        case Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS:
          // 即将退出全屏
          console.log("即将退出全屏模式");
          updateFullscreenState(false);
          break;
          
        case Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS:
          // 已经退出全屏
          console.log("已退出全屏模式");
          
          // 延迟一下再锁定为竖屏，避免过快切换导致的问题
          setTimeout(async () => {
            try {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
              
              // 恢复原始视频尺寸
              setDimensions({
                width: Dimensions.get('window').width,
                height: 250
              });
              
              // 更新方向状态
              setDeviceOrientation('portrait');
            } catch (error) {
              console.error("锁定为竖屏失败:", error);
            }
          }, 300);
          break;
      }
    }
  };
  
  // 自定义控制器显示/隐藏处理
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // 3秒后隐藏控制器
  };
  
  // 点击视频区域时切换控制器显示状态
  const toggleControls = () => {
    if (showControls) {
      // 如果控制器已显示，则清除超时并隐藏控制器
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(false);
    } else {
      // 如果控制器隐藏，则显示并设置隐藏超时
      setShowControls(true);
      resetControlsTimeout();
    }
  };
  
  // 播放/暂停切换
  const togglePlayback = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      resetControlsTimeout();
    }
  };
  
  // 返回按钮处理
// 返回按钮处理
const handleBackPress = async () => {
  if (isFullscreen) {
    try {
      // 先更新全屏状态
      updateFullscreenState(false);
      
      // Android需要先关闭全屏播放器
      if (Platform.OS === 'android' && videoRef.current) {
        await videoRef.current.dismissFullscreenPlayer();
      }
      
      // 显示状态栏
      StatusBar.setHidden(false);
      
      // 延迟处理屏幕方向和尺寸
      setTimeout(async () => {
        try {
          // 先设置竖屏尺寸
          setDimensions({
            width: Dimensions.get('window').width,
            height: 250
          });
          
          // 更新方向状态
          setDeviceOrientation('portrait');
          
          // 然后锁定屏幕方向
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          console.log('屏幕已锁定为竖屏');
        } catch (error) {
          console.error('锁定为竖屏失败:', error);
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          } catch (e) {
            console.error('备用锁定也失败:', e);
          }
        }
      }, 500);
      
      // 显示控制器
      setShowControls(true);
      resetControlsTimeout();
    } catch (error) {
      console.error('切换回竖屏模式失败:', error);
      
      // 出错时强制重置
      updateFullscreenState(false);
      setDimensions({
        width: Dimensions.get('window').width,
        height: 250
      });
      StatusBar.setHidden(false);
    }
  } else if (navigation && navigation.goBack) {
    // 如果有导航对象，则返回上一页
    navigation.goBack();
  }
};
  
  // 计算最适合的调整模式
  // 竖屏时使用CONTAIN，横屏全屏时使用COVER以充满屏幕
  const currentResizeMode = isFullscreen 
    ? ResizeMode.COVER 
    : (resizeMode || ResizeMode.CONTAIN);
  
  // 自定义切换全屏状态方法
// 自定义切换全屏状态方法
const toggleFullscreen = async () => {
  try {
    const newIsFullscreen = !isFullscreen;
    
    if (newIsFullscreen) {
      // 进入自定义全屏模式
      StatusBar.setHidden(true);
      
      // 强制锁定横屏方向
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } catch (error) {
        console.error('锁定屏幕方向失败:', error);
        // 尝试替代方案
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      
      // 设置视频尺寸为全屏
      const {width, height} = Dimensions.get('window');
      setDimensions({
        width: Math.max(width, height),
        height: Math.min(width, height)
      });
      
      // Android使用原生全屏功能
      if (Platform.OS === 'android') {
        if (videoRef.current) {
          await videoRef.current.presentFullscreenPlayer();
        }
      }
    } else {
      // 退出自定义全屏模式
      StatusBar.setHidden(false);
      
      // Android先退出全屏播放器
      if (Platform.OS === 'android' && videoRef.current) {
        await videoRef.current.dismissFullscreenPlayer();
      }
      
      // 使用延时确保切换动画完成后再改变方向
      setTimeout(async () => {
        try {
          // 先恢复竖屏尺寸
          setDimensions({
            width: Dimensions.get('window').width,
            height: 250
          });
          
          // 更新方向状态
          setDeviceOrientation('portrait');
          
          // 最后锁定为竖屏方向
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } catch (error) {
          console.error('锁定屏幕方向失败:', error);
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
          } catch (e) {
            console.error('备用方向锁定也失败:', e);
          }
        }
      }, 500);
    }
    
    // 更新状态并通知父组件
    updateFullscreenState(newIsFullscreen);
    
    // 重新显示控件
    setShowControls(true);
    resetControlsTimeout();
  } catch (error) {
    console.error('切换全屏模式失败:', error);
  }
};
  
  return (
    <View style={[styles.container, style, 
      isFullscreen ? {
        width: dimensions.width, 
        height: dimensions.height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: '#000',
      } : {
        // 非全屏固定为竖屏样式
        width: Dimensions.get('window').width,
        height: 250,
      }
    ]}>
      {videoLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>视频加载中...</Text>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={toggleControls}>
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              style={styles.video}
              source={{ uri: DateVedio.file }}
              resizeMode={currentResizeMode}
              shouldPlay
              isMuted={false}
              onFullscreenUpdate={handleFullscreenUpdate}
              isLooping={false}
              progressUpdateIntervalMillis={1000}
              onPlaybackStatusUpdate={status => {
                setStatus(() => status);
              }}
              // 禁用原生控制器，使用自定义控制器
              useNativeControls={false}
              // iOS系统关闭原生全屏特性，使用自定义实现
              presentFullscreenPlayer={Platform.OS === 'android' && isFullscreen}
              fullscreenUpdate={Platform.OS === 'android' ? Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT : undefined}
            />
            
            {/* 自定义控制器 */}
            {showControls && (
              <View style={styles.controlsContainer}>
                {/* 顶部控制栏 - 返回按钮区域 */}
                <View style={styles.topControls}>
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={handleBackPress}
                  >
                <FontAwesomeIcon icon={faCircleChevronLeft} size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  {/* 视频标题区域 */}
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {source?.episodeInfo?.title || '正在播放'}
                  </Text>
                </View>
                
                {/* 中间区域 - 播放/暂停按钮 */}
                <View style={styles.centerControls}>
                  <TouchableOpacity 
                    style={styles.playPauseButton}
                    onPress={togglePlayback}
                  >
                    {status.isPlaying ? (
                      <FontAwesomeIcon icon={faPause} size={24} color="#fff" />
                    ) : (
                      <FontAwesomeIcon icon={faPlay } size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* 底部控制栏 - 进度条和全屏按钮 */}
                <View style={styles.bottomControls}>
                  {/* 进度时间显示 */}
                  <Text style={styles.timeText}>
                    {formatTime(status.positionMillis ? status.positionMillis / 1000 : 0)}
                  </Text>
                  
                  {/* 进度条 */}
                  <Slider
                    style={styles.progressBar}
                    minimumValue={0}
                    maximumValue={status.durationMillis ? status.durationMillis : 1}
                    value={status.positionMillis || 0}
                    minimumTrackTintColor="#FF0000"
                    maximumTrackTintColor="#FFFFFF"
                    thumbTintColor="#FF0000"
                    onSlidingComplete={async (value) => {
                      await videoRef.current.setPositionAsync(value);
                      resetControlsTimeout();
                    }}
                  />
                  
                  {/* 总时长 */}
                  <Text style={styles.timeText}>
                    {formatTime(status.durationMillis ? status.durationMillis / 1000 : 0)}
                  </Text>
                  
                  {/* 全屏按钮 */}
                  <TouchableOpacity 
                    style={styles.fullscreenButton} 
                    onPress={toggleFullscreen}
                  >
                    {isFullscreen ? (
                <FontAwesomeIcon icon={faCompress} size={24} color="#fff" />
                    ) : (
                 <FontAwesomeIcon icon={faExpand} size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

// 样式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  // 自定义控制器样式
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: (Platform.OS === 'ios' && !StatusBar.currentHeight) ? 40 : (StatusBar.currentHeight || 16),
    height: 60,
  },
  backButton: {
    padding: 8,
  },
  videoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  centerControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    height: 60,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  fullscreenButton: {
    padding: 8,
    marginLeft: 8,
  }
});

export default Vdeio;