const { Hono } = require('hono')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')


const authRoute = (prisma) =>{

    const auth = new Hono()

    auth.post('/signup',async (ctx)=>{
        const {email,password} = await ctx.req.json()
        const hashpassword = await bcrypt.hash(password,10)

        const user = await prisma.user.create({
            data :{
                email,
                password:hashpassword,
            }
        })
        return ctx.json({message :'user created successfully', userId : user.id})
    })
    auth.post('/login',async(ctx)=>{
        const {email,password} = await ctx.req.json()
        const user = await prisma.user.findUnique({
            where:{email}
        })
        if(!user || (await bcrypt.compare(password,user.password))){
            return ctx.json({message:'invalid credential'},401)
        }
        const token = jwt.sign({userId:user.id},'ijazkhanafridi',{
            expiresIn:'24h'
        })
        return ctx.json({token})
    })
    return auth
}

module.exports=  {authRoute}