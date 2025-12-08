const ImageKit = require("imagekit");
require("dotenv").config();


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC,
  privateKey: process.env.IMAGEKIT_PRIVATE,
  urlEndpoint: process.env.IMAGEKIT_URL
});

function uploadFile(file){
    return new Promise((resolve,reject)=>{
        imagekit.upload({
            file:file.buffer,
            fileName:file.originalname
        },(error,result)=>{
            if(error){
                reject(error)
            }else{
                resolve(result)
            }
        })  
    })
}

module.exports=uploadFile