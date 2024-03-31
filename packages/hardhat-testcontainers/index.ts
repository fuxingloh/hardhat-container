import { AbstractStartedContainer, GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { createPublicClient, http, type HttpTransport, type PublicClient } from 'viem';
import { hardhat as hardhatChain } from 'viem/chains';

import { devDependencies } from './package.json';

export class HardhatContainer extends GenericContainer {
  constructor(image: string = `ghcr.io/fuxingloh/hardhat-container:${devDependencies['hardhat']}`) {
    super(image);

    this.withWaitStrategy(Wait.forLogMessage('Started HTTP and WebSocket JSON-RPC server at'));
    this.withExposedPorts(8545);
  }

  withChainId(chainId: number): this {
    return this.withEnvironment({
      HARDHAT_CHAIN_ID: chainId.toString(),
    });
  }

  withAllowUnlimitedContractSize(allowUnlimitedContractSize = true): this {
    return this.withEnvironment({
      HARDHAT_ALLOW_UNLIMITED_CONTRACT_SIZE: allowUnlimitedContractSize.toString(),
    });
  }

  withMiningAuto(auto: boolean): this {
    return this.withEnvironment({
      HARDHAT_MINING_AUTO: auto.toString(),
    });
  }

  withMiningInterval(intervalMs = 6000): this {
    return this.withEnvironment({
      HARDHAT_MINING_INTERVAL: intervalMs.toString(),
    });
  }

  withForking(rpcUrl: string): this {
    return this.withEnvironment({
      HARDHAT_FORKING_ENABLED: 'true',
      HARDHAT_FORKING_URL: rpcUrl,
    });
  }

  async start(): Promise<StartedHardhatContainer> {
    return new StartedHardhatContainer(await super.start());
  }
}

export class StartedHardhatContainer extends AbstractStartedContainer {
  public readonly client: PublicClient<HttpTransport>;

  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
    this.client = createPublicClient<HttpTransport>({
      cacheTime: 0,
      chain: hardhatChain,
      transport: http(this.getHostRpcEndpoint()),
    });
  }

  getHostRpcEndpoint(): string {
    return `http://${this.getHost()}:${this.getMappedPort(8545)}`;
  }

  async evmMine(count: number = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.client.request({ method: 'evm_mine' } as any);
    }
  }

  async evmRevert(snapshotId: string): Promise<void> {
    await this.client.request({ method: 'evm_revert', params: [snapshotId] } as any);
  }

  async evmSnapshot(): Promise<string> {
    return await this.client.request({ method: 'evm_snapshot' } as any);
  }
}
