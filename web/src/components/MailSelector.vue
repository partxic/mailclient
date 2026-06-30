<script setup>
import { useAccountStore, useMailboxStore } from '@/store.js'
import { ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const totalPages = ref(0)
const currentPage = ref(1)
const mails = ref([])
const accountStore = useAccountStore()
const mailboxStore = useMailboxStore()

const fetchCount = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/count?account=${accountStore.account}&folder=${mailboxStore.folder}`)
        totalPages.value = res.data.totalPages
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const fetchMails = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/list?account=${accountStore.account}&folder=${mailboxStore.folder}&page=${currentPage.value}`)
        mails.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const refresh = async () => {
    await fetchCount()
    if (totalPages.value < 1) return
    await fetchMails()
}

watch(
    () => currentPage.value,
    page => {
        if (page === 0) return
        fetchMails()
    }
)

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
        <div class="top-bar">
            <el-button type="primary" :loading="loading" :icon="Refresh" @click="refresh" plain />
            <el-pagination v-model:current-page="currentPage" size="small" layout="prev, pager, next" :pager-count="5" :page-count="totalPages" hide-on-single-page />
        </div>
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
    row-gap: 10px;
}

.top-bar {
    display: flex;
    align-items: center;
    column-gap: 10px;
}

.el-pagination :deep(*) {
    background-color: transparent !important;
}

.view-container,
.mails {
    display: flex;
    flex-direction: column;
}

.el-button {
    margin: 0;
    width: fit-content;
}
</style>
