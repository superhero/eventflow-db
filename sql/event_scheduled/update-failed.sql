UPDATE event_scheduled
SET failed     = UTC_TIMESTAMP()
WHERE event_id = ?