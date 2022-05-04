import "mocha";
import { getDefaultLoggerOptions } from "@walletconnect/logger";
import { generateRandomBytes32, hashKey } from "@walletconnect/utils";
import pino from "pino";
import Sinon from "sinon";

import { Core, CORE_DEFAULT, Crypto } from "../src";
import { expect, TEST_CORE_OPTIONS } from "./shared";

describe("Crypto", () => {
  const logger = pino(getDefaultLoggerOptions({ level: CORE_DEFAULT.logger }));
  const core = new Core(TEST_CORE_OPTIONS);

  let crypto: Crypto;

  beforeEach(async () => {
    crypto = new Crypto(core, logger);
    await crypto.init();
  });

  it("initializes the keychain subcontroller a single time", async () => {
    const spy = Sinon.spy();
    const _crypto = new Crypto(core, logger);
    _crypto.keychain.init = spy;
    await _crypto.init();
    await _crypto.init();
    expect(spy.callCount).to.equal(1);
  });

  describe("setSymKey", () => {
    it("throws if not initialized", async () => {
      const invalidCrypto = new Crypto(core, logger);
      await expect(invalidCrypto.setSymKey("key")).to.eventually.be.rejectedWith(
        "crypto was not initialized",
      );
    });
    it("sets expected topic-symKey pair in keychain, returns topic", async () => {
      const spy = Sinon.spy();
      crypto.keychain.set = spy;
      const fakeSymKey = generateRandomBytes32();
      const topic = hashKey(fakeSymKey);
      const returnedTopic = await crypto.setSymKey(fakeSymKey);
      const [calledTopic, calledSymKey] = spy.getCall(0).args;
      expect(calledTopic).to.equal(topic);
      expect(calledSymKey).to.equal(fakeSymKey);
      expect(returnedTopic).to.equal(topic);
    });
    it("sets expected topic-symKey pair in keychain if overrideTopic is passed", async () => {
      const spy = Sinon.spy();
      crypto.keychain.set = spy;
      const fakeSymKey = generateRandomBytes32();
      const topic = generateRandomBytes32();
      const returnedTopic = await crypto.setSymKey(fakeSymKey, topic);
      const [calledTopic, calledSymKey] = spy.getCall(0).args;
      expect(calledTopic).to.equal(topic);
      expect(calledSymKey).to.equal(fakeSymKey);
      expect(returnedTopic).to.equal(topic);
    });
  });

  describe("deleteSymKey", () => {
    it("throws if not initialized", async () => {
      const invalidCrypto = new Crypto(core, logger);
      await expect(invalidCrypto.deleteSymKey("key")).to.eventually.be.rejectedWith(
        "crypto was not initialized",
      );
    });
    it("deletes the expected topic-symKey pair from keychain", async () => {
      const topic = generateRandomBytes32();
      const spy = Sinon.spy();
      crypto.keychain.del = spy;
      await crypto.deleteSymKey(topic);
      const [calledTopic] = spy.getCall(0).args;
      expect(calledTopic).to.equal(topic);
    });
  });
});
