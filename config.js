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
      // @link: https://sidorares.github.io/node-mysql2/docs/examples/connections/create-connection
      // @link: https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool

      debug                 : process.env.EVENTFLOW_MYSQL_DEBUG               ?? false,
      trace                 : process.env.EVENTFLOW_MYSQL_TRACE               ?? true,
      decimalNumbers        : process.env.EVENTFLOW_MYSQL_DECIMAL_NUMBERS     ?? false,
      disableEval           : process.env.EVENTFLOW_MYSQL_DISABLE_EVAL        ?? true,
      bigNumberStrings      : process.env.EVENTFLOW_MYSQL_BIG_NUMBER_STRINGS  ?? false,
      supportBigNumbers     : process.env.EVENTFLOW_MYSQL_SUPPORT_BIG_NUMBERS ?? false,
      insecureAuth          : process.env.EVENTFLOW_MYSQL_INSECURE_AUTH       ?? false,
      enableKeepAlive       : process.env.EVENTFLOW_MYSQL_ENABLE_KEEP_ALIVE   ?? true,
      keepAliveInitialDelay : process.env.EVENTFLOW_MYSQL_KEEP_ALIVE_DELAY    ?? 0,
      waitForConnections    : process.env.EVENTFLOW_MYSQL_WAIT_FOR_CONN       ?? true,
      compress              : process.env.EVENTFLOW_MYSQL_COMPRESS            ?? false,
      namedPlaceholders     : process.env.EVENTFLOW_MYSQL_NAMED_PLACEHOLDERS  ?? false,
      maxIdle               : process.env.EVENTFLOW_MYSQL_MAX_IDLE            ?? 
                              process.env.EVENTFLOW_MYSQL_CONNECTION_LIMIT    ?? 10,
      idleTimeout           : process.env.EVENTFLOW_MYSQL_IDLE_TIMEOUT        ?? 60e3,
      queueLimit            : process.env.EVENTFLOW_MYSQL_QUEUE_LIMIT         ?? 0,
      connectionLimit       : process.env.EVENTFLOW_MYSQL_CONNECTION_LIMIT    ?? 10,
      flags                 : process.env.EVENTFLOW_MYSQL_FLAGS               ?? false,
      ssl                   : process.env.EVENTFLOW_MYSQL_SSL                 ?? false,
      charset               : process.env.EVENTFLOW_MYSQL_CHARSET             ?? 'utf8mb4',
      timezone              : process.env.EVENTFLOW_MYSQL_TIMEZONE            ?? 'Z',
      host                  : process.env.EVENTFLOW_MYSQL_HOST                ?? 'localhost',
      port                  : process.env.EVENTFLOW_MYSQL_PORT                ?? '3306',
      socketPath            : process.env.EVENTFLOW_MYSQL_SOCKET_PATH         ?? false,
      user                  : process.env.EVENTFLOW_MYSQL_USER                ?? 'root',
      password              : process.env.EVENTFLOW_MYSQL_PASS                ?? 'root',
      passwordSha1          : process.env.EVENTFLOW_MYSQL_PASS_SHA1           ?? false,
      // multifactor authentication support
      password1             : process.env.EVENTFLOW_MYSQL_PASS_1              ?? false,
      password2             : process.env.EVENTFLOW_MYSQL_PASS_2              ?? false,
      password3             : process.env.EVENTFLOW_MYSQL_PASS_3              ?? false,
      database              : process.env.EVENTFLOW_MYSQL_DB                  ?? 'eventflow',
    }
  }
}