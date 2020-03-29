import { expect } from "chai";
import * as AWS from "aws-sdk";

AWS.config.update({ region: "us-west-2" });

describe("This module", () => {
  it("should do something", () => {
    expect(true).to.equal(true);
  });
});

function fetchConfigParamFromSSM(paramName: string): Promise<string> {
  const ssm = new AWS.SSM({ region: "us-west-2" });
  return new Promise((resolve, reject) =>
    ssm.getParameter({ Name: paramName, WithDecryption: true }, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }

      resolve(data.Parameter.Value);
    }),
  );
}

type FetchConfiguration = (paramName: string) => Promise<string>;

async function getConfiguration(
  fetchConfigParam: FetchConfiguration = fetchConfigParamFromSSM,
) {
  const databaseUser = await fetchConfigParam("/services/test-database/user");

  return {
    database: {
      user: databaseUser,
    },
  };
}

describe("getConfiguration", () => {
  it("should get configuration params", async () => {
    const result = await getConfiguration();
    expect(result.database.user).to.equal("postgres");
  });
});
