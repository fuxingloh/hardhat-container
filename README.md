# Chainfile Hardhat

Part of the Chainfile project/initiative, this library provides a Docker image for running Hardhat in a container
for toolchain isolation.
This is particularly useful for language-agnostic development and parallelization of systems.

## `hardhat-testcontainers`

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
