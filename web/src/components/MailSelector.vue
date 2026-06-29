<script setup></script>

<template>
    <div class="view-container">
        <el-scrollbar>
            <div class="mails"></div>
        </el-scrollbar>
    </div>
</template>

<style scoped>
.view-container {
    width: 300px;
    height: 100%;
}

.mails {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
}
</style>
