SELECT eid
FROM event_eid
WHERE event_id = CAST(? AS CHAR CHARACTER SET ascii) COLLATE ascii_bin