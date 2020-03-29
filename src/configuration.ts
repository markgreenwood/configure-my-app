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

export type FetchConfiguration = (
  paramName: string,
  decrypt?: boolean,
) => Promise<string>;

export async function getConfiguration(
  fetchConfigParam: FetchConfiguration = fetchConfigParamFromSSM,
) {
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
    database: {
      user: databaseUser,
      name: databaseName,
      host: databaseHost,
      password: databasePassword,
    },
    service: {
      scheme: "http",
      host: serviceHost,
      port: 3000,
    },
  };
}
