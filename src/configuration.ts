import * as AWS from "aws-sdk";

AWS.config.update({ region: "us-west-2" });

export const fetchConfigParamFromSSM: (ssmClient: AWS.SSM) => FetchParameter = (
  ssmClient: AWS.SSM,
) => (paramName: string, decrypt: boolean = true): Promise<string> => {
  return new Promise((resolve, reject) =>
    ssmClient.getParameter(
      { Name: paramName, WithDecryption: decrypt },
      (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        resolve(data.Parameter.Value);
      },
    ),
  );
};

export type FetchParameter = (
  paramName: string,
  decrypt?: boolean,
) => Promise<string>;

export type ConfigParams = {
  databaseUser: string;
  databaseName: string;
  databasePassword: string;
  databaseHost: string;
  serviceHost: string;
};

export type FetchConfig = () => Promise<ConfigParams>;

export async function configParamFetcher(
  ssmClient: AWS.SSM = new AWS.SSM(),
): Promise<ConfigParams> {
  const fetchParam = fetchConfigParamFromSSM(ssmClient);

  const [
    databaseUser,
    databaseHost,
    databasePassword,
    databaseName,
    serviceHost,
  ] = await Promise.all([
    fetchParam("/databases/test-database/dbuser"),
    fetchParam("/databases/test-database/dbhostname"),
    fetchParam("/databases/test-database/dbpassword"),
    fetchParam("/databases/test-database/dbname"),
    fetchParam("/services/test-service/hostname"),
  ]);

  return {
    databaseUser,
    databaseName,
    databaseHost,
    databasePassword,
    serviceHost,
  };
}

function configMapper(params: ConfigParams) {
  return {
    database: {
      user: params.databaseUser,
      name: params.databaseName,
      host: params.databaseHost,
      password: params.databasePassword,
    },
    service: {
      scheme: "https",
      host: params.serviceHost,
      port: 3000,
    },
  };
}

export async function getConfiguration(
  configFetcher: FetchConfig = configParamFetcher,
) {
  const params: ConfigParams = await configFetcher();
  return configMapper(params);
}
