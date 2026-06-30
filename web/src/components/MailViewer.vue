<script setup>
import { useMailboxStore } from '@/store.js'
import { ref, watch } from 'vue'
import PostalMime from 'postal-mime'
import DOMPurify from 'dompurify'
import Color from 'color'

const parsedContent = ref('')
const mailboxStore = useMailboxStore()

watch(
    () => mailboxStore.mailData.body,
    async body => {
        if (!body) return ''
        let raw = body

        if (body.includes('From:') && body.includes('Subject:')) {
            const headerIndex = body.search(/(From:|Subject:|Date:|Content-Type: multipart)/i)

            if (headerIndex !== -1) {
                let headersPart = body.substring(headerIndex)
                let bodyPart = body.substring(0, headerIndex)
                headersPart = headersPart.replace(/BODY\[HEADER[\s\S]*?\]\s*\{\d+\}/gi, '')
                raw = `${headersPart.trim()}\n\n${bodyPart.trim()}`
            }
        }

        let content = ''

        {
            const parser = new PostalMime()
            const mail = await parser.parse(raw)

            content = mail.html || mail.text || ''
            content = DOMPurify.sanitize(content)
        }

        {
            const parser = new DOMParser()
            const doc = parser.parseFromString(content, 'text/html')

            const links = doc.querySelectorAll('a')
            links.forEach(link => {
                link.setAttribute('target', '_blank')
                link.setAttribute('rel', 'noopener noreferrer')
            })

            const elements = doc.querySelectorAll('[style]')
            elements.forEach(el => {
                const text = el.style.color
                if (!text) return

                try {
                    let c = Color(text)
                    if (!c.isDark()) return

                    c = c.lightness(80)
                    if (c.saturationl() > 60) {
                        c = c.saturationl(60)
                    }

                    el.style.color = c.hex()
                } catch {}
            })

            content = doc.body.innerHTML
        }

        parsedContent.value = content
    },
    { immediate: true }
)
</script>

<template>
    <div class="view-container flex-1">
        <div class="mail-header">
            <h2 class="mail-subject">{{ mailboxStore.mailData.subject || '(无主题)' }}</h2>
            <div class="mail-meta">
                <p><span>发件人:</span>{{ mailboxStore.mailData.from }}</p>
                <p><span>收件人:</span>{{ mailboxStore.mailData.to }}</p>
                <p><span>时间:</span>{{ new Date(mailboxStore.mailData.date).toLocaleString() }}</p>
            </div>
        </div>
        <el-scrollbar>
            <div class="mail-body flex-1" v-html="parsedContent" />
        </el-scrollbar>
    </div>
</template>

<style scoped>
.view-container {
    display: flex;
    flex-direction: column;
    background: #1e1e1ebf;
    backdrop-filter: blur(4px);
    border-radius: 8px;
    padding: 24px;
    color: #f7fafc;
}

.mail-header {
    border-bottom: 1px solid #ffffff1a;
    padding-bottom: 16px;
    margin-bottom: 20px;
}

.mail-subject {
    font-size: 1.25rem;
    color: #ffffff;
    margin: 0 0 12px 0;
    font-weight: 600;
}

.mail-meta p {
    margin: 4px 0;
    font-size: 0.875rem;
    color: #cbd5e0;
}

.mail-meta span {
    color: #a0aec0;
    display: inline-block;
    width: 60px;
}

.mail-body {
    background: transparent;
    font-size: 0.95rem;
    line-height: 1.6;
    word-break: break-word;
}

.mail-body :deep(*) {
    background-color: transparent !important;
}

.mail-body :deep(pre) {
    white-space: pre-wrap;
    font-family: inherit;
    color: inherit;
}
</style>
