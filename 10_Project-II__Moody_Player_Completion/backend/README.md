# 🎵 Moody Player Backend API

This project is a backend API for uploading and fetching songs based on mood.  
It supports:

✅ Audio file upload using Multer  
✅ ImageKit cloud storage integration  
✅ MongoDB for song data storage  
✅ Mood-based song filtering  
✅ Fully RESTful API structure  

---

## 🚀 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Multer (file upload)**
- **ImageKit (cloud storage)**
- **dotenv**
- **Nodemon**

---

## 📂 Required Environment Setup (`.env`)

Create a file named `.env` in the `backend` folder and add:

```env
MONGODB_URL=your_mongodb_connection_string
IMAGEKIT_PUBLIC=your_imagekit_public_key
IMAGEKIT_PRIVATE=your_imagekit_private_key
IMAGEKIT_URL=https://ik.imagekit.io/your_id
```

⚠️ Without these values, the server will NOT start.

---

## ▶️ How To Run the Project

### 1️⃣ Install Dependencies

```bash
npm install
```

---

### 2️⃣ Start the Server

```bash
npx nodemon server.js
```

Your backend will run on:

```
http://localhost:3000
```

---

## 🎵 Upload a Song (POST Request)

### ✅ API Endpoint
```
POST http://localhost:3000/songs
```

### ✅ Open Postman and Select:
- Method → **POST**
- Body → **form-data**

### ✅ Add These Fields:

| Key    | Type | Value |
|--------|------|--------|
| title  | Text | Song Title |
| artist | Text | Artist Name |
| mood   | Text | happy / sad / chill / angry |
| audio  | File | Select an audio file |

✅ Click **Send**  
✅ Audio gets uploaded to **ImageKit**  
✅ Song details saved in **MongoDB**

---

## 🎧 Fetch Songs (GET Request)

### ✅ Fetch All Songs
```
GET http://localhost:3000/songs
```

---

### ✅ Fetch Songs by Mood
```
GET http://localhost:3000/songs?mood=happy
```

You can replace `happy` with:
```
sad
chill
angry
romantic
```

---

## ✅ Example Requests

```
http://localhost:3000/songs
http://localhost:3000/songs?mood=happy
http://localhost:3000/songs?mood=sad
```

---

## ✅ Quick Setup Checklist

- ✅ MongoDB running
- ✅ `.env` configured correctly
- ✅ ImageKit public & private keys added
- ✅ Server running on port **3000**
- ✅ Postman using **form-data** for uploads

---

## ❗ Common Issues & Fixes

| Problem | Fix |
|--------|-----|
| Server crashes | Check `.env` values |
| Audio not uploading | Ensure Postman key name is `audio` |
| ImageKit error | Verify public/private keys |
| No songs returned | Check MongoDB connection |
| Mood filter not working | Use lowercase moods (`happy`, `sad`) |

---

## 🔮 Future Improvements

- ✅ User authentication
- ✅ Playlist system
- ✅ Song likes & favorites
- ✅ Admin dashboard
- ✅ Streaming support
- ✅ Deployment on Render / Railway / VPS

---

## 👨‍💻 Author

**Sayantan Bharati**  
Backend Developer  

---

## 📜 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it.
