const {Sequelize,DataTypes} = require("sequelize")
const seq = new Sequelize(process.env.db,process.env.dbuser,process.env.dbpasswd,{host:process.env.host,dialect:"mysql"})

const Product = seq.define(
    "Product",
    {
        pid: {
            type:DataTypes.UUID,
            primaryKey:true,
            defaultValue : DataTypes.UUIDV4
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
            allowNull:false,
            defaultValue:0.00
        },
        price: {
            type:DataTypes.FLOAT(6),
            allowNull:false
        },
        discount: {
            type:DataTypes.FLOAT(3),
            allowNull:false,
            defaultValue:0.00
        },
        gst: {
            type:DataTypes.FLOAT(3),
            allowNull:false,
            defaultValue:0.00
        }
    },{
        tableName:"products"
    }
)

module.exports=Product