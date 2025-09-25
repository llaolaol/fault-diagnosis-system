<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  ElCard, ElRow, ElCol, ElButton, ElButtonGroup, ElIcon, ElEmpty,
  ElTabs, ElTabPane, ElProgress, ElTag, ElDivider, ElCollapse, ElCollapseItem,
  ElDescriptions, ElDescriptionsItem, ElAlert, ElTimeline, ElTimelineItem,
  ElStatistic, ElTooltip
} from 'element-plus';
import { 
  Document, List, Histogram, Files, Warning, InfoFilled, 
  Download, Share, Printer, RefreshRight, TrendCharts,
  CircleCheck, CircleClose, Clock, Location
} from '@element-plus/icons-vue';
import type { ParsedDiagnosisResult } from '@/utils/textParser';

interface Props {
  reportData: {
    raw_text: string;
    parsed_data: ParsedDiagnosisResult;
    summary: string;
    metrics: Record<string, any>;
    input_params: Record<string, number>;
  } | null;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const showRawText = ref(false);
const activeTab = ref('overview');

const getSeverityInfo = (severity?: string) => {
  const configs = {
    '危急': { color: '#f56c6c', bgColor: '#fef0f0', icon: Warning, level: 5, text: '危急' },
    '严重': { color: '#f56c6c', bgColor: '#fef0f0', icon: Warning, level: 4, text: '严重' },
    '警告': { color: '#e6a23c', bgColor: '#fdf6ec', icon: Warning, level: 3, text: '警告' },
    '注意': { color: '#409eff', bgColor: '#ecf5ff', icon: InfoFilled, level: 2, text: '注意' },
    '正常': { color: '#67c23a', bgColor: '#f0f9ff', icon: CircleCheck, level: 1, text: '正常' },
  };
  return configs[severity as keyof typeof configs] || { color: '#909399', bgColor: '#f4f4f5', icon: InfoFilled, level: 0, text: '未知' };
};

const severityConfig = computed(() => {
  return getSeverityInfo(props.reportData?.parsed_data?.severity);
});

const safeReportData = computed(() => props.reportData);

const gasAnalysisData = computed(() => {
  if (!props.reportData?.input_params) return [];
  
  const gasLabels: Record<string, string> = {
    H2_ppm: '氢气 (H2)',
    CH4_ppm: '甲烷 (CH4)',
    C2H6_ppm: '乙烷 (C2H6)',
    C2H4_ppm: '乙烯 (C2H4)',
    C2H2_ppm: '乙炔 (C2H2)',
    CO_ppm: '一氧化碳 (CO)',
    CO2_ppm: '二氧化碳 (CO2)'
  };
  
  return Object.entries(props.reportData.input_params)
    .filter(([key]) => key.endsWith('_ppm'))
    .map(([key, value]) => ({
      name: gasLabels[key] || key,
      value,
      unit: 'ppm',
      key
    }));
});

const hasValidData = computed(() => {
  return props.reportData && props.reportData.parsed_data;
});

const handleExport = (type: string) => {
  console.log(`导出为 ${type}`);
};

const handleShare = () => {
  console.log('分享报告');
};

const handlePrint = () => {
  window.print();
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '未知';
  return new Date(timestamp).toLocaleString('zh-CN');
};
</script>

<template>
  <ElCard class="enhanced-diagnosis-report" shadow="never">
    <template #header>
      <div class="report-header">
        <div class="header-title">
          <ElIcon class="title-icon"><Document /></ElIcon>
          <span>智能诊断报告</span>
          <ElTag v-if="hasValidData" :color="severityConfig.bgColor" :style="{ color: severityConfig.color }" size="small" class="severity-tag">
            {{ severityConfig.text }}
          </ElTag>
        </div>
        
        <div class="header-actions" v-if="hasValidData">
          <ElButtonGroup size="small">
            <ElButton :type="!showRawText ? 'primary' : 'default'" @click="showRawText = false">
              智能报告
            </ElButton>
            <ElButton :type="showRawText ? 'primary' : 'default'" @click="showRawText = true">
              原始数据
            </ElButton>
          </ElButtonGroup>
          
