<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import { 
  ElCard, ElProgress, ElIcon, ElTag, ElTooltip
} from 'element-plus';
import { 
  Warning, CircleCheck, Clock, Monitor, InfoFilled
} from '@element-plus/icons-vue';

interface Props {
  severity?: string;
  severityLevel?: number;
  faultType?: string;
  diagnosisTime?: string;
  deviceId?: string;
}

const props = defineProps<Props>();

// 严重性配置
const severityConfig = computed(() => {
  const config = {
    '正常': { 
      color: '#67c23a', 
      bgColor: '#f0f9ff', 
      borderColor: '#67c23a',
      icon: CircleCheck, 
      level: 1,
      status: 'success'
    },
    '注意': { 
      color: '#409eff', 
      bgColor: '#ecf5ff', 
      borderColor: '#409eff',
      icon: InfoFilled, 
      level: 2,
      status: 'primary'
    },
    '警告': { 
      color: '#e6a23c', 
      bgColor: '#fdf6ec', 
      borderColor: '#e6a23c',
      icon: Warning, 
      level: 3,
      status: 'warning'
    },
    '严重': { 
      color: '#f56c6c', 
      bgColor: '#fef0f0', 
      borderColor: '#f56c6c',
      icon: Warning, 
      level: 4,
      status: 'danger'
    },
    '危急': { 
      color: '#f56c6c', 
      bgColor: '#fef0f0', 
      borderColor: '#f56c6c',
      icon: Warning, 
      level: 5,
      status: 'danger'
    }
  };
  
  return config[props.severity as keyof typeof config] || {
    color: '#909399',
    bgColor: '#f4f4f5',
    borderColor: '#dcdfe6',
    icon: InfoFilled,
    level: 0,
    status: 'info'
  };
});

// 进度条百分比
const progressPercentage = computed(() => {
  return props.severityLevel ? (props.severityLevel / 5) * 100 : 0;
});

// 故障类型图标
const faultTypeIcon = computed(() => {
  const typeIconMap: { [key: string]: any } = {
    '高能电弧放电': '⚡',
    '局部放电': '🔹',
    '过热故障': '🌡️',
    '绝缘故障': '🛡️',
    '接触不良': '🔌',
    '机械故障': '⚙️'
  };
  
  return typeIconMap[props.faultType || ''] || '⚠️';
});

// 设备状态
const deviceStatus = computed(() => {
  if (!props.severity) return 'unknown';
  
  const statusMap: { [key: string]: string } = {
    '正常': 'running',
    '注意': 'monitoring',
    '警告': 'warning',
    '严重': 'fault',
    '危急': 'emergency'
  };
  
  return statusMap[props.severity] || 'unknown';
});

const getDeviceStatusConfig = (status: string) => {
  const configs = {
    'running': { label: '正常运行', color: '#67c23a', icon: '🟢' },
    'monitoring': { label: '监控中', color: '#409eff', icon: '🔵' },
    'warning': { label: '需关注', color: '#e6a23c', icon: '🟡' },
    'fault': { label: '故障状态', color: '#f56c6c', icon: '🔴' },
    'emergency': { label: '紧急停机', color: '#f56c6c', icon: '🚨' },
    'unknown': { label: '状态未知', color: '#909399', icon: '⚪' }
  };
  
  return configs[status] || configs.unknown;
};

const deviceStatusConfig = computed(() => getDeviceStatusConfig(deviceStatus.value));

