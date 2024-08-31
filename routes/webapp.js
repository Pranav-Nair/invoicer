const express = require("express")

const webui = express.Router()

webui.get("/register",async (req,resp)=>{
    return resp.render("register")
})

webui.get("/login",async (req,resp)=>{
    return resp.render("login")
})

webui.get("/home",async(req,resp)=>{
    return resp.render("home")
})

webui.get("/products",async(req,resp)=>{
    return resp.render("products")
})

webui.get("/addproducts",async(req,resp)=>{
    return resp.render("addproducts")
})

webui.get("/editproducts?:pid",async(req,resp)=>{
    return resp.render("editproduct")
})

webui.get("/billplus",async(req,resp)=>{
    return resp.render("billplus")
})

webui.get("/billlist",async(req,resp)=>{
    return resp.render("billlist")
})

webui.get("/viewbill?:bid",async(req,resp)=>{
    return resp.render("billview")
})

module.exports = webui