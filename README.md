# Movie Night Scheduler

A full-stack TypeScript application for organizing movie nights with friends. Users can vote on movies for upcoming screenings using Google SSO authentication.

## Features

- 🎬 **Movie Voting**: Vote for your favorite movies from curated lists
- ❌ **Vote Cancellation**: Cancel your vote if you change your mind
- 👥 **Voter Transparency**: See who voted for each movie
- 🖼️ **Rich Movie Metadata**: Automatic movie posters, ratings, descriptions, and genres
- 📅 **Scheduled Screenings**: Automatic vote reset after each screening date
- 🔐 **Simple Authentication**: Username and password based user accounts
- 📱 **Responsive Design**: Beautiful Material-UI interface that works on all devices
- ⚙️ **Admin Configuration**: Configurable movie lists and screening dates
- 🧹 **Manual Vote Clearing**: Command-line tool to clear votes manually
- 🐳 **Containerized**: Ready for deployment with Docker

## Tech Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Authentication**: Username/Password with JWT tokens
- **Containerization**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd movieschedule
npm install
\`\`\`

### 2. Environment Setup

Copy the example environment file and configure it:

\`\`\`bash
cp env.example .env
\`\`\`

Edit `.env` with your configuration:

\`\`\`env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_PATH=./data/movieschedule.db
CONFIG_PATH=./data/config.json
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

This starts both the backend (port 3001) and frontend (port 3000) servers.

### 4. Fetch Movie Metadata (Optional)

To add movie posters, ratings, and descriptions:

\`\`\`bash
npm run fetch-metadata
\`\`\`

You'll need a free TMDb API key. See [docs/METADATA.md](docs/METADATA.md) for detailed instructions.

## Docker Deployment

### Build and Run with Docker Compose

\`\`\`bash
# Create data directory
mkdir -p data

# Set environment variables
export JWT_SECRET=your-secret-key

# Build and start
docker-compose up --build -d
\`\`\`

### Build Docker Image Only

\`\`\`bash
docker build -t movieschedule .
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -v $(pwd)/data:/app/data \
  movieschedule
\`\`\`

## Heroku Deployment

### 1. Prepare for Heroku

\`\`\`bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create your-movie-night-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key
\`\`\`

### 2. Deploy

\`\`\`bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-movie-night-app.git

# Deploy
git push heroku main
\`\`\`

## Alternative Free Deployment Options

### Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Render

1. Connect your GitHub repo to [Render](https://render.com)
2. Choose "Web Service"
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

### Fly.io

1. **Install flyctl**: https://fly.io/docs/getting-started/installing-flyctl/
2. **Create app**: `flyctl apps create movieschedule-yourname`
3. **Set secrets**: 
   ```bash
   flyctl secrets set JWT_SECRET=your-secret-key
   flyctl secrets set TMDB_API_KEY=your-tmdb-key
   ```
4. **Deploy**: `flyctl deploy`

See [docs/FLY_DEPLOYMENT.md](docs/FLY_DEPLOYMENT.md) for detailed instructions.

### GitHub Actions (Automated Deployment)

Set up automated deployment and maintenance with GitHub Actions:

1. **Add secrets** to your GitHub repository:
   - `FLY_API_TOKEN` - Get with `flyctl auth token`
   - `FLY_APP_NAME` - Your Fly.io app name
   - `TMDB_API_KEY` - Your TMDb API key

2. **Workflows included**:
   - 🚀 **Auto-deploy** on push to main
   - 🎬 **Weekly metadata updates** (Sundays 2 AM UTC)
   - 🧹 **Manual vote clearing** with safety checks

See [docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md) for complete setup guide.

## Configuration

### Movie Lists and Screening Dates

The app automatically creates a default configuration file at `data/config.json`. You can modify this file to:

- Add/remove screening dates
- Change movie lists for each screening
- Update movie titles and years

Example configuration:

\`\`\`json
{
  "screenings": [
    {
      "id": "screening_1",
      "date": "2024-12-15T19:00:00.000Z",
      "movies": [
        { "id": "movie_1", "title": "The Matrix", "year": 1999 },
        { "id": "movie_2", "title": "Inception", "year": 2010 }
      ]
    }
  ]
}
\`\`\`

### Vote Reset

Votes automatically reset after each screening date via a daily cron job at midnight.

## Development

### Project Structure

\`\`\`
movieschedule/
├── src/
│   ├── client/          # React frontend
│   ├── server/          # Express backend
│   └── shared/          # Shared TypeScript types
├── data/                # Database and config files
├── Dockerfile
├── docker-compose.yml
└── package.json
\`\`\`

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run server:dev` - Start backend only
- `npm run clear-votes` - Interactive vote clearing tool
- `npm run fetch-metadata` - Fetch movie metadata from TMDb API

## CI/CD and Automation

### GitHub Actions Workflows

- **🚀 Deploy**: Automatic deployment to Fly.io on push to main
- **🎬 Metadata**: Weekly automatic movie metadata updates  
- **🧹 Clear Votes**: Manual vote clearing with safety confirmations

See [docs/GITHUB_ACTIONS.md](docs/GITHUB_ACTIONS.md) for setup instructions.

### API Endpoints

- `POST /api/auth/register` - Register new user account
- `POST /api/auth/login` - Login with username/password
- `GET /api/movies/next-screening` - Get next screening with vote counts
- `GET /api/movies/screenings` - Get all screenings (admin)
- `POST /api/votes` - Cast a vote
- `DELETE /api/votes/:screeningId` - Cancel your vote for a screening
- `GET /api/votes/my-vote/:screeningId` - Get user's vote for screening
- `DELETE /api/votes/admin/clear/:screeningId` - Clear all votes for a screening (admin)

## Administration

### Manual Vote Clearing

You can manually clear all votes for a screening using the built-in CLI tool:

\`\`\`bash
npm run clear-votes
\`\`\`

This interactive tool will:
1. Ask for your server URL (defaults to localhost:3001)
2. Request your JWT token (get this from browser localStorage after logging in)
3. Show all available screenings with vote counts
4. Allow you to select a screening to clear
5. Require confirmation before clearing votes

**Getting Your JWT Token:**
1. Log into the web app
2. Open browser Developer Tools (F12)
3. Go to Application/Storage tab → Local Storage
4. Find the `token` key and copy its value

### Admin Features

- **Vote Clearing**: Use the CLI tool or API endpoint to clear votes
- **Config Management**: Edit `data/config.json` to update movie lists and screening dates
- **Movie Metadata**: Use `npm run fetch-metadata` to add posters, ratings, and descriptions
- **User Management**: Access the SQLite database directly if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
