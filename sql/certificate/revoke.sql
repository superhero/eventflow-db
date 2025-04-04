UPDATE certificate AS c
LEFT JOIN
(
  SELECT 
    id, 
    COUNT(*) AS new_version

  FROM certificate
  WHERE id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
) sub
ON c.id = sub.id

SET 
  c.revoked = UTC_TIMESTAMP(),
  c.version = sub.new_version

WHERE c.id      = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin
  AND c.version = 0
  AND c.revoked IS NULL