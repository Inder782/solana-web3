#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("8Xq3os7JmvL3TrCnKEPdyYVe9BSoVqU3ftRfaqXftiQH");

#[program]
pub mod Voting {
    use super::*;

    pub fn Initialize_poll(ctx:Context<Initialize_poll>,
                            poll_id:u64,
                            description:String,
                            poll_start:u64,
                            poll_end:u64,
                        )->Result<()>{
        
        let poll = &mut ctx.accounts.poll;
        poll.poll_id= poll_id;
        poll.description= description;
        poll.poll_start= poll_start;
        poll.poll_end=poll_end;
        poll.candidate_amount=0;
        Ok(())
    }
    pub fn initialize_candidate(ctx:Context<InitializeCandidate>, candidatename:String,_poll_id:u64)->Result<()>{
        let candidate_names= &mut ctx.accounts.candidate_account;

        let poll_id = &mut ctx.accounts.poll_account;
        candidate_names.candidate_name= candidatename;
        candidate_names.candidate_votes=0;
        Ok(())
    }

    pub fn vote(ctx:Context<Vote>,_candidate_name:String,_poll_id:u64)->Result<()>{
        let candidate= &mut ctx.accounts.candidate_account;
        candidate.candidate_votes+=1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(candidate_name:String,poll_id:u64)]

pub struct Vote<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],bump,
    )] // can be the bug of maxiumum account depth reached , 
       //update: condfirmed , not using #[account] was causing maximum account depth error
    pub poll_account:Account<'info,Poll>,

    #[account(
        mut,
        seeds= [poll_id.to_le_bytes().as_ref(),candidate_name.as_bytes()],
        bump,
    )]
    pub candidate_account: Account<'info,CandidateAccount>,

}


#[derive(Accounts)]
#[instruction(poll_id:u64)] // instructions that are passed with it

pub struct Initialize_poll<'info>{
    #[account(mut)] // account is a mutable
    pub signer:Signer<'info>,

    #[account(
        init, // initialize one 
        payer= signer, // who is the payer
        space = 8 + Poll::INIT_SPACE, // how much space it will require
        seeds= [poll_id.to_le_bytes().as_ref()], // what would be the seed
        bump,
    )]
    pub poll:Account<'info,Poll>,
    pub system_program: Program<'info,System>,

}

#[account]  // define that it is an account
#[derive(InitSpace)] // derive the space for it 
pub struct Poll{
    pub poll_id:u64,

    #[max_len(280)]
    pub description:String,

    pub poll_start:u64,
    pub poll_end:u64,
    pub candidate_amount:u64
}


#[derive(Accounts)]
#[instruction(candidatename:String,poll_id:u64)]

pub struct InitializeCandidate<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],bump,
    )] // can be the bug of maxiumum account depth reached , 
       //update: condfirmed , not using #[account] was causing maximum account depth error
    pub poll_account:Account<'info,Poll>,

    #[account(
        init,
        payer = signer,
        space= 8+CandidateAccount::INIT_SPACE,
        seeds= [poll_id.to_le_bytes().as_ref(),candidatename.as_bytes()],
        bump,
    )]
    pub candidate_account: Account<'info,CandidateAccount>,
    pub system_program: Program<'info,System>,

}

#[account]
#[derive(InitSpace)]
pub struct CandidateAccount{
    #[max_len(40)]
    pub candidate_name:String,
    pub candidate_votes:u64,
}