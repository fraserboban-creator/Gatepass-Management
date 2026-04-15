/**
 * Property-based tests for aiCommandValidatorService
 * Uses fast-check for property generation
 *
 * Subtask 4.1 - Property 9: Required Field Validation
 * Subtask 4.2 - Property 10: Email Format Validation
 *              Property 11: Valid Role Constraint
 *              Property 12: Room Number Format Validation
 * Subtask 4.3 - Property 13: Duplicate Email Detection
 *              Property 14: User Existence Validation
 *              Property 40: Self-Deletion Prevention
 */

const fc = require('fast-check');

// Mock UserModel before requiring the service
jest.mock('../models/userModel');
const UserModel = require('../models/userModel');
const AiCommandValidatorService = require('./aiCommandValidatorService');

const VALID_ROLES = ['student', 'coordinator', 'warden', 'security', 'admin'];

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const validEmail = () =>
  fc.tuple(
    fc.stringMatching(/^[a-z]{1,10}$/),
    fc.stringMatching(/^[a-z]{1,10}$/),
    fc.constantFrom('com', 'org', 'net', 'edu')
  ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const invalidEmail = () =>
  fc.oneof(
    fc.constant('notanemail'),
    fc.constant('@nodomain.com'),
    fc.constant('noatsign.com'),
    fc.constant('spaces in@email.com'),
    fc.constant('double@@email.com'),
    fc.constant(''),
    fc.stringMatching(/^[a-z]{1,5}$/) // no @ at all
  );

const validRole = () => fc.constantFrom(...VALID_ROLES);

const invalidRole = () =>
  fc.string({ minLength: 1 }).filter(r => !VALID_ROLES.includes(r));

const validRoomNumber = () =>
  fc.tuple(
    fc.stringMatching(/^[A-Z]$/),
    fc.integer({ min: 0, max: 999 })
  ).map(([letter, num]) => `${letter}-${String(num).padStart(3, '0')}`);

const invalidRoomNumber = () =>
  fc.oneof(
    fc.constant('a-101'),   // lowercase letter
    fc.constant('AB-101'),  // two letters
    fc.constant('A-10'),    // two digits
    fc.constant('A-1001'),  // four digits
    fc.constant('A101'),    // missing dash
    fc.constant('1-101'),   // digit instead of letter
    fc.stringMatching(/^[a-z]{1,3}-\d{2}$/) // various invalid patterns
  );

const validUserId = () => fc.integer({ min: 1, max: 99999 });

// ─── Subtask 4.1: Property 9 — Required Field Validation ─────────────────────

describe('Property 9: Required Field Validation', () => {
  /**
   * Validates: Requirements 3.1
   * For any parsed command, if required fields for the action type are missing,
   * the validator SHALL reject the command and return an error listing the missing fields.
   */

  test('create_user: missing name always produces a validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constant('create_user'),
          name: fc.constant(null),
          email: validEmail(),
          role: validRole(),
          room_number: fc.constant(null),
        }),
        async (cmd) => {
          UserModel.findByEmail.mockReturnValue(null);
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'name')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('create_user: missing email always produces a validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constant('create_user'),
          name: fc.string({ minLength: 1 }),
          email: fc.constant(null),
          role: validRole(),
          room_number: fc.constant(null),
        }),
        async (cmd) => {
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'email')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('create_user: missing role always produces a validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constant('create_user'),
          name: fc.string({ minLength: 1 }),
          email: validEmail(),
          role: fc.constant(null),
          room_number: fc.constant(null),
        }),
        async (cmd) => {
          UserModel.findByEmail.mockReturnValue(null);
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'role')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('update_user: missing user_id always produces a validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constant('update_user'),
          user_id: fc.constant(null),
          name: fc.string({ minLength: 1 }),
          email: fc.constant(null),
          role: fc.constant(null),
          room_number: fc.constant(null),
        }),
        async (cmd) => {
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'user_id')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('update_user: no updatable fields always produces a validation error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          action: fc.constant('update_user'),
          user_id: validUserId(),
          name: fc.constant(null),
          email: fc.constant(null),
          role: fc.constant(null),
          room_number: fc.constant(null),
        }),
        async (cmd) => {
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'fields')).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  test.each(['delete_user', 'deactivate_user', 'activate_user'])(
    '%s: missing user_id always produces a validation error',
    async (action) => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            action: fc.constant(action),
            user_id: fc.constant(null),
          }),
          async (cmd) => {
            const result = await AiCommandValidatorService.validate(cmd, 999);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'user_id')).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    }
  );
});

// ─── Subtask 4.2: Properties 10, 11, 12 ──────────────────────────────────────

