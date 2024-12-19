
import Gateway            from '@superhero/db'
import mysql2             from 'mysql2'
import AdapterFactory     from '@superhero/db/adapter/mysql/factory.js'
import path               from 'node:path'
import { fileURLToPath }  from 'node:url'

export function locate(locator)
{
  const
    config          = locator('@superhero/config').find('eventflow/db', {}),
    adapterFactory  = new AdapterFactory(),
    adapter         = adapterFactory.create(mysql2, config),
    filePath        = fileURLToPath(path.join(path.dirname(import.meta.url), 'sql')),
    fileSuffix      = '.sql',
    gateway         = new Gateway(adapter, filePath, fileSuffix)

  return new DB(gateway)
}

/**
 * @memberof Eventflow
 */
export default class DB
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  destroy()
  {
    return new Promise((resolve, reject) =>
    {
      setImmediate(async () =>
      {
        try
        {
          await this.gateway.close()
          resolve()
        }
        catch(error)
        {
          reject(error)
        }
      })
    })
  }

  async createTableCertificate()
  {
    try
    {
      await this.gateway.query('certificate/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table certificate')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_CERTIFICATE'
      error.cause = reason
      throw error
    }
  }

  async createTableEvent()
  {
    try
    {
      await this.gateway.query('event/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table event')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_EVENT'
      error.cause = reason
      throw error
    } 
  }

  async createTableEventCpid()
  {
    try
    {
      await this.gateway.query('event_cpid/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table event_cpid')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_EVENT_CPID'
      error.cause = reason
      throw error
    } 
  }

  async createTableEventEid()
  {
    try
    {
      await this.gateway.query('event_eid/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table event_eid')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_EVENT_EID'
      error.cause = reason
      throw error
    } 
  }

  async createTableEventPublished()
  {
    try
    {
      await this.gateway.query('event_published/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table event_published')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_EVENT_PUBLISHED'
      error.cause = reason
      throw error
    } 
  }

  async createTableEventScheduled()
  {
    try
    {
      await this.gateway.query('event_scheduled/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table event_schedule')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_EVENT_SCHEDULED'
      error.cause = reason
      throw error
    } 
  }

  async createTableHub()
  {
    try
    {
      await this.gateway.query('hub/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table hub')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_HUB'
      error.cause = reason
      throw error
    } 
  }

  async createTableLog()
  {
    try
    {
      await this.gateway.query('log/schema')
    }
    catch(reason)
    {
      const error = new Error('could not create table log')
      error.code  = 'E_EVENTFLOW_DB_CREATE_TABLE_LOG'
      error.cause = reason
      throw error
    }
  }

  async setupTableSchemas()
  {
    await this.createTableCertificate()
    await this.createTableHub()
    await this.createTableEvent()
    await this.createTableEventCpid()
    await this.createTableEventEid()
    await this.createTableEventPublished()
    await this.createTableEventScheduled()
    await this.createTableLog()
  }

  #generateEventId()
  {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
  }

  async persistEvent(event)
  {
    try
    {
      const
        id    = event.id ?? this.#generateEventId(),
        data  = JSON.stringify(event.data ?? {})

      await this.gateway.query('event/persist', [{ ...event, id, data }])

      return id
    }
    catch(reason)
    {
      const error = new Error('could not persist event')
      error.code  = 'E_EVENTFLOW_DB_EVENT_PERSIST'
      error.cause = reason
      error.event = event
      throw error
    } 
  }

  async deleteEvent(id)
  {
    try
    {
      const result = await this.gateway.query('event/delete-by-id', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not delete event by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_DELETE'
      error.cause = reason
      throw error
    } 
  }

  async deleteEventByDomainAndPid(domain, pid)
  {
    try
    {
      const result = await this.gateway.query('event/delete-by-pid-domain', [ pid, domain ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not delete event by pid ${pid} in domain ${domain}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_DELETE_BY_PID'
      error.cause = reason
      throw error
    } 
  }

  async readEvent(id)
  {
    let result

    try
    {
      result = await this.gateway.query('event/read-by-id', [ id ])
    }
    catch(reason)
    {
      const error = new Error(`could not read event by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_READ'
      error.cause = reason
      throw error
    } 

    if(result.length === 0)
    {
      const error = new Error(`event not found by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_NOT_FOUND'
      throw error
    }

    const event = result[0]
    return event
  }

  async readEventsByDomainAndPid(domain, pid)
  {
    let result

    try
    {
      result = await this.gateway.query('event/read-by-pid-domain', [ pid, domain ])
    }
    catch(reason)
    {
      const error = new Error(`could not read event by pid: ${pid} and domain: ${domain}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_READ_BY_PID'
      error.cause = reason
      throw error
    } 

    return result
  }

  async persistEventCpid(event_id, cpid)
  {
    try
    {
      const result = await this.gateway.query('event_cpid/persist', [ event_id, cpid ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`Could not persist event (${event_id}) and cpid (${cpid}) association`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_CPID_PERSIST'
      error.cause = reason
      throw error
    } 
  }

  async deleteEventCpid(event_id, cpid)
  {
    try
    {
      const result = await this.gateway.query('event_cpid/delete', [ event_id, cpid ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`Could not delete event (${event_id}) and cpid (${cpid}) association`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_CPID_DELETE'
      error.cause = reason
      throw error
    } 
  }

  async readEventCpidByEventId(id)
  {
    let result

    try
    {
      result = await this.gateway.query('event_cpid/read-by-event_id', [ id ])
    }
    catch(reason)
    {
      const error = new Error(`could not read cpid by event id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_CPID_READ_BY_EVENT_ID'
      error.cause = reason
      throw error
    } 

    return result.map((row) => row.cpid)
  }

  async readEventsByDomainAndCpid(domain, cpid)
  {
    try
    {
      return await this.gateway.query('event_cpid/read-by-cpid-domain', [ cpid, domain ])
    }
    catch(reason)
    {
      const error = new Error(`could not read events by domain: ${domain} and cpid: ${cpid}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_BY_DOMAIN_AND_CPID_READ'
      error.cause = reason
      throw error
    } 
  }

  async persistEventEid(event_id, eid)
  {
    try
    {
      const result = await this.gateway.query('event_eid/persist', [ event_id, eid ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not persist event (${event_id}) and eid (${eid}) association`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_EID_PERSIST'
      error.cause = reason
      throw error
    } 
  }

  async deleteEventEid(event_id, eid)
  {
    try
    {
      const result = await this.gateway.query('event_eid/delete', [ event_id, eid ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not persist event (${event_id}) and eid (${eid}) association`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_EID_DELETE'
      error.cause = reason
      throw error
    } 
  }

  async readEventEidByEventId(id)
  {
    let result

    try
    {
      result = await this.gateway.query('event_eid/read-by-event_id', [ id ])
    }
    catch(reason)
    {
      const error = new Error(`could not read eid by event id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_EID_READ_BY_EVENT_ID'
      error.cause = reason
      throw error
    } 

    return result.map((row) => row.eid)
  }

  async readEventsByEid(eid)
  {
    try
    {
      return await this.gateway.query('event_eid/read-by-eid', [ eid ])
    }
    catch(reason)
    {
      const error = new Error(`could not read event by eid: ${eid}`)
      error.code  = 'E_EVENTFLOW_DB_EVENTS_READ_BY_EID'
      error.cause = reason
      throw error
    }
  }

  async readEventsByDomainAndEid(domain, eid)
  {
    try
    {
      return await this.gateway.query('event_eid/read-by-eid-domain', [ eid, domain ])
    }
    catch(reason)
    {
      const error = new Error(`could not read events by domain: ${domain} eid: ${eid}`)
      error.code  = 'E_EVENTFLOW_DB_EVENTS_READ_BY_DOMAIN_AND_EID'
      error.cause = reason
      throw error
    } 
  }

  async persistEventPublished(publishedEvent)
  {
    try
    {
      const result = await this.gateway.query('event_published/persist', [ publishedEvent ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error('could not persist event published')
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_PERSIST'
      error.cause = reason
      error.publishedEvent = publishedEvent
      throw error
    } 
  }

  async updateEventPublishedToConsumedByHub(id, hub)
  {
    try
    {
      const result = await this.gateway.query('event_published/update-to-consumed-by-hub', [ hub, id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update published event: ${id} to consumed by hub: ${hub}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_CREATE'
      error.cause = reason
      throw error
    } 
  }

  async updateEventPublishedToConsumedBySpoke(id, spoke)
  {
    try
    {
      const result = await this.gateway.query('event_published/update-to-consumed-by-spoke', [ spoke, id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update published event: ${id} to consumed by spoke: ${spoke}`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_CREATE'
      error.cause = reason
      throw error
    } 
  }

  async updateEventPublishedToOrphan(id)
  {
    try
    {
      const result = await this.gateway.query('event_published/update-to-orphan', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update published event: ${id} to orphan`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_UPDATE_ORPHAN'
      error.cause = reason
      throw error
    } 
  }

  async updateEventPublishedToSuccess(id)
  {
    try
    {
      const result = await this.gateway.query('event_published/update-to-success', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update published event: ${id} to success`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_UPDATE_SUCCESS'
      error.cause = reason
      throw error
    } 
  }

  async updateEventPublishedToFailed(id)
  {
    try
    {
      const result = await this.gateway.query('event_published/update-to-failed', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update published event: ${id} to failed`)
      error.code  = 'E_EVENTFLOW_DB_EVENT_PUBLISHED_UPDATE_FAILED'
      error.cause = reason
      throw error
    } 
  }

  async persistEventScheduled(scheduledEvent)
  {
    try
    {
      const result = await this.gateway.query('event_scheduled/persist', [ scheduledEvent ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not persist the scheduled event`)
      error.code  = 'E_EVENTFLOW_DB_SCHEDULED_EVENT_PERSIST'
      error.cause = reason
      error.scheduledEvent = scheduledEvent
      throw error
    } 
  }

  async readEventsScheduled()
  {
    try
    {
      return await this.gateway.query('event_scheduled/read')
    }
    catch(reason)
    {
      const error = new Error('could not read scheduled events')
      error.code  = 'E_EVENTFLOW_DB_SCHEDULED_EVENT_READ'
      error.cause = reason
      throw error
    } 
  }

  async updateEventScheduledExecuted(id)
  {
    try
    {
      const result = await this.gateway.query('event_scheduled/update-executed', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update the scheduled event: ${id} as executed`)
      error.code  = 'E_EVENTFLOW_DB_SCHEDULED_EVENT_UPDATE_EXECUTED'
      error.cause = reason
      throw error
    } 
  }

  async updateEventScheduledSuccess(id)
  {
    try
    {
      const result = await this.gateway.query('event_scheduled/update-success', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update the scheduled event: ${id} as successful`)
      error.code  = 'E_EVENTFLOW_DB_SCHEDULED_EVENT_UPDATE_SUCCESS'
      error.cause = reason
      throw error
    } 
  }

  async updateEventScheduledFailed(id)
  {
    try
    {
      const result = await this.gateway.query('event_scheduled/update-failed', [ id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update the scheduled event: ${id} as failed`)
      error.code  = 'E_EVENTFLOW_DB_SCHEDULED_EVENT_UPDATE_FAILED'
      error.cause = reason
      throw error
    } 
  }

  async persistHub(hub)
  {
    try
    {
      const result = await this.gateway.query('hub/persist', [ hub ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error('could not persist hub')
      error.code  = 'E_EVENTFLOW_DB_HUB_PERSIST'
      error.cause = reason
      error.hub   = hub
      throw error
    } 
  }

  async readOnlineHubs()
  {
    try
    {
      return await this.gateway.query('hub/read-online-hubs')
    }
    catch(reason)
    {
      const error = new Error('could not read online hubs')
      error.code  = 'E_EVENTFLOW_DB_HUBS_READ'
      error.cause = reason
      throw error
    } 
  }

  async updateHubToQuit(hub)
  {
    try
    {
      const result = await this.gateway.query('hub/update-to-quit', [ hub ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not update hub: ${hub} to quit`)
      error.code  = 'E_EVENTFLOW_DB_HUB_UPDATE_TO_QUIT'
      error.cause = reason
      throw error
    } 
  }

  async persistLog(log)
  {
    try
    {
      log.error = JSON.stringify(log.error ?? {})
      await this.gateway.query('log/persist', [ log ])
    }
    catch(reason)
    {
      const error = new Error('could not persist log')
      error.code  = 'E_EVENTFLOW_DB_LOG_PERSIST'
      error.cause = reason
      error.log   = log 
      throw error
    } 
  }

  async archiveLog(date)
  {
    date = (date ? new Date(date) : new Date()).toJSON().slice(0, 10)
    try
    {
      const partition = date.replace(/-/g, '')
      await this.gateway.query('log/archive', [ partition, date ])
    }
    catch(reason)
    {
      const error = new Error(`could not archive log for date: ${date}`)
      error.code  = 'E_EVENTFLOW_DB_LOG_ARCHIVE'
      error.cause = reason
      throw error
    }
  }

  async readCertificate(id)
  {
    let result 

    try
    {
      result = await this.gateway.query('certificate/read', [ id ])
    }
    catch(reason)
    {
      const error = new Error(`could not read certificate by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_CERTIFICATE_READ'
      error.cause = reason
      throw error
    }

    if(0 === result.length)
    {
      const error = new Error(`certificate not found by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_CERTIFICATE_NOT_FOUND'
      throw error
    }

    return result[0]
  }

  async persistCertificate(certificate)
  {
    try
    {
      const result = await this.gateway.query('certificate/persist', [ certificate ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      if('ER_DUP_ENTRY' === reason.code)
      {
        return false
      }

      const error = new Error(`could not persist certificate`)
      error.code  = 'E_EVENTFLOW_DB_CERTIFICATE_PERSIST'
      error.cause = reason
      error.certificate = certificate
      throw error
    }
  }

  async revokeCertificate(id)
  {
    try
    {
      const result = await this.gateway.query('certificate/revoke', [ id, id ])
      return result.affectedRows > 0
    }
    catch(reason)
    {
      const error = new Error(`could not revoke certificate by id: ${id}`)
      error.code  = 'E_EVENTFLOW_DB_CERTIFICATE_REVOKE'
      error.cause = reason
      throw error
    }
  }

  async revokeCertificatesPastValidityPeriod()
  {
    try
    {
      const result = await this.gateway.query('certificate/revoke-past-validity')
      return result.affectedRows
    }
    catch(reason)
    {
      const error = new Error('could not revoke certificates past validity period')
      error.code  = 'E_EVENTFLOW_DB_CERTIFICATE_REVOKE_PAST_VALIDITY'
      error.cause = reason
      throw error
    }
  }
}