<script setup>
import { useAccountStore } from '@/store.js'
const accountStore = useAccountStore()
</script>

<template>
    <el-scrollbar max-height="400px">
        <el-dropdown-item v-for="account in accountStore.accounts">
            <el-button @click="accountStore.account = account" link>{{ account }}</el-button>
        </el-dropdown-item>
    </el-scrollbar>
</template>

<style scoped></style>
