pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("25uoZzo8hyQ9vzsDd2KwdoKkvqSCB6FTsfSfgNwrhuC1");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(ctx: Context<MakeOffer>,id:u64,token_a_offered_amt:u64,token_b_offered_amt:u64) -> Result<()> {
        
        instructions::make_offer::send_offered_tokens_to_vault(&ctx,token_a_offered_amt)?;

        instructions::make_offer::save_offer(ctx,id,token_b_offered_amt)
    }
}
