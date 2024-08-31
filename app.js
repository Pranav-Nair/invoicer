const express = require("express")
const dotenv = require("dotenv")
const {Sequelize} = require("sequelize")
const User = require("./models/usermodel")
const Product =require("./models/productmodel")
const {BillDraft,Bill,BillLog} = require("./models/billmodels")
const userRoute = require("./routes/user")
const productRoute = require("./routes/product")
const billRoute = require("./routes/bill")
const webui = require("./routes/webapp")
const path =require("path")
const app=express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))
dotenv.config()
app.set("views",path.join(__dirname,"views"))
app.use("/static",express.static("static"))
app.set("view engine","ejs")

app.use("/",webui)
app.use("/api/user",userRoute)
app.use("/api/product",productRoute)
app.use("/api/bill",billRoute)

app.get("/api",(req,resp)=>{
    return resp.status(404).json({error:"unknown endpoint"})
})
app.listen(3000,()=>{
    console.log("server running")
})

const seq = new Sequelize(process.env.db,process.env.dbuser,process.env.dbpasswd,{host:process.env.host,dialect:"mysql"})
try {
    seq.authenticate().then(()=> {
        console.log("[OK] database connected")
        seq.close().then()
        Product.sync().then(()=>User.sync().then(()=>{
            BillDraft.sync().then()
            Bill.sync().then()
            BillLog.sync().then()
        }))
    });
}catch(err) {
    console.log("[ERROR]: ",err)
}