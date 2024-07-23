const { Hono } = require('hono')
const {PrismaClient} = require('@prisma/client')
const { authRoute } = require('./auth')
const { messageRoute } = require('./routes')
const { serve } = require('@hono/node-server')


const app = new Hono()
const prisma = new PrismaClient()

app.use('/auth',authRoute(prisma))
app.use('/message',messageRoute(prisma))

serve(app)
