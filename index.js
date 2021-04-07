const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const aws = require('aws-sdk')

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.SECRETKEY,
  endpoint: process.env.ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
})
app.get('/', (res, req) => {
  res.redirect(process.env.REDIRECTURL)
})

app.get('/:filename', async (req, res) => {
  const dbFile = await prisma.file.findUnique({
    where: {
      filename: req.params.filename
    }
  })
  if (!dbFile) return res.status(404).json({ success: false, message: 'file not found' })
  if (!dbFile.allowed) return res.status(451).json({ success: false, message: 'the file which you have requested is not allowed due to legal reasons' })
  const params = { Bucket: 'uploads', Key: req.params.filename }
  s3.getObject(params, function (_err, data) {
    res.write(data.Body, 'binary')
    res.end(null, 'binary')
  })
})

app.listen(3000)
