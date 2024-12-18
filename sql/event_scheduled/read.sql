SELECT *
FROM event_scheduled
WHERE scheduled >= UTC_TIMESTAMP()
  AND executed IS NULL