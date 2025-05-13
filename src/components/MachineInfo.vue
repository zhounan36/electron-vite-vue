<template>
  <div class="machine-info-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h3>机器信息</h3>
          <el-tag v-if="isRegistered" type="success" effect="dark">已注册</el-tag>
        </div>
      </template>
      <el-form label-position="right" label-width="100px">
        <el-form-item label="机器码:">
          <el-input v-model="machineId" readonly></el-input>
          <el-button type="primary" size="small" style="margin-left: 10px" @click="copyMachineId">
            复制
          </el-button>
        </el-form-item>
        <el-form-item label="注册码:">
          <el-input 
            v-model="registrationCode" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入注册码"
            :readonly="isRegistered"
          ></el-input>
          <div class="button-container">
            <el-button 
              type="primary" 
              size="small" 
              @click="registerApp" 
              :disabled="isRegistered || !registrationCode"
            >
              注册
            </el-button>
            <span v-if="isRegistered" class="registered-text">应用已成功注册</span>
            <el-button 
              v-if="isRegistered" 
              type="danger" 
              size="small" 
              @click="clearRegistration" 
              style="margin-left: 10px"
            >
              清除注册信息
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'


const machineId = ref('')
const registrationCode = ref('')
const isRegistered = ref(false)

// 注册表中存储注册码的位置
const registryKey = 'HKCU\\Software\\ZhouNan\\WareHouse'
const registryValueName = 'RegistrationCode'

onMounted(async () => {
  if (!window.ipcRenderer) {
    console.error('Electron IPC Renderer 不可用')
    ElMessage.error('Electron功能不可用，请确保在Electron环境中运行')
    return
  }

  try {
    // 通过IPC从主进程获取机器码
    machineId.value = await window.ipcRenderer.invoke('get-machine-id')
    
    // 通过IPC从主进程获取注册码
    try {
      const regCode = await window.ipcRenderer.invoke('get-registry-value', {
        key: registryKey,
        valueName: registryValueName
      })
      
      if (regCode) {
        registrationCode.value = regCode
        isRegistered.value = true
      }
    } catch (error) {
      console.log('未找到注册码，可能尚未注册', error)
      // 注册表中没有找到注册码时不显示错误
    }
  } catch (error) {
    console.error('获取机器信息失败:', error)
    ElMessage.error('获取机器信息失败: ' + (error instanceof Error ? error.message : String(error)))
    machineId.value = '获取失败'
  }
})

// 复制机器码到剪贴板
const copyMachineId = () => {
  navigator.clipboard.writeText(machineId.value)
    .then(() => {
      ElMessage.success('机器码已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败: ' + (err instanceof Error ? err.message : String(err)))
    })
}

// 注册应用
const registerApp = async () => {
  if (!registrationCode.value.trim()) {
    ElMessage.warning('请输入注册码')
    return
  }
  
  try {
    // 验证注册码
    const isValid = await window.ipcRenderer.invoke('validate-registration-code', {
      machineId: machineId.value,
      registrationCode: registrationCode.value
    })
    
    if (isValid) {
      // 保存注册码到注册表
      await window.ipcRenderer.invoke('set-registry-value', {
        key: registryKey,
        valueName: registryValueName,
        value: registrationCode.value
      })
      
      isRegistered.value = true
      ElMessage.success('注册成功')
    } else {
      ElMessage.error('无效的注册码')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 清除注册信息
const clearRegistration = async () => {
  try {
    await window.ipcRenderer.invoke('delete-registry-value', {
      key: registryKey,
      valueName: registryValueName
    })
    registrationCode.value = ''
    isRegistered.value = false
    ElMessage.success('注册信息已清除')
  } catch (error) {
    console.error('清除注册信息失败:', error)
    ElMessage.error('清除注册信息失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}
</script>

<style scoped>
.machine-info-container {
  max-width: 600px;
  margin: 20px auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.registered-text {
  margin-left: 10px;
  color: #67c23a;
  font-size: 14px;
}
</style>