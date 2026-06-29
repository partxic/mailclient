import express from 'express'
const mail = express.Router()

import { needauth } from './auth.js'
mail.use(needauth)

import { getenv } from './cfenv.js'
const env = getenv()

import { CFImap } from 'cf-imap'
import { WorkerMailer } from 'worker-mailer'

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

    req.emalAccount = {
        address: account,
        name: config.displayName
    }

    const authCredentials = {
        username: account,
        password: config.password
    }

    req.connectImapServer = async () => {
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
    }

    req.connectSmtpServer = async () => {
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
    }

    return next()
})

mail.get('/folders', async (req, res) => {
    await req.connectImapServer()

    const namespaces = await req.imapClient.getNamespaces()
    const allFolders = []

    for (const namespace of namespaces) {
        const folders = await req.imapClient.getFolders(namespace, '*')
        allFolders.push(...folders)
    }

    return res.status(200).json(allFolders.map(item => item.name))
})

mail.get('/count', async (req, res) => {
    const { folder } = req.query
    if (typeof folder !== 'string' || folder === '') {
        return res.status(400).send('请求错误')
    }

    await req.connectImapServer()

    const { emails } = await req.imapClient.selectFolder(folder)
    return res.status(200).json({ emails })
})

mail.get('/list', async (req, res) => {
    const { folder, page: rawPage } = req.query
    if (typeof folder !== 'string' || folder === '' || typeof rawPage !== 'string' || rawPage === '') {
        return res.status(400).send('请求错误')
    }

    const page = parseInt(rawPage, 10)
    if (isNaN(page) || page < 1) {
        return res.status(400).send('参数错误')
    }

    await req.connectImapServer()

    const { emails: totalMails } = await req.imapClient.selectFolder(folder)
    const mailPerPage = 20
    const mailStart = (page - 1) * mailPerPage + 1
    const mailEnd = Math.min(page * mailPerPage, totalMails)

    if (mailStart > totalMails) {
        return res.status(200).json([])
    }

    const result = await req.imapClient.fetchEmails({
        limit: [mailStart, mailEnd],
        folder: folder,
        fetchBody: false
    })

    return res.status(200).json(result)
})

export default mail
