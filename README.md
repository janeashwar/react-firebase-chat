# 3D Particle System with Hand Gesture Control

An interactive real-time 3D particle system built with Three.js and controlled through hand gestures using MediaPipe Hands.

## Features

### 🎨 Interactive Particle Templates
- **❤️ Hearts** - Mathematical heart curve pattern
- **🌸 Flowers** - Spiral petal arrangement  
- **🪐 Saturn** - Ring and sphere combination
- **🎆 Fireworks** - Spherical explosion pattern

### 👋 Hand Gesture Control
- Detects both hands simultaneously through camera
- **Hand openness** controls particle scaling (0.5x to 2.0x)
- **Hand tension** controls particle expansion (-0.5 to 1.0)
- Real-time instant reactions to gesture changes
- Automatic demo mode when camera is unavailable

### 🎨 Customization
- Color picker with visual preview
- Hex color input for precise color control
- Smooth color transitions
- Modern glass-morphism UI

## Technology Stack

- **Three.js** - 3D rendering and WebGL
- **MediaPipe Hands** - Hand landmark detection
- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebGL support
- Camera access for hand tracking (optional - demo mode available)

### Installation

1. Clone the repository
```bash
git clone https://github.com/janeashwar/react-firebase-chat.git
cd react-firebase-chat
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Allow camera access** when prompted (or use demo mode)
2. **Show your hands** to the camera
3. **Open your hands** to scale particles up
4. **Close your hands** to scale particles down
5. **Adjust hand tension** to control particle expansion
6. **Switch templates** using the dropdown menu
7. **Change colors** using the color picker or hex input

## Performance Optimizations

- Pre-calculated distance caching for efficient particle updates
- Optimized animation loop with requestAnimationFrame
- Proper Three.js resource disposal to prevent memory leaks
- Efficient WebGL rendering with additive blending

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any browser with WebGL 1.0+ support

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Three.js community for the excellent 3D library
- MediaPipe team for hand tracking technology
- React team for the UI framework
