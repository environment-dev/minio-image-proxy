const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const app = express()
const aws = require('aws-sdk')

const s3 = new aws.S3({
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
})
app.get('/', (res, req) => {
  res.redirect('https://starrain.cc')
})

app.get('/:imageId', async (req, res) => {
  const dbFile = await prisma.file.findUnique({
    where: {
      filename: req.params.imageId
    }
  })
  if (!dbFile) return res.status(404).json({ success: false, message: 'file not found' })
  if (!dbFile.allowed) return res.status(451).json({ success: false, message: 'the file which you have requested is not allowed due to legal reasons' })
  const params = { Bucket: 'uploads', Key: req.params.imageId }
  s3.getObject(params, function (_err, data) {
    res.write(data.Body, 'binary')
    res.end(null, 'binary')
  })
})

app.listen(3000)
