// with http

// const http=require("http")
// r = () => {
//     let arr = [];
//     for (let i = 0; i < 100; i++) {
//         arr.push(i);
//     }
//     return arr;
// }
// const server=http.createServer((req,res)=>{
//     res.end(JSON.stringify(r()))
// })
// server.listen(3000,()=>{
//     console.log("server is running on 3000")
// })

// express
const express=require("express")

const app=express()

app.get('/',(req,res)=>{
    res.send("default page bro")
})
app.get('/home',(req,res)=>{
    res.send("home page bro")
})
app.get('/about',(req,res)=>{
    res.send("about page bro")
})

app.listen(3000,()=>{
     console.log("server is running on 3000")
})