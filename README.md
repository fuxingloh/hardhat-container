# Hardhat Container

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
  const client = createPublicClient({ chain: hardhat, transport: http(container.getHostRpcUrl()) });

  const blockNumber = await client.getBlockNumber();
  expect(blockNumber).toStrictEqual(BigInt(0));
});
```

## Motivation

This library creates a Docker image that isolates the toolchain for Hardhat from the host system.
This is particularly useful for language-agnostic development and parallelization of systems.

## License

MPL-2.0
