/**
 * @memberof Eventflow.DB
 */
export default
{
  locator:
  {
    '@superhero/eventflow-db' : true
  },
  eventflow:
  {
    db:
    {
      debug                 : process.env.EVENTFLOW_MYSQL_DEBUG               ?? false,
      insecureAuth          : process.env.EVENTFLOW_MYSQL_INSECURE_AUTH       ?? false,
      enableKeepAlive       : process.env.EVENTFLOW_MYSQL_ENABLE_KEEP_ALIVE   ?? true,
      waitForConnections    : process.env.EVENTFLOW_MYSQL_WAIT_FOR_CONN       ?? true,
      namedPlaceholders     : process.env.EVENTFLOW_MYSQL_NAMED_PLACEHOLDERS  ?? false,
      idleTimeout           : process.env.EVENTFLOW_MYSQL_IDLE_TIMEOUT        ?? 0,
      keepAliveInitialDelay : process.env.EVENTFLOW_MYSQL_KEEP_ALIVE_DELAY    ?? 0,
      queueLimit            : process.env.EVENTFLOW_MYSQL_QUEUE_LIMIT         ?? 0,
      connectionLimit       : process.env.EVENTFLOW_MYSQL_CONNECTION_LIMIT    ?? 10,
      flags                 : process.env.EVENTFLOW_MYSQL_FLAGS               ?? '',
      charset               : process.env.EVENTFLOW_MYSQL_CHARSET             ?? 'UTF8_GENERAL_CI',
      timezone              : process.env.EVENTFLOW_MYSQL_TIMEZONE            ?? 'Z',
      host                  : process.env.EVENTFLOW_MYSQL_HOST                ?? 'localhost',
      port                  : process.env.EVENTFLOW_MYSQL_PORT                ?? '3306',
      user                  : process.env.EVENTFLOW_MYSQL_USER                ?? 'root',
      password              : process.env.EVENTFLOW_MYSQL_PASS                ?? 'root',
      database              : process.env.EVENTFLOW_MYSQL_DB                  ?? 'eventflow',
    }
  }
}