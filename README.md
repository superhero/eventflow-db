# @superhero/eventflow-db

`@superhero/eventflow-db` is a Node.js library providing common persistent logic for the Eventflow ecosystem. It abstracts database interactions and ensures a  standardized way of managing event-related data in the event-driven architecture of Eventflow.

## Features

- Simplified table schema management for the Eventflow components.
- Supports creating, reading, updating and deleting events and their associations.
- Supports database interactions for scheduled and published events.
- Supports database interactions for certificate, hub and log.
- Integrates with `@superhero/db` for file management of SQL queries, and `mysql2` as the database driver.
- Error declarations with descriptive error messages and  error codes.

## Installation

> [!NOTE]
> This module is only expected to be a dependency to `@superhero/eventflow-hub` and `@superhero/eventflow-spoke` as a common library.

```sh
npm install @superhero/eventflow-db
```

## Usage

### Initialize the Database Component

The library uses a locator pattern to retrieve dependencies and set up configurations.

```javascript
import Config     from '@superhero/config'
import Locator    from '@superhero/locator'
import { locate } from '@superhero/eventflow-db'

const config = new Config()
await config.add('@superhero/eventflow-db')

const locator = new Locator()
locator.set('@superhero/config', config)

const db = locate(locator)
```

### Table Schema Setup

Use the `setupTableSchemas` method to ensure all required tables are created:

```javascript
await db.setupTableSchemas()
```

### Persisting Events

You can persist an event and let the library generate a unique ID if one is not provided:

```javascript
const event = 
{
  domain : 'example',
  pid    : 'process-id',
  name   : 'event-name',
  data   : { key: 'value' },
}

const eventId = await db.persistEvent(event)
console.log(`Event persisted with ID: ${eventId}`)
```

### Reading Events

#### By ID

```javascript
const event = await db.readEvent(eventId)
console.log('Event:', event)
```

#### By Domain and Process ID

```javascript
const events = await db.readEventsByDomainAndPid('example', 'process-id')
console.log('Events:', events)
```

### Scheduling Events

```javascript
const scheduledEvent = 
{
  event_id  : eventId,
  scheduled : new Date(),
}

await db.persistEventScheduled(scheduledEvent)

const scheduledEvents = await db.readEventsScheduled()
console.log('Scheduled Events:', scheduledEvents)
```

### Publishing Events

```javascript
const publishedEvent = 
{
  event_id  : eventId,
  publisher : 'publisher-id',
}

await db.persistEventPublished(publishedEvent)
await db.updateEventPublishedToSuccess(eventId)
```

### Logging

#### Persisting a log entry

```javascript
const log = 
{
  agent   : 'hub-id',
  message : 'Test log message',
  error   : { message: 'Error details' },
};

await db.persistLog(log)
```

#### Archive logs

Archives logs by partitioning the log table by date.

```javascript
const date = new Date()
await db.archiveLog(date)
```

### Managing Hubs

#### Persisting a Hub

```javascript
const hub = 
{
  id            : 'hub-id',
  external_ip   : '127.0.0.1',
  external_port : 50001,
  internal_ip   : '127.0.0.1',
  internal_port : 50001,
}

await db.persistHub(hub)
```

#### Reading Online Hubs

```javascript
const hubs = await db.readOnlineHubs()
console.log('Online Hubs:', hubs)
```

### Managing Certificate

#### Persisting a Certificate

```javascript
const certificate = 
{
  id        : 'unique_certificate_id',
  validity  : new Date('2025-12-31T23:59:59.000Z'),
  cert      : 'certificate_value',
  key       : Buffer.from('encryption_key'),
  key_iv    : Buffer.from('initialization_vector'),
  key_salt  : Buffer.from('key_salt'),
  key_tag   : Buffer.from('key_tag'),
  pass      : Buffer.from('encrypted_passphrase'),
  pass_iv   : Buffer.from('pass_iv'),
  pass_salt : Buffer.from('pass_salt'),
  pass_tag  : Buffer.from('pass_tag'),
};

const isPersisted = await db.persistCertificate(certificate);
console.log('Persisted:', isPersisted);
```

#### Reading a Certificate

```javascript
try 
{
  const certificate = await db.readCertificate('unique_certificate_id');
  console.log('Certificate:', certificate);
} 
catch (error) 
{
  if (error.code === 'E_EVENTFLOW_DB_CERTIFICATE_NOT_FOUND') 
  {
    console.error('Certificate not found');
  }
  else 
  {
    console.error('Error reading certificate:', error);
  }
}
```

#### Revoking a Certificate

```javascript
const revoked = await db.revokeCertificate('unique_certificate_id');
console.log('Certificate revoked:', revoked);
```

## Table Schemas

Below are the database schemas used in this component:

### Certificate Table

