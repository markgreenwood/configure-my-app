import { expect } from "chai";
import * as AWS from "aws-sdk";
import * as AWSMock from "aws-sdk-mock";
import { fetchConfigParamFromSSM } from "../../src/configuration";

describe("fetchConfigParamFromSSM", () => {
  // TODO: Figure out how to do this while stubbing SSM

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      "SSM",
      "getParameter",
      (params: AWS.SSM.Types.GetParameterRequest, callback: Function) => {
        const lookup: { [index: string]: string } = {
          "/param/1": "param one",
          "/param/2": "param two",
          "/param/3": "param three",
        };
        const value = lookup[params.Name];
        callback(null, { Parameter: { Value: value } });
      },
    );
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it("should get a config param from SSM via the fetchConfigParamFrom... function", async () => {
    const param = await fetchConfigParamFromSSM(new AWS.SSM())("/param/1");
    expect(param).to.equal("param one");
  });

  it("should get a different config param from SSM via the fetchConfigParamFrom... function", async () => {
    const param = await fetchConfigParamFromSSM(new AWS.SSM())("/param/2");
    expect(param).to.equal("param two");
  });
});
