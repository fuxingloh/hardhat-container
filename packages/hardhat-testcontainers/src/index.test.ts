import { afterAll, beforeAll, describe, expect, it } from '@workspace/jest/globals';
import waitFor from '@workspace/jest/wait-for';
import { createPublicClient, getContract, getContractAddress, http } from 'viem';
import { hardhat } from 'viem/chains';

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

  it('should be able to use getContract', async () => {
    const Token = {
      abi: [
        {
          inputs: [
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'symbol',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'initialSupply',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'allowance',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'needed',
              type: 'uint256',
            },
          ],
          name: 'ERC20InsufficientAllowance',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'sender',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'balance',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'needed',
              type: 'uint256',
            },
          ],
          name: 'ERC20InsufficientBalance',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'approver',
              type: 'address',
            },
          ],
          name: 'ERC20InvalidApprover',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'receiver',
              type: 'address',
            },
          ],
          name: 'ERC20InvalidReceiver',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'sender',
              type: 'address',
            },
          ],
          name: 'ERC20InvalidSender',
          type: 'error',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
          ],
          name: 'ERC20InvalidSpender',
          type: 'error',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'Approval',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'from',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'owner',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
          ],
          name: 'allowance',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'spender',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'approve',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'account',
              type: 'address',
            },
          ],
          name: 'balanceOf',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'decimals',
          outputs: [
            {
              internalType: 'uint8',
              name: '',
              type: 'uint8',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'name',
          outputs: [
            {
              internalType: 'string',
              name: '',
              type: 'string',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'symbol',
          outputs: [
            {
              internalType: 'string',
              name: '',
              type: 'string',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'totalSupply',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'transfer',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'from',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
          ],
          name: 'transferFrom',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      bytecode:
        '0x60806040523480156200001157600080fd5b506040516200186338038062001863833981810160405281019062000037919062000505565b828281600390816200004a9190620007e0565b5080600490816200005c9190620007e0565b5050506200007133826200007a60201b60201c565b505050620009fe565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620000ef5760006040517fec442f05000000000000000000000000000000000000000000000000000000008152600401620000e691906200090c565b60405180910390fd5b62000103600083836200010760201b60201c565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036200015d57806002600082825462000150919062000958565b9250508190555062000233565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015620001ec578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401620001e393929190620009a4565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036200027e5780600260008282540392505081905550620002cb565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516200032a9190620009e1565b60405180910390a3505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620003a08262000355565b810181811067ffffffffffffffff82111715620003c257620003c162000366565b5b80604052505050565b6000620003d762000337565b9050620003e5828262000395565b919050565b600067ffffffffffffffff82111562000408576200040762000366565b5b620004138262000355565b9050602081019050919050565b60005b838110156200044057808201518184015260208101905062000423565b60008484015250505050565b6000620004636200045d84620003ea565b620003cb565b90508281526020810184848401111562000482576200048162000350565b5b6200048f84828562000420565b509392505050565b600082601f830112620004af57620004ae6200034b565b5b8151620004c18482602086016200044c565b91505092915050565b6000819050919050565b620004df81620004ca565b8114620004eb57600080fd5b50565b600081519050620004ff81620004d4565b92915050565b60008060006060848603121562000521576200052062000341565b5b600084015167ffffffffffffffff81111562000542576200054162000346565b5b620005508682870162000497565b935050602084015167ffffffffffffffff81111562000574576200057362000346565b5b620005828682870162000497565b92505060406200059586828701620004ee565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620005f257607f821691505b602082108103620006085762000607620005aa565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620006727fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000633565b6200067e868362000633565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620006c1620006bb620006b584620004ca565b62000696565b620004ca565b9050919050565b6000819050919050565b620006dd83620006a0565b620006f5620006ec82620006c8565b84845462000640565b825550505050565b600090565b6200070c620006fd565b62000719818484620006d2565b505050565b5b8181101562000741576200073560008262000702565b6001810190506200071f565b5050565b601f82111562000790576200075a816200060e565b620007658462000623565b8101602085101562000775578190505b6200078d620007848562000623565b8301826200071e565b50505b505050565b600082821c905092915050565b6000620007b56000198460080262000795565b1980831691505092915050565b6000620007d08383620007a2565b9150826002028217905092915050565b620007eb826200059f565b67ffffffffffffffff81111562000807576200080662000366565b5b620008138254620005d9565b6200082082828562000745565b600060209050601f83116001811462000858576000841562000843578287015190505b6200084f8582620007c2565b865550620008bf565b601f19841662000868866200060e565b60005b8281101562000892578489015182556001820191506020850194506020810190506200086b565b86831015620008b25784890151620008ae601f891682620007a2565b8355505b6001600288020188555050505b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620008f482620008c7565b9050919050565b6200090681620008e7565b82525050565b6000602082019050620009236000830184620008fb565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006200096582620004ca565b91506200097283620004ca565b92508282019050808211156200098d576200098c62000929565b5b92915050565b6200099e81620004ca565b82525050565b6000606082019050620009bb6000830186620008fb565b620009ca602083018562000993565b620009d9604083018462000993565b949350505050565b6000602082019050620009f8600083018462000993565b92915050565b610e558062000a0e6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce5671461013457806370a082311461015257806395d89b4114610182578063a9059cbb146101a0578063dd62ed3e146101d057610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a0610200565b6040516100ad9190610aa9565b60405180910390f35b6100d060048036038101906100cb9190610b64565b610292565b6040516100dd9190610bbf565b60405180910390f35b6100ee6102b5565b6040516100fb9190610be9565b60405180910390f35b61011e60048036038101906101199190610c04565b6102bf565b60405161012b9190610bbf565b60405180910390f35b61013c6102ee565b6040516101499190610c73565b60405180910390f35b61016c60048036038101906101679190610c8e565b6102f7565b6040516101799190610be9565b60405180910390f35b61018a61033f565b6040516101979190610aa9565b60405180910390f35b6101ba60048036038101906101b59190610b64565b6103d1565b6040516101c79190610bbf565b60405180910390f35b6101ea60048036038101906101e59190610cbb565b6103f4565b6040516101f79190610be9565b60405180910390f35b60606003805461020f90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461023b90610d2a565b80156102885780601f1061025d57610100808354040283529160200191610288565b820191906000526020600020905b81548152906001019060200180831161026b57829003601f168201915b5050505050905090565b60008061029d61047b565b90506102aa818585610483565b600191505092915050565b6000600254905090565b6000806102ca61047b565b90506102d7858285610495565b6102e2858585610529565b60019150509392505050565b60006012905090565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461034e90610d2a565b80601f016020809104026020016040519081016040528092919081815260200182805461037a90610d2a565b80156103c75780601f1061039c576101008083540402835291602001916103c7565b820191906000526020600020905b8154815290600101906020018083116103aa57829003601f168201915b5050505050905090565b6000806103dc61047b565b90506103e9818585610529565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b610490838383600161061d565b505050565b60006104a184846103f4565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146105235781811015610513578281836040517ffb8f41b200000000000000000000000000000000000000000000000000000000815260040161050a93929190610d6a565b60405180910390fd5b6105228484848403600061061d565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361059b5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016105929190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361060d5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016106049190610da1565b60405180910390fd5b6106188383836107f4565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361068f5760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016106869190610da1565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107015760006040517f94280d620000000000000000000000000000000000000000000000000000000081526004016106f89190610da1565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080156107ee578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516107e59190610be9565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361084657806002600082825461083a9190610deb565b92505081905550610919565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156108d2578381836040517fe450d38c0000000000000000000000000000000000000000000000000000000081526004016108c993929190610d6a565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361096257806002600082825403925050819055506109af565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a0c9190610be9565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610a53578082015181840152602081019050610a38565b60008484015250505050565b6000601f19601f8301169050919050565b6000610a7b82610a19565b610a858185610a24565b9350610a95818560208601610a35565b610a9e81610a5f565b840191505092915050565b60006020820190508181036000830152610ac38184610a70565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610afb82610ad0565b9050919050565b610b0b81610af0565b8114610b1657600080fd5b50565b600081359050610b2881610b02565b92915050565b6000819050919050565b610b4181610b2e565b8114610b4c57600080fd5b50565b600081359050610b5e81610b38565b92915050565b60008060408385031215610b7b57610b7a610acb565b5b6000610b8985828601610b19565b9250506020610b9a85828601610b4f565b9150509250929050565b60008115159050919050565b610bb981610ba4565b82525050565b6000602082019050610bd46000830184610bb0565b92915050565b610be381610b2e565b82525050565b6000602082019050610bfe6000830184610bda565b92915050565b600080600060608486031215610c1d57610c1c610acb565b5b6000610c2b86828701610b19565b9350506020610c3c86828701610b19565b9250506040610c4d86828701610b4f565b9150509250925092565b600060ff82169050919050565b610c6d81610c57565b82525050565b6000602082019050610c886000830184610c64565b92915050565b600060208284031215610ca457610ca3610acb565b5b6000610cb284828501610b19565b91505092915050565b60008060408385031215610cd257610cd1610acb565b5b6000610ce085828601610b19565b9250506020610cf185828601610b19565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610d4257607f821691505b602082108103610d5557610d54610cfb565b5b50919050565b610d6481610af0565b82525050565b6000606082019050610d7f6000830186610d5b565b610d8c6020830185610bda565b610d996040830184610bda565b949350505050565b6000602082019050610db66000830184610d5b565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610df682610b2e565b9150610e0183610b2e565b9250828201905080821115610e1957610e18610dbc565b5b9291505056fea26469706673582212209b4701262545d2722cf464ea203e1c1c511e8248a94f3aa32c57b5e16d9941e664736f6c63430008140033',
    };

    const [address1, address2] = await client.getAddresses();
    const hash = await client.deployContract({
      abi: Token.abi,
      bytecode: Token.bytecode as `0x${string}`,
      args: ['Name', 'SYMBOL', 999n],
      account: address1,
    });

    const transaction = await client.getTransaction({ hash: hash });
    const contract = getContract({
      address: getContractAddress({ from: transaction.from, nonce: BigInt(transaction.nonce) }),
      abi: Token.abi,
      client: {
        public: client,
        wallet: client,
      },
    });

    await contract.write.transfer([address2, 99n], { account: address1 });
  });
});