Only expected to have 1 certificate for each ID active at the same time. Once a certificate is revoked, it will be be persisted with a version number greater than 0, hence partition it as `cold` data; archived.

```sql
CREATE TABLE IF NOT EXISTS certificate
(
  created   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version   INT UNSIGNED  NOT NULL DEFAULT 0,
  id        VARCHAR(64)   NOT NULL,
  cert      TEXT          NOT NULL,
  `key`     BLOB          NOT NULL,
  key_iv    VARBINARY(16) NOT NULL,
  key_salt  VARBINARY(16) NOT NULL,
  key_tag   VARBINARY(16) NOT NULL,
  pass      BLOB          NOT NULL,
  pass_iv   VARBINARY(16) NOT NULL,
  pass_salt VARBINARY(16) NOT NULL,
  pass_tag  VARBINARY(16) NOT NULL,
  validity  DATETIME      NOT NULL,
  revoked   DATETIME          NULL,

  PRIMARY KEY (version, id)
)
ENGINE=InnoDB
PARTITION BY RANGE (version)
(
  PARTITION p_hot   VALUES LESS THAN (1),
  PARTITION p_cold  VALUES LESS THAN MAXVALUE
)
```

### Event Table

```sql
CREATE TABLE IF NOT EXISTS event
(
  id        VARCHAR(64) NOT NULL,
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  domain    VARCHAR(64) NOT NULL,
  rid       VARCHAR(64)     NULL,
  pid       VARCHAR(64) NOT NULL,
  name      VARCHAR(64) NOT NULL,
  data      JSON        NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (rid) REFERENCES event (id) ON DELETE SET NULL,

  INDEX idx_rid         (rid),
  INDEX idx_name        (name, timestamp),
  INDEX idx_domain      (domain, timestamp),
  INDEX idx_domain_pid  (domain, pid, timestamp)
)
ENGINE=InnoDB
```

### Associated Event CPID Table

```sql
CREATE TABLE IF NOT EXISTS event_cpid
(
  event_id  VARCHAR(64) NOT NULL,
  cpid      VARCHAR(64) NOT NULL,

  PRIMARY KEY (event_id, cpid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_cpid (cpid)
)
ENGINE=InnoDB
```

### Associated Event EID Table

```sql
CREATE TABLE IF NOT EXISTS event_eid
(
  event_id  VARCHAR(64) NOT NULL,
  eid       VARCHAR(64) NOT NULL,

  PRIMARY KEY (event_id, eid),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_eid (eid)
)
ENGINE=InnoDB
```

### Event Published Table

```sql
CREATE TABLE IF NOT EXISTS event_published 
(
  event_id        VARCHAR(64) NOT NULL,
  published       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  publisher       VARCHAR(64) NOT NULL,
  consumer        VARCHAR(64)     NULL,
  hub             VARCHAR(64)     NULL,
  consumed_hub    DATETIME        NULL,
  consumed_spoke  DATETIME        NULL,
  success         DATETIME        NULL,
  failed          DATETIME        NULL,
  orphan          DATETIME        NULL,

  PRIMARY KEY (event_id),
  FOREIGN KEY (hub)       REFERENCES hub    (id),
  FOREIGN KEY (event_id)  REFERENCES event  (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_published       (published),
  INDEX idx_consumed_hub    (consumed_hub),
  INDEX idx_consumed_spoke  (consumed_spoke)
)
ENGINE=InnoDB
```

### Event Scheduled Table

```sql
CREATE TABLE IF NOT EXISTS event_scheduled 
(
  event_id    VARCHAR(64) NOT NULL,
  timestamp   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  scheduled   DATETIME    NOT NULL,
  executed    DATETIME        NULL,
  success     DATETIME        NULL,
  failed      DATETIME        NULL,

  PRIMARY KEY (event_id),
  FOREIGN KEY (event_id) REFERENCES event (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX idx_timestamp   (timestamp),
  INDEX idx_scheduled   (scheduled),
  INDEX idx_executed    (executed),
  INDEX idx_success     (success),
  INDEX idx_failed      (failed)
)
ENGINE=InnoDB
```

### Hub Table

```sql
CREATE TABLE IF NOT EXISTS hub 
(
  id            VARCHAR(64)       NOT NULL,
  timestamp     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  external_ip   VARCHAR(16)       NOT NULL,
  external_port SMALLINT UNSIGNED NOT NULL,
  internal_ip   VARCHAR(16)       NOT NULL,
  internal_port SMALLINT UNSIGNED NOT NULL,
  quit          DATETIME              NULL,

  PRIMARY KEY (id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_external_ip_port (external_ip, external_port),
  INDEX idx_internal_ip_port (internal_ip, internal_port)
)
ENGINE=InnoDB
```

### Log Table

Partition on timestamp to make it possible to archive logs.

