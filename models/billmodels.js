const {Sequelize,DataTypes, DATE} = require("sequelize")
const Product = require("./productmodel")
const User = require("./usermodel")
const seq = new Sequelize(process.env.db,process.env.dbuser,process.env.dbpasswd,{host:process.env.host,dialect:"mysql"})
const BillDraft = seq.define(
    "BillDraft",
    {
        rid : {
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model: User,
                key:"rid"
            }
        },
        pid : {
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model:Product,
                key:"pid"
            }
        },
        qty: {
            type:DataTypes.FLOAT(6),
            allowNull:false
        }
    },{
        tableName:"bill_drafts"
    }
)

const Bill =seq.define(
    'Bill',
    {
        bid: {
            type:DataTypes.UUID,
            primaryKey:true,
            defaultValue:DataTypes.UUIDV4
        },
        pno : {
            type:DataTypes.BIGINT,
            allowNull:false
        }
    }, {
        tableName:"bills"
    }
)

const BillLog = seq.define(
    "BillLog",
    {
        bid:{
            type:DataTypes.UUID,
            allowNull:false,
            references: {
                model:Bill,
                key:'bid'
            }
        },
        pid: {
            type:DataTypes.UUID,
            allowNull:false
        },
        name : {
            type:DataTypes.STRING,
            allowNull:false
        },
        unit: {
            type:DataTypes.STRING,
            allowNull:false
        },
        per_qty: {
            type:DataTypes.FLOAT(6),
            allowNull:false
        },
        qty: {
            type:DataTypes.FLOAT(6),
            allowNull:false
        },
        applied_price: {
            type:DataTypes.FLOAT(6),
            allowNull:false
        },
        applied_discount: {
            type:DataTypes.FLOAT(3),
            allowNull:false,
            defaultValue:0.00
        },
        applied_gst: {
            type:DataTypes.FLOAT(3),
            allowNull:false,
            defaultValue:0.00
        },
        final_price: {
            type : DataTypes.FLOAT(6),
            allowNull : false
        }
    },{
        tableName:"bill_logs"
    }
)
BillDraft.removeAttribute('id')
BillLog.removeAttribute('id')
module.exports= {BillDraft,Bill,BillLog}