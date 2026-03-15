const GatepassModel = require('../models/gatepassModel');
const UserModel = require('../models/userModel');
const LogModel = require('../models/logModel');

class SearchController {
  /**
   * Global search across gatepasses, users, and logs
   */
  static async globalSearch(req, res, next) {
    try {
      const {
        q: query,
        status,
        userType,
        hostelBlock,
        gatepassType,
        roomNumber,
        dateFrom,
        dateTo,
      } = req.query;

      const results = [];

      // Search Gatepasses
      if (query || status || dateFrom || dateTo) {
        const gatepasses = GatepassModel.search({
          query,
          status: status?.split(','),
          dateFrom,
          dateTo,
          limit: 20,
        });

        gatepasses.forEach((gatepass) => {
          const student = UserModel.findById(gatepass.student_id);
          results.push({
            id: gatepass.id,
            type: 'gatepass',
            title: `Gatepass #${gatepass.id} - ${student?.full_name || 'Unknown'}`,
            subtitle: `${gatepass.destination} - ${gatepass.reason}`,
            status: gatepass.status,
            timestamp: new Date(gatepass.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            metadata: {
              destination: gatepass.destination,
              leave_time: gatepass.leave_time,
            },
          });
        });
      }

      // Search Users
      if (query || userType || hostelBlock || roomNumber) {
        const users = UserModel.search({
          query,
          role: userType?.split(','),
          hostelBlock: hostelBlock?.split(','),
          roomNumber,
          limit: 20,
        });

        users.forEach((user) => {
          results.push({
            id: user.id,
            type: 'user',
            title: user.full_name,
            subtitle: `${user.role} - ${user.email}`,
            status: user.is_active ? 'active' : 'inactive',
            timestamp: user.hostel_block
              ? `Block ${user.hostel_block}, Room ${user.room_number || 'N/A'}`
              : 'No hostel info',
            metadata: {
              role: user.role,
              email: user.email,
              hostel_block: user.hostel_block,
              room_number: user.room_number,
            },
          });
        });
      }

      // Search Logs
      if (query || dateFrom || dateTo) {
        const logs = LogModel.search({
          query,
          dateFrom,
          dateTo,
          limit: 20,
        });

        logs.forEach((log) => {
          const user = UserModel.findById(log.user_id);
          results.push({
            id: log.id,
            type: 'log',
            title: log.action,
            subtitle: `${user?.full_name || 'Unknown'} - ${log.details || ''}`,
            timestamp: new Date(log.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            metadata: {
              action: log.action,
              ip_address: log.ip_address,
            },
          });
        });
      }

      // Sort by relevance (most recent first)
      results.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return 0;
      });

      // Limit total results
      const limitedResults = results.slice(0, 50);

      res.json({
        success: true,
        data: limitedResults,
        count: limitedResults.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SearchController;
