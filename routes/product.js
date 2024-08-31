const express = require("express")
const Product = require("../models/productmodel")
const User = require("../models/usermodel")
const {BillDraft} = require("../models/billmodels")
const {parseToken} = require("../validators/validator")
require("dotenv").config()


const productRoute = express.Router()

productRoute.post("/create",async(req,resp)=>{
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findOne({where: {rid : userId}})
        if (!user) {
            return resp.status(404).json({error:'user not found'})
        }
        let newproductdata={}
        if (!req.body || !req.body.name || !req.body.name.trim() || !req.body.unit || !req.body.unit.trim() || !req.body.per_qty || !req.body.price) {
            return resp.status(400).json({error:'missing fields',required_fields: ['name','unit','per_qty','price'],optional:['discount','qty','gst']})
        }
        newproductdata.name=req.body.name
        newproductdata.unit=req.body.unit
        if (req.body.price<=0 || req.body.per_qty<=0)
            return resp.status(400).json({error:'invalid values',fields_non_negative:['price','per_qty']})
        else {
            newproductdata.price=req.body.price
            newproductdata.per_qty = req.body.per_qty
        }
        if (req.body.discount)
            if (req.body.discount<=0)
                return resp.status(400).json({error:'invalid values',fields_non_negative:['discount']})
            else
                newproductdata.discount = req.body.discount
        if (req.body.qty)
            if (req.body.qty<=0 || (req.body.qty%newproductdata.per_qty)!=0)
                return resp.status(400).json({error:'invalid values',fields_non_negative:['qty']})
            else
                newproductdata.qty = req.body.qty
        if (req.body.gst)
            if (req.body.gst<=0)
                return resp.status(400).json({error:'invalid values',fields_non_negative:['gst']})
            else
                newproductdata.gst = req.body.gst
        const product = Product.build(newproductdata)
        await product.save()
        return resp.json(newproductdata)
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

productRoute.post("/list",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findOne({where: {rid : userId}})
        if (!user) {
            return resp.status(404).json({error:'user not found'})
        }
        // let page=1
        // if (req.body.page && req.body.page>0)
        //     page = req.body.page
        // let count = await Product.count()
        // let limit=30
        // let pages = Math.ceil(count/limit)
        // let offset = limit*(page-1)
        // const products = await Product.findAll({limit:limit,offset : offset})
        const products = await Product.findAll()
        return resp.json({products:products})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

productRoute.post("/delete",async (req,resp)=>{
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findOne({where: {rid : userId}})
        if (!user) {
            return resp.status(404).json({error:'user not found'})
        }
        if (!req.body || !req.body.pid) {
            return resp.status(400).json({error:"missing fields",required_fields:['pid']})
        }
        const product = await Product.findByPk(req.body.pid)
        if (!product)
            return resp.status(404).json({error:"product not found"})
        const drafts = await BillDraft.findAll({where : {pid:product.pid}})
        if (drafts){
            console.log(drafts)
            for (const index in drafts) {
                await drafts[index].destroy()
            }
        }
        await product.destroy()
        return resp.json({msg:"product deleted"})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

productRoute.post("/change",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findOne({where:{rid:userId}})
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        if (!req.body || !req.body.pid || ((!req.body.name || !req.body.name.trim()) && (!req.body.unit || !req.body.unit.trim()) && !req.body.per_qty && !req.body.price && !req.body.discount && !req.body.gst && !req.body.qty && !req.body.addqty))
            return resp.status(400).json({error:"missing fields",optional_fields:['name','unit','per_qty','qty','price','gst','discount','addqty'],required_fields:['pid']})
        const product = await Product.findByPk(req.body.pid.toString())
        if (!product) {
            return resp.status(404).json({error:"product not found"})
        }
        const newproduct = {}
        if (req.body.name)
            newproduct.name = req.body.name
        if (req.body.unit)
            newproduct.unit = req.body.unit
        if (req.body.price)
            if (req.body.price<=0)
                return resp.status(400).json({error:"Invalid value",fields:['price']})
            else 
                newproduct.price=req.body.price
        if (req.body.discount)
            if (req.body.discount<=0)
                return resp.status(400).json({error:"Invalid value",fields:['discount']})
            else 
                newproduct.discount=req.body.discount
        if (req.body.gst)
            if (req.body.gst<=0)
                return resp.status(400).json({error:"Invalid value",fields:['gst']})
            else 
                newproduct.gst=req.body.gst
        if (req.body.per_qty)
            if (req.body.per_qty<=0)
                return resp.status(400).json({error:"Invalid value",fields:['per_qty']})
            else 
                newproduct.per_qty=req.body.per_qty
        if (req.body.qty)
            if (req.body.qty<=0)
                return resp.status(400).json({error:"Invalid value",fields:['qty']})
            else 
                newproduct.qty=req.body.qty
        if (newproduct.per_qty) {
            if ((req.body.qty%newproduct.per_qty)!=0) {
                return resp.status(400).json({error:"Invalid value",fields:['qty']})
            }
        }else if (req.body.qty%product.per_qty!=0) {
            return resp.status(400).json({error:"Invalid value",fields:['qty']})
        }

        product.set(newproduct)
        if (req.body.addqty)
            if (req.body.addqty<=0)
                return resp.status(400).json({error:"Invalid value",fields:['addqty']})
            else {
                let newqty = product.qty+req.body.addqty
                product.qty=newqty
            }
        await product.save()
        return resp.json({product})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})

productRoute.post("/details",async (req,resp)=> {
    try {
        const userId = parseToken(req.headers.authorization)
        if (!userId) {
            return resp.status(401).json({error:"token expired"})
        }
        const user = await User.findOne({where:{rid:userId}})
        if (!user) {
            return resp.status(404).json({error:"user not found"})
        }
        if (!req.body || !req.body.pid)
            return resp.status(400).json({error:"missing fields",required_fields:['pid']})
        const product = await Product.findByPk(req.body.pid.toString())
        if (!product) {
            return resp.status(404).json({error:"product not found"})
        }
        return resp.json({product})
    }catch(err) {
        return resp.status(400).json({error:err.toString()})
    }
})


module.exports = productRoute