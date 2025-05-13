<template>
  <div class="database-demo">
    <h2>数据库操作示例</h2>
    
    <!-- 初始化数据库按钮 -->
    <div class="action-group">
      <button @click="initDB" :disabled="isLoading">初始化数据库</button>
      <span v-if="initMessage" :class="{ success: initSuccess, error: !initSuccess }">
        {{ initMessage }}
      </span>
    </div>
    
    <!-- 商品管理 -->
    <div class="section">
      <h3>商品管理</h3>
      
      <!-- 添加商品表单 -->
      <div class="form-group">
        <h4>添加商品</h4>
        <div class="form-item">
          <label>商品名称:</label>
          <input type="text" v-model="newGoods.name" placeholder="输入商品名称" />
        </div>
        <div class="form-item">
          <label>商品编码:</label>
          <input type="text" v-model="newGoods.code" placeholder="输入商品编码" />
        </div>
        <div class="form-item">
          <label>商品描述:</label>
          <textarea v-model="newGoods.description" placeholder="输入商品描述"></textarea>
        </div>
        <div class="form-item">
          <button @click="createGoods" :disabled="isLoading">保存商品</button>
        </div>
      </div>
      
      <!-- 商品列表 -->
      <div class="list-group">
        <h4>商品列表</h4>
        <button @click="loadGoods" :disabled="isLoading">刷新列表</button>
        
        <div v-if="isLoading">正在加载...</div>
        <div v-else-if="goodsList.length === 0">暂无商品数据</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>编码</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in goodsList" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.description }}</td>
              <td>
                <button @click="editGoods(item)">编辑</button>
                <button @click="deleteGoods(item.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 编辑商品对话框 -->
      <div v-if="showEditDialog" class="dialog-overlay">
        <div class="dialog">
          <h4>编辑商品</h4>
          <div class="form-item">
            <label>商品名称:</label>
            <input type="text" v-model="editingGoods.name" placeholder="输入商品名称" />
          </div>
          <div class="form-item">
            <label>商品编码:</label>
            <input type="text" v-model="editingGoods.code" placeholder="输入商品编码" />
          </div>
          <div class="form-item">
            <label>商品描述:</label>
            <textarea v-model="editingGoods.description" placeholder="输入商品描述"></textarea>
          </div>
          <div class="dialog-buttons">
            <button @click="updateGoods" :disabled="isLoading">保存</button>
            <button @click="cancelEdit">取消</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 包装管理 -->
    <div class="section">
      <h3>包装管理</h3>
      
      <!-- 添加包装表单 -->
      <div class="form-group">
        <h4>添加包装</h4>
        <div class="form-item">
          <label>包装编码:</label>
          <input type="text" v-model="newPackage.code" placeholder="输入包装编码" />
        </div>
        <div class="form-item">
          <label>包装描述:</label>
          <textarea v-model="newPackage.description" placeholder="输入包装描述"></textarea>
        </div>
        <div class="form-item">
          <button @click="createPackage" :disabled="isLoading">保存包装</button>
        </div>
      </div>
      
      <!-- 包装列表 -->
      <div class="list-group">
        <h4>包装列表</h4>
        <button @click="loadPackages" :disabled="isLoading">刷新列表</button>
        
        <div v-if="isLoading">正在加载...</div>
        <div v-else-if="packageList.length === 0">暂无包装数据</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>编码</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in packageList" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.description }}</td>
              <td>
                <button @click="viewPackageDetails(item.id)">查看详情</button>
                <button @click="deletePackage(item.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

// 使用已存在的ElectronAPI类型
// vite-env.d.ts中已经定义了Window.electronAPI的类型
import type { ElectronAPI } from '../vite-env.d.ts';

// 状态变量
const isLoading = ref(false);
const initMessage = ref('');
const initSuccess = ref(false);

// 商品相关
const goodsList = ref<any[]>([]);
const newGoods = reactive({
  name: '',
  code: '',
  description: ''
});

// 编辑商品相关
const showEditDialog = ref(false);
const editingGoods = reactive({
  id: 0,
  name: '',
  code: '',
  description: ''
});

// 包装相关
const packageList = ref<any[]>([]);
const newPackage = reactive({
  code: '',
  description: ''
});

