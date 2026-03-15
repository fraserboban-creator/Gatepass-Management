const VisitorPassService = require('./visitorPassService');

class VisitorOverdueJob {
  /**
   * Check for overdue visitors
   * Runs periodically to detect visitors who have exceeded their expected exit time
   */
  static checkOverdueVisitors() {
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Checking for overdue visitors...`);
      
      const result = VisitorPassService.checkAndMarkOverdue();
      
      if (result.marked > 0) {
        console.log(`[${timestamp}] ✓ Overdue check: ${result.marked} visitors marked as overdue`);
      }
    } catch (error) {
      console.error('Error checking overdue visitors:', error);
    }
  }
}

module.exports = VisitorOverdueJob;
