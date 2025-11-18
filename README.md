# RASM - Live in Visualized Maths Universe

[![Netlify Status](https://api.netlify.com/api/v1/badges/ea168b66-238a-4ea5-9ba5-515de73aeb8a/deploy-status)](https://app.netlify.com/projects/rasm-graphing/deploys)

A mathematical graphing and visualization application for sketching functions, geometry, and exploring mathematical concepts interactively.

![Screenshot of the app](./docs/screenshot.png)

## Prerequisites

- **Node.js** (v14 or higher)
- **Bun** (v1.0 or higher)

## Installation

```bash
bun install
```

## Commands

**Development:**

```bash
npm start              # Start dev server with hot reload
npm run build:dev      # Build in development mode
npm run lint           # Lint code
npm run lint:fix       # Fix linting issues
npm run format         # Format code
```

**Production:**

```bash
npm run build:prod     # Build optimized production bundle
npm run webpack:prod   # Alternative production build with Webpack
npm run webpack:analyze # Analyze bundle size
```

## Key Components

- **Canvas** - Drawing canvas and viewport management
- **Coordinates** - Coordinate system and transformations
- **Graph Children** - Point, Function, Slider, Variable objects
- **GraphSettings** - Graph configuration and transforms
- **Events & UI** - Event handling and user interface

## License

Apache License 2.0
