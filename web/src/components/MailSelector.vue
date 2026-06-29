<script setup>
import { useAccountStore, useMailboxStore } from '@/store.js'
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const totalMails = ref(0)
const mailboxStore = useMailboxStore()
const accountStore = useAccountStore()

const fetchCount = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/count?account=${accountStore.account}&folder=${mailboxStore.folder}`)
        totalMails.value = res.data.emails
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const refresh = async () => {
    await fetchCount()
}

watch(
    () => mailboxStore.folder,
    folder => {
        if (folder === '') return
        refresh()
    },
    { immediate: true }
)
</script>

<template>
    <div class="view-container">
        <el-button type="primary" :loading="loading" :icon="Refresh" @click="refresh" plain />
        <div class="flex-1">
            <el-scrollbar>
                <div class="mails"></div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style scoped>
.view-container {
    width: 300px;
    height: 100%;
}

.view-container,
.mails {
    display: flex;
    flex-direction: column;

    row-gap: 10px;
}

.el-button {
    margin: 0;
    width: fit-content;
}
</style>
