import express from 'express'
const account = express.Router()

import { needauth } from './auth.js'
account.use(needauth)

import { getenv } from './cfenv.js'
const env = getenv()

account.get('/list', async (req, res) => {
    const result = await env.data.list()
    const keys = result.keys.map(item => item.name)
    return res.status(200).json(keys)
})

account.get('/get', async (req, res) => {
    const { address } = req.query
    if (typeof address !== 'string' || address === '') {
        return res.status(400).send('未选择账号')
    }

    const result = await env.data.get(address)
    if (!result) {
        return res.status(404).send('账号不存在')
    }

    return res.status(200).json(JSON.parse(result))
})

account.post('/save', async (req, res) => {
    const { address, password, imapServer, imapPort, smtpServer, smtpPort, displayName } = req.body
    if (typeof address !== 'string' || address === '' || typeof password !== 'string' || password === '') {
        return res.status(400).send('认证信息错误')
    }

    if (typeof imapServer !== 'string' || imapServer === '' || typeof imapPort !== 'number' || imapPort === 0) {
        return res.status(400).send('收信服务器配置错误')
    }

    if (typeof smtpServer !== 'string' || smtpServer === '' || typeof smtpPort !== 'number' || smtpPort === 0) {
        return res.status(400).send('发信服务器配置错误')
    }

    if (typeof displayName !== 'string') {
        return res.status(400).send('别名信息错误')
    }

    if (smtpPort === 25) {
        return res.status(403).send('SMTP 端口不能是 25')
    }

    await env.data.put(
        address,
        JSON.stringify({
            password,
            imapServer,
            imapPort,
            smtpServer,
            smtpPort,
            displayName
        })
    )

    return res.status(200).send('操作成功')
})

account.delete('/delete', async (req, res) => {
    const { address } = req.query
    if (typeof address !== 'string' || address === '') {
        return res.status(400).send('未选择账号')
    }

    await env.data.delete(address)
    return res.status(200).send('操作成功')
})

export default account
