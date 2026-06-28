<script setup>
document.title = '邮箱客户端'

import { UserFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const doLogout = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/auth/logout')

        ElMessage.success(res.data)
        router.push({ name: 'login' })
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="container">
        <div class="top-bar">
            <div class="flex-1" />
            <el-dropdown trigger="click" :show-arrow="false">
                <span class="el-dropdown-link">
                    <el-icon class="el-icon--right">
                        <UserFilled />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <el-button type="warning" :loading="loading" @click="doLogout" link>退出登录</el-button>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <div class="flex-1"></div>
    </div>
</template>

<style scoped>
.container {
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    padding: 10px;
    row-gap: 10px;

    display: flex;
    flex-direction: column;
}

.top-bar {
    display: flex;
    align-items: center;
}
</style>
