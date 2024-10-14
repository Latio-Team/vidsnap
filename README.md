# VidSnap: Effortless Screen Recording App

![App Preview](https://github.com/user-attachments/assets/295f7529-6155-418e-8168-c39068ef35b3)

VidSnap is a screen recording app to easy capture and share your screen. All you need to do is click "Start Recording" and share the preview URL with anyone. It is private and your recordings are stored securely on Pinata Cloud.

# Get Started

1. Clone the project into your local machine.
2. Link it to a Vercel project for API function testing (use `npm i -g vercel`).
3. Sign up at [Pinata Cloud](https://pinata.cloud) and create a new API key.
4. Grab the JWT key and add it as an environment variable in Vercel `vercel env add PINATA_JWT`
5. Replace your Gateway domain at `/api/video.js`
6. Run the dev server `vercel dev`

# Screenshots

**Home page**
![homepage](https://github.com/user-attachments/assets/5e66289d-5dab-4b11-acaf-819f593c12d8)

**Recording preview**
![image](https://github.com/user-attachments/assets/35a87b6b-b8a4-4a53-8dea-7574d647da47)
