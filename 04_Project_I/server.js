const express=require("express")
const app=express()
const port=3000
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("main page")    
})

let notes=[]
app.get('/notes',(req,res)=>{
    res.send(notes)
})
app.post('/notes',(req,res)=>{
    let note=req.body
    notes.push(note)
    res.json({
        message:"Notes",
        notes:notes
    })    
})
app.delete('/notes/:index',(req,res)=>{
    const index=req.params.index
    notes.splice(index, 1);
    res.json({
        message:"Notes",
        notes:notes
    }) 
})
app.patch('/notes/:index',(req,res)=>{
    const index=req.params.index
    const {title,note}=req.body
    notes[index].title=title
    notes[index].note=note
    res.json({
        message:"Notes",
        notes:notes
    }) 
})


app.listen(port,()=>{
    console.log("server running on "+port)
})