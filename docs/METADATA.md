# Getting a TMDb API Key

To fetch movie metadata, you'll need a free API key from The Movie Database (TMDb).

## Steps:

1. **Create Account**: Go to https://www.themoviedb.org/signup
2. **Verify Email**: Check your email and verify your account
3. **Request API Key**: 
   - Go to https://www.themoviedb.org/settings/api
   - Click "Create" under "Request an API Key"
   - Choose "Developer" (free option)
   - Fill out the form with basic information
   - Accept the terms
4. **Get Your Key**: Copy your "API Key (v3 auth)" value

## Usage:

Run the metadata fetcher:
```bash
npm run fetch-metadata
```

When prompted, paste your API key. The script will:
- Search TMDb for each movie in your config
- Download metadata including posters, ratings, descriptions, genres
- Update your config.json file
- Skip movies that already have metadata

## What Gets Added:

- **Posters**: High-quality movie poster images
- **Ratings**: TMDb user ratings (0-10 scale)
- **Descriptions**: Movie plot summaries
- **Genres**: Movie categories (Action, Comedy, etc.)
- **Runtime**: Movie duration in minutes
- **Release Date**: Official release date
- **Additional Data**: Budget, revenue, IMDb ID, tagline

## Notes:

- The script respects TMDb's rate limits (5 requests per second)
- Already processed movies are skipped on subsequent runs
- Movies not found in TMDb will have empty metadata placeholders
- All data is stored in your local config.json file
