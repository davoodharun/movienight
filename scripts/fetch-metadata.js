#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// TMDb API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchMovieMetadata() {
  console.log('🎬 Movie Metadata Fetcher\n');
  
  // Get TMDb API key from command line arg or prompt
  let apiKey = process.argv[2];
  
  if (!apiKey) {
    apiKey = await new Promise((resolve) => {
      rl.question('Enter your TMDb API key (get free key at https://www.themoviedb.org/settings/api): ', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  if (!apiKey) {
    console.log('❌ TMDb API key is required');
    process.exit(1);
  }

  try {
    // Read current config
    const configPath = path.join(__dirname, '../src/data/config.json');
    if (!fs.existsSync(configPath)) {
      console.log('❌ Config file not found at', configPath);
      console.log('Make sure you have run the app at least once to generate the config file.');
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`📋 Found ${config.screenings.length} screenings\n`);

    let totalMovies = 0;
    let processedMovies = 0;
    let newMetadata = 0;

    // Process each screening
    for (const screening of config.screenings) {
      console.log(`🎭 Processing screening: ${new Date(screening.date).toLocaleDateString()}`);
      
      for (const movie of screening.movies) {
        totalMovies++;
        
        // Skip if movie already has metadata
        if (movie.metadata && movie.metadata.tmdb_id) {
          console.log(`  ✓ ${movie.title} (${movie.year}) - metadata exists`);
          processedMovies++;
          continue;
        }

        console.log(`  🔍 Searching: ${movie.title} (${movie.year})`);

        try {
          // Search for movie
          const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`;
          const searchResponse = await axios.get(searchUrl);
          const searchData = searchResponse.data;

          if (searchData.results && searchData.results.length > 0) {
            const tmdbMovie = searchData.results[0];
            
            // Get detailed movie info
            const detailUrl = `${TMDB_BASE_URL}/movie/${tmdbMovie.id}?api_key=${apiKey}`;
            const detailResponse = await axios.get(detailUrl);
            const detailData = detailResponse.data;

            // Add metadata to movie
            movie.metadata = {
              tmdb_id: detailData.id,
              overview: detailData.overview || 'No description available.',
              poster_path: detailData.poster_path ? `${TMDB_IMAGE_BASE_URL}${detailData.poster_path}` : null,
              backdrop_path: detailData.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${detailData.backdrop_path}` : null,
              vote_average: detailData.vote_average || 0,
              vote_count: detailData.vote_count || 0,
              runtime: detailData.runtime || null,
              genres: detailData.genres ? detailData.genres.map(g => g.name) : [],
              release_date: detailData.release_date,
              tagline: detailData.tagline || null,
              imdb_id: detailData.imdb_id,
              budget: detailData.budget || null,
              revenue: detailData.revenue || null,
              fetched_at: new Date().toISOString()
            };

            console.log(`    ✅ Found: ${tmdbMovie.title} (Rating: ${detailData.vote_average}/10)`);
            newMetadata++;
          } else {
            console.log(`    ❌ Not found: ${movie.title} (${movie.year})`);
            
            // Add empty metadata to mark as searched
            movie.metadata = {
              tmdb_id: null,
              overview: 'Movie not found in database.',
              poster_path: null,
              backdrop_path: null,
              vote_average: 0,
              vote_count: 0,
              runtime: null,
              genres: [],
              release_date: null,
              tagline: null,
              imdb_id: null,
              budget: null,
              revenue: null,
              fetched_at: new Date().toISOString()
            };
          }

          processedMovies++;
          
          // Rate limiting - wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.log(`    ❌ Error fetching ${movie.title}: ${error.message}`);
        }
      }
      
      console.log(''); // Empty line between screenings
    }

    // Save updated config
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('📊 Summary:');
    console.log(`  Total movies: ${totalMovies}`);
    console.log(`  Already had metadata: ${processedMovies - newMetadata}`);
    console.log(`  New metadata fetched: ${newMetadata}`);
    console.log(`  Movies not found: ${totalMovies - processedMovies + (processedMovies - newMetadata)}`);
    console.log('\n✅ Metadata fetching complete!');
    console.log(`💾 Updated config saved to: ${configPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

fetchMovieMetadata();
