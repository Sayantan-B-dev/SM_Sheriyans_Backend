const {productModel} = require('../models/product.model')

async function creatProduct(req, res) {
    const {
        image,
        title,
        description,
        price: {
            ammount,
            currency
        }
    } = req.body

    try {

        const product = await productModel.create({
            image,
            title,
            description,
            price: {
                ammount,
                currency
            }
        })
    return res.status(201).json({
        message:"product creatd succesfully",
        product
    })

    } catch (e) {
        console.log(e)
    }
}

async function getProduct(req,res){
    try{
        const products=await productModel.findOne({})
        return res.status(201).json({
            message:"product fetched successfully",
            products
        })
    }catch(e){
        console.log(e)
    }
}

module.exports={
    creatProduct,
    getProduct
}