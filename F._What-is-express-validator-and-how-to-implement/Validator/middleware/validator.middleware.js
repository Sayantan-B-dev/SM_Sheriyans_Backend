const {body,query,params,validationResult}=require('express-validator')

function validate(req,res,next){
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next()
}
// another method .optional()
const registerValidationRules=[
    body('username')
        .isString().withMessage('Username must be a String')
        .isLength({min:3}).withMessage("Username must be at least 3 characters long"),

    body("email")
        .isEmail().withMessage("Invalid email format"),

    body("password")
        .isLength({min:6}).withMessage("Password must be at least 6 characters long"),
    validate
]

module.exports={
    registerValidationRules
}