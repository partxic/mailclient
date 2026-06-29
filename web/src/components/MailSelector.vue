<script setup>
import { useMailboxStore } from '@/store.js'
import { ref, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const mailboxStore = useMailboxStore()

const refresh = async () => {}

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
