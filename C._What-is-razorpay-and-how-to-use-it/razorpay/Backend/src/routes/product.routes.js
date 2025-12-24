const express=require("express")
const productController =require("../controllers/product.controller")


const router=express.Router()

router.post('/',productController.creatProduct)
router.get('/get-item',productController.getProduct)


module.exports=router