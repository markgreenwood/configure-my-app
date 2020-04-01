/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import {
  fetchConfigParamFromSSM,
  FetchParameter,
  FetchConfig,
  getConfiguration,
  ConfigParams,
} from "../../src/configuration";

describe("fetchConfigParamFromSSM", () => {
  it("should get a config param from SSM", async () => {
    const param = await fetchConfigParamFromSSM(
      "/services/test-service/hostname",
    );
    expect(param).to.equal("prod-service-hostname");
  });
});

describe("getConfiguration", () => {
  // Uses actual SSM, should be stubbed for testing
  context("with the default fetchConfigParam", () => {
    it("should have the expected structure", async () => {
      const expectedTopLevelKeys = ["database", "service"];
      const expectedDatabaseKeys = ["user", "name", "password", "host"];
      const expectedServiceKeys = ["scheme", "host", "port"];

      const config = await getConfiguration();
      expect(config).to.have.all.keys(expectedTopLevelKeys);
      expect(config.database).to.have.all.keys(expectedDatabaseKeys);
      expect(config.service).to.have.all.keys(expectedServiceKeys);
    });

    it("should contain the expected contents", async () => {
      const expectedConfigContents = {
        database: {
          user: "prod-db-user",
          name: "prod-db-name",
          host: "prod-db-hostname",
          password: "ProdSecret",
        },
        service: {
          scheme: "https",
          host: "prod-service-hostname",
          port: 3000,
        },
      };
      const config = await getConfiguration();
      expect(config).to.deep.equal(expectedConfigContents);
    });
  });

  // Tests that getConfiguration can use a supplied fetchConfigParam function
  context("with custom fetchConfigParam", () => {
    const customFetchConfigParam: FetchParameter = (
      paramName: string,
      decrypt?: boolean,
    ) => {
      const lookupTable: { [index: string]: string } = {
        "/databases/test-database/dbuser": "custom-db-user",
        "/databases/test-database/dbname": "custom-db-name",
        "/databases/test-database/dbpassword": "CustomSecret",
        "/databases/test-database/dbhostname": "custom-db-hostname",
        "/services/test-service/hostname": "custom-service-hostname",
      };

      return Promise.resolve(lookupTable[paramName]);
    };

    const customConfigFetcher: FetchConfig = async (): Promise<
      ConfigParams
    > => {
      const databaseUser = await customFetchConfigParam(
        "/databases/test-database/dbuser",
      );
      const databaseHost = await customFetchConfigParam(
        "/databases/test-database/dbhostname",
      );
      const databasePassword = await customFetchConfigParam(
        "/databases/test-database/dbpassword",
      );
      const databaseName = await customFetchConfigParam(
        "/databases/test-database/dbname",
      );
      const serviceHost = await customFetchConfigParam(
        "/services/test-service/hostname",
      );

      return {
        databaseUser,
        databaseHost,
        databasePassword,
        databaseName,
        serviceHost,
      };
    };

    it("should contain the expected contents", async () => {
      const expectedConfigContents = {
        database: {
          user: "custom-db-user",
          name: "custom-db-name",
          host: "custom-db-hostname",
          password: "CustomSecret",
        },
        service: {
          scheme: "https",
          host: "custom-service-hostname",
          port: 3000,
        },
      };
      const config = await getConfiguration(customConfigFetcher);
      expect(config).to.deep.equal(expectedConfigContents);
    });
  });
});
