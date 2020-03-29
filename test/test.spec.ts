/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import {
  fetchConfigParamFromSSM,
  FetchConfiguration,
  getConfiguration,
} from "../src/configuration";

describe("fetchConfigParamFromSSM", () => {
  it("should get a config param from SSM", async () => {
    const param = await fetchConfigParamFromSSM(
      "/services/test-service/hostname",
    );
    expect(param).to.equal("the-test-service-hostname");
  });
});

describe("getConfiguration", () => {
  // Uses actual SSM, should be stubbed for testing
  context("with the default fetchConfigParam", () => {
    it("should get configuration params", async () => {
      const result = await getConfiguration();
      expect(result.database.user).to.equal("test-db-user");
    });

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
          user: "test-db-user",
          name: "postgres",
          host: "the-test-database-hostname",
          password: "VerySecret",
        },
        service: {
          scheme: "http",
          host: "the-test-service-hostname",
          port: 3000,
        },
      };
      const config = await getConfiguration();
      expect(config).to.deep.equal(expectedConfigContents);
    });
  });

  // Tests that getConfiguration can use a supplied fetchConfigParam function
  context("with custom fetchConfigParam", () => {
    const customFetchConfigParam: FetchConfiguration = (
      paramName: string,
      decrypt?: boolean,
    ) => {
      const lookupTable: { [index: string]: string } = {
        "/databases/test-database/dbuser": "custom-test-db-user",
        "/databases/test-database/dbname": "custom-postgres",
        "/databases/test-database/dbpassword": "custom-VerySecret",
        "/databases/test-database/dbhostname":
          "custom-the-test-database-hostname",
        "/services/test-service/hostname": "custom-the-test-service-hostname",
      };

      return Promise.resolve(lookupTable[paramName]);
    };

    it("should contain the expected contents", async () => {
      const expectedConfigContents = {
        database: {
          user: "custom-test-db-user",
          name: "custom-postgres",
          host: "custom-the-test-database-hostname",
          password: "custom-VerySecret",
        },
        service: {
          scheme: "http",
          host: "custom-the-test-service-hostname",
          port: 3000,
        },
      };
      const config = await getConfiguration(customFetchConfigParam);
      expect(config).to.deep.equal(expectedConfigContents);
    });
  });
});
