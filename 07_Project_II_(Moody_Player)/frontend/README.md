# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🎭 Image-to-Video Face Mask (React + face-api.js)

This project allows you to:

✅ Upload a **source image**  
✅ Automatically **cut the face** from that image  
✅ Upload a **target video**  
✅ **Overlay the extracted face as a mask on the video face in real time**  
✅ All processing happens **inside the browser** using **face-api.js**

⚠️ This is a **2D face mask overlay**, not a deepfake GAN-based system.

---

## 🚀 Features

- Image face detection & cropping
- Real-time face tracking in video
- Live face mask overlay
- No backend required
- No webcam required
- Works fully in the browser
- Fast & lightweight

---

## 🛠️ Tech Stack

- **React.js**
- **face-api.js**
- **HTML5 Canvas**
- **JavaScript (ES6+)**

---

## 📂 Required Model Files

You MUST place these files inside:

