<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import { 
  ElCard, ElTabs, ElTabPane, ElButton, ElButtonGroup, ElIcon, ElEmpty
} from 'element-plus';
import { 
  Download, Share, Printer, RefreshRight
} from '@element-plus/icons-vue';
import StatusCard from './StatusCard.vue';
import DiagnosisCharts from './DiagnosisCharts.vue';
import ActionPanel from './ActionPanel.vue';

interface Props {
  reportData: any;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const activeTab = ref('overview');
const showRawText = ref(false);

const hasValidData = computed(() => {
  return props.reportData && props.reportData.parsed_data;
});

const handleExportPDF = () => {
  // TODO: 实现PDF导出功能
  console.log('导出PDF');
};

const handleExportExcel = () => {
  // TODO: 实现Excel导出功能
  console.log('导出Excel');
};

const handleShare = () => {
  // TODO: 实现分享功能
  console.log('分享报告');
};

const handlePrint = () => {
  window.print();
};

const handleRefresh = () => {
  // TODO: 实现刷新功能
  console.log('刷新数据');
};
</script>

<template>
  <ElCard class="diagnosis-report-container" shadow="never">
    <template #header>
      <div class="report-header">
        <div class="header-title">
          <ElIcon class="title-icon"><Document /></ElIcon>
          <span>智能诊断报告</span>
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
            <ElButton @click="handleRefresh" :loading="isLoading">
              <ElIcon><RefreshRight /></ElIcon>
            </ElButton>
            <ElButton @click="handleExportPDF">
              <ElIcon><Download /></ElIcon>
              PDF
            </ElButton>
            <ElButton @click="handleExportExcel">
              <ElIcon><Download /></ElIcon>
              Excel
            </ElButton>
            <ElButton @click="handleShare">
              <ElIcon><Share /></ElIcon>
            </ElButton>
            <ElButton @click="handlePrint">
              <ElIcon><Printer /></ElIcon>
            </ElButton>
          </ElButtonGroup>
        </div>
      </div>
    </template>

    <div class="report-content">
      <div v-if="hasValidData && !showRawText" class="intelligent-report">
        <!-- 状态概览卡片 -->
        <StatusCard 
          :severity="reportData.parsed_data.severity"
          :severity-level="reportData.parsed_data.severity_level"
          :fault-type="reportData.parsed_data.fault_type"
          :diagnosis-time="reportData.metrics?.diagnosis_time"
          :device-id="reportData.metrics?.device_id"
        />

        <!-- Tab页签内容 -->
        <ElTabs v-model="activeTab" class="report-tabs">
          <ElTabPane label="诊断概览" name="overview">
            <div class="overview-content">
              <DiagnosisCharts 
                :input-params="reportData.input_params"
                :parsed-data="reportData.parsed_data"
                :metrics="reportData.metrics"
              />
              
              <!-- 主要诊断结论 -->
              <ElCard class="diagnosis-conclusion" shadow="never">
                <template #header>
                  <h3 class="section-title">
                    <ElIcon><Document /></ElIcon>
                    主要诊断结论
                  </h3>
                </template>
                <div class="conclusion-content">
                  <p class="main-diagnosis">
                    {{ reportData.parsed_data.main_diagnosis || '暂无明确诊断结论' }}
                  </p>
                  <div class="diagnosis-summary" v-if="reportData.summary">
                    <div class="summary-tag">诊断摘要</div>
                    <p>{{ reportData.summary }}</p>
                  </div>
                </div>
              </ElCard>
            </div>
          </ElTabPane>

          <ElTabPane label="详细分析" name="analysis">
            <div class="analysis-content">
              <!-- 气体分析详情 -->
              <ElCard class="analysis-section" shadow="never">
                <template #header>
                  <h3 class="section-title">
                    <ElIcon><Histogram /></ElIcon>
                    气体分析详情
                  </h3>
                </template>
                <div class="gas-analysis">
                  <div class="gas-grid">
                    <div v-for="(value, key) in reportData.input_params" :key="key" class="gas-item">
                      <div class="gas-name">{{ key.replace('_ppm', '').toUpperCase() }}</div>
                      <div class="gas-value">{{ value }} <span class="unit">ppm</span></div>
                    </div>
                  </div>
                </div>
              </ElCard>

              <!-- 关键指标 -->
              <ElCard class="metrics-section" shadow="never" v-if="reportData.metrics && Object.keys(reportData.metrics).length">
                <template #header>
                  <h3 class="section-title">
                    <ElIcon><DataAnalysis /></ElIcon>
                    关键指标
                  </h3>
                </template>
                <div class="metrics-grid">
                  <div v-for="(value, key) in reportData.metrics" :key="key" class="metric-item">
                    <div class="metric-label">{{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}</div>
                    <div class="metric-value">{{ value }}</div>
                  </div>
                </div>
              </ElCard>
            </div>
          </ElTabPane>

          <ElTabPane label="建议措施" name="recommendations">
            <ActionPanel 
              :recommendations="reportData.parsed_data.recommendations"
              :severity="reportData.parsed_data.severity"
            />
          </ElTabPane>

          <ElTabPane label="原始报告" name="raw">
            <ElCard class="raw-report-section" shadow="never">
              <div class="raw-content">
                <pre class="raw-text">{{ reportData.raw_text }}</pre>
              </div>
            </ElCard>
          </ElTabPane>
        </ElTabs>
      </div>

      <!-- 原始文本显示 -->
      <div v-else-if="hasValidData && showRawText" class="raw-text-display">
        <pre class="raw-text-pre">{{ reportData.raw_text }}</pre>
      </div>

      <!-- 空状态 -->
      <ElEmpty v-else description="暂无诊断结果，请先进行故障诊断" class="empty-state">
        <template #image>
          <div class="empty-icon">📊</div>
        </template>
      </ElEmpty>
    </div>
  </ElCard>
</template>

<style scoped>
.diagnosis-report-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.diagnosis-report-container :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.title-icon {
  margin-right: 8px;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-buttons .el-button {
  padding: 6px 12px;
}

.report-content {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
}

.intelligent-report {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diagnosis-conclusion {
  border: none;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.conclusion-content {
  padding: 0;
}

.main-diagnosis {
  background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
  border-left: 4px solid #409eff;
  padding: 16px 20px;
  margin: 0 0 16px 0;
  border-radius: 0 6px 6px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
}

.diagnosis-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-tag {
  display: inline-block;
  background: #e1f5fe;
  color: #0277bd;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-section,
.metrics-section {
  border: none;
}

.gas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.gas-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.gas-name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.gas-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.unit {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.metric-label {
  font-size: 13px;
  color: #606266;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.raw-report-section {
  border: none;
  height: 100%;
}

.raw-content {
  height: 400px;
  overflow: auto;
}

.raw-text,
.raw-text-pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  min-height: 100%;
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

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .gas-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* 打印样式 */
@media print {
  .header-actions {
    display: none;
  }
  
  .report-tabs :deep(.el-tabs__header) {
    display: none;
  }
  
  .raw-text,
  .raw-text-pre {
    background: white;
    color: black;
    border: 1px solid #ddd;
  }
}
</style>