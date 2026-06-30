<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    mails: {
        type: Array,
        required: true
    }
})

const emits = defineEmits(['click'])
</script>

<template>
    <div v-for="(mail, index) in mails" class="mail-card" @click="emits('click', index + 1)">
        <div class="mail-header">
            <span class="mail-from">{{ mail.from }}</span>
            <span class="mail-date">{{ new Date(mail.date).toLocaleDateString() }}</span>
        </div>
        <div class="mail-subject">{{ mail.subject || '(无主题)' }}</div>
        <div class="mail-to">至: {{ mail.to }}</div>
    </div>
</template>

<style scoped>
.mail-card {
    padding: 16px;
    background: #1e1e1ea6;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    border-bottom: 1px solid #ffffff14;

    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.mail-card:hover {
    background: #2d2d2dcc;
}

.mail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mail-from {
    font-weight: 600;
    font-size: 14px;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mail-date {
    font-size: 12px;
    color: #94a3b8;
    flex-shrink: 0;
}

.mail-subject {
    font-size: 15px;
    color: #cbd5e1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mail-to {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
