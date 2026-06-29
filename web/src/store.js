import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccountStore = defineStore('account', () => {
    const account = ref('')
    const accounts = ref([])

    const fetchAccounts = async () => {
        const res = await axios.get('/api/account/list')
        accounts.value = res.data
    }

    return { account, accounts, fetchAccounts }
})

export const useMailboxStore = defineStore('mailbox', () => {
    const folder = ref('')

    return { folder }
})
