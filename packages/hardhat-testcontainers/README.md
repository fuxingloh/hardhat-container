This project provides a Docker image for running Hardhat in a container for toolchain isolation.

```shell
npm i -D hardhat-testcontainers viem
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
