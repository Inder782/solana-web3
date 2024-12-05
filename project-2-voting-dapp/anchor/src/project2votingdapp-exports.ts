// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import Project2votingdappIDL from '../target/idl/project2votingdapp.json'
import type { Project2votingdapp } from '../target/types/project2votingdapp'

// Re-export the generated IDL and type
export { Project2votingdapp, Project2votingdappIDL }

// The programId is imported from the program IDL.
export const PROJECT2VOTINGDAPP_PROGRAM_ID = new PublicKey(Project2votingdappIDL.address)

// This is a helper function to get the Project2votingdapp Anchor program.
export function getProject2votingdappProgram(provider: AnchorProvider) {
  return new Program(Project2votingdappIDL as Project2votingdapp, provider)
}

// This is a helper function to get the program ID for the Project2votingdapp program depending on the cluster.
export function getProject2votingdappProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Project2votingdapp program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return PROJECT2VOTINGDAPP_PROGRAM_ID
  }
}
