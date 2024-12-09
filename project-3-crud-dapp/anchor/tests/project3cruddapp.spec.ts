import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Project3cruddapp} from '../target/types/project3cruddapp'

describe('project3cruddapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Project3cruddapp as Program<Project3cruddapp>

  const project3cruddappKeypair = Keypair.generate()

  it('Initialize Project3cruddapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        project3cruddapp: project3cruddappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([project3cruddappKeypair])
      .rpc()

    const currentCount = await program.account.project3cruddapp.fetch(project3cruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Project3cruddapp', async () => {
    await program.methods.increment().accounts({ project3cruddapp: project3cruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.project3cruddapp.fetch(project3cruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Project3cruddapp Again', async () => {
    await program.methods.increment().accounts({ project3cruddapp: project3cruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.project3cruddapp.fetch(project3cruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Project3cruddapp', async () => {
    await program.methods.decrement().accounts({ project3cruddapp: project3cruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.project3cruddapp.fetch(project3cruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set project3cruddapp value', async () => {
    await program.methods.set(42).accounts({ project3cruddapp: project3cruddappKeypair.publicKey }).rpc()

    const currentCount = await program.account.project3cruddapp.fetch(project3cruddappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the project3cruddapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        project3cruddapp: project3cruddappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.project3cruddapp.fetchNullable(project3cruddappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
