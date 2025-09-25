<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { 
  ElCard, ElRow, ElCol, ElButton, ElMessage, ElAlert, 
  ElForm, ElFormItem, ElInput
} from 'element-plus';
import type { DiagnosisParams } from '@/types';
import { runFaultDiagnosis } from '@/services/diagnosis';
import EnhancedDiagnosisReport from '@/components/diagnosis/EnhancedDiagnosisReport.vue';

const isLoading = ref(false);
const diagnosisError = ref<string | null>(null);

const manualParams = reactive<Partial<DiagnosisParams>>({
  H2_ppm: 50,
  CH4_ppm: 100,
  C2H6_ppm: 10,
  C2H4_ppm: 100,
  C2H2_ppm: 10,
  CO_ppm: 100,
  CO2_ppm: 100,
  total_hydrocarbons_limit: 150,
});

const currentDiagnosisResult = ref<any | null>(null);

const triggerDiagnosis = async () => {
  isLoading.value = true;
  diagnosisError.value = null;
  currentDiagnosisResult.value = null;
  try {
    const result = await runFaultDiagnosis(manualParams as DiagnosisParams);
    currentDiagnosisResult.value = result;
    ElMessage.success('诊断接口调用成功！');
  } catch (error) {
    diagnosisError.value = (error as Error).message || '诊断过程中发生未知错误。';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="fault-diagnosis-page" v-loading="isLoading">
    <ElRow :gutter="24">
      <ElCol :span="10">
        <ElCard class="input-card" shadow="never">
          <template #header><div class="card-header"><span>故障参数输入</span></div></template>
          <ElForm :model="manualParams" label-width="120px" label-position="right">
            <ElFormItem label="H2 (ppm)">
              <ElInput v-model.number="manualParams.H2_ppm" type="number" placeholder="请输入 H2 浓度" />
            </ElFormItem>
            <ElFormItem label="CH4 (ppm)">
              <ElInput v-model.number="manualParams.CH4_ppm" type="number" placeholder="请输入 CH4 浓度" />
            </ElFormItem>
            <ElFormItem label="C2H6 (ppm)">
              <ElInput v-model.number="manualParams.C2H6_ppm" type="number" placeholder="请输入 C2H6 浓度" />
            </ElFormItem>
            <ElFormItem label="C2H4 (ppm)">
              <ElInput v-model.number="manualParams.C2H4_ppm" type="number" placeholder="请输入 C2H4 浓度" />
            </ElFormItem>
            <ElFormItem label="C2H2 (ppm)">
              <ElInput v-model.number="manualParams.C2H2_ppm" type="number" placeholder="请输入 C2H2 浓度" />
            </ElFormItem>
            <ElFormItem label="CO (ppm)">
              <ElInput v-model.number="manualParams.CO_ppm" type="number" placeholder="请输入 CO 浓度" />
            </ElFormItem>
            <ElFormItem label="CO2 (ppm)">
              <ElInput v-model.number="manualParams.CO2_ppm" type="number" placeholder="请输入 CO2 浓度" />
            </ElFormItem>
            <ElFormItem label="总烃限值">
              <ElInput v-model.number="manualParams.total_hydrocarbons_limit" type="number" placeholder="请输入总烃限值" />
            </ElFormItem>
            <ElButton type="primary" @click="triggerDiagnosis" style="width: 100%; margin-top: 10px;" size="large">开始诊断</ElButton>
          </ElForm>
        </ElCard>
      </ElCol>

      <ElCol :span="14">
        <EnhancedDiagnosisReport 
          :report-data="currentDiagnosisResult"
          :is-loading="isLoading"
          @refresh="triggerDiagnosis"
        />
      </ElCol>
    </ElRow>

    <ElAlert v-if="diagnosisError" :title="diagnosisError" type="error" show-icon :closable="false" style="margin-top: 24px;" />
  </div>
</template>

<style scoped>
.fault-diagnosis-page {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.el-card {
  border: none;
  border-radius: 8px;
}

.input-card, .result-card {
  height: calc(100vh - 48px - 48px); /* Full height minus page padding */
  display: flex;
  flex-direction: column;
}

.result-card .el-card__body {
  flex-grow: 1;
  padding: 0;
}

</style>