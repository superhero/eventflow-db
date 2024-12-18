UPDATE event_published
SET consumed_hub = UTC_TIMESTAMP(),
    hub          = ?
WHERE event_id   = ?
  AND consumed_hub IS NULL
