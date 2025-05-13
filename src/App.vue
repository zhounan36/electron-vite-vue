<script setup lang="ts">
</script>

<template>
  <el-container>
    <el-header>
      <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false" background-color="#545c64" text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="1">
          <router-link to="/Welcome">首页</router-link>
        </el-menu-item>
        <el-menu-item index="2">
          <router-link to="/ElectronDemo">注册</router-link>
        </el-menu-item>

      </el-menu>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style></style>