// 初始化数据库
const initDB = async () => {
  try {
    isLoading.value = true;
    const result = await window.electronAPI.initDatabase();
    initMessage.value = result;
    initSuccess.value = result.includes('成功');
    
    // 如果初始化成功，加载初始数据
    if (initSuccess.value) {
      await loadGoods();
      await loadPackages();
    }
  } catch (error: any) {
    initMessage.value = `初始化失败: ${error.message}`;
    initSuccess.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 加载商品列表
const loadGoods = async () => {
  try {
    isLoading.value = true;
    goodsList.value = await window.electronAPI.goods.findAll();
  } catch (error: any) {
    console.error('加载商品失败:', error);
    alert(`加载商品失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 创建新商品
const createGoods = async () => {
  try {
    if (!newGoods.name || !newGoods.code) {
      alert('商品名称和编码不能为空');
      return;
    }
    
    isLoading.value = true;
    await window.electronAPI.goods.create(newGoods);
    
    // 清空表单并刷新列表
    newGoods.name = '';
    newGoods.code = '';
    newGoods.description = '';
    
    await loadGoods();
    alert('商品添加成功');
  } catch (error: any) {
    console.error('创建商品失败:', error);
    alert(`创建商品失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 编辑商品
const editGoods = (goods: any) => {
  editingGoods.id = goods.id;
  editingGoods.name = goods.name;
  editingGoods.code = goods.code;
  editingGoods.description = goods.description || '';
  showEditDialog.value = true;
};

// 取消编辑
const cancelEdit = () => {
  showEditDialog.value = false;
};

// 更新商品
const updateGoods = async () => {
  try {
    if (!editingGoods.name || !editingGoods.code) {
      alert('商品名称和编码不能为空');
      return;
    }
    
    isLoading.value = true;
    await window.electronAPI.goods.update(editingGoods.id, {
      name: editingGoods.name,
      code: editingGoods.code,
      description: editingGoods.description
    });
    
    showEditDialog.value = false;
    await loadGoods();
    alert('商品更新成功');
  } catch (error: any) {
    console.error('更新商品失败:', error);
    alert(`更新商品失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 删除商品
const deleteGoods = async (id: number) => {
  try {
    if (!confirm('确定要删除这个商品吗？')) {
      return;
    }
    
    isLoading.value = true;
    await window.electronAPI.goods.delete(id);
    await loadGoods();
    alert('商品删除成功');
  } catch (error: any) {
    console.error('删除商品失败:', error);
    alert(`删除商品失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 加载包装列表
const loadPackages = async () => {
  try {
    isLoading.value = true;
    packageList.value = await window.electronAPI.package.findAll();
  } catch (error: any) {
    console.error('加载包装失败:', error);
    alert(`加载包装失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 创建新包装
const createPackage = async () => {
  try {
    if (!newPackage.code) {
      alert('包装编码不能为空');
      return;
    }
    
    isLoading.value = true;
    await window.electronAPI.package.create(newPackage);
    
    // 清空表单并刷新列表
    newPackage.code = '';
    newPackage.description = '';
    
    await loadPackages();
    alert('包装添加成功');
  } catch (error: any) {
    console.error('创建包装失败:', error);
    alert(`创建包装失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 查看包装详情
const viewPackageDetails = async (id: number) => {
  try {
    isLoading.value = true;
    const packageWithItems = await window.electronAPI.package.getWithItems(id);
    console.log('包装详情:', packageWithItems);
    alert(`包装 #${id} 详情已在控制台打印`);
  } catch (error: any) {
    console.error('查看包装详情失败:', error);
    alert(`查看包装详情失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 删除包装
const deletePackage = async (id: number) => {
  try {
    if (!confirm('确定要删除这个包装吗？')) {
      return;
    }
    
    isLoading.value = true;
    await window.electronAPI.package.deleteWithItems(id);
    await loadPackages();
    alert('包装删除成功');
  } catch (error: any) {
    console.error('删除包装失败:', error);
    alert(`删除包装失败: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

// 组件挂载时自动初始化数据库
onMounted(async () => {
  await initDB();
});
</script>

<style scoped>
.database-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.action-group {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 30px;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.form-item label {
  width: 100px;
  text-align: right;
  padding-right: 10px;
}

.form-item input, .form-item textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-item textarea {
  min-height: 60px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table th {
  background-color: #f2f2f2;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 5px;
  min-width: 400px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 8px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success {
  color: green;
  margin-left: 10px;
}

.error {
  color: red;
  margin-left: 10px;
}
</style>