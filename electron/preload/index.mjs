import { contextBridge, ipcRenderer } from 'electron'

// 添加调试日志
console.log('Preload script is running')

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // 允许渲染进程通过 invoke 调用这些主进程方法
    invoke: (channel, args) => {
      const validChannels = ['get-machine-id', 'get-registry-value', 'open-win'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
      }
      throw new Error(`不允许使用 IPC 通道: ${channel}`);
    },
    on: (channel, listener) => {
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    once: (channel, listener) => ipcRenderer.once(channel, listener),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener)
  }
})

// 验证electron对象是否正确暴露
console.log('Electron API exposed:', !!window.electron)