#!/usr/bin/env node

const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function clearVotes() {
  console.log('🎬 Movie Night - Vote Clearing Tool\n');
  
  try {
    // Get server URL
    const serverUrl = await new Promise((resolve) => {
      rl.question('Enter server URL (default: http://localhost:3001): ', (answer) => {
        resolve(answer.trim() || 'http://localhost:3001');
      });
    });

    // Get auth token
    const token = await new Promise((resolve) => {
      rl.question('Enter your JWT token (from browser localStorage): ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!token) {
      console.log('❌ JWT token is required');
      process.exit(1);
    }

    // Get available screenings
    console.log('\n📋 Fetching available screenings...');
    const screeningsResponse = await axios.get(`${serverUrl}/api/movies/screenings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const screenings = screeningsResponse.data.screenings;
    
    if (screenings.length === 0) {
      console.log('❌ No screenings found');
      process.exit(1);
    }

    console.log('\n📽️  Available screenings:');
    screenings.forEach((screening, index) => {
      const date = new Date(screening.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const totalVotes = screening.movies.reduce((sum, movie) => sum + movie.votes, 0);
      console.log(`${index + 1}. ${date} (${totalVotes} total votes)`);
    });

    // Get screening choice
    const screeningIndex = await new Promise((resolve) => {
      rl.question('\nSelect screening number (or 0 to exit): ', (answer) => {
        resolve(parseInt(answer.trim()) - 1);
      });
    });

    if (screeningIndex < 0 || screeningIndex >= screenings.length) {
      console.log('👋 Goodbye!');
      process.exit(0);
    }

    const selectedScreening = screenings[screeningIndex];
    const totalVotes = selectedScreening.movies.reduce((sum, movie) => sum + movie.votes, 0);

    console.log(`\n⚠️  You are about to clear ALL votes for:`);
    console.log(`   ${new Date(selectedScreening.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    console.log(`   Total votes to be cleared: ${totalVotes}`);

    // Confirm deletion
    const confirmation = await new Promise((resolve) => {
      rl.question('\nType "CLEAR" to confirm: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (confirmation !== 'CLEAR') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }

    // Clear votes
    console.log('\n🧹 Clearing votes...');
    await axios.delete(`${serverUrl}/api/votes/admin/clear/${selectedScreening.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Votes cleared successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.error || error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

clearVotes();
