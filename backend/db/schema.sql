CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMP DEFAULT NOW(),
    level VARCHAR(10),
    service VARCHAR(100),
    message TEXT,
    trace_id VARCHAR(50),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_service ON logs(service);
CREATE INDEX idx_logs_ts ON logs(ts);