<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ipcRenderer } from 'electron'

defineProps<{ msg: string }>()

// 定义数据库项的接口
interface DbItem {
  id: number;
  name: string;
  value: number;
}

const count = ref(0)
const dbStatus = ref('')
const dbResults = ref<DbItem[]>([])

// 数据库操作函数
const initDatabase = async () => {
  try {
    const result = await ipcRenderer.invoke('init-database')
    dbStatus.value = result
  } catch (error: any) {
    dbStatus.value = `初始化数据库错误: ${error.message}`
  }
}

const addData = async () => {
  try {
    const result = await ipcRenderer.invoke('add-data', { name: `项目 ${count.value}`, value: count.value })
    dbStatus.value = '数据添加成功'
    fetchData()
  } catch (error: any) {
    dbStatus.value = `添加数据错误: ${error.message}`
  }
}

const fetchData = async () => {
  try {
    const result = await ipcRenderer.invoke('fetch-data')
    dbResults.value = result
    dbStatus.value = '数据获取成功'
  } catch (error: any) {
    dbStatus.value = `获取数据错误: ${error.message}`
  }
}

onMounted(() => {
  initDatabase()
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <div class="database-section">
    <h2>SQLite 演示</h2>
    <div class="db-controls">
      <button @click="addData">添加数据</button>
      <button @click="fetchData">获取数据</button>
    </div>
    <p>数据库状态: {{ dbStatus }}</p>
    
    <div v-if="dbResults.length > 0" class="db-results">
      <h3>数据库结果</h3>
      <ul>
        <li v-for="(item, index) in dbResults" :key="index">
          ID: {{ item.id }}, 名称: {{ item.name }}, 值: {{ item.value }}
        </li>
      </ul>
    </div>
  </div>

  <p class="read-the-docs">Electron + SQLite 演示</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.database-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.db-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.db-controls button {
  padding: 5px 15px;
}

.db-results {
  margin-top: 15px;
}
</style>
