import Config     from '@superhero/config'
import Locator    from '@superhero/locator'
import { locate } from '@superhero/eventflow-db'
import assert     from 'node:assert/strict'
import { after, suite, test }  from 'node:test'

suite('@superhero/eventflow-db', async () =>
{
  const 
    config  = new Config(),
    locator = new Locator()

  locator.set('@superhero/config', config)
  await config.add('./config.js')

  const db = locate(locator)

  test('Setup table schemas', async (sub) =>
  {
    await assert.doesNotReject(db.setupTableSchemas())

    await sub.test('Persist a hub', async (sub) =>
    {
      const hub = 
      { 
        id            : 'test_hub_id_' + Date.now().toString(36), 
        external_ip   : '127.0.0.1',
        external_port : 50001,
        internal_ip   : '127.0.0.1',
        internal_port : 50001,
      }

      await assert.doesNotReject(db.persistHub(hub))

      await sub.test('Read online hubs', async () =>
      {
        const hubs = await db.readOnlineHubs()
        assert.ok(hubs.length > 0, 'Online hubs should be returned')
        assert.equal(hubs[0].id, hub.id)
        assert.equal(hubs[0].external_ip, hub.external_ip)
        assert.equal(hubs[0].internal_ip, hub.internal_ip)
        assert.equal(hubs[0].external_port, hub.external_port)
        assert.equal(hubs[0].internal_port, hub.internal_port)
      })

      await sub.test('Persisting an event should generate an ID if not provided', async (sub) => 
      {
        const
          domain  = 'foo',
          pid     = 'bar',
          name    = 'baz',
          event   = { domain, pid, name, data: { qux: 'foobar' } },
          id      = await db.persistEvent(event)
  
        assert.ok(id)
        event.id = id
    
        await sub.test('Read an event by id should return the same data as when persisted the event', async () => 
        {
          const readEvent = await db.readEvent(event.id)
  
          assert.equal(readEvent.id,        event.id)
          assert.equal(readEvent.domain,    event.domain)
          assert.equal(readEvent.pid,       event.pid)
          assert.equal(readEvent.name,      event.name)
          assert.deepEqual(readEvent.data,  event.data)
        })

        await sub.test('Schedule a persisted event', async (sub) =>
        {
          const scheduledEvent = { event_id:event.id, scheduled: new Date() }

          const success = await db.persistEventScheduled(scheduledEvent)
          assert.ok(success, 'Event should be scheduled')

          await sub.test('Read all scheduled events', async () =>
          {
            const events = await db.readEventsScheduled()
            assert.ok(events.length > 0, 'Scheduled events should be returned')
          })

          await sub.test('Update scheduled event as executed', async () => 
          {
            const updated = await db.updateEventScheduledExecuted(scheduledEvent.event_id)
            assert.ok(updated, 'Scheduled event should be marked as executed')
          })

          await sub.test('Update scheduled event as success', async () => 
          {
            const updated = await db.updateEventScheduledSuccess(scheduledEvent.event_id)
            assert.ok(updated, 'Scheduled event should be marked as success')
          })

          await sub.test('Update scheduled event as failed', async () => 
          {
            const updated = await db.updateEventScheduledFailed(scheduledEvent.event_id)
            assert.ok(updated, 'Scheduled event should be marked as failed')
          })
        })

        await sub.test('Publish a persisted event', async (sub) => 
        {
          const publishedEvent = { event_id:event.id, publisher:'spoke_id' }
          const success = await db.persistEventPublished(publishedEvent)
          assert.ok(success, 'Event should be published')

          await sub.test('Update published event to consumed by hub', async () => 
          {
            const success = await db.updateEventPublishedToConsumedByHub(event.id, hub.id)
            assert.ok(success, 'Event should be updated to consumed by hub')
          })
  
          await sub.test('Update published event to consumed by spoke', async () => 
          {
            const success = await db.updateEventPublishedToConsumedBySpoke(event.id, publishedEvent.publisher)
            assert.ok(success, 'Event should be updated to consumed by spoke')
          })

          await sub.test('Update published event to success', async () => 
          {
            const success = await db.updateEventPublishedToSuccess(event.id)
            assert.ok(success, 'Event should be updated to success')
          })

          await sub.test('Update published event to failed', async () => 
          {
            const success = await db.updateEventPublishedToFailed(event.id)
            assert.ok(success, 'Event should be updated to failed')
          })

          await sub.test('Update published event to orphan', async () => 
          {
            const success = await db.updateEventPublishedToOrphan(id)
            assert.ok(success, 'Event should be updated to orphan')
          })
        })

        await sub.test('Persist event cpid association', async (sub) =>
        {
          const cpid = 'test_cpid'
          const success = await db.persistEventCpid(event.id, cpid)
          assert.ok(success, 'Event cpid association should be persisted')

          await sub.test('Read events by domain and cpid', async () =>
          {
            const events = await db.readEventsByDomainAndCpid(event.domain, cpid)
            assert.ok(events.length, 'Events found by domain and cpid')
          })

          await sub.test('Read associated cpid by event id', async () =>
          {
            const readCpid = await db.readEventCpidByEventId(event.id)
            assert.ok(readCpid.length > 0, 'Event cpid association should be found')
            assert.equal(readCpid[0], cpid)
          })

          await sub.test('Delete associated cpid by event id', async () =>
          {
            const success = await db.deleteEventCpid(event.id, cpid)
            assert.ok(success, 'Event cpid association should be deleted')
          })

          await sub.test('Read deleted associated cpid by event id returns empty', async () =>
          {
            const readCpid = await db.readEventCpidByEventId(event.id)
            assert.ok(readCpid.length === 0, 'Event cpid association should be empty')
          })
        })

        await sub.test('Persist event eid association', async (sub) =>
        {
          const eid = 'test_eid'
          const success = await db.persistEventEid(event.id, eid)
          assert.ok(success, 'Event eid association should be persisted')

          await sub.test('Read events by eid', async () =>
          {
            const events = await db.readEventsByEid(eid)
            assert.ok(events.length, 'Events found by eid')
          })

          await sub.test('Read events by domain and eid', async () =>
          {
            const events = await db.readEventsByDomainAndEid(event.domain, eid)
            assert.ok(events.length, 'Events found by domain and eid')
          })

          await sub.test('Read associated eid by event id', async () =>
          {
            const readEid = await db.readEventEidByEventId(event.id)
            assert.ok(readEid.length > 0, 'Event eid association should be found')
            assert.equal(readEid[0], eid)
          })

          await sub.test('Delete associated eid by event id', async () =>
          {
            const success = await db.deleteEventEid(event.id, eid)
            assert.ok(success, 'Event eid association should be deleted')
          })

          await sub.test('Read deleted associated eid by event id returns empty', async () =>
          {
            const readEid = await db.readEventEidByEventId(event.id)
            assert.ok(readEid.length === 0, 'Event eid association should be empty')
          })
        })

        await sub.test('Delete event', async (sub) =>
        {
          const success = await db.deleteEvent(event.id)
          assert.ok(success, 'Event should be deleted')

          await sub.test('Reading a deleted event rejects', async () =>
          {
            await assert.rejects(db.readEvent(event.id))
          })
        })

        await sub.test('By domain and pid', async (sub) =>
        {
          const event_id = await db.persistEvent(event)
          assert.ok(event_id, 'Event should be persisted')

          await sub.test('Read event by domain and pid', async () =>
          {
            const eventlog = await db.readEventsByDomainAndPid(domain, pid)
            assert.ok(eventlog.length > 0, 'Event should be found')
          })

          await sub.test('Delete event by domain and pid', async () =>
          {
            const success = await db.deleteEventByDomainAndPid(event.domain, event.pid)
            assert.ok(success, 'Should be possible to delete event by domain and pid')
          })

          await sub.test('Read empty eventlog by domain and pid', async () =>
          {
            const eventlog = await db.readEventsByDomainAndPid(domain, pid)
            assert.ok(eventlog.length === 0, 'Eventlog should be empty')
          })
        })
      })

      await sub.test('Persist log', async () =>
      {
        const log = { agent:hub.id, message: 'Test log', error: { message: 'Test error' } }
        await assert.doesNotReject(db.persistLog(log))
      })

      await sub.test('Update hub to quit', async () => 
      {
        const updated = await db.updateHubToQuit(hub.id)
        assert.ok(updated, 'Hub should be updated to quit')
      })
    })
  
    await sub.test('Reading a non existing event should reject with an error', async () => 
    {
      await assert.rejects(
        db.readEvent('nonExistingId'),
        { code : 'E_EVENTFLOW_DB_EVENT_NOT_FOUND' })
    })
  })

  after(() => db.destroy())
})
