# RASM - Live in Visualized Maths Universe

[![Netlify Status](https://api.netlify.com/api/v1/badges/ea168b66-238a-4ea5-9ba5-515de73aeb8a/deploy-status)](https://app.netlify.com/projects/rasm-graphing/deploys)

A mathematical graphing and visualization application for sketching functions, geometry, and exploring mathematical concepts interactively.

![Screenshot of the app](./docs/screenshot.png)

## Architecture

**Monorepo** powered by [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/).

### Packages

| Package                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `@rasm/app`            | Main SolidJS application                     |
| `@rasm/math`           | Math utilities (Vector, Angles, Lines, Core) |
| `@rasm/magical-parser` | Expression parser for mathematical notation  |

### App Structure (`packages/app`)

```txt
src/
├── components/          # SolidJS UI components
│   ├── App/             # Root app component
│   ├── Layout/          # Canvas, Controls, Keypad containers
│   ├── ChildControl/    # Graph element controls (Slider, Function, etc.)
│   ├── Sketch/          # Canvas rendering
│   └── CoordinatesDisplay/
├── stores/              # Reactive state management
│   ├── controlsStore    # Graph children (functions, variables, sliders)
│   ├── graphSettingsStore # Viewport, pan/zoom, coordinates
│   └── sketchStore      # Drawing queue and canvas state
├── core/                # Core logic
│   ├── GraphChildren/   # Xfunction, Slider, Variable, EvalExpr
│   ├── GraphSetting/    # Transform, CoorManager
│   └── Sketch.js        # Canvas orchestration
└── utils/               # Helpers
```

## Prerequisites

- **Bun** (v1.0+)

## Installation

```bash
bun install
```

## Commands

```bash
bun run dev         # Start dev server with hot reload
bun run build       # Build production bundle
bun run lint        # Lint code
bun run lint:fix    # Fix linting issues
bun run format      # Format code

# Preview production build
bunx turbo --filter @rasm/app preview
```

## TODOs

Check [Projects tab](https://github.com/MuhammadSawalhy/rasm/projects?query=is%3Aopen) on the GitHub repo.

- [ ] Share the graph as a link
  - [ ] Disable sharing if a CSV was uploaded or the graph children can't be serialized
- [ ] Save the graph as an image
- [ ] Record a video for the canvas
- [ ] Better performance
  - [ ] More threads using WebWorker
  - [ ] GPU computing using WebGPU
  - [ ] Low level compiled languages using WebAssembly
- [ ] Configure the coordinates display
  - [ ] Show axes labels and change in settings
  - [ ] Show grid lines and change in settings
  - [ ] Add units to the axes
  - [ ] Scientific way to display the acess with the axes sticked to the left and the bottom only
  - [ ] Polar coordinates like that exists in GeoGebra
  - [ ] Logarithmic scale of either of the axes
- [ ] Build a backend so someone can store his own drawings and visit later
  - [ ] Store data files like CSV files
- [ ] History control (undo and redo)
- [ ] Versioning control and save a version
- [ ] Support more math values
  - [ ] Make it support matrices
  - [ ] Make it support complex numbers
- [ ] Draw fractals and The Mandelbrot set
- [ ] Frequency domain and Fourier transform
- [ ] New graph children
  - [ ] Implicit functions like $(x^{2}+y^{2}-1)^{3}=x^{2}y^{3}$
  - [ ] $(f(t), g(t))$
  - [ ] Polar functions: $r = f(\theta)$
  - [ ] List of numbers and sets (and operations of them are done in a numpy way of handling arrays)
  - [ ] Operations of lists and sets
- [ ] Long press on a math-field to cause a tools bar to appear with a copy as ($\TeX$, ASCII-math), clear, and more.
- [ ] More advanced sidebar
  - [ ] Maybe folders and expressions like Desmos or some thing more flexible like Jupiter Py
  - [ ] Make it sortable and foldable
- [ ] Keyboard hotkeys
  - [ ] Move and sort the child controls
  - [ ] Zoom in/out and pan the canvas
- [ ] Open equation editor `mathquill` in a floating component for larger view to see the full expression
- [ ] OCR for handwritten equations
- [ ] Studing and discovering `matplotlib` Python package and Matlab

## License

Apache License 2.0
