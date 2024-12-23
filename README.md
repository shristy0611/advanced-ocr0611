# Advanced OCR Application

A bilingual (English/Japanese) OCR application that uses Google's Gemini AI to analyze images and extract text, tables, and insights.

## Features

- Bilingual support (English/Japanese)
- Automatic language detection
- Text extraction from images
- Table detection and extraction
- Object detection
- Detailed image analysis

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your Google Gemini API key to `.env`:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

### Netlify Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set the following build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables:
   - Add `VITE_GEMINI_API_KEY` in Netlify's environment variables settings

### Render Deployment

1. Push your code to GitHub
2. Create a new Static Site in Render
3. Connect your repository
4. Set the following build settings:
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
5. Add environment variables:
   - Add `VITE_GEMINI_API_KEY` in Render's environment variables settings

## Important Notes

- Make sure to keep your API keys secret and never commit them to version control
- The application requires a Google Gemini API key to function
- All text processing is done client-side for privacy
- The application supports both English and Japanese interfaces
