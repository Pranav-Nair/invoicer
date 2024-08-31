const express = require("express")
const Product = require("../models/productmodel")
const {BillDtaft, BillDraft, BillLog, Bill} = require("../models/billmodels")
const { parseToken } = require("../validators/validator")
const User = require("../models/usermodel")
require("dotenv").config()

const billRoute = express.Router()

billRoute.post("/draft/add",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        if (!req.body || !req.body.pid || !req.body.qty) {
            return resp.status(400).json({error:"missing fields",required_fields:['pid','qty']})
        }
        if (req.body.qty<=0)
            return resp.status(400).json({error:"invalid values",non_negative_fields:['qty']})
        const product = await Product.findByPk(req.body.pid.toString())
        if (!product) {
            return resp.status(404).json({error:"product not found"})
        }
        if (product.qty<req.body.qty || (req.body.qty%product.per_qty)!=0) {
            return resp.status(404).json({error:"not enough stock to fullfill transaction"})
        }
        product.qty-=req.body.qty
        let draft = await BillDraft.findOne({where : {pid : product.pid,rid : userId}});
        if (!draft)
        draft = BillDraft.build({
            rid:userId,
            pid : product.pid,
            qty : req.body.qty
        })
        else
            draft.qty +=req.body.qty
        await product.save()
        await draft.save()
        return resp.json({draft})
    }catch(err) {
        console.log(err)
        return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/draft/rm",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        if (!req.body || !req.body.pid) {
            return resp.status(400).json({error:"missing fields",required_fields:['pid'],optional_fields:['qty']})
        }
        const draft = await BillDraft.findOne({where: {pid : req.body.pid,rid: userId}})
        if (!draft)
            return resp.status(404).json({error:'draft not found'})
        if (draft.qty < req.body.qty)
            return resp.status(400).json({error:"invalid values",non_negative_fields:['qty']})
        draft.qty-=req.body.qty
        const product = await Product.findByPk(req.body.pid.toString())
            if (product) {
                if (req.body.qty && (req.body.qty<=0 || req.body.qty%product.per_qty!=0))
                    return resp.status(400).json({error:"invalid values",non_negative_fields:['qty']})
                product.qty+=req.body.qty
                await product.save()
            }
        if (draft.qty==0)
            await draft.destroy()
        else
            await draft.save()
        return resp.json({msg:"draft item deleted"})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

billRoute.get("/draft/list",async (req,resp)=> {
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }   
        const drafts = await BillDraft.findAll({where:{rid : userId}})
        let products =[]
        let total=0
        for (const draft of drafts) {
            await Product.findOne({where:{pid : draft.pid.toString()}}).then((product)=> {
                const draftitem = {pid : product.pid,name:product.name,unit : product.unit,qty: draft.qty,total_price: product.price*(draft.qty/product.per_qty) + product.price*(product.gst*0.01)*(draft.qty/product.per_qty) - product.price*(product.discount*0.01)*(draft.qty/product.per_qty)}
                products.push(draftitem)
                total += draftitem.total_price;
            })
        }
        return resp.json({products : products,total:total})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/draft/clear",async (req,resp)=>{
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }   
        const drafts = await BillDraft.findAll({where:{rid : userId}})
        for (const draft of drafts) {
            const product = await Product.findOne({where : {pid : draft.pid.toString()}})
            if (product) {
                product.qty +=draft.qty
                await product.save()
            }
            await draft.destroy()
        }
        return resp.json({drafts:[]})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/generate",async (req,resp)=> {
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }   
        if (!req.body || !req.body.pno) {
            return resp.status(400).json({error:"missing fields",required_fields:['pno']})
        }
        const drafts = await BillDraft.findAll({where : {rid: userId}})
        if (!drafts)
            return resp.status(400).json({error:"noting in draft"})
        const bill = Bill.build({pno: req.body.pno})
        await bill.save()
        for (const draft of drafts) {
            const product = await Product.findByPk(draft.pid.toString())
            let bill_log = BillLog.build({
                pid : product.pid,
                name : product.name,
                unit : product.unit,
                per_qty : product.per_qty,
                applied_discount : product.discount,
                applied_gst : product.gst,
                applied_price : product.price,
                bid : bill.bid,
                qty : draft.qty,
            })
            const tax_amt = bill_log.applied_price*(bill_log.applied_gst*0.01)
            bill_log.final_price = bill_log.applied_price - bill_log.applied_price*(bill_log.applied_discount*0.01) + tax_amt
            bill_log.final_price*=(bill_log.qty/bill_log.per_qty)

            await bill_log.save()
            await draft.destroy()
        }
        return resp.json({bid : bill.bid})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/rm",async (req,resp)=> {
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }   
        if (!req.body || !req.body.bid) {
            return resp.status(400).json({error : "missing fields",required_fields:['bid']})
        }
        const bill = await Bill.findByPk(req.body.bid)
        if (!bill) {
            return resp.status(404).json({error:"bill not found"})
        }
        const bill_logs = await BillLog.findAll({where : {bid : bill.bid}})
        for (const bill_log of bill_logs) {
            await bill_log.destroy()
        }
        await bill.destroy()
        return resp.json({msg: "bill deleted"})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/list",async (req,resp)=> {
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }   
        const bills = await Bill.findAll()
        if (!bills)
            bills=[]
        return resp.json({bills : bills})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

billRoute.post("/info",async (req,resp)=> {
    try{
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findByPk(userId.toString())
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        if (!req.body || !req.body.bid) {
            return resp.status(400).json({error:"missing fields",required_fields:['bid']})
        } 
        let total=0
        const bill_logs = await BillLog.findAll({where: {bid : req.body.bid}})
        if (!bill_logs)
            return resp.status(404).json({error:"bill not found"})
        for (const bill_log of bill_logs) {
            total +=bill_log.final_price
        }
        return resp.json({billed_items:bill_logs,total : total})
    }catch(err) {
    return resp.status(400).json({error:err.toString()})
    }
})

module.exports = billRoute