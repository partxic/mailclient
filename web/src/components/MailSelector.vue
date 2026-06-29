<script setup>
import { useAccountStore, useMailboxStore } from '@/store.js'
import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const totalMails = ref(0)
const currentPage = ref(1)
const mails = ref([])
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

const fetchMails = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/list?account=${accountStore.account}&folder=${mailboxStore.folder}&page=${currentPage.value}`)
        mails.value.push(...res.data)
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const refresh = async () => {
    await fetchCount()
    if (totalMails.value === 0) return

    mails.value = []
    const totalPage = currentPage.value

    for (let i = 1; i <= totalPage; i++) {
        currentPage.value = i
        await fetchMails()
    }
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
