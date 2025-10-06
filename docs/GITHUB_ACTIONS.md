# GitHub Actions Setup Guide

This guide explains how to set up automated deployment and maintenance workflows for your Movie Night Scheduler.

## Overview

We provide three GitHub Actions workflows:

1. **🚀 Deployment** - Automatically deploy to Fly.io on every push to main
2. **🎬 Metadata Fetching** - Weekly automatic movie metadata updates  
3. **🧹 Vote Clearing** - Manual vote clearing with safety checks

## Prerequisites

1. **GitHub repository** with your code
2. **Fly.io app** already created and deployed once manually
3. **Fly.io API token** for GitHub Actions

## Setup Instructions

### 1. Get Fly.io API Token

```bash
# Create a new API token
flyctl auth token

# Copy the token that's displayed
```

### 2. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FLY_API_TOKEN` | Your Fly.io API token | `fo1_xxx...` |
| `FLY_APP_NAME` | Your Fly.io app name | `movieschedule-yourname` |
| `TMDB_API_KEY` | TMDb API key for metadata | `18074a49a747...` |

### 3. Enable Workflows

The workflows are automatically enabled when you push them to your repository.

## Workflow Details

### 🚀 Deploy Workflow

**File**: `.github/workflows/deploy.yml`

**Triggers**:
- Every push to `main` branch
- Manual trigger via GitHub Actions tab

**What it does**:
1. Builds your application
2. Runs tests (if any)
3. Deploys to Fly.io
4. Performs health check

**Manual Trigger**:
1. Go to Actions tab in GitHub
2. Select "Deploy to Fly.io"
3. Click "Run workflow"

### 🎬 Metadata Fetching Workflow

**File**: `.github/workflows/fetch-metadata.yml`

**Triggers**:
- Every Sunday at 2 AM UTC (automatic)
- Manual trigger with options

**What it does**:
1. Downloads current config from Fly.io
2. Fetches new movie metadata from TMDb
3. Updates the config on Fly.io
4. Restarts the application
5. Commits changes back to GitHub

**Manual Trigger**:
1. Go to Actions tab → "Fetch Movie Metadata"
2. Click "Run workflow"
3. Options:
   - **Force update**: Re-fetch metadata for all movies (ignores existing)

**Example Uses**:
- Add new movies to config and trigger this to get their metadata
- Weekly updates to keep ratings current
- Force refresh if TMDb data has changed

### 🧹 Vote Clearing Workflow

**File**: `.github/workflows/clear-votes.yml`

**Triggers**:
- Manual trigger only (for safety)

**What it does**:
1. Shows available screenings (if no ID provided)
2. Clears votes for specified screening
3. Logs the action with timestamp and user
4. Commits log to repository

**How to Use**:

1. **List screenings first**:
   - Go to Actions → "Clear Votes"
   - Run without screening_id
   - Check logs to see available screening IDs

2. **Clear specific screening**:
   - Run workflow again
   - Set `screening_id` (e.g., "screening_1")
   - Type "CONFIRM" in confirmation field
   - Click "Run workflow"

**Safety Features**:
- Requires typing "CONFIRM" to proceed
- Logs all actions with user and timestamp
- Shows screening info before clearing

## Common Scenarios

### New Movie Added
1. Edit `src/data/config.json` locally or via admin panel
2. Push changes or manually trigger "Fetch Movie Metadata"
3. Metadata will be automatically fetched and app updated

### After Movie Night
1. Go to GitHub Actions
2. Run "Clear Votes" workflow
3. Select the screening that just finished
4. Type "CONFIRM" to clear votes

### Emergency Deployment
1. Make your fixes
2. Push to main branch
3. Deployment happens automatically
4. Check Actions tab for status

### Update All Movie Metadata
1. Go to Actions → "Fetch Movie Metadata"
2. Check "Force update all movies"
3. Run workflow
4. All movies will get fresh metadata

## Monitoring and Troubleshooting

### Check Workflow Status
- Go to Actions tab in GitHub
- Click on any workflow run to see details
- Red X = failed, Green checkmark = success

### Common Issues

1. **Deployment fails**:
   - Check build logs in Actions
   - Verify Fly.io token is valid
   - Ensure app name is correct

2. **Metadata fetching fails**:
   - Verify TMDb API key is valid
   - Check if TMDb API is accessible
   - Review error logs in workflow

3. **Vote clearing fails**:
   - Ensure screening ID exists
   - Check database connectivity
   - Verify Fly.io token permissions

### Debugging

```bash
# Check Fly.io app status
flyctl status --app your-app-name

# View app logs
flyctl logs --app your-app-name

# SSH into container for debugging
flyctl ssh console --app your-app-name
```

## Security Considerations

1. **Secrets Management**: Never commit API keys to code
2. **Workflow Permissions**: Vote clearing requires manual confirmation
3. **Branch Protection**: Consider protecting main branch
4. **Token Rotation**: Rotate Fly.io tokens periodically

## Customization

### Change Schedule
Edit `.github/workflows/fetch-metadata.yml`:
```yaml
schedule:
  # Daily at 3 AM UTC
  - cron: '0 3 * * *'
  # Every Monday at 9 AM UTC  
  - cron: '0 9 * * 1'
```

### Add Notifications
Add Slack/Discord notifications to workflows:
```yaml
- name: Notify on success
  if: success()
  run: curl -X POST -H 'Content-type: application/json' --data '{"text":"Deployment successful!"}' ${{ secrets.SLACK_WEBHOOK }}
```

### Environment-Specific Deployments
Create separate workflows for staging/production with different Fly.io apps.

## Cost Considerations

GitHub Actions provides:
- 2,000 minutes/month free for public repos
- 500 minutes/month for private repos
- Each workflow run typically uses 2-5 minutes

Your monthly usage should be well within free limits unless you're triggering deployments very frequently.
