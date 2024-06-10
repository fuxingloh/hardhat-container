# Chainfile Hardhat

Part of the Chainfile ecosystem,
this library provides a Docker image for running Hardhat in a container for toolchain isolation.
This is particularly useful for language-agnostic development and parallelization of systems.

## `hardhat-testcontainers`

This is a standalone testcontainers-node package for running Hardhat in a container for testing purposes.
You don't need to use the Chainfile ecosystem to use this package.

```shell
npm i -D hardhat-testcontainers
```

```typescript
import { HardhatContainer, StartedHardhatContainer } from 'hardhat-testcontainers';
import { createPublicClient, http, PublicClient } from 'viem';
import { hardhat } from 'viem/chains';

let container: StartedHardhatContainer;

beforeAll(async () => {
  container = await new HardhatContainer().start();
});

afterAll(async () => {
  await container.stop();
});

it('should rpc(eth_blockNumber) via viem', async () => {
  const client = createPublicClient({ chain: hardhat, transport: http(container.getHostRpcEndpoint()) });

  const blockNumber = await client.getBlockNumber();
  expect(blockNumber).toStrictEqual(BigInt(0));
});
```

## License

MPL-2.0