// 格式化时间
const formattedTime = computed(() => {
  if (!props.diagnosisTime) return '未知';
  
  try {
    const date = new Date(props.diagnosisTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return props.diagnosisTime;
  }
});
</script>

<template>
  <ElCard 
    class="status-card" 
    shadow="never"
    :style="{ 
      borderLeftColor: severityConfig.borderColor,
      backgroundColor: severityConfig.bgColor 
    }"
  >
    <div class="status-content">
      <!-- 左侧：严重性展示 -->
      <div class="severity-section">
        <div class="severity-header">
          <ElIcon 
            :size="32" 
            :color="severityConfig.color" 
            class="severity-icon"
          >
            <component :is="severityConfig.icon" />
          </ElIcon>
          
          <div class="severity-info">
            <div class="severity-level">
              <span 
                class="severity-text" 
                :style="{ color: severityConfig.color }"
              >
                {{ severity || '未知' }}
              </span>
              <ElTag 
                v-if="severityLevel" 
                :type="severityConfig.status"
                size="small"
                class="level-tag"
              >
                等级 {{ severityLevel }}/5
              </ElTag>
            </div>
            
            <div class="fault-type-display">
              <span class="fault-icon">{{ faultTypeIcon }}</span>
              <span class="fault-text">{{ faultType || '未确定故障类型' }}</span>
            </div>
          </div>
        </div>

        <!-- 严重性进度条 -->
        <div class="severity-progress">
          <ElTooltip 
            :content="`严重等级: ${severityLevel || 0}/5`"
            placement="top"
          >
            <ElProgress
              :percentage="progressPercentage"
              :color="severityConfig.color"
              :stroke-width="8"
              :show-text="false"
              class="level-progress"
            />
          </ElTooltip>
          
          <div class="progress-labels">
            <span class="label-start">正常</span>
            <span class="label-end">危急</span>
          </div>
        </div>
      </div>

      <!-- 右侧：设备和时间信息 -->
      <div class="info-section">
        <!-- 设备状态 -->
        <div class="info-item device-status">
          <div class="info-header">
            <ElIcon class="info-icon"><Monitor /></ElIcon>
            <span class="info-label">设备状态</span>
          </div>
          <div class="info-content">
            <span class="status-indicator">{{ deviceStatusConfig.icon }}</span>
            <span 
              class="status-text"
              :style="{ color: deviceStatusConfig.color }"
            >
              {{ deviceStatusConfig.label }}
            </span>
          </div>
          <div class="device-id" v-if="deviceId">
            设备ID: {{ deviceId }}
          </div>
        </div>

        <!-- 诊断时间 -->
        <div class="info-item diagnosis-time">
          <div class="info-header">
            <ElIcon class="info-icon"><Clock /></ElIcon>
            <span class="info-label">诊断时间</span>
          </div>
          <div class="info-content">
            <span class="time-text">{{ formattedTime }}</span>
          </div>
        </div>

        <!-- 响应状态指示器 -->
        <div class="response-indicators">
          <div class="indicator-item">
            <div class="indicator-dot active"></div>
            <span>实时监控</span>
          </div>
          <div class="indicator-item">
            <div class="indicator-dot" :class="{ active: severityLevel && severityLevel > 2 }"></div>
            <span>预警激活</span>
          </div>
          <div class="indicator-item">
            <div class="indicator-dot" :class="{ active: severityLevel && severityLevel > 3 }"></div>
            <span>应急响应</span>
          </div>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.status-card {
  border: none;
  border-left: 6px solid;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.status-content {
  display: flex;
  gap: 32px;
  padding: 8px;
}

.severity-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.severity-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.severity-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.severity-info {
  flex: 1;
}

.severity-level {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.severity-text {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.level-tag {
  font-weight: 600;
}

.fault-type-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fault-icon {
  font-size: 16px;
}

.fault-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.severity-progress {
  margin-top: 8px;
}

.level-progress {
  margin-bottom: 4px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #909399;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.info-icon {
  color: #409eff;
  font-size: 14px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  font-size: 12px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
}

.device-id {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.time-text {
  font-size: 13px;
  color: #303133;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.response-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #606266;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dcdfe6;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #67c23a;
  box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .severity-header {
    gap: 12px;
  }
  
  .severity-text {
    font-size: 20px;
  }
  
  .info-section {
    gap: 16px;
  }
  
  .response-indicators {
    flex-direction: row;
    justify-content: space-around;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .info-item {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .response-indicators {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>