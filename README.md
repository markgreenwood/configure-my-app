# Configuration

## How it works

### Application

In the application, call `getConfiguration()` without arguments 
which will use the default parameter fetcher.

### Test

For test, call `getConfiguration(fetchConfigForTest)` which will use
the passed `fetchConfigForTest` function to determine the value of the 
config params.

### Development

For dev, call `getConfiguration()` without arguments which will use
the default parameter fetcher, but provde a `.env` file which will
override the params with values from defined environment variables.

## General principles of use

Each module needing configuration should take an injected config
object with its piece of config information. This insures modules
can be independently tested. For the application this will be handled
when objects are instantiated by the main application.
