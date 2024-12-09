'use client'

import { PublicKey } from '@solana/web3.js'
import { useProject3cruddappProgram, useProject3cruddappProgramAccount } from './project3cruddapp-data-access'
import {useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function Project3cruddappCreate() {
  const [title,settitle]=useState("");
  const [message,setmessage]=useState("");

  const {createEntry}= useProject3cruddappProgram();
  const {publicKey}=useWallet();

  const isFormValid = title.trim() !== '' &&message.trim() !=='';

  const handleSubmit=()=>{
    if (publicKey && isFormValid){
      createEntry.mutateAsync({title,message,owner:publicKey})
    }
  }
  if (!publicKey){
    return <p>Please connect your wallet</p>
  }
  return (
    <div>
      <input
      type='text'
      placeholder='title'
      value={title}
      onChange={(e)=>settitle(e.target.value)}
      className='input input-bordered w-full max-w-xs'
      />
      
      <textarea 
      placeholder='message'
      value={message}
      onChange={(e)=>setmessage(e.target.value)}
      className='textarea textarea-bordered-wfull max-w-xs'/>
      
      <button
      onClick={handleSubmit}
      disabled={createEntry.isPending || !isFormValid}
      className='btn btn-xs lg:btn-primary'
      />
  </div>
  )
}

export function Project3cruddappList() {
  const { accounts, getProgramAccount } = useProject3cruddappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <Project3cruddappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function Project3cruddappCard({ account }: { account: PublicKey }) {
  const { accountQuery,update_entry,delete_entry  } = useProject3cruddappProgramAccount({
    account,
  })
  const {publicKey}= useWallet();

  const [message,setmessage]=useState("");
  const title=accountQuery.data?.title;

  const isFormValid = message.trim() !=='';

  const handleSubmit=()=>{
    if (publicKey && isFormValid && title){
      update_entry.mutateAsync({title,message,owner:publicKey})
    }
  }
  if (!publicKey){
    return <p>Please connect your wallet</p>
  }
  return accountQuery.isLoading ? (
    <span className='loading loading-spinner loading-lg'></span>):(
      <div className='card card-bordered border-base-300 border-4 text-neutral-content'>
        <div className='card-body items-center text-center'>
          <div className='space-y-2'></div>
          
          <h2 className='card-title justify-center text-3xl cursor-pointer' onClick={()=>{
            accountQuery.refetch()
          }}>{accountQuery.data?.title}</h2>

          <p>{account.toString()}</p>
          
          <p>{accountQuery.data?.message}</p>
          <div className='card-actions justify-around'>
           
            <textarea 
            placeholder='message'
            value={message}
            onChange={(e)=>setmessage(e.target.value)}
            className=' textarea textarea-bordered w-full max-w-xs'/>

            <button 
            onClick={handleSubmit}
            disabled= {update_entry.isPending || !isFormValid}
            className='btn btn-xs lg:btn-md btn-primary'>
              Update Journal Entry
            </button>
            
            <button 
            onClick={()=>{
              const title=accountQuery.data?.title;
              if (title){
                return delete_entry.mutateAsync(title)
              }
            }
          }
            disabled={delete_entry.isPending}
            className='btn btn-xs lg:btn-md btn-error'>
              Delete
            </button>
          
          </div>
        </div>
      </div>
    )
  
}
