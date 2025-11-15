import { build } from "bun";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pug from "pug";
import * as sass from "sass";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.argv[2] || "development";
const isProduction = mode === "production";
const isDev = mode === "development";

// Ensure dist directory exists
const distDir = join(__dirname, "dist");
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy public directory to dist if it exists
async function copyPublicToDist() {
  const publicDir = join(__dirname, "public");
  if (existsSync(publicDir)) {
    try {
      const { cp } = await import("node:fs/promises");
      await cp(publicDir, distDir, { recursive: true });
      console.log("✓ Copied public directory to dist");
    } catch (error) {
      console.log("Note: Could not copy public directory:", error);
    }
  }
}

// Compile Pug template to HTML
function compilePug() {
  const pugFile = join(__dirname, "src/pugjs/index.pug");
  const html = pug.renderFile(pugFile, {
    pretty: isDev,
  });
  writeFileSync(join(distDir, "index.html"), html);
  console.log("✓ Compiled Pug template");
}

// Update HTML with CSS and JS references
function updateHTML(cssFile: string, jsFile: string) {
  const htmlPath = join(distDir, "index.html");
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, "utf-8");
    
    // Remove old script and link tags
    html = html.replace(/<script[^>]*src="[^"]*app[^"]*\.js"[^>]*><\/script>/g, "");
    html = html.replace(/<link[^>]*href="[^"]*style[^"]*\.css"[^>]*>/g, "");
    
    // Add CSS link in head
    html = html.replace(
      /<\/head>/,
      `  <link rel="stylesheet" href="${cssFile}">\n</head>`
    );
    
    // Add script before closing body tag
    html = html.replace(
      /<\/body>/,
      `  <script src="${jsFile}"></script>\n</body>`
    );
    
    writeFileSync(htmlPath, html);
  }
}

// Compile SCSS to CSS
function compileScss() {
  const scssFile = join(__dirname, "src/styles/style.scss");
  const result = sass.compile(scssFile, {
    style: isProduction ? "compressed" : "expanded",
  });
  writeFileSync(join(distDir, "style.css"), result.css);
  console.log("✓ Compiled SCSS");
}

// Build JavaScript bundle
async function buildJS(): Promise<string> {
  const hash = isProduction ? `-${Date.now().toString(36)}` : "";
  const outputName = isProduction ? `app${hash}.min.js` : `app${hash}.js`;
  const outputPath = join(distDir, outputName);
  
  const result = await build({
    entrypoints: [join(__dirname, "src/js/index.js")],
    outdir: distDir,
    minify: isProduction,
    sourcemap: isDev ? "inline" : "none",
    target: "browser",
    format: "iife",
    define: {
      "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
    },
    naming: {
      entry: "[name][ext]",
    },
    external: [],
    plugins: [],
  });

  // Bun outputs with the entry name, so we need to find and rename it
  const outputFiles = Array.from(result.outputs);
  if (outputFiles.length > 0) {
    const file = outputFiles[0] as { path: string; text: () => Promise<string> };
    const content = await file.text();
    
    // Always write to the desired output path
    writeFileSync(outputPath, content);
    
    // Try to delete the old file if it exists and is different
    if (file.path !== outputPath) {
      try {
        const { unlink } = await import("node:fs/promises");
        await unlink(file.path);
      } catch {
        // Ignore if file doesn't exist
      }
    }
    
    console.log(`✓ Built JavaScript bundle: ${outputName}`);
    return outputName;
  }
  
  return outputName;
}

// Build worker files
async function buildWorkers() {
  const workerFile = join(__dirname, "src/js/worker/worker.js");
  if (existsSync(workerFile)) {
    const result = await build({
      entrypoints: [workerFile],
      outdir: join(distDir, "workers"),
      minify: isProduction,
      sourcemap: isDev ? "inline" : "none",
      target: "browser",
      format: "esm",
    });
    console.log("✓ Built worker files");
  }
}

// Main build function
async function main() {
  console.log(`Building in ${mode} mode...\n`);
  
  try {
    // Copy public directory first (if it exists)
    await copyPublicToDist();
    
    compilePug();
    compileScss();
    const jsFile = await buildJS();
    await buildWorkers();
    
    // Update HTML with CSS and JS references
    updateHTML("style.css", jsFile);
    
    console.log("\n✓ Build complete!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

main();

