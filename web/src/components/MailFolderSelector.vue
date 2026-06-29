<script setup>
import { useAccountStore } from '@/store'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { watch, ref } from 'vue'

const loading = ref(false)
const accountStore = useAccountStore()
const folders = ref([])

const fetchFolders = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/folders?account=${accountStore.account}`)
        folders.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

watch(
    () => accountStore.account,
    account => {
        if (account === '') return
        fetchFolders()
    },
    { immediate: true }
)
</script>

<template>
    <div class="view-container">
        <el-scrollbar></el-scrollbar>
    </div>
</template>

<style scoped>
.view-container {
    width: 200px;
    height: 100%;
}
</style>
