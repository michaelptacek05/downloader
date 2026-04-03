# YouTube MP3 Downloader

This project is an experimental tool designed for real-time YouTube to MP3 conversion using Node.js streaming pipes and FFmpeg.
<br />

## Project Status: Unsuccessful
This project is currently **not functional** in a production environment (VPS/Cloud). Despite a solid technical architecture, it was defeated by Google's aggressive bot detection and cookie rotation policies. 

Even with advanced techniques like User-Agent spoofing and manual cookie injection, YouTube's security layers (like TLS fingerprinting) effectively block requests coming from datacenter IP ranges (Contabo, AWS, etc.).

## Techstack 
* React
* Next.js (API Routes)
* TypeScript
* [FFmpeg](https://ffmpeg.org/)
* [yt-dlp](https://github.com/yt-dlp/yt-dlp)
* Docker

## How to install and run this project
Make sure you have [Node.js](https://nodejs.org/), [Python](https://www.python.org/), and [FFmpeg](https://ffmpeg.org/) installed on your system.

1. Clone this repository
2. Install dependencies: 
`npm install`
3. Start the development server: 
`npm run dev`

made by [Michael Ptáček](https://michaelptacek.com)