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

    req.mailAccount = {
        name: config.displayName,
        email: account
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

import utf7 from 'utf7'

mail.get('/folders', async (req, res) => {
    try {
        await req.connectImapServer()
    } catch {
        return res.status(400).send('无法连接 IMAP 服务器')
    }

    const namespaces = await req.imapClient.getNamespaces()
    const allFolders = []

    for (const namespace of namespaces) {
        const folders = await req.imapClient.getFolders(namespace, '*')
        allFolders.push(...folders.map(item => utf7.imap.decode(item.name).replace(/^"|"$/g, '')))
    }

    return res.status(200).json(allFolders)
})

const mailPerPage = 20

mail.get('/count', async (req, res) => {
    const { folder } = req.query
    if (typeof folder !== 'string' || folder === '') {
        return res.status(400).send('请求错误')
    }

    try {
        await req.connectImapServer()
    } catch {
        return res.status(400).send('无法连接 IMAP 服务器')
    }

    const realFolder = utf7.imap.encode(folder)
    const { emails: totalMails } = await req.imapClient.selectFolder(realFolder)
    const totalPages = Math.ceil(totalMails / mailPerPage)
    return res.status(200).json({ totalPages })
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

    try {
        await req.connectImapServer()
    } catch {
        return res.status(400).send('无法连接 IMAP 服务器')
    }

    const realFolder = utf7.imap.encode(folder)
    const { emails: totalMails } = await req.imapClient.selectFolder(realFolder)
    const mailStart = Math.max(1, totalMails - page * mailPerPage + 1)
    const mailEnd = totalMails - (page - 1) * mailPerPage

    if (mailEnd <= 0) {
        return res.status(200).json([])
    }

    const result = await req.imapClient.fetchEmails({
        limit: [mailStart, mailEnd],
        folder: realFolder,
        fetchBody: false
    })

    return res.status(200).json(result.filter(item => item.messageID).reverse())
})

mail.get('/content', async (req, res) => {
    const { folder, page: rawPage, id: rawId } = req.query
    if (typeof folder !== 'string' || folder === '' || typeof rawPage !== 'string' || rawPage === '' || typeof rawId !== 'string' || rawId === '') {
        return res.status(400).send('请求错误')
    }

    const page = parseInt(rawPage, 10)
    const id = parseInt(rawId, 10)
    if (isNaN(page) || page < 1 || isNaN(id) || id < 1 || id > mailPerPage) {
        return res.status(400).send('参数错误')
    }

    try {
        await req.connectImapServer()
    } catch {
        return res.status(400).send('无法连接 IMAP 服务器')
    }

    const realFolder = utf7.imap.encode(folder)
    const { emails: totalMails } = await req.imapClient.selectFolder(realFolder)
    const realId = totalMails - (page - 1) * mailPerPage - (id - 1)
    if (realId < 1 || realId > totalMails) {
        return res.status(404).send('邮件未找到')
    }

    const result = await req.imapClient.fetchEmails({
        limit: [realId, realId],
        folder: realFolder,
        fetchBody: true
    })

    return res.status(200).json(result.filter(item => item.messageID)[0])
})

mail.post('/send', async (req, res) => {
    const { to, subject, plaintext, content } = req.body
    if (typeof to !== 'string' || to === '') {
        return res.status(400).send('发送目标错误')
    }

    if (typeof subject !== 'string' || subject === '' || typeof plaintext !== 'boolean' || typeof content !== 'string' || content === '') {
        return res.status(400).send('发送内容错误')
    }

    try {
        await req.connectSmtpServer()
    } catch {
        return res.status(400).send('无法连接 SMTP 服务器')
    }

    await req.smtpClient.send({
        from: req.mailAccount,
        to: to.includes(',') ? to.split(',').map(item => item.trim()) : to,
        subject,
        [plaintext ? 'text' : 'html']: content
    })

    return res.status(200).send('发送成功')
})

export default mail