          <ElButtonGroup size="small" class="action-buttons">
            <ElTooltip content="刷新数据" placement="top">
              <ElButton @click="$emit('refresh')" :loading="isLoading">
                <ElIcon><RefreshRight /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="导出PDF" placement="top">
              <ElButton @click="handleExport('pdf')">
                <ElIcon><Download /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="分享报告" placement="top">
              <ElButton @click="handleShare">
                <ElIcon><Share /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="打印报告" placement="top">
              <ElButton @click="handlePrint">
                <ElIcon><Printer /></ElIcon>
              </ElButton>
            </ElTooltip>
          </ElButtonGroup>
        </div>
      </div>
    </template>

    <div class="report-content">
      <!-- 智能报告内容 -->
      <div v-if="hasValidData && !showRawText" class="intelligent-report">
        <!-- 状态概览卡片 -->
        <div class="status-overview-section">
          <ElRow :gutter="16">
            <ElCol :span="8">
              <ElCard class="status-card" shadow="hover" :body-style="{ padding: '20px' }">
                <div class="status-content">
                  <div class="status-icon" :style="{ backgroundColor: severityConfig.bgColor }">
                    <ElIcon :color="severityConfig.color" :size="32">
                      <component :is="severityConfig.icon" />
                    </ElIcon>
                  </div>
                  <div class="status-info">
                    <div class="status-title">故障状态</div>
                    <div class="status-value" :style="{ color: severityConfig.color }">
                      {{ safeReportData?.parsed_data?.severity || '未知' }}
                    </div>
                    <ElProgress 
                      v-if="safeReportData?.parsed_data?.severity_level"
                      :percentage="((safeReportData?.parsed_data?.severity_level || 0) / 5) * 100" 
                      :color="severityConfig.color"
                      :show-text="false"
                      :stroke-width="4"
                      class="severity-progress"
                    />
                  </div>
                </div>
              </ElCard>
            </ElCol>
            
            <ElCol :span="8">
              <ElCard class="info-card" shadow="hover" :body-style="{ padding: '20px' }">
                <div class="statistic-container">
                <div class="statistic-title">故障类型</div>
                <div class="statistic-value">{{ safeReportData?.parsed_data?.fault_type || '未检测到明确故障' }}</div>
              </div>
                <div class="card-footer">
                  <ElIcon color="#409eff"><TrendCharts /></ElIcon>
                  <span class="footer-text">基于AI智能分析</span>
                </div>
              </ElCard>
            </ElCol>
            
            <ElCol :span="8">
              <ElCard class="info-card" shadow="hover" :body-style="{ padding: '20px' }">
                <div class="statistic-container">
                  <div class="statistic-title">诊断时间</div>
                  <div class="statistic-value">{{ formatTimestamp(safeReportData?.metrics?.diagnosis_time as string) }}</div>
                </div>
                <div class="card-footer">
                  <ElIcon color="#67c23a"><Clock /></ElIcon>
                  <span class="footer-text">实时检测完成</span>
                </div>
              </ElCard>
            </ElCol>
          </ElRow>
        </div>

        <!-- Tab内容区域 -->
        <ElTabs v-model="activeTab" class="report-tabs">
          <!-- 概览页 -->
          <ElTabPane label="诊断概览" name="overview">
            <div class="overview-content">
              <!-- 主要诊断结论 -->
              <ElCard class="conclusion-card" shadow="never">
                <template #header>
                  <div class="section-header">
                    <ElIcon><Document /></ElIcon>
                    <span>主要诊断结论</span>
                  </div>
                </template>
                <div class="conclusion-content">
                  <div class="main-diagnosis">
                    <div class="diagnosis-text">
                      {{ reportData?.parsed_data?.main_diagnosis || reportData?.summary || '暂无明确诊断结论' }}
                    </div>
                  </div>
                  
