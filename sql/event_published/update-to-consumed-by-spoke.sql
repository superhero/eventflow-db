UPDATE event_published
SET consumed_spoke  = UTC_TIMESTAMP(),
    consumer        = ?
WHERE event_id      = ?
  AND consumed_spoke  IS NULL
