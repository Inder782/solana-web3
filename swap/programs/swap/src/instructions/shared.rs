use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint,TokenAccount,TokenInterface,TransferChecked,trans}


pub fn transfer_token<'info>(from: &InterfaceAccount<'info,TokenAccount>,
to:&InterfaceAccount<'info,TokenAccount>,amount:&u64
mint: &InterfaceAccount<'info,TokenAccount>, authority :&Signer<'info>,
token_program: &InterfaceAccount<'info,TokenAccount)->Result<()>{

    let transfer_account_options= TranferChecked {
        from : from.to_account_info(),
        mint: mint.to_account_info(),
        to: to.to_account_info(),
        authority:  authority.to_account_info()
    };
    let cpi_context= CpiContext::new(token_program.to_account_info(),accounts:transfer_account_options);

    TranferChecked(cpi_context,*amount,mint.decimals)

}