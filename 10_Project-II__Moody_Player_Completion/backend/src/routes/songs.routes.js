const express = require("express")
const router = express.Router()
const multer = require("multer")
const uploadFile = require('../service/storage.service')
const songModel = require("../models/song.model")

const upload = multer({ storage: multer.memoryStorage() })


router.post('/songs', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Audio file is required" });
        }

        const fileData = await uploadFile(req.file)

        const song = await songModel.create({
            title: req.body.title.toLowerCase(),
            artist: req.body.artist.toLowerCase(),
            audio: fileData.url,
            mood: req.body.mood.toLowerCase()
        })

        console.log(song)
        res.status(200).json({
            message: "song created succesfully",
            song: req.body,
        })
    } catch (e) {
        console.error(error);

        res.status(500).json({
            message: "Song upload failed",
            error: error.message
        });
    }
})

router.get('/songs', async (req, res) => {
    try {
        const { mood } = req.query

        let filter = {};
        if (mood) {
            filter.mood = mood.toLowerCase();
        }
        const songs = await songModel.find(filter)

        res.status(200).json({
            message: "Songs Fetched Succesfully",
            count: songs.length,
            songs: songs
        })

    } catch (e) {
        res.status(500).json({
            message: "Failed to fetch songs",
            error: error.message
        });
    }

})



module.exports = router