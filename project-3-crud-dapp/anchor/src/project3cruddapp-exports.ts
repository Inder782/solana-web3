// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import Project3cruddappIDL from '../target/idl/project3cruddapp.json'
import type { Project3cruddapp } from '../target/types/project3cruddapp'

// Re-export the generated IDL and type
export { Project3cruddapp, Project3cruddappIDL }

// The programId is imported from the program IDL.
export const PROJECT3CRUDDAPP_PROGRAM_ID = new PublicKey(Project3cruddappIDL.address)

// This is a helper function to get the Project3cruddapp Anchor program.
export function getProject3cruddappProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...Project3cruddappIDL, address: address ? address.toBase58() : Project3cruddappIDL.address } as Project3cruddapp, provider)
}

// This is a helper function to get the program ID for the Project3cruddapp program depending on the cluster.
export function getProject3cruddappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Project3cruddapp program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return PROJECT3CRUDDAPP_PROGRAM_ID
  }
}
