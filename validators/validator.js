
const jwt = require("jsonwebtoken")
require("dotenv").config()
const isValidUsername=(username)=> {
    const alphabets = /[a-z]+/gi
    const allowed_specials =/[\._]/
    const specials = /\W+/g
    let valid=true
    if (!username || !username.trim() || username.length<2) {
        valid=false
        return valid
    }
    if (!alphabets.test(username)) {
        valid=false
        return valid
    }
    const contained_specials =Array.from(username.matchAll(specials))
    contained_specials.forEach(special => {
        if (!allowed_specials.test(special[0]))
            valid=false
    });
    return valid
}

const isValidPassword = (password)=> {
    const alph_upper = /[A-Z]+/
    const alph_lower = /[a-z]+/
    const digits = /[0-9]+/
    const specials = /\W+/
    let valid=true
    console.log(password.length)
    if (!password ||!password.trim() || password.length<4) {
        valid=false
        return valid
    }
    if (!alph_lower.test(password) || !alph_upper.test(password) || !digits.test(password) || !specials.test(password)) {
        valid=false
        return valid
    }
    return valid
}

const parseToken = (tokenstr)=> {
    let token
    let data
    let tokendata = tokenstr
    if (!tokendata)
        return
    tokendata = tokendata.split(" ")
    if (tokendata.length==3)
        token=tokendata[2]
    else
        token=tokendata[1]
    try {
        data=jwt.verify(token,process.env.access_token_secret)
    }catch(err) {
        return
    }
    return data.userId
}

module.exports ={isValidPassword,isValidUsername,parseToken}