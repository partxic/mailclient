<script setup>
import { useAccountStore, useMailboxStore } from '@/store.js'
import { Refresh } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { watch, ref } from 'vue'

const loading = ref(false)
const accountStore = useAccountStore()
const mailboxStore = useMailboxStore()
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
        mailboxStore.folder = ''
        mailboxStore.emptyMailData()
        folders.value = []
        fetchFolders()
    },
    { immediate: true }
)
</script>

<template>
    <div class="view-container">
        <el-button type="primary" :loading="loading" :icon="Refresh" @click="fetchFolders" plain />
        <div class="flex-1">
            <el-scrollbar>
                <div class="folders">
                    <el-button v-for="folder in folders" @click="mailboxStore.folder = folder" link>
                        <el-text :tag="folder === mailboxStore.folder ? 'ins' : 'span'" size="large">{{ folder }}</el-text>
                    </el-button>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style scoped>
.view-container {
    width: 200px;
    height: 100%;
}

.view-container,
.folders {
    display: flex;
    flex-direction: column;

    row-gap: 10px;
}

.el-button {
    margin: 0;
    width: fit-content;
}
</style>
