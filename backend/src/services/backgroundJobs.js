const OverdueService = require('./overdueService');
const VisitorOverdueJob = require('./visitorOverdueJob');

class BackgroundJobs {
  static overdueCheckInterval = null;
  static visitorOverdueCheckInterval = null;

  /**
   * Start background jobs
   */
  static start() {
    console.log('Starting background jobs...');
    
    // Run gatepass overdue check every 5 minutes
    this.overdueCheckInterval = setInterval(() => {
      this.runOverdueCheck();
    }, 5 * 60 * 1000); // 5 minutes

    // Run visitor overdue check every 3 minutes
    this.visitorOverdueCheckInterval = setInterval(() => {
      this.runVisitorOverdueCheck();
    }, 3 * 60 * 1000); // 3 minutes

    // Run immediately on startup
    this.runOverdueCheck();
    this.runVisitorOverdueCheck();

    console.log('✓ Background jobs started');
  }

  /**
   * Stop background jobs
   */
  static stop() {
    if (this.overdueCheckInterval) {
      clearInterval(this.overdueCheckInterval);
      this.overdueCheckInterval = null;
    }
    if (this.visitorOverdueCheckInterval) {
      clearInterval(this.visitorOverdueCheckInterval);
      this.visitorOverdueCheckInterval = null;
    }
    console.log('✓ Background jobs stopped');
  }

  /**
   * Run gatepass overdue check
   */
  static runOverdueCheck() {
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Running gatepass overdue check...`);
      
      const result = OverdueService.checkAndMarkOverdue();
      
      if (result.marked > 0) {
        console.log(`[${timestamp}] ✓ Gatepass overdue check: ${result.marked} marked, ${result.notified} notifications sent`);
      }
    } catch (error) {
      console.error('Error in gatepass overdue check:', error);
    }
  }

  /**
   * Run visitor overdue check
   */
  static runVisitorOverdueCheck() {
    try {
      VisitorOverdueJob.checkOverdueVisitors();
    } catch (error) {
      console.error('Error in visitor overdue check:', error);
    }
  }
}

module.exports = BackgroundJobs;
