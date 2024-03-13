import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createPublicClient, http, PublicClient } from 'viem';
import { hardhat } from 'viem/chains';
import waitForExpect from 'wait-for-expect';

import { HardhatContainer, StartedHardhatContainer } from './index';

describe('default container', () => {
  let container: StartedHardhatContainer;

  beforeAll(async () => {
    container = await new HardhatContainer().start();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should expose host rpc url', async () => {
    expect(container.getHostRpcUrl()).toMatch(/http:\/\/localhost:\d+/);
  });

  it('should rpc(eth_blockNumber) via viem', async () => {
    const client = createPublicClient({
      chain: hardhat,
      transport: http(container.getHostRpcUrl()),
    });

    const blockNumber = await client.getBlockNumber();
    expect(blockNumber).toStrictEqual(BigInt(0));
  });
});

describe('auto mining container', () => {
  let container: StartedHardhatContainer;
  let client: PublicClient;

  beforeAll(async () => {
    container = await new HardhatContainer().withAutoMining(3000).start();
    client = createPublicClient({
      chain: hardhat,
      transport: http(container.getHostRpcUrl()),
    });
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should auto mine block', async () => {
    await waitForExpect(async () => {
      const blockNumber = await client.getBlockNumber();
      expect(blockNumber).toStrictEqual(BigInt(1));
    }, 10000);
  });
});
