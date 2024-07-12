import { AbstractStartedContainer, GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import {
  type Client,
  createClient,
  http,
  type HttpTransport,
  type PublicActions,
  publicActions,
  type TestActions,
  testActions,
  type WalletActions,
  walletActions,
} from 'viem';
import { hardhat } from 'viem/chains';

import { devDependencies } from '../package.json';

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

type HardhatChain = typeof hardhat;

export type HardhatClient = Client<HttpTransport, HardhatChain> &
  TestActions &
  PublicActions<HttpTransport, HardhatChain> &
  WalletActions<HardhatChain>;

export class StartedHardhatContainer extends AbstractStartedContainer {
  public readonly client: HardhatClient;

  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
    this.client = this.createClient();
  }

  getHostRpcEndpoint(host: string = this.getHost()): string {
    return `http://${host}:${this.getMappedPort(8545)}`;
  }

  createClient(host: string = this.getHost()): HardhatClient {
    return createClient({
      cacheTime: 0,
      chain: hardhat,
      transport: http(this.getHostRpcEndpoint(host)),
      name: 'Hardhat Client',
      key: 'hardhat',
      type: 'hardhat',
    })
      .extend(testActions({ mode: 'hardhat' }))
      .extend(publicActions)
      .extend(walletActions);
  }
}
