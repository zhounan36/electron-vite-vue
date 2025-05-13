<template>
  <div class="welcome-container">
    <!-- 左侧Logo区域 -->
    <div class="logo-section">
      <div class="logo-container">
        <img v-if="logoUrl" :src="logoUrl" alt="公司Logo" class="logo" />
        <div v-else class="logo-placeholder">LOGO</div>
        <h1 class="company-name">{{ companyName }}</h1>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <h2>登录信息</h2>
        <div class="form-group">
          <label for="operatorName">操作者名称</label>
          <input type="text" id="operatorName" v-model="operatorName" placeholder="请输入操作者名称"
            :class="{ 'error': isSubmitted && !operatorName }" />
            <span class="error-message" v-if="isSubmitted && !batchNumber">请输入操作者名称</span>
        </div>
        <div class="form-group">
          <label for="batchNumber">产品批次号</label>
          <input type="text" id="batchNumber" v-model="batchNumber" placeholder="请输入产品批次号"
            :class="{ 'error': isSubmitted && !batchNumber }" />
          <span class="error-message" v-if="isSubmitted && !batchNumber">请输入产品批次号</span>
        </div>
        <div class="form-group">
          <label for="partNumber">零件编号</label>
          <input type="text" id="partNumber" v-model="partNumber" placeholder="请输入零件编号"
            :class="{ 'error': isSubmitted && !partNumber }" />
          <span class="error-message" v-if="isSubmitted && !partNumber">请输入零件编号</span>
        </div>
        <button class="submit-btn" @click="handleSubmit">下一步</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();
const companyName = ref('叶片排序系统');
// 使用相对路径或导入图片资源
const logoUrl = ref(new URL('../assets/logo.png', import.meta.url).href);
const operatorName = ref('');
const partNumber = ref('');
const batchNumber = ref('');
const isSubmitted = ref(false);

const handleSubmit = () => {
  isSubmitted.value = true;
  if (operatorName.value && partNumber.value) {
    localStorage.setItem('operatorName', operatorName.value);
    localStorage.setItem('partNumber', partNumber.value);
    localStorage.setItem('batchNumber', batchNumber.value);
    router.push('/All');
  }
};


onMounted(() => {
  localStorage.removeItem('operatorName');
  localStorage.removeItem('partNumber');
  localStorage.removeItem('batchNumber');
});

</script>

<style scoped>
.welcome-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.logo-section {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-container {
  text-align: center;
}

.logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.logo-placeholder {
  width: 150px;
  height: 150px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto;
}

.company-name {
  margin-top: 20px;
  font-size: 24px;
  color: #333;
}

.form-section {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.form-container {
  width: 80%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #409eff;
}

input.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #66b1ff;
}

.submit-btn:active {
  background-color: #3a8ee6;
}
</style>
