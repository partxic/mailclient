<script setup>
import { useAccountStore } from '@/store.js'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const loading = ref(false)
const accountStore = useAccountStore()

const fetchAccounts = async () => {
    try {
        loading.value = true
        await accountStore.fetchAccounts()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const selectAccount = async account => {
    if (account === accountStore.account) return

    try {
        loading.value = true
        const res = await axios.get(`/api/mail/test?account=${account}&enable=imap,smtp`)

        ElMessage.success(res.data)
        accountStore.account = account
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchAccounts)
</script>

<template>
    <el-scrollbar max-height="400px">
        <el-dropdown-item v-for="account in accountStore.accounts">
            <el-button :loading="loading" @click="selectAccount(account)" link>{{ account }}</el-button>
        </el-dropdown-item>
    </el-scrollbar>
</template>

<style scoped></style>