                  <ElAlert 
                    v-if="reportData?.parsed_data?.severity_level && reportData.parsed_data.severity_level >= 3"
                    :title="`${reportData?.parsed_data?.severity}级别故障检测`"
                    :type="reportData.parsed_data.severity_level >= 4 ? 'error' : 'warning'"
                    :description="`建议立即采取相应措施，已检测到${reportData.parsed_data.severity_level}/5级严重程度的设备异常`"
                    show-icon
                    :closable="false"
                    class="severity-alert"
                  />
                </div>
              </ElCard>

              <!-- 气体分析图表 -->
              <ElCard class="chart-card" shadow="never">
                <template #header>
                  <div class="section-header">
                    <ElIcon><Histogram /></ElIcon>
                    <span>气体浓度分析</span>
                  </div>
                </template>
                <div class="gas-analysis-grid">
                  <div v-for="gas in gasAnalysisData" :key="gas.key" class="gas-item">
                    <div class="gas-name">{{ gas.name }}</div>
                    <div class="gas-value">
                      <ElStatistic 
                        :value="gas.value" 
                        suffix="ppm"
                        :value-style="{ color: gas.value > 100 ? '#f56c6c' : '#303133', fontSize: '18px' }"
                      />
                    </div>
                    <ElProgress 
                      :percentage="Math.min((gas.value / 500) * 100, 100)"
                      :color="gas.value > 100 ? '#f56c6c' : gas.value > 50 ? '#e6a23c' : '#67c23a'"
                      :show-text="false"
                      :stroke-width="6"
                    />
                  </div>
                </div>
              </ElCard>
            </div>
          </ElTabPane>

          <!-- 详细分析页 -->
          <ElTabPane label="详细分析" name="analysis">
            <div class="analysis-content">
              <ElCard class="metrics-card" shadow="never">
                <template #header>
                  <div class="section-header">
                    <ElIcon><List /></ElIcon>
                    <span>技术指标</span>
                  </div>
                </template>
                <ElDescriptions :column="2" border>
                  <ElDescriptionsItem 
                    v-for="(value, key) in reportData?.metrics || {}" 
                    :key="key" 
                    :label="String(key).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())"
                  >
                    <ElTag>{{ value }}</ElTag>
                  </ElDescriptionsItem>
                </ElDescriptions>
              </ElCard>

              <!-- 诊断过程时间线 -->
              <ElCard class="timeline-card" shadow="never">
                <template #header>
                  <div class="section-header">
                    <ElIcon><Clock /></ElIcon>
                    <span>分析过程</span>
                  </div>
                </template>
                <ElTimeline>
                  <ElTimelineItem timestamp="数据采集" placement="top">
                    <ElCard>
                      <p>获取设备气体浓度参数</p>
                      <p class="timeline-detail">
                        共采集 {{ gasAnalysisData?.length || 0 }} 项气体指标数据
                      </p>
                    </ElCard>
                  </ElTimelineItem>
                  <ElTimelineItem timestamp="智能分析" placement="top">
                    <ElCard>
                      <p>AI模型进行故障模式识别</p>
                      <p class="timeline-detail">应用多种诊断算法进行综合判断</p>
                    </ElCard>
                  </ElTimelineItem>
                  <ElTimelineItem timestamp="结果生成" placement="top" :icon="CircleCheck" color="#67c23a">
                    <ElCard>
                      <p>生成诊断报告和建议措施</p>
                      <p class="timeline-detail">
                        检测状态: {{ reportData?.parsed_data?.severity || '未知' }}
                      </p>
                    </ElCard>
                  </ElTimelineItem>
                </ElTimeline>
              </ElCard>
            </div>
          </ElTabPane>

          <!-- 建议措施页 -->
          <ElTabPane label="建议措施" name="recommendations">
            <ElCard class="recommendations-card" shadow="never">
              <template #header>
                <div class="section-header">
                  <ElIcon><Files /></ElIcon>
                  <span>操作建议</span>
                  <ElTag v-if="reportData?.parsed_data?.recommendations?.length" type="info" size="small">
                    {{ reportData.parsed_data.recommendations.length }} 项建议
                  </ElTag>
                </div>
              </template>
              
