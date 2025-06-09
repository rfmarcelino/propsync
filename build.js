const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const chokidar = require('chokidar');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function buildFile(filePath) {
  try {
    const relativePath = path.relative(srcDir, filePath);
    const outputPath = path.join(distDir, relativePath);

    console.log(`Building: ${relativePath}`);

    const code = fs.readFileSync(filePath, 'utf8');

    const result = await minify(code, {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        keep_fnames: true,
      },
      format: {
        comments: false,
      },
    });

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.code);

    const originalSize = Buffer.byteLength(code, 'utf8');
    const compressedSize = Buffer.byteLength(result.code, 'utf8');
    const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log(`✓ ${relativePath} (${originalSize}B → ${compressedSize}B, ${savings}% smaller)`);
  } catch (error) {
    console.error(`Error building ${filePath}:`, error.message);
  }
}

async function buildAll() {
  console.log('Building all JavaScript files...');

  if (!fs.existsSync(srcDir)) {
    console.error('src/ directory not found. Please create it and move your JS files there.');
    return;
  }

  const files = fs.readdirSync(srcDir)
    .filter(file => file === 'propsync.js')
    .map(file => path.join(srcDir, file));

  for (const file of files) {
    await buildFile(file);
  }

  console.log(`\nBuild complete! ${files.length} files processed.`);
  console.log(`Files available at: https://git.omibee.com/products/propsync/-/raw/master/dist/`);
}

if (process.argv.includes('--watch')) {
  console.log('Watching for changes...');
  buildAll();

  chokidar.watch(path.join(srcDir, '*.js')).on('change', (filePath) => {
    console.log(`\nFile changed: ${path.relative(srcDir, filePath)}`);
    buildFile(filePath);
  });
} else {
  buildAll();
}
