UPDATE hub
SET quit = UTC_TIMESTAMP()
WHERE id = ?
  AND quit IS NULL