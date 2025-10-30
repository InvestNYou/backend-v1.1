const cron = require('node-cron');
const portfolioSnapshotService = require('./portfolioSnapshotService');

class CronService {
  constructor() {
    this.jobs = new Map();
    console.log('✅ Cron Service initialized');
  }

  // Start daily snapshot job (runs at 6 PM EST every day)
  startDailySnapshotJob() {
    const jobId = 'daily-snapshots';
    
    if (this.jobs.has(jobId)) {
      console.log('📅 Daily snapshot job already running');
      return;
    }

    // Run at 6 PM EST (11 PM UTC) every day
    const job = cron.schedule('0 23 * * *', async () => {
      try {
        console.log('🕰️ Running daily portfolio snapshot job...');
        const results = await portfolioSnapshotService.createSnapshotsForAllUsers();
        
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Daily snapshot job completed: ${successCount}/${results.length} successful`);
        
        // Log any failures
        const failures = results.filter(r => !r.success);
        if (failures.length > 0) {
          console.warn('⚠️ Some snapshots failed:', failures);
        }
      } catch (error) {
        console.error('❌ Daily snapshot job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set(jobId, job);
    job.start();
    console.log('📅 Daily snapshot job started (6 PM EST)');
  }

  // Start cleanup job (runs weekly on Sunday at 2 AM EST)
  startCleanupJob() {
    const jobId = 'cleanup-snapshots';
    
    if (this.jobs.has(jobId)) {
      console.log('🗑️ Cleanup job already running');
      return;
    }

    // Run every Sunday at 2 AM EST (7 AM UTC)
    const job = cron.schedule('0 7 * * 0', async () => {
      try {
        console.log('🗑️ Running weekly cleanup job...');
        const deletedCount = await portfolioSnapshotService.cleanupOldSnapshots();
        console.log(`✅ Cleanup job completed: ${deletedCount} old snapshots removed`);
      } catch (error) {
        console.error('❌ Cleanup job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    });

    this.jobs.set(jobId, job);
    job.start();
    console.log('🗑️ Cleanup job started (Sunday 2 AM EST)');
  }

  // Start all cron jobs
  startAllJobs() {
    this.startDailySnapshotJob();
    this.startCleanupJob();
    console.log('🚀 All cron jobs started');
  }

  // Stop all cron jobs
  stopAllJobs() {
    this.jobs.forEach((job, jobId) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${jobId}`);
    });
    this.jobs.clear();
    console.log('⏹️ All cron jobs stopped');
  }

  // Get job status
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, jobId) => {
      status[jobId] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  // Manually trigger daily snapshots (for testing)
  async triggerDailySnapshots() {
    try {
      console.log('🔄 Manually triggering daily snapshots...');
      const results = await portfolioSnapshotService.createSnapshotsForAllUsers();
      
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Manual snapshot trigger completed: ${successCount}/${results.length} successful`);
      
      return results;
    } catch (error) {
      console.error('❌ Manual snapshot trigger failed:', error);
      throw error;
    }
  }

  // Manually trigger cleanup (for testing)
  async triggerCleanup() {
    try {
      console.log('🗑️ Manually triggering cleanup...');
      const deletedCount = await portfolioSnapshotService.cleanupOldSnapshots();
      console.log(`✅ Manual cleanup completed: ${deletedCount} old snapshots removed`);
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Manual cleanup failed:', error);
      throw error;
    }
  }
}

module.exports = new CronService();
