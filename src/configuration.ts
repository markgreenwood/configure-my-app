import * as AWS from "aws-sdk";

AWS.config.update({ region: "us-west-2" });

export function fetchConfigParamFromSSM(
  paramName: string,
  decrypt: boolean = true,
): Promise<string> {
  const ssm = new AWS.SSM({ region: "us-west-2" });
  return new Promise((resolve, reject) =>
    ssm.getParameter(
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
}

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

async function configParamFetcher(
  fetchConfigParam: FetchParameter = fetchConfigParamFromSSM,
): Promise<ConfigParams> {
  const databaseUser = await fetchConfigParam(
    "/databases/test-database/dbuser",
  );
  const databaseHost = await fetchConfigParam(
    "/databases/test-database/dbhostname",
  );
  const databasePassword = await fetchConfigParam(
    "/databases/test-database/dbpassword",
  );
  const databaseName = await fetchConfigParam(
    "/databases/test-database/dbname",
  );
  const serviceHost = await fetchConfigParam("/services/test-service/hostname");
  return {
    databaseUser,
    databaseName,
    databaseHost,
    databasePassword,
    serviceHost,
  };
}

export async function getConfiguration(
  configFetcher: FetchConfig = configParamFetcher,
) {
  const params = await configFetcher();

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
