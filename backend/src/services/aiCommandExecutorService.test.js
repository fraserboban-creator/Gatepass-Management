/**
 * Property-based tests for aiCommandExecutorService
 * Uses fast-check for property generation
 *
 * Subtask 5.1
 *   Property 17: Execution Result Format
 *   Property 20: Transaction Rollback (simulated DB failure leaves no partial changes)
 *
 * Validates: Requirements 4.7, 5.5
 */

'use strict';

const fc = require('fast-check');

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../models/userModel');
jest.mock('./authService');

const UserModel = require('../models/userModel');
const AuthService = require('./authService');
const { execute } = require('./aiCommandExecutorService');

const VALID_ACTIONS = ['create_user', 'update_user', 'delete_user', 'deactivate_user', 'activate_user'];

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const userId = () => fc.integer({ min: 1, max: 99999 });

const validEmail = () =>
  fc.tuple(
    fc.stringMatching(/^[a-z]{1,8}$/),
    fc.stringMatching(/^[a-z]{1,8}$/),
    fc.constantFrom('com', 'org', 'net')
  ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const validRole = () => fc.constantFrom('student', 'coordinator', 'warden', 'security', 'admin');

const validRoomNumber = () =>
  fc.tuple(
    fc.stringMatching(/^[A-Z]$/),
    fc.integer({ min: 0, max: 999 })
  ).map(([letter, num]) => `${letter}-${String(num).padStart(3, '0')}`);

const createUserCmd = () =>
  fc.record({
    action: fc.constant('create_user'),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    email: validEmail(),
    role: validRole(),
    room_number: fc.option(validRoomNumber(), { nil: null }),
    user_id: fc.constant(null),
  });

const updateUserCmd = () =>
  fc.record({
    action: fc.constant('update_user'),
    user_id: userId(),
    name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    email: fc.constant(null),
    role: fc.constant(null),
    room_number: fc.constant(null),
  });

const singleIdCmd = (action) =>
  fc.record({
    action: fc.constant(action),
    user_id: userId(),
    name: fc.constant(null),
    email: fc.constant(null),
    role: fc.constant(null),
    room_number: fc.constant(null),
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFakeUser(id) {
  return {
    id,
    full_name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    room_number: 'A-101',
    is_active: 1,
  };
}

// ─── Property 17: Execution Result Format ─────────────────────────────────────

/**
 * **Validates: Requirements 4.7**
 *
 * For any executed command, the system SHALL return a result object with
 * a `success` boolean and relevant data or error.
 */
describe('Property 17: Execution Result Format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create_user success always returns { success: true, data: { userId, name, email, role, room_number } }', async () => {
    await fc.assert(
      fc.asyncProperty(
        createUserCmd(),
        async (cmd) => {
          AuthService.register.mockResolvedValue({
            id: 42,
            full_name: cmd.name,
            email: cmd.email,
            role: cmd.role,
            room_number: cmd.room_number,
          });

          const result = await execute(cmd, 1);

          expect(typeof result.success).toBe('boolean');
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          expect(typeof result.data.userId).toBe('number');
          expect(typeof result.data.name).toBe('string');
          expect(typeof result.data.email).toBe('string');
          expect(typeof result.data.role).toBe('string');
          // room_number may be null or string
          expect(result.data.room_number === null || typeof result.data.room_number === 'string').toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('update_user success always returns { success: true, data: { userId, name, email, role, room_number } }', async () => {
    await fc.assert(
      fc.asyncProperty(
        updateUserCmd(),
        async (cmd) => {
          const fakeUser = makeFakeUser(cmd.user_id);
          UserModel.update.mockReturnValue({ changes: 1 });
          UserModel.findById.mockReturnValue(fakeUser);

          const result = await execute(cmd, 1);

          expect(typeof result.success).toBe('boolean');
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          expect(result.data).toHaveProperty('userId');
          expect(result.data).toHaveProperty('name');
          expect(result.data).toHaveProperty('email');
          expect(result.data).toHaveProperty('role');
          expect(result.data).toHaveProperty('room_number');
        }
      ),
      { numRuns: 50 }
    );
  });

  test.each(['delete_user', 'deactivate_user', 'activate_user'])(
    '%s success always returns { success: true, data: { userId, name, email, role, room_number } }',
    async (action) => {
      await fc.assert(
        fc.asyncProperty(
          singleIdCmd(action),
          async (cmd) => {
            const fakeUser = makeFakeUser(cmd.user_id);
            UserModel.delete.mockReturnValue({ changes: 1 });
            UserModel.deactivate.mockReturnValue({ changes: 1 });
            UserModel.activate.mockReturnValue({ changes: 1 });
            UserModel.findById.mockReturnValue(fakeUser);

            const result = await execute(cmd, 1);

            expect(typeof result.success).toBe('boolean');
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toHaveProperty('userId');
            expect(result.data).toHaveProperty('name');
            expect(result.data).toHaveProperty('email');
            expect(result.data).toHaveProperty('role');
            expect(result.data).toHaveProperty('room_number');
          }
        ),
        { numRuns: 50 }
      );
    }
  );

  test('any failure always returns { success: false, error: <string> } without stack trace', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...VALID_ACTIONS),
        userId(),
        async (action, id) => {
          // Force all model/service methods to throw
          const err = new Error('Simulated DB error');
          AuthService.register.mockRejectedValue(err);
          UserModel.update.mockImplementation(() => { throw err; });
          UserModel.delete.mockImplementation(() => { throw err; });
          UserModel.deactivate.mockImplementation(() => { throw err; });
          UserModel.activate.mockImplementation(() => { throw err; });
          UserModel.findById.mockReturnValue(null);

          const cmd = {
            action,
            user_id: id,
            name: 'Test',
            email: 'test@example.com',
            role: 'student',
            room_number: null,
          };

          const result = await execute(cmd, 1);

          expect(typeof result.success).toBe('boolean');
          expect(result.success).toBe(false);
          expect(typeof result.error).toBe('string');
          expect(result.error.length).toBeGreaterThan(0);
          // Must not expose stack traces or internal error messages
          expect(result.error).not.toMatch(/Error:/);
          expect(result.error).not.toMatch(/at\s+\w+\s+\(/); // no stack frames
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Property 20: Transaction Rollback ────────────────────────────────────────

/**
 * **Validates: Requirements 5.5**
 *
 * For any failed database operation, any partial changes SHALL be rolled back,
 * leaving the database in its pre-operation state.
 *
 * Since UserModel uses SQLite (synchronous better-sqlite3 style), each operation
 * is a single atomic statement. We verify that when the primary DB call throws,
 * no secondary side-effects occur (i.e., findById is not called after a failed
 * write, and the result correctly signals failure).
 */
describe('Property 20: Transaction Rollback (simulated DB failure)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('update_user: DB failure leaves no partial changes (findById not called after failed update)', async () => {
    await fc.assert(
      fc.asyncProperty(
        updateUserCmd(),
        async (cmd) => {
          UserModel.update.mockImplementation(() => { throw new Error('DB write failed'); });
          UserModel.findById.mockReturnValue(makeFakeUser(cmd.user_id));

          const result = await execute(cmd, 1);

          expect(result.success).toBe(false);
          // findById should NOT have been called because update threw before we got there
          expect(UserModel.findById).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('deactivate_user: DB failure leaves no partial changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        singleIdCmd('deactivate_user'),
        async (cmd) => {
          UserModel.deactivate.mockImplementation(() => { throw new Error('DB write failed'); });
          UserModel.findById.mockReturnValue(makeFakeUser(cmd.user_id));

          const result = await execute(cmd, 1);

          expect(result.success).toBe(false);
          expect(UserModel.findById).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('activate_user: DB failure leaves no partial changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        singleIdCmd('activate_user'),
        async (cmd) => {
          UserModel.activate.mockImplementation(() => { throw new Error('DB write failed'); });
          UserModel.findById.mockReturnValue(makeFakeUser(cmd.user_id));

          const result = await execute(cmd, 1);

          expect(result.success).toBe(false);
          expect(UserModel.findById).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('create_user: AuthService failure returns failure result without partial DB state', async () => {
    await fc.assert(
      fc.asyncProperty(
        createUserCmd(),
        async (cmd) => {
          AuthService.register.mockRejectedValue(new Error('DB constraint violation'));

          const result = await execute(cmd, 1);

          expect(result.success).toBe(false);
          expect(typeof result.error).toBe('string');
          // UserModel should not have been touched directly
          expect(UserModel.update).not.toHaveBeenCalled();
          expect(UserModel.delete).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });
});
