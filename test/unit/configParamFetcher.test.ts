import { expect } from "chai";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";

import { configParamFetcher } from "../../src/configuration";

describe("configParamFetcher", () => {
  const expectedKeys = [
    "databaseUser",
    "databaseHost",
    "databaseName",
    "databasePassword",
    "serviceHost",
  ];

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "SSM",
      "getParameter",
      (params: AWS.SSM.GetParameterRequest, callback: Function) => {
        const paramLookup: { [index: string]: string } = {
          "/databases/test-database/dbuser": "db-user",
          "/databases/test-database/dbhostname": "db-hostname",
          "/databases/test-database/dbname": "db-name",
          "/databases/test-database/dbpassword": "db-password",
          "/services/test-service/hostname": "service-hostname",
        };
        callback(null, { Parameter: { Value: paramLookup[params.Name] } });
      },
    );
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should return all the right parameters", async () => {
    const configParams = await configParamFetcher(new AWS.SSM());
    expect(configParams).to.have.all.keys(expectedKeys);
  });

  it("should return the right values", async () => {
    const configParams = await configParamFetcher(new AWS.SSM());
    expect(configParams).to.deep.equal({
      databaseUser: "db-user",
      databaseHost: "db-hostname",
      databaseName: "db-name",
      databasePassword: "db-password",
      serviceHost: "service-hostname",
    });
  });
});
