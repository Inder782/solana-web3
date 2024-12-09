'use client'

import { getProject3cruddappProgram, getProject3cruddappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, Message, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { title } from 'process'

interface CreateEntryArgs{
  title:string,
  message:string,
  owner: PublicKey
}
export function useProject3cruddappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getProject3cruddappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getProject3cruddappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['project3cruddapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })
  const createEntry= useMutation<string,Error,CreateEntryArgs>(
    {
      mutationKey:['journalEntry','creater',{cluster}],
      mutationFn: async({title,message,owner})=>{
        return program.methods.createJournalEntry(title,message).rpc();
      },
      onSuccess: (signature)=>{
        transactionToast(signature);
        accounts.refetch()
      },
      onError:(error)=>{
        toast.error(`Erorr creating entry:" ${error.message}`)
      }
    }
  )
  return {
    program,
    accounts,
    getProgramAccount,
    createEntry,
    programId
  }
}

export function useProject3cruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useProject3cruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['project3cruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const update_entry = useMutation<string,Error,CreateEntryArgs>({
    mutationKey:['journalEntry','update',{cluster}],
    mutationFn: async({title,message})=>{
      return program.methods.updateJournalEntry(title,message).rpc()
    },
    onSuccess:(signature)=>{
      transactionToast(signature)
      accounts.refetch()
    },
    onError:(error)=>{
      toast.error(`Error updating the entry ${error.message}`);
    }
  })

  const delete_entry = useMutation({
    mutationKey:['journalEntry','delete',{cluster}],
    mutationFn: (title:string)=>{
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess:(signature)=>{
      transactionToast(signature)
      accounts.refetch()
    },
    
  })
  return {
    accountQuery,
    update_entry,
    delete_entry
  }
}
