/**
 * @memberof Eventflow.DB
 */
export default
{
  locator:
  {
    '@superhero/eventflow-db' : './index.js'
  },
  eventflow:
  {
    db:
    {
      debug           : process.env.EVENTFLOW_MYSQL_DEBUG             ?? false,
      insecureAuth    : process.env.EVENTFLOW_MYSQL_INSECURE_AUTH     ?? false,
      connectionLimit : process.env.EVENTFLOW_MYSQL_CONNECTION_LIMIT  ?? '5',
      flags           : process.env.EVENTFLOW_MYSQL_FLAGS             ?? '',
      charset         : process.env.EVENTFLOW_MYSQL_CHARSET           ?? 'UTF8_GENERAL_CI',
      timezone        : process.env.EVENTFLOW_MYSQL_TIMEZONE          ?? 'Z',
      host            : process.env.EVENTFLOW_MYSQL_HOST              ?? 'localhost',
      port            : process.env.EVENTFLOW_MYSQL_PORT              ?? '3306',
      user            : process.env.EVENTFLOW_MYSQL_USER              ?? 'root',
      password        : process.env.EVENTFLOW_MYSQL_PASS              ?? 'root',
      database        : process.env.EVENTFLOW_MYSQL_DB                ?? 'eventflow',
    }
  }
}