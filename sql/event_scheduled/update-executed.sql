UPDATE event_scheduled
SET executed   = UTC_TIMESTAMP()
WHERE event_id = ?