import { expect } from "chai";
import { getConfiguration } from "../../src/configuration";

describe("getConfiguration from SSM", () => {
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
