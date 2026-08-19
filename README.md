# DevTools Web App

A powerful suite of developer utilities built with React, Vite, and Tailwind CSS. Features professional tools like Color Converters, Gradient Generators, and a Catppuccin-themed Code Scratchpad.

## 🚀 Features

- **Color Converter**: HEX, RGB, HSL, and CMYK conversion.
- **Image Color Picker**: Extract colors directly from images.
- **Gradient Generator**: Create complex CSS gradients with RGBA support.
- **Palette Generator**: harmonic color recommendations.
- **Shadow Generator**: Visual box-shadow creation.
- **Quick Notes**: Multi-tab code scratchpad with Catppuccin theme, line numbers, and syntax highlighting.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: FontAwesome
- **Editor**: PrismJS + react-simple-code-editor
- **Environment**: Docker (PHP 8.4 + Apache + Node.js)

## 📦 Commands

### Development
To start the development server:
```bash
npm run dev
```

### Build for Production (Recommended using Docker)
To create a production-ready build inside the container:
```bash
docker-compose exec app npm run build
```

### Build Locally (Alternative)
If you have Node.js installed on your host:
```bash
npm run build
```

### Preview Production Build
To preview the build locally:
```bash
npm run preview
```

## 🐳 Docker Usage

Start the environment with:
```bash
docker-compose up -d
```

Access the app at `http://localhost:5173`.
