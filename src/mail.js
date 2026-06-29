import express from 'express'
const mail = express.Router()

import { needauth } from './auth.js'
mail.use(needauth)

import { getenv } from './cfenv.js'
const env = getenv()

import { ImapFlow } from 'imapflow'
import nodemailer from 'nodemailer'

mail.use(async (req, res, next) => {
    const { account } = req.query
    if (typeof account !== 'string' || account === '') {
        return res.status(400).send('请求错误')
    }

    const result = await env.data.get(account)
    if (!result) {
        return res.status(404).send('账号不存在')
    }

    const config = JSON.parse(result)

    const auth = {
        user: account,
        pass: config.password
    }

    req.account = {
        address: account,
        name: config.displayName
    }

    const imapClient = new ImapFlow({
        host: config.imapServer,
        port: config.imapPort,
        auth
    })

    try {
        await imapClient.connect()
        req.imapClient = imapClient
    } catch (error) {
        console.error(error)
        return res.status(400).send('无法连接至 IMAP 服务器')
    }

    const smtpClient = nodemailer.createTransport({
        host: config.smtpServer,
        port: config.smtpPort,
        auth
    })

    try {
        await smtpClient.verify()
        req.smtpClient = smtpClient
    } catch (error) {
        console.error(error)
        return res.status(400).send('无法连接至 SMTP 服务器')
    }

    const cleanup = async () => {
        try {
            await imapClient.logout()
        } catch {}

        try {
            smtpClient.close()
        } catch {}
    }

    res.on('finish', cleanup)
    res.on('close', cleanup)

    return next()
})

mail.get('/test', async (req, res) => {
    if (typeof req.account === 'undefined') return res.status(500).send('账号信息错误')
    if (typeof req.imapClient === 'undefined') return res.status(500).send('IMAP 连接错误')
    if (typeof req.smtpClient === 'undefined') return res.status(500).send('SMTP 连接错误')
    return res.status(200).send('账号正常')
})

export default mail
