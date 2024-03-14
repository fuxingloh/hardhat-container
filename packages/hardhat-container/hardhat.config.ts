import { type HardhatUserConfig, task } from 'hardhat/config';

function getNumber(env: string, defaultValue?: number): number | undefined {
  return process.env[env] ? Number(process.env[env]) : defaultValue;
}

function getString(env: string, defaultValue?: string): string | undefined {
  return process.env[env] ?? defaultValue;
}

function getBoolean(env: string, defaultValue: boolean): boolean {
  return (process.env[env] ?? defaultValue.toString()).toLowerCase() === 'true';
}

function getHardhatUserConfig(): HardhatUserConfig {
  const hardhat: NonNullable<HardhatUserConfig['networks']>['hardhat'] = {
    chainId: getNumber('HARDHAT_CHAIN_ID', 31337),
    allowUnlimitedContractSize: getBoolean('HARDHAT_ALLOW_UNLIMITED_CONTRACT_SIZE', true),
    mining: {
      auto: getBoolean('HARDHAT_MINING_AUTO', false),
      interval: getNumber('HARDHAT_MINING_INTERVAL', 6_000),
    },
  };

  const hardfork = getString('HARDHAT_HARDFORK');
  if (hardfork !== undefined) {
    hardhat.hardfork = hardfork;
  }

  const forkingEnabled = getBoolean('HARDHAT_FORKING_ENABLED', false);
  const forkingUrl = getString('HARDHAT_FORKING_URL');
  if (forkingEnabled) {
    if (forkingUrl === undefined) {
      throw new Error('HARDHAT_FORKING_URL is required when HARDHAT_FORKING_ENABLED is true');
    }

    hardhat.forking = {
      enabled: true,
      url: forkingUrl,
    };
  }

  return { networks: { hardhat } };
}

task('container').setAction(async (_, hre) => {
  // TODO(fuxingloh): auto compile with streamed in contracts?
  // TODO(fuxingloh): auto compile with default contracts?
  await hre.run('node');
});

export default getHardhatUserConfig();
