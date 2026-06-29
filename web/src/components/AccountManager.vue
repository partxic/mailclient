<script setup>
import { useAccountStore } from '@/store.js'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

const loading = ref(false)
const showEditor = ref(false)
const accountStore = useAccountStore()

const formData = reactive({
    address: '',
    password: '',
    imapServer: '',
    imapPort: 0,
    smtpServer: '',
    smtpPort: 0,
    displayName: ''
})

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

const newAccount = () => {
    Object.assign(formData, {
        address: '',
        password: '',
        imapServer: '',
        imapPort: 0,
        smtpServer: '',
        smtpPort: 0,
        displayName: ''
    })

    showEditor.value = true
}

const editAccount = async () => {
    formData.address = accountStore.account

    try {
        loading.value = true
        const res = await axios.get(`/api/account/get?address=${formData.address}`)

        Object.assign(formData, res.data)
        showEditor.value = true
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveAccount = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/account/save', formData)

        ElMessage.success(res.data)
        await accountStore.fetchAccounts()
        showEditor.value = false
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const testAccount = async () => {
    try {
        loading.value = true
        const res = await axios.get(`/api/mail/test?account=${accountStore.account}`)
        ElMessage.success(res.data)
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteAccount = async () => {
    try {
        loading.value = true
        const res = await axios.delete(`/api/account/delete?address=${accountStore.account}`)

        ElMessage.success(res.data)
        accountStore.account = ''
        await accountStore.fetchAccounts()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <el-dropdown-item divided>
        <el-button :loading="loading" @click="fetchAccounts" link>刷新账号</el-button>
    </el-dropdown-item>
    <el-dropdown-item>
        <el-button :loading="loading" @click="newAccount" link>添加账号</el-button>
    </el-dropdown-item>
    <el-dropdown-item>
        <el-button :loading="loading" @click="editAccount" link>编辑账号</el-button>
    </el-dropdown-item>
    <el-dropdown-item>
        <el-button :loading="loading" @click="testAccount" link>测试账号</el-button>
    </el-dropdown-item>
    <el-dropdown-item>
        <el-button type="danger" :loading="loading" @click="deleteAccount" link>删除账号</el-button>
    </el-dropdown-item>
    <el-dialog v-model="showEditor" title="账号编辑器">
        <el-form :model="formData" label-width="auto">
            <el-form-item v-for="(value, key) in formData" :label="key">
                <el-input v-if="typeof value === 'string'" v-model="formData[key]" />
                <el-input-number v-if="typeof value === 'number'" v-model="formData[key]" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="loading" @click="saveAccount">保存</el-button>
                <el-button :loading="loading" @click="showEditor = false">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style scoped></style>
