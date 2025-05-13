// src\router\index.ts
import { createRouter, createWebHashHistory } from "vue-router";
import { ElMessage } from "element-plus";

// 检查用户是否已注册
const checkRegistration = async () => {
  // 如果不在Electron环境中，默认允许访问
  if (!window.ipcRenderer) {
    return true;
  }

  try {
    // 从注册表中获取注册码
    const registryKey = 'HKCU\\Software\\ZhouNan\\WareHouse';
    const registryValueName = 'RegistrationCode';
    
    const regCode = await window.ipcRenderer.invoke('get-registry-value', {
      key: registryKey,
      valueName: registryValueName
    });
    
    // 如果有注册码，认为已注册
    return !!regCode;
  } catch (error) {
    // 出错或未找到注册码，认为未注册
    console.log('未找到注册码，可能尚未注册', error);
    return false;
  }
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/MachineInfo",
      component: () => import("../components/MachineInfo.vue"),
    },
    {
      path: "/",
      component: () => import("../components/MachineInfo.vue"),
    },
    {
      path: "/Welcome",
      component: () => import("../components/Welcome.vue"),
    }
  ],
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 如果目标路径是 MachineInfo 或根路径，直接允许访问
  if (to.path === '/MachineInfo' || to.path === '/') {
    next();
    return;
  }
  
  // 检查是否已注册
  const isRegistered = await checkRegistration();
  
  if (isRegistered) {
    // 已注册，允许访问
    next();
  } else {
    // 未注册，重定向到 MachineInfo 页面并显示提示
    ElMessage.warning('请先注册应用后再访问此页面');
    next('/MachineInfo');
  }
});

export default router;
