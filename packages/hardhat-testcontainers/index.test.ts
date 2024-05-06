import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import waitFor from 'wait-for-expect';

import { HardhatClient, HardhatContainer, StartedHardhatContainer } from './index';

describe('default container', () => {
  let container: StartedHardhatContainer;

  beforeAll(async () => {
    container = await new HardhatContainer().start();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should expose host rpc url', async () => {
    expect(container.getHostRpcEndpoint()).toMatch(/http:\/\/localhost:\d+/);
  });

  it('should rpc(eth_blockNumber) via viem', async () => {
    const client = createPublicClient({
      chain: hardhat,
      transport: http(container.getHostRpcEndpoint()),
    });

    const blockNumber = await client.getBlockNumber();
    expect(blockNumber).toBeGreaterThanOrEqual(0n);
  });
});

describe('auto mining container 2000ms interval', () => {
  let container: StartedHardhatContainer;

  beforeAll(async () => {
    container = await new HardhatContainer().withMiningInterval(2000).start();
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should auto mine block', async () => {
    await waitFor(async () => {
      const blockNumber = await container.client.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(1n);
    });
  });
});

describe('HardhatClient', () => {
  let container: StartedHardhatContainer;
  let client: HardhatClient;

  beforeAll(async () => {
    container = await new HardhatContainer().withMiningInterval(0).start();
    client = container.client;
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should snapshot and revert', async () => {
    await client.mine({ blocks: 1 });
    const snapshotId = await client.snapshot();
    await client.mine({ blocks: 1 });
    await client.revert({ id: snapshotId });
    await client.setCoinbase({ address: '0x0000000000000000000000000000000000000000' });
    await client.mine({ blocks: 2 });

    await waitFor(async () => {
      const blockNumber = await client.getBlockNumber();
      expect(blockNumber).toBeGreaterThanOrEqual(3n);
    });
  });
});
