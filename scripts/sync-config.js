#!/usr/bin/env node

const fs = require('fs');

// Check if config file exists locally
const localConfigPath = 'src/data/config.json';
if (!fs.existsSync(localConfigPath)) {
  console.log('❌ Local config file not found at:', localConfigPath);
  process.exit(1);
}

// Read local config
const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));

console.log('📋 Local config loaded successfully');
console.log(`   Found ${localConfig.screenings.length} screenings`);

localConfig.screenings.forEach((screening, index) => {
  const date = new Date(screening.date).toLocaleDateString();
  const totalMovies = screening.movies.length;
  const moviesWithMetadata = screening.movies.filter(m => m.metadata).length;
  console.log(`   ${index + 1}. ${date} - ${totalMovies} movies (${moviesWithMetadata} with metadata)`);
});

console.log('');
console.log('🚀 To sync this config to your Fly.io app:');
console.log('');
console.log('Option 1 - Manual upload via SSH:');
console.log('1. flyctl ssh console');
console.log('2. mkdir -p /app/data');
console.log('3. Exit SSH, then run: cat src/data/config.json | flyctl ssh console -C "cat > /app/data/config.json"');
console.log('4. flyctl ssh console -C "supervisorctl restart app"');
console.log('');
console.log('Option 2 - Use the metadata sync GitHub Action:');
console.log('1. Push this config to your GitHub repo');
console.log('2. Go to GitHub Actions → "Fetch Movie Metadata"');
console.log('3. Run workflow (it will sync the config automatically)');
console.log('');
console.log('Option 3 - Quick restart (if config is already uploaded):');
console.log('flyctl apps restart');
