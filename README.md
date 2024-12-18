# @superhero/eventflow-db

`@superhero/eventflow-db` is a Node.js library providing common persistent logic for the Eventflow ecosystem. It abstracts database interactions and ensures a  standardized way of managing event-related data in the event-driven architecture of Eventflow.

## Features

- Simplified table schema management for the Eventflow components.
- Supports creating, reading, updating and deleting events and their associations.
- Supports database interactions for scheduled and published events.
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

```javascript
const log = 
{
  agent   : 'hub-id',
  message : 'Test log message',
  error   : { message: 'Error details' },
};

await db.persistLog(log)
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

## Table Schemas

Below are the database schemas used in this component:

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
      ✔ Read online hubs (5.587373ms)

      ▶ Persisting an event should generate an ID if not provided
        ✔ Read an event by id should return the same data as when persisted the event (4.480859ms)

        ▶ Schedule a persisted event
          ✔ Read all scheduled events (5.224091ms)
          ✔ Update scheduled event as executed (5.74482ms)
          ✔ Update scheduled event as success (5.297828ms)
          ✔ Update scheduled event as failed (6.276729ms)
        ✔ Schedule a persisted event (29.417902ms)

        ▶ Publish a persisted event
          ✔ Update published event to consumed by hub (7.16767ms)
          ✔ Update published event to consumed by spoke (6.096988ms)
          ✔ Update published event to success (6.491936ms)
          ✔ Update published event to failed (7.925911ms)
          ✔ Update published event to orphan (4.379269ms)
        ✔ Publish a persisted event (38.916677ms)

        ▶ Persist event cpid association
          ✔ Read events by domain and cpid (3.532181ms)
          ✔ Read associated cpid by event id (4.202583ms)
          ✔ Delete associated cpid by event id (7.538617ms)
          ✔ Read deleted associated cpid by event id returns empty (2.465462ms)
        ✔ Persist event cpid association (25.886055ms)

        ▶ Persist event eid association
          ✔ Read events by eid (3.706348ms)
          ✔ Read events by domain and eid (4.862519ms)
          ✔ Read associated eid by event id (3.864714ms)
          ✔ Delete associated eid by event id (3.806146ms)
          ✔ Read deleted associated eid by event id returns empty (3.217061ms)
        ✔ Persist event eid association (24.547606ms)

        ▶ Delete event
          ✔ Reading a deleted event rejects (2.195439ms)
        ✔ Delete event (9.437439ms)

        ▶ By domain and pid
          ✔ Read event by domain and pid (3.467037ms)
          ✔ Delete event by domain and pid (5.735279ms)
          ✔ Read empty eventlog by domain and pid (2.678678ms)
        ✔ By domain and pid (17.088958ms)
      ✔ Persisting an event should generate an ID if not provided (158.031614ms)

      ✔ Persist log (5.5136ms)
      ✔ Update hub to quit (7.367751ms)
    ✔ Persist a hub (182.853588ms)
    ✔ Reading a non existing event should reject with an error (2.51415ms)
  ✔ Setup table schemas (250.260079ms)
✔ @superhero/eventflow-db (251.7368ms)

tests 36
suites 1
pass 36

----------------------------------------------------------------
file            | line % | branch % | funcs % | uncovered lines
----------------------------------------------------------------
config.js       | 100.00 |   100.00 |  100.00 | 
index.js        | 100.00 |    96.51 |  100.00 | 
index.test.js   | 100.00 |   100.00 |  100.00 | 
----------------------------------------------------------------
all files       | 100.00 |    97.62 |  100.00 | 
----------------------------------------------------------------
```

## License

This project is licensed under the MIT License.

## Contributing

Feel free to submit issues or pull requests for improvements or additional features.
