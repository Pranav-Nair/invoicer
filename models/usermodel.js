const {Sequelize,DataTypes} = require("sequelize")
const dotenv = require("dotenv")
dotenv.config()
const seq = new Sequelize(process.env.db,process.env.dbuser,process.env.dbpasswd,{host:process.env.host,dialect:"mysql"})
const User = seq.define(
    "User",{
        rid: {
            type: DataTypes.UUID,
            primaryKey:true,
            defaultValue:DataTypes.UUIDV4
        },
        username: {
            type:DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        passwd: {
            type: DataTypes.STRING,
            allowNull:false
        }
    },{
        tableName: "users"
    }
);

module.exports = User
