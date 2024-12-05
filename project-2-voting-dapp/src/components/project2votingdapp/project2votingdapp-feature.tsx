'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProject2votingdappProgram } from './project2votingdapp-data-access'
import { Project2votingdappCreate, Project2votingdappList } from './project2votingdapp-ui'

export default function Project2votingdappFeature() {
  const { publicKey } = useWallet()
  const { programId } = useProject2votingdappProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Project2votingdapp"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <Project2votingdappCreate />
      </AppHero>
      <Project2votingdappList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
