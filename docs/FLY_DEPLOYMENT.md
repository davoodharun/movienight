# Fly.io Deployment Guide

This guide will walk you through deploying your Movie Night Scheduler to Fly.io.

## Prerequisites

1. **Install flyctl**: https://fly.io/docs/getting-started/installing-flyctl/
2. **Create Fly.io account**: https://fly.io/app/sign-up
3. **Have your app ready**: Make sure your app works locally

## Step-by-Step Deployment

### 1. Login to Fly.io

```bash
flyctl auth login
```

### 2. Create Your App

```bash
flyctl apps create movieschedule-yourname
```

Replace `movieschedule-yourname` with your desired app name (must be globally unique).

### 3. Update fly.toml

Edit `fly.toml` and change the app name:

```toml
app = "movieschedule-yourname"  # Your actual app name
primary_region = "dfw"  # Choose your preferred region
```

**Available regions:**
- `dfw` - Dallas, USA
- `ord` - Chicago, USA  
- `lax` - Los Angeles, USA
- `lhr` - London, UK
- `ams` - Amsterdam, Netherlands
- `nrt` - Tokyo, Japan
- `syd` - Sydney, Australia

### 4. Create Persistent Volume

Your app needs persistent storage for the database and config files:

```bash
flyctl volumes create movieschedule_data --region dfw --size 1
```

Replace `dfw` with your chosen region.

### 5. Set Environment Variables

```bash
# Required: JWT secret for authentication
flyctl secrets set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: TMDb API key for automatic metadata fetching
flyctl secrets set TMDB_API_KEY="your-tmdb-api-key"
```

### 6. Deploy Your App

```bash
flyctl deploy
```

This will:
- Build your Docker image
- Deploy to Fly.io
- Start your application
- Create the persistent volume mount

### 7. Open Your App

```bash
flyctl open
```

## Post-Deployment Setup

### Initial Configuration

After deployment, you may want to:

1. **Set up initial movie screenings**: Edit the config via the admin panel or directly modify the mounted volume
2. **Test the application**: Create a user account and test voting
3. **Run metadata fetch**: Use GitHub Actions (see below) or SSH into the container

### Monitoring and Logs

```bash
# View logs
flyctl logs

# View app status  
flyctl status

# Scale your app
flyctl scale count 1

# SSH into your container (for debugging)
flyctl ssh console
```

### Updating Your App

To deploy updates:

```bash
git push origin main  # If using GitHub Actions
# OR
flyctl deploy        # Manual deployment
```

## Troubleshooting

### Common Issues

1. **Build failures**: Check your Dockerfile and ensure all dependencies are installed
2. **Database issues**: Ensure the volume is properly mounted to `/app/data`
3. **Environment variables**: Verify secrets are set with `flyctl secrets list`

### Debugging

```bash
# Check app status
flyctl status

# View detailed logs
flyctl logs --follow

# SSH into container for debugging
flyctl ssh console

# Check volume mounts
flyctl ssh console -C "ls -la /app/data"
```

### Volume Management

```bash
# List volumes
flyctl volumes list

# Backup data (from SSH session)
tar -czf backup.tar.gz /app/data/

# Restore data (to SSH session) 
tar -xzf backup.tar.gz -C /
```

## Cost Estimation

Fly.io pricing (as of 2024):
- **App**: Free tier includes 2,340 hours/month (enough for 3 always-on apps)
- **Volume**: $0.15/GB/month (1GB = $0.15/month)
- **Bandwidth**: First 160GB free, then $0.02/GB

**Estimated monthly cost**: $0.15-$2.00 for a small personal app

## Security Considerations

1. **Use strong JWT secrets**: Generate with `openssl rand -base64 32`
2. **Enable HTTPS**: Automatically handled by Fly.io
3. **Regular updates**: Keep dependencies updated
4. **Backup data**: Regular volume backups recommended

## Next Steps

- Set up GitHub Actions for automated deployment (see `.github/workflows/`)
- Configure monitoring and alerts
- Set up custom domain (optional): `flyctl certs add yourdomain.com`
