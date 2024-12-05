'use client'

import {getProject2votingdappProgram, getProject2votingdappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useProject2votingdappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProject2votingdappProgramId(cluster.network as Cluster), [cluster])
  const program = getProject2votingdappProgram(provider)

  const accounts = useQuery({
    queryKey: ['project2votingdapp', 'all', { cluster }],
    queryFn: () => program.account.project2votingdapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['project2votingdapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ project2votingdapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useProject2votingdappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useProject2votingdappProgram()

  const accountQuery = useQuery({
    queryKey: ['project2votingdapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.project2votingdapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['project2votingdapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ project2votingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['project2votingdapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ project2votingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['project2votingdapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ project2votingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['project2votingdapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ project2votingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
