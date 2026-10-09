const fs = require('fs');
const path = require('path');
const root = __dirname;
const dependencyRoot = path.resolve(root, '../node_modules');
const { webpack } = require(path.join(dependencyRoot, 'next/dist/compiled/webpack/webpack'));
webpack({
  mode: 'production', context: root, target: ['web', 'es2020'],
  entry: path.join(root, 'full-preview-entry.tsx'),
  output: { path: path.join(root, 'full-preview-build'), filename: 'work.js', publicPath: '' },
  resolve: { extensions: ['.tsx','.ts','.jsx','.js','.json'], modules: [dependencyRoot, 'node_modules'] },
  module: { rules: [
    { test: /\.[jt]sx?$/, include: root, use: [path.join(root, 'preview-loader.cjs')] },
    { test: /\.css$/, use: [path.join(root, 'preview-loader.cjs')] },
    { test: /\.(avif|png|jpg|webp)$/, type: 'asset/inline' },
  ] },
  optimization: { minimize: false }, devtool: false, performance: false,
}, (error, stats) => {
  if(error || stats.hasErrors()) { console.error(error || stats.toString({all:false,errors:true})); process.exitCode=1; return; }
  const js = fs.readFileSync(path.join(root, 'full-preview-build/work.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  const html = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LIONOVART — Work</title><style>html{scroll-behavior:smooth;scrollbar-gutter:stable}body{margin:0;background:#f5f0eb}button,input,textarea{font:inherit}#root{min-height:100vh}</style></head><body><div id="root"></div><script>'+js+'</script></body></html>';
  // Replace the currently open preview with the complete page, keeping its URL.
  fs.writeFileSync(path.join(root,'LIONOVART-results-preview.html'),html);
  fs.writeFileSync(path.join(root,'LIONOVART-work.html'),html);
  const previewPublishRoot = path.resolve(root, '../public');
  if (fs.existsSync(previewPublishRoot)) fs.writeFileSync(path.join(previewPublishRoot, 'work-showcase.html'), html);
  console.log('Built the complete interactive Work page: gallery, results, next steps, founder, closing and enquiry.');
});
