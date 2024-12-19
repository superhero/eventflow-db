UPDATE certificate AS c
LEFT JOIN
(
  SELECT id, COUNT(*) AS new_version
  FROM certificate
  GROUP BY id
) sub
ON c.id = sub.id
SET c.revoked = UTC_TIMESTAMP(),
    c.version = sub.new_version
WHERE c.version = 0
  AND c.validity < UTC_TIMESTAMP()