describe('Property 10: Email Format Validation', () => {
  /**
   * Validates: Requirements 3.2
   * Any non-RFC-5322 email must be rejected.
   */

  test('invalid emails are always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidEmail(),
        async (email) => {
          const cmd = { action: 'create_user', name: 'Test User', email, role: 'student', room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'email')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('valid emails pass email validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        validEmail(),
        async (email) => {
          UserModel.findByEmail.mockReturnValue(null);
          const cmd = { action: 'create_user', name: 'Test User', email, role: 'student', room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          // Should not have an email format error
          expect(result.errors.filter(e => e.field === 'email' && e.message.includes('format'))).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 11: Valid Role Constraint', () => {
  /**
   * Validates: Requirements 3.3
   * Any role outside the allowed set must be rejected.
   */

  test('invalid roles are always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidRole(),
        async (role) => {
          const cmd = { action: 'create_user', name: 'Test User', email: 'test@example.com', role, room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'role')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('valid roles pass role validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRole(),
        async (role) => {
          UserModel.findByEmail.mockReturnValue(null);
          const cmd = { action: 'create_user', name: 'Test User', email: 'test@example.com', role, room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.errors.filter(e => e.field === 'role')).toHaveLength(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property 12: Room Number Format Validation', () => {
  /**
   * Validates: Requirements 3.4
   * Any room_number not matching [A-Z]-\d{3} must be rejected.
   */

  test('invalid room numbers are always rejected when provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidRoomNumber(),
        async (room_number) => {
          const cmd = { action: 'create_user', name: 'Test User', email: 'test@example.com', role: 'student', room_number };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'room_number')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('valid room numbers pass format validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRoomNumber(),
        async (room_number) => {
          UserModel.findByEmail.mockReturnValue(null);
          const cmd = { action: 'create_user', name: 'Test User', email: 'test@example.com', role: 'student', room_number };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.errors.filter(e => e.field === 'room_number')).toHaveLength(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('null/undefined room_number is allowed (optional field)', async () => {
    UserModel.findByEmail.mockReturnValue(null);
    const cmd = { action: 'create_user', name: 'Test User', email: 'test@example.com', role: 'student', room_number: null };
    const result = await AiCommandValidatorService.validate(cmd, 999);
    expect(result.errors.filter(e => e.field === 'room_number')).toHaveLength(0);
  });
});

// ─── Subtask 4.3: Properties 13, 14, 40 ──────────────────────────────────────

describe('Property 13: Duplicate Email Detection', () => {
  /**
   * Validates: Requirements 3.5
   * create_user with existing email must always be rejected.
   */

  test('create_user with existing email is always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        validEmail(),
        async (email) => {
          // Simulate email already exists in DB
          UserModel.findByEmail.mockReturnValue({ id: 1, email });
          const cmd = { action: 'create_user', name: 'Test User', email, role: 'student', room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'email' && e.message.includes('already exists'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('create_user with new email passes duplicate check', async () => {
    await fc.assert(
      fc.asyncProperty(
        validEmail(),
        async (email) => {
          // Simulate email does NOT exist
          UserModel.findByEmail.mockReturnValue(null);
          const cmd = { action: 'create_user', name: 'Test User', email, role: 'student', room_number: null };
          const result = await AiCommandValidatorService.validate(cmd, 999);
          expect(result.errors.filter(e => e.field === 'email' && e.message.includes('already exists'))).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 14: User Existence Validation', () => {
  /**
   * Validates: Requirements 3.6
   * update/delete/deactivate/activate with non-existent user_id must always be rejected.
   */

  test.each(['update_user', 'delete_user', 'deactivate_user', 'activate_user'])(
    '%s with non-existent user_id is always rejected',
    async (action) => {
      await fc.assert(
        fc.asyncProperty(
          validUserId(),
          async (user_id) => {
            UserModel.findById.mockReturnValue(null); // user does not exist
            const cmd =
              action === 'update_user'
                ? { action, user_id, name: 'Updated Name', email: null, role: null, room_number: null }
                : { action, user_id };
            const result = await AiCommandValidatorService.validate(cmd, 999);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.field === 'user_id' && e.message.includes('not found'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    }
  );

  test.each(['update_user', 'delete_user', 'activate_user'])(
    '%s with existing user_id passes existence check',
    async (action) => {
      await fc.assert(
        fc.asyncProperty(
          validUserId(),
          async (user_id) => {
            UserModel.findById.mockReturnValue({ id: user_id, email: 'x@x.com' });
            const cmd =
              action === 'update_user'
                ? { action, user_id, name: 'Updated Name', email: null, role: null, room_number: null }
                : { action, user_id };
            const result = await AiCommandValidatorService.validate(cmd, 999);
            expect(result.errors.filter(e => e.field === 'user_id' && e.message.includes('not found'))).toHaveLength(0);
          }
        ),
        { numRuns: 50 }
      );
    }
  );
});

describe('Property 40: Self-Deletion Prevention', () => {
  /**
   * Validates: Requirements 9.6
   * delete/deactivate targeting own account must always be rejected.
   */

  test('delete_user targeting own account is always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId(),
        async (adminId) => {
          UserModel.findById.mockReturnValue({ id: adminId });
          const cmd = { action: 'delete_user', user_id: adminId };
          const result = await AiCommandValidatorService.validate(cmd, adminId);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'user_id')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('deactivate_user targeting own account is always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId(),
        async (adminId) => {
          UserModel.findById.mockReturnValue({ id: adminId });
          const cmd = { action: 'deactivate_user', user_id: adminId };
          const result = await AiCommandValidatorService.validate(cmd, adminId);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.field === 'user_id')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('delete_user targeting a different user is allowed (self-protection does not block others)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(validUserId(), validUserId()).filter(([a, b]) => a !== b),
        async ([adminId, targetId]) => {
          UserModel.findById.mockReturnValue({ id: targetId });
          const cmd = { action: 'delete_user', user_id: targetId };
          const result = await AiCommandValidatorService.validate(cmd, adminId);
          // Self-protection error should NOT appear
          expect(
            result.errors.filter(e => e.field === 'user_id' && e.message.includes('own account'))
          ).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('activate_user targeting own account is allowed (only delete/deactivate are blocked)', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId(),
        async (adminId) => {
          UserModel.findById.mockReturnValue({ id: adminId });
          const cmd = { action: 'activate_user', user_id: adminId };
          const result = await AiCommandValidatorService.validate(cmd, adminId);
          expect(
            result.errors.filter(e => e.message.includes('own account'))
          ).toHaveLength(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
