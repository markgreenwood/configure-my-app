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

type ConfigParams = {
  databaseUser: string;
  databaseName: string;
  databasePassword: string;
  databaseHost: string;
  serviceHost: string;
};

type FetchConfig = () => Promise<ConfigParams>;

export async function getConfiguration(
  fetchConfigParam: FetchParameter = fetchConfigParamFromSSM,
) {
  async function configParamFetcher(): Promise<ConfigParams> {
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
    const serviceHost = await fetchConfigParam(
      "/services/test-service/hostname",
    );
    return {
      databaseUser,
      databaseName,
      databaseHost,
      databasePassword,
      serviceHost,
    };
  }

  const params = await configParamFetcher();

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
