import { type HardhatUserConfig, task } from 'hardhat/config';

function requireString(env: string): string {
  const value = process.env[env];
  if (value === undefined) {
    throw new Error(`Environment variable ${env} is required`);
  }

  return value;
}

function getNumber(env: string, defaultValue: number): number {
  return process.env[env] ? Number(process.env[env]) : defaultValue;
}

function getString(env: string, defaultValue?: string): string | undefined {
  return process.env[env] ?? defaultValue;
}

function getBoolean(env: string, defaultValue: boolean): boolean {
  return (process.env[env] ?? defaultValue.toString()).toLowerCase() === 'true';
}

function computeIf<T>(bool: boolean, func: () => T): T | undefined {
  return bool ? func() : undefined;
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: getNumber('HARDHAT_CHAIN_ID', 31337),
      hardfork: getString('HARDHAT_HARDFORK'),
      allowUnlimitedContractSize: getBoolean('HARDHAT_ALLOW_UNLIMITED_CONTRACT_SIZE', true),
      mining: {
        auto: getBoolean('HARDHAT_MINING_AUTO', false),
        interval: getNumber('HARDHAT_MINING_INTERVAL', 6_000),
      },
      forking: computeIf(getBoolean('HARDHAT_FORKING_ENABLED', false), () => {
        return {
          enabled: true,
          url: requireString('HARDHAT_FORKING_URL'),
        };
      }),
    },
  },
};

task('container').setAction(async (_, hre) => {
  // TODO(fuxingloh): auto compile with streamed in contracts?
  // TODO(fuxingloh): auto compile with default contracts?
  await hre.run('node');
});

export default config;
