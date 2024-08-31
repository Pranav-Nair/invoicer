const express = require("express")
const bcrypt = require("bcrypt")
const User = require("../models/usermodel")
const {isValidPassword,isValidUsername,parseToken} = require("../validators/validator")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const { BillDraft } = require("../models/billmodels")
const Product = require("../models/productmodel")
userRoute = express.Router()

userRoute.post("/signup",async (req,resp)=>{
    try {
        if (!req.body || !req.body.username || !req.body.username.trim() || !req.body.passwd || !req.body.passwd.trim() || !req.body.cpasswd || !req.body.cpasswd.trim()) {
            return resp.status(400).json({error:"missing fields","required_fields":['username','passwd','cpasswd']}),400
        }
        if (!isValidUsername(req.body.username)) {
            return resp.status(400).json({error:"username not valid",must_contain: ['a-z','A-Z','0-9','._','minlength:2']}),400
        }
        if (req.body.passwd !=req.body.cpasswd) {
            return resp.status(400).json({error:"passwords dont match"}),400
        }
        if (!isValidPassword(req.body.passwd))
            return resp.status(400).json({error:"password not valid (minlength:4)",must_contain:['a-z','A-Z','0-9','any specials','']}),400
        const user = await User.findOne({where:{username: req.body.username}})
        if (user)
            return resp.status(400).json({error: "user exists"}),400
        const hashpasswd = await bcrypt.hash(req.body.passwd,16)
        const newuser= User.build({
            username:req.body.username,
            passwd:hashpasswd
        })
        await newuser.save()
        return resp.json({username:newuser.username })
    }catch(err){
        return resp.status(400).json({error: err.toString()}),400
    }
})

userRoute.post("/login",async (req,resp)=> {
    try {
        if (!req.body || !req.body.username || !req.body.username.trim() || !req.body.passwd || !req.body.passwd.trim())
            return resp.status(400).json({error: "missing fields",required_fields: ['username','passwd']})
        const user = await User.findOne({where:{username:req.body.username}})
        console.log(user)
        if (!user)
            return resp.status(404).json({error:"username/password is invalid"})
        if (!await bcrypt.compare(req.body.passwd,user.passwd))
            return resp.status(404).json({error:"username/password is invalid"})
        const access_token = jwt.sign({userId: user.rid},process.env.access_token_secret,{expiresIn:"9h"})
        return resp.json({access_token:access_token})
    }catch(err) {
        return resp.status(400).json({error: err.toString()}),400
    }
})

userRoute.post("/change",async (req,resp)=>{
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId)
            return resp.status(401).json({error:"token expired"})
        if (!req.body && !req.body.username && (!req.body.passwd || !req.body.cpasswd)) {
            return resp.status(400).json({error:"missing fields",required_fields:['username',['passwd','cpasswd']]})
        }
        let moduser = {}
        if (req.body.username) {
            if (!isValidUsername(req.body.username)) {
                return resp.status(400).json({error:"username not valid",must_contain: ['a-z','A-Z','0-9','._','minlength:2']})
            }
            moduser.username=req.body.username
        }

        if (req.body.passwd) {
            if (req.body.passwd==req.body.cpasswd) {
                if (req.body.passwd !=req.body.cpasswd)
                    return resp.status(400).json({error:"passwords dont match"}),400
                if (!isValidPassword(req.body.passwd)) 
                    return resp.status(400).json({error:"password not valid (minlength:4)",must_contain:['a-z','A-Z','0-9','any specials','']}),400
                moduser.passwd = req.body.passwd
            }
        }
    const user =await User.findOne({where:{rid:userId}})
    if (!user) {
        return resp.status(404).json({error:"user not found"})
    }
    user.set(moduser)
    await user.save()
    return resp.json({msg:'user data changed'})
    }catch(err) {
        return resp.status(400).json({error: err.toString()})
    }
}) 

userRoute.post("/delete",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId)
            return resp.status(401).json({error:"token expired"})
        const user =await User.findOne({where:{rid:userId}})
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        const bill_drafts = await BillDraft.findAll({where: {rid:user.rid}})
        for (const bill_draft of bill_drafts) {
            const product = await Product.findOne({where:{pid:bill_draft.pid}})
            if (product) {
                const newqty = product.qty+bill_draft.qty
                product.set({qty:newqty})
                await product.save()
            }
            await bill_draft.destroy()
        }
    await user.destroy()
    return resp.json({msg:"user deleted"})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

userRoute.get("/info",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId)
            return resp.status(401).json({error:"token expired"})
        const user =await User.findOne({where:{rid:userId}})
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
    return resp.json({username:user.username,createdAt:user.createdAt})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

module.exports=userRoute