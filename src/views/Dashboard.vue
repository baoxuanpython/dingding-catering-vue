<template>
  <div class="dashboard">
    <h1>欢迎使用叮叮餐饮后台管理系统</h1>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>今日订单</template>
          <h2>100</h2>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>今日营业额</template>
          <h2>¥5,000</h2>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>菜品总数</template>
          <h2>50</h2>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <template #header>用户总数</template>
          <h2>200</h2>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// TODO: 调用接口获取统计数据
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
h1 {
  margin-bottom: 24px;
}
</style>