              <div v-if="reportData?.parsed_data?.recommendations?.length" class="recommendations-list">
                <div 
                  v-for="(recommendation, index) in reportData?.parsed_data?.recommendations || []" 
                  :key="index"
                  class="recommendation-item"
                >
                  <div class="recommendation-priority">
                    <ElTag 
                      :type="index < 2 ? 'danger' : index < 4 ? 'warning' : 'info'" 
                      size="small"
                    >
                      优先级 {{ index + 1 }}
                    </ElTag>
                  </div>
                  <div class="recommendation-content">
                    <h4>{{ recommendation }}</h4>
                    <p class="recommendation-desc">
                      基于当前{{ reportData?.parsed_data?.severity || '未知' }}级别故障状态的专业建议
                    </p>
                  </div>
                  <div class="recommendation-status">
                    <ElButton size="small" type="primary" plain>
                      标记已执行
                    </ElButton>
                  </div>
                </div>
              </div>
              
              <ElEmpty v-else description="暂无具体建议措施" />
            </ElCard>
          </ElTabPane>

          <!-- 原始数据页 -->
          <ElTabPane label="原始数据" name="raw">
            <ElCard class="raw-data-card" shadow="never">
              <template #header>
                <div class="section-header">
                  <ElIcon><Document /></ElIcon>
                  <span>完整报告</span>
                  <ElButton size="small" @click="handleExport('txt')">
                    <ElIcon><Download /></ElIcon>
                    导出文本
                  </ElButton>
                </div>
              </template>
              <div class="raw-content">
                <pre class="raw-text">{{ reportData?.raw_text || '' }}</pre>
              </div>
            </ElCard>
          </ElTabPane>
        </ElTabs>
      </div>

      <!-- 原始文本显示 -->
      <div v-else-if="hasValidData && showRawText" class="raw-text-display">
        <ElCard shadow="never">
          <pre class="raw-text-pre">{{ safeReportData?.raw_text || '' }}</pre>
        </ElCard>
      </div>

      <!-- 空状态 -->
      <ElEmpty v-else description="暂无诊断结果，请先进行故障诊断" class="empty-state">
        <template #image>
          <ElIcon size="64" color="#c0c4cc"><Document /></ElIcon>
        </template>
        <template #description>
          <p>点击左侧"开始诊断"按钮获取智能分析报告</p>
        </template>
      </ElEmpty>
    </div>
  </ElCard>
</template>

<style scoped>
.enhanced-diagnosis-report {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.enhanced-diagnosis-report :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  color: #409eff;
}

.severity-tag {
  font-weight: 500;
  border: none;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.report-content {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: #fafbfc;
}

.intelligent-report {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-overview-section {
  margin-bottom: 20px;
}

.status-card .status-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.status-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.severity-progress {
  margin-top: 8px;
}

.info-card .card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.statistic-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.statistic-title {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.statistic-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.footer-text {
  font-size: 12px;
  color: #909399;
}

.report-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.report-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.conclusion-card,
.chart-card,
.metrics-card,
.timeline-card,
.recommendations-card,
.raw-data-card {
  border: none;
  margin-bottom: 20px;
}

.main-diagnosis {
  margin-bottom: 16px;
}

.diagnosis-text {
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f9ff 100%);
  border-left: 4px solid #409eff;
  padding: 20px;
  border-radius: 0 8px 8px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #2c3e50;
  font-weight: 500;
}

.severity-alert {
  margin-top: 16px;
}

.gas-analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 8px 0;
}

.gas-item {
  text-align: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.gas-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.gas-name {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
}

.gas-value {
  margin-bottom: 12px;
}

.timeline-detail {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
  line-height: 1.4;
}

.recommendation-desc {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.raw-content {
  max-height: 500px;
  overflow: auto;
}

.raw-text,
.raw-text-pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.raw-text-display {
  height: 100%;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .gas-analysis-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .recommendation-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

/* 打印样式 */
@media print {
  .header-actions,
  .report-tabs :deep(.el-tabs__header) {
    display: none !important;
  }
  
  .raw-text,
  .raw-text-pre {
    background: white !important;
    color: black !important;
    border: 1px solid #ddd !important;
  }
  
  .gas-item {
    break-inside: avoid;
  }
}
</style>