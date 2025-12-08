const express=require("express")
const app=express()
app.use(express.json())

app.get('/notes',(req,res)=>{
    res.send("default page bro")
})

let notes=[]
app.post('/notes',(req,res)=>{
    console.log(req.body)
    notes.push(req.body)
    res.json(
        {
            message: "ok",
            note:notes
        }
    )
})

app.listen(3000,()=>{
     console.log("server is running on 3000")
})