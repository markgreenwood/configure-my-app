import { expect } from "chai";

// configuration for a database
type DatabaseConfiguration = {
  user: string;
  password: string;
  name: string;
  hostname: string;
  port: number;
};

// configuration for an HTTP service
type ServiceConfiguration = {
  scheme: string;
  hostname: string;
  port: number;
};

// configuration for the application
type AppConfiguration = {
  database: DatabaseConfiguration;
  service: ServiceConfiguration;
};

// parameters returned from a configurator
type ConfigurationParams = {
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbHostname: string;
  dbPort: number;
  serviceScheme: string;
  serviceHostname: string;
  servicePort: number;
};

// default configurator function
function defaultAppConfigurator(): Promise<ConfigurationParams> {
  return Promise.resolve({
    dbUser: "db-user",
    dbPassword: "db-password",
    dbName: "db-name",
    dbHostname: "db-hostname",
    dbPort: 3000,
    serviceScheme: "http",
    serviceHostname: "service-hostname",
    servicePort: 5000,
  });
}

type ConfigurationParamFetcher = () => Promise<ConfigurationParams>;

type ConfigurationMapper = (
  configParams: ConfigurationParams,
) => AppConfiguration;

async function Configuration(
  configurator: ConfigurationParamFetcher = defaultAppConfigurator,
): Promise<AppConfiguration> {
  const configParams: ConfigurationParams = await configurator();

  const configMapper: ConfigurationMapper = params => {
    return {
      database: {
        user: params.dbUser,
        password: params.dbPassword,
        name: params.dbName,
        hostname: params.dbHostname,
        port: params.dbPort,
      },
      service: {
        scheme: params.serviceScheme,
        hostname: params.serviceHostname,
        port: params.servicePort,
      },
    };
  };

  return configMapper(configParams);
}

describe("AppConfiguration", () => {
  it("should have the right properties", async () => {
    const config = await Configuration();
    expect(config).to.have.all.keys(["database", "service"]);
    expect(config.database).to.have.all.keys([
      "user",
      "name",
      "password",
      "hostname",
      "port",
    ]);
    expect(config.service).to.have.all.keys(["scheme", "hostname", "port"]);
  });

  it("should work with the default configurator", async () => {
    const config = await Configuration();
    expect(config).to.deep.equal({
      database: {
        user: "db-user",
        password: "db-password",
        name: "db-name",
        hostname: "db-hostname",
        port: 3000,
      },
      service: { scheme: "http", hostname: "service-hostname", port: 5000 },
    });
  });

  it("should work with a supplied custom fetcher", async () => {
    const customFetcher = () =>
      Promise.resolve({
        dbUser: "custom-db-user",
        dbPassword: "custom-db-password",
        dbName: "custom-db-name",
        dbHostname: "custom-db-hostname",
        dbPort: 3001,
        serviceScheme: "https",
        serviceHostname: "custom-service-hostname",
        servicePort: 5001,
      });

    const config = await Configuration(customFetcher);
    expect(config).to.deep.equal({
      database: {
        user: "custom-db-user",
        password: "custom-db-password",
        name: "custom-db-name",
        hostname: "custom-db-hostname",
        port: 3001,
      },
      service: {
        scheme: "https",
        hostname: "custom-service-hostname",
        port: 5001,
      },
    });
  });
});
