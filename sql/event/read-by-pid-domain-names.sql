SELECT *
FROM event
WHERE pid    = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND domain = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND name IN (?%s)
ORDER BY timestamp ASC