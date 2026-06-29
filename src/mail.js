import express from 'express'
const mail = express.Router()

import { needauth } from './auth.js'
mail.use(needauth)

import { getenv } from './cfenv.js'
const env = getenv()

import { CFImap } from 'cf-imap'
import { WorkerMailer } from 'worker-mailer'

mail.use(async (req, res, next) => {
    const { account, enable } = req.query
    if (typeof account !== 'string' || account === '' || typeof enable !== 'string' || enable === '') {
        return res.status(400).send('请求错误')
    }

    const result = await env.data.get(account)
    if (!result) {
        return res.status(404).send('账号不存在')
    }

    const config = JSON.parse(result)

    req.emalAccount = {
        address: account,
        name: config.displayName
    }

    const authCredentials = {
        username: account,
        password: config.password
    }

    if (enable.includes('imap')) {
        try {
            const imapClient = new CFImap({
                host: config.imapServer,
                port: config.imapPort,
                tls: config.imapPort === 993,
                auth: authCredentials
            })

            await imapClient.connect()
            req.imapClient = imapClient

            res.on('finish', imapClient.logout)
            res.on('close', imapClient.logout)
        } catch (error) {
            console.error(error)
            return res.status(400).send('无法连接至 IMAP 服务器')
        }
    }

    if (enable.includes('smtp')) {
        try {
            const smtpClient = await WorkerMailer.connect({
                host: config.smtpServer,
                port: config.smtpPort,
                secure: config.smtpPort === 465,
                credentials: authCredentials,
                authType: ['plain', 'login', 'cram-md5']
            })

            req.smtpClient = smtpClient

            res.on('finish', smtpClient.close)
            res.on('close', smtpClient.close)
        } catch (error) {
            console.error(error)
            return res.status(400).send('无法连接至 SMTP 服务器')
        }
    }

    return next()
})

mail.get('/test', async (req, res) => {
    return res.status(200).send('账号正常')
})

export default mail
