-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('student', 'coordinator', 'warden', 'security', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    student_id VARCHAR(50) UNIQUE,
    hostel_block VARCHAR(50),
    room_number VARCHAR(20),
    profile_picture VARCHAR(500),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- Gatepasses Table
CREATE TABLE IF NOT EXISTS gatepasses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    enrollment_number VARCHAR(50),
    destination VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    leave_time DATETIME NOT NULL,
    expected_return_time DATETIME NOT NULL,
    actual_exit_time DATETIME,
    actual_return_time DATETIME,
    contact_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'coordinator_approved', 'approved', 'rejected', 'expired', 'completed', 'overdue')),
    is_overdue BOOLEAN DEFAULT 0,
    coordinator_id INTEGER,
    warden_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (warden_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gatepasses_student ON gatepasses(student_id);
CREATE INDEX IF NOT EXISTS idx_gatepasses_status ON gatepasses(status);
CREATE INDEX IF NOT EXISTS idx_gatepasses_leave_time ON gatepasses(leave_time);

-- Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gatepass_id INTEGER NOT NULL,
    approver_id INTEGER NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK(action IN ('approved', 'rejected')),
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gatepass_id) REFERENCES gatepasses(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_approvals_gatepass ON approvals(gatepass_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_id);

-- QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gatepass_id INTEGER UNIQUE NOT NULL,
    qr_data TEXT NOT NULL,
    qr_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_at DATETIME,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gatepass_id) REFERENCES gatepasses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_gatepass ON qr_codes(gatepass_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_hash ON qr_codes(qr_hash);

-- Logs Table
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gatepass_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    security_id INTEGER NOT NULL,
    log_type VARCHAR(50) NOT NULL CHECK(log_type IN ('exit', 'entry')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (gatepass_id) REFERENCES gatepasses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (security_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logs_gatepass ON logs(gatepass_id);
CREATE INDEX IF NOT EXISTS idx_logs_student ON logs(student_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    gatepass_id INTEGER,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK(type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gatepass_id) REFERENCES gatepasses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Visitor Passes Table
CREATE TABLE IF NOT EXISTS visitor_passes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    visitor_id_type VARCHAR(50) NOT NULL CHECK(visitor_id_type IN ('passport', 'national_id', 'driving_license', 'student_id', 'other')),
    visitor_id_number VARCHAR(100) NOT NULL,
    relationship VARCHAR(100),
    purpose TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    entry_time DATETIME,
    expected_exit_time DATETIME NOT NULL,
    actual_exit_time DATETIME,
    created_by VARCHAR(50) NOT NULL CHECK(created_by IN ('student', 'security')),
    status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'active', 'exited', 'overdue')),
    is_overdue BOOLEAN DEFAULT 0,
    visitor_photo_url VARCHAR(500),
    pass_id VARCHAR(50) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_visitor_passes_student ON visitor_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_status ON visitor_passes(status);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_entry_time ON visitor_passes(entry_time);
CREATE INDEX IF NOT EXISTS idx_visitor_passes_pass_id ON visitor_passes(pass_id);
