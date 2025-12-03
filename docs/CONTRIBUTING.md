# Contributing to RASM

Thank you for your interest in contributing to RASM! This guide will help you set up your development environment and understand how to maintain the project.

## Setting Up Development Environment

### Prerequisites

- **Node.js** (v14 or higher)
- **Bun** (v1.0 or higher) - [Install Bun](https://bun.sh)
- **Git**
- A code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MuhammadSawalhy/rasm.git
   cd rasm
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Verify setup:**

   ```bash
   bun run build:dev
   ```

## Development Workflow

### Starting Development Server

Run the development server with hot module reloading:

```bash
npm start
```

This will start a webpack dev server at `http://localhost:8080` and automatically reload when you make changes.

### Code Structure

The project is organized as follows:

- **`src/js/core/`** - Core functionality (Canvas, Coordinates, Graph elements)
- **`src/js/rasm/`** - Main application logic and UI controls
- **`src/pugjs/`** - HTML templates
- **`src/styles/`** - SCSS stylesheets
- **`src/SUI/`** - Custom UI component library
- **`public/`** - Static assets and external libraries

### Making Changes

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the `src/` directory

3. **Test locally:**

   ```bash
   npm start
   ```

   Visit `http://localhost:8080` to see your changes

4. **Lint your code:**

   ```bash
   npm run lint
   ```

5. **Fix linting issues:**

   ```bash
   npm run lint:fix
   npm run format
   ```

6. **Build to verify:**

   ```bash
   npm run build:dev
   ```

### Committing Changes

1. **Stage your changes:**

   ```bash
   git add .
   ```

2. **Commit with a descriptive message:**

   ```bash
   git commit -m "feat: add feature description"
   ```

   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for test additions
   - `chore:` for maintenance tasks

3. **Push your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub

## Project Maintenance

### Code Quality

**Linting & Formatting:**

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
```

The project uses **Biome** for linting and formatting. Configuration is in `biome.json`.

### Building for Production

**Full production build with linting:**

```bash
npm run build:prod
```

**Production build only:**

```bash
npm run webpack:prod
```

This will:

- Run linting checks
- Minify JavaScript and CSS
- Generate source maps
- Create optimized bundles in `dist/`

### Bundle Analysis

To analyze bundle size and composition:

```bash
npm run webpack:analyze
```

This opens an interactive visualization of your bundle.

### Dependencies

**Checking dependencies:**

```bash
npm list
```

**Adding a dependency:**

```bash
npm install package-name
bun install  # Keep bun lockfile in sync
```

**Updating dependencies:**

```bash
npm update
bun install  # Keep bun lockfile in sync
```

### Build Process

The project uses two build systems:

**Bun Build** (`build.ts`):

- Compiles Pug templates to HTML
- Compiles SCSS to CSS
- Bundles JavaScript with Bun
- Used for `npm run build:dev` and `npm run build:prod`

**Webpack** (`webpack.config.cjs`):

- Alternative bundler
- Handles hot module reloading
- Used for `npm start`, `npm run webpack:*`

### File Structure After Build

```txt
dist/
├── index.html              # Compiled from Pug templates
├── style.css              # Compiled from SCSS
├── app.js or app-[hash].js # Bundled JavaScript
├── workers/               # Web Worker files
├── assets/                # Copied static assets
└── libraries/             # External libraries (Font Awesome, jQuery, etc.)
```

## Key Development Areas

### Adding a New Component

1. Create the component in appropriate `src/js/` directory
2. Import it in the parent module
3. Add styles to `src/styles/`
4. Update templates in `src/pugjs/` if UI changes needed
5. Test with `npm start`
6. Lint and format: `npm run lint:fix && npm run format`

### Modifying Styles

- Edit SCSS files in `src/styles/`
- Files are organized by section: `canvas/`, `keypad/`, `sidebar/`, `main/`
- Changes are automatically compiled on save during development

### Updating Templates

- Edit Pug files in `src/pugjs/`
- Use partials (files starting with `_`) for reusable components
- Main template is `index.pug`

### Adding External Libraries

1. Install via npm/bun
2. Import in `src/js/index.js` or relevant module
3. Add styles if needed
4. Update README if significant change
5. Check bundle size impact: `npm run webpack:analyze`

## Testing

While the project doesn't have automated tests currently, test your changes:

1. **Manual testing:**
   - Use `npm start` to test interactively
   - Test all major features that could be affected

2. **Visual testing:**
   - Check across different screen sizes
   - Test on different browsers if possible

3. **Performance:**
   - Use browser DevTools to check for console errors
   - Monitor performance for computationally heavy operations

## Performance Considerations

- Heavy computations run in Web Workers (`src/js/worker/`) to prevent UI blocking
- Use source maps during development for easier debugging
- Check bundle size regularly with `npm run webpack:analyze`
- Profile with browser DevTools Performance tab

## Documentation

When adding new features:

1. Update code comments for complex logic
2. Update README.md if user-facing changes
3. Document public APIs and methods
4. Add examples for new features if applicable

## Release Process

When preparing a release:

1. Update version in `package.json`
2. Update changelog/release notes
3. Ensure all tests pass
4. Build production version: `npm run build:prod`
5. Test the production build
6. Create a release on GitHub

## Troubleshooting

### Build Issues

**Node modules not working:**

```bash
rm -rf node_modules bun.lockb
bun install
```

**Port 8080 already in use:**

```bash
npm start -- --port 3000
```

**Module not found errors:**

- Check import paths
- Ensure file exists
- Run `bun install` to update dependencies

### Hot Reload Not Working

- Restart the dev server: `npm start`
- Check browser console for errors
- Clear browser cache (Ctrl+Shift+Delete)

## Getting Help

- Check existing GitHub issues
- Review the codebase comments
- Ask in pull request discussions
- Check Biome documentation for linting questions

## Code Style Guidelines

- Use 2-space indentation
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add comments for complex logic
- Keep functions focused and modular
- Follow existing code patterns

## Commit Message Guidelines

Optionally include the scope (in which part this commit changes). Also start your commit message with lowercase letter.

```txt
<type>(<scope>): <subject>

<body>

<footer>
```

Example:

```txt
feat(canvas): add zoom feature

Implement mouse wheel zoom functionality for canvas.
Maintains aspect ratio and centers on cursor position.

Closes #123
```

Thank you for contributing to RASM!
