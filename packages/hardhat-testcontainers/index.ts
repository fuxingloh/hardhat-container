import { AbstractStartedContainer, GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

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

  withAutoMining(intervalMs = 6000): this {
    return this.withEnvironment({
      HARDHAT_MINING_AUTO: 'true',
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
  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
  }

  getHostRpcUrl(): string {
    return `http://${this.getHost()}:${this.getMappedPort(8545)}`;
  }
}