```sql
CREATE TABLE IF NOT EXISTS log 
(
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  agent     VARCHAR(64) NOT NULL,
  message   TEXT        NOT NULL,
  error     JSON        NOT NULL,
  INDEX idx_timestamp (timestamp),
  INDEX idx_agent (agent)
)
ENGINE=InnoDB
PARTITION BY RANGE (TO_DAYS(timestamp)) 
(
  PARTITION p_hot VALUES LESS THAN MAXVALUE
)
```

## Development

### Build the Environment

The `build` script launches a MySQL container for testing:

```sh
npm run build
```

## Running Tests

The library includes a test suite using `node:test`. Run tests using:

```bash
npm test
```

### Test Coverage

```
▶ @superhero/eventflow-db
  ▶ Setup table schemas
    ▶ Persist a hub
      ✔ Read online hubs (6.657231ms)

      ▶ Persisting an event should generate an ID if not provided
        ✔ Read an event by id should return the same data as when persisted the event (6.927063ms)

        ▶ Schedule a persisted event
          ✔ Read all scheduled events (3.495457ms)
          ✔ Update scheduled event as executed (8.137136ms)
          ✔ Update scheduled event as success (4.61686ms)
          ✔ Update scheduled event as failed (6.822805ms)
        ✔ Schedule a persisted event (32.658117ms)

        ▶ Publish a persisted event
          ✔ Update published event to consumed by hub (5.682705ms)
          ✔ Update published event to consumed by spoke (6.462036ms)
          ✔ Update published event to success (6.573691ms)
          ✔ Update published event to failed (8.581383ms)
          ✔ Update published event to orphan (6.094177ms)
        ✔ Publish a persisted event (43.017241ms)

        ▶ Persist event cpid association
          ✔ Read events by domain and cpid (3.71914ms)
          ✔ Read associated cpid by event id (7.035953ms)
          ✔ Delete associated cpid by event id (6.621011ms)
          ✔ Read deleted associated cpid by event id returns empty (4.727825ms)
        ✔ Persist event cpid association (34.125991ms)

        ▶ Persist event eid association
          ✔ Read events by eid (3.884999ms)
          ✔ Read events by domain and eid (5.055002ms)
          ✔ Read associated eid by event id (5.857354ms)
          ✔ Delete associated eid by event id (6.000871ms)
          ✔ Read deleted associated eid by event id returns empty (3.435941ms)
        ✔ Persist event eid association (35.837834ms)

        ▶ Delete event
          ✔ Reading a deleted event rejects (3.54941ms)
        ✔ Delete event (12.321329ms)

        ▶ By domain and pid
          ✔ Read event by domain and pid (4.147919ms)
          ✔ Delete event by domain and pid (6.651147ms)
          ✔ Read empty eventlog by domain and pid (5.039975ms)
        ✔ By domain and pid (24.294124ms)
      ✔ Persisting an event should generate an ID if not provided (196.618539ms)
      
      ✔ Persist log (9.773113ms)
      ✔ Update hub to quit (6.745869ms)

      ▶ Certificate management
        ✔ Persist a certificate (11.285064ms)
        ✔ Persisting a duplicate certificate should return false (3.597549ms)
        ✔ Read a persisted certificate by id (9.74682ms)
        ✔ Reading a non-existing certificate should reject with an error (3.670532ms)

        ▶ Revoke a persisted certificate
          ✔ Reading a revoked certificate should reject with an error (2.507398ms)
        ✔ Revoke a persisted certificate (10.427673ms)

        ▶ Revoke certificates that past there validity period
          ✔ Reading a revoked certificate should reject with an error (2.622701ms)
        ✔ Revoke certificates that past there validity period (15.182145ms)
      ✔ Certificate management (58.006904ms)
    ✔ Persist a hub (302.207468ms)

    ✔ Reading a non existing event should reject with an error (3.189934ms)
  ✔ Setup table schemas (516.946853ms)
✔ @superhero/eventflow-db (519.11646ms)

tests 45
suites 1
pass 45

-------------------------------------------------------------------------------------------------------------------------
file            | line % | branch % | funcs % | uncovered lines
-------------------------------------------------------------------------------------------------------------------------
config.js       | 100.00 |   100.00 |  100.00 | 
index.js        |  69.26 |    56.57 |   97.96 | 43-48 58-62 73-77 88-92 103-107 118-122 133-137 148-153 186-191 203-207…
index.test.js   | 100.00 |   100.00 |  100.00 | 
-------------------------------------------------------------------------------------------------------------------------
all files       |  79.36 |    71.14 |   98.96 | 
-------------------------------------------------------------------------------------------------------------------------
```

## License

This project is licensed under the MIT License.

## Contributing

Feel free to submit issues or pull requests for improvements or additional features.
