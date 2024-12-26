import * as anchor from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { BanksClient, Clock, ProgramTestContext, startAnchor }  from "solana-bankrun";
import {  program, SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import {  BankrunProvider } from 'anchor-bankrun';
import { TokenVesting } from '@project/anchor';
import { createMint, mintTo } from 'spl-token-bankrun';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// import the IDL
import IDL from "../target/idl/token_vesting.json"
import { BN } from 'bn.js';

describe('Vesting smart contract', () => {
    const companyName="compoany";

    // required for the particular smart contract
    let beneficiary : Keypair;
    let context : ProgramTestContext
    let provider : BankrunProvider;
    let program: anchor.Program<TokenVesting>
    let banksClient: BanksClient;
    let employer: Keypair;
    let mint: PublicKey;
    let beneficiaryProvider: BankrunProvider;
    let program2:anchor.Program<TokenVesting>
    let vestingAccountkey:PublicKey;
    let treasuryTokenAccount:PublicKey;
    let employeeAccount: PublicKey;

    beforeAll(async()=>{
        // funded wallet account
        beneficiary = new anchor.web3.Keypair();

        context = await startAnchor(
            "",
            [{name:"token_vesting",programId: new PublicKey(IDL.address)}],
            [{
                address:beneficiary.publicKey,
                info: {
                    lamports: 1000000000000,
                    data:Buffer.alloc(0),
                    owner:  SYSTEM_PROGRAM_ID,
                    executable: false
                }
            }],
           
        );
        provider = new BankrunProvider(context);

        // set the provider
        anchor.setProvider(provider);

        program = new anchor.Program<TokenVesting>(IDL as TokenVesting,)

        banksClient= context.banksClient;
        employer = provider.wallet.payer;

        // create a new mint
        // You don't need to freeze any token in this scenerio
        //@ts-ignore
        mint = await createMint(banksClient,employer,employer.publicKey,null,2);

        // Generate a new keypair for the beneficiary

        beneficiaryProvider= new BankrunProvider(context);
        beneficiaryProvider.wallet= new NodeWallet(beneficiary);

        program2= new anchor.Program<TokenVesting>(IDL as TokenVesting, beneficiaryProvider);

        // Derive the three PDA's you will need 
        [vestingAccountkey] = PublicKey.findProgramAddressSync(
            [Buffer.from(companyName)],
            program.programId
        );
        [treasuryTokenAccount]= PublicKey.findProgramAddressSync(
            [Buffer.from("vesting_treasury"),Buffer.from(companyName)],
            program.programId);

        [employeeAccount]= PublicKey.findProgramAddressSync(
            [Buffer.from("employee_vesting"),beneficiary.publicKey.toBuffer(),vestingAccountkey.toBuffer()],
            program.programId
        )

    })
    it("should create a vesting account",async()=>{

        const tx = await program.methods.createVesting(companyName)
        .accounts({
            signer: employer.publicKey,
            mint,
            tokenProgram:TOKEN_PROGRAM_ID
        })
        .rpc({commitment:"confirmed"})
        const vestingAccountData = await program.account.vestingAccount.fetch(vestingAccountkey,"confirmed");
        console.log("Vesting account data : ",JSON.stringify(vestingAccountData,null,2))
        console.log("Create Vesting Account Transaction Signature:", tx);
    })

    it("Should fund the treasury token_account",async()=>{
        const amount = 10_000*10 **9;

        const mintTx= await mintTo(
            // @ts-ignores
            banksClient,
            employer,
            mint,
            treasuryTokenAccount,
            employer,
            amount
        );
        console.log("Mint to treasury token Signature", mintTx);
    })
    it("should create an employee vesting account",async()=>{
        const tx2= await program.methods.createEmployee(new BN(0),new BN(100),new BN(100),new BN(0))
        .accounts({
            beneficiary: beneficiary.publicKey,
            vestingAccount: vestingAccountkey
        }).rpc({commitment:"confirmed",skipPreflight:true})
        console.log("Create employeed account transaction signature",tx2);
        console.log("Employee account",employeeAccount.toBase58());
    })
    it("should claim tokens",async()=>{
        // create a timeout 
        await new Promise((resolve)=>setTimeout(resolve,1000));

        const currentClock= await banksClient.getClock();
        context.setClock(
            new Clock(
                currentClock.slot,
                currentClock.epochStartTimestamp,
                currentClock.epoch,
                currentClock.leaderScheduleEpoch,
                1000n
            )
        );
        console.log("Employee Account",employeeAccount.toBase58())

        // transaction3 that claims token
        const tx3= await program2.methods.claimTokens(companyName)
        .accounts({tokenProgram:TOKEN_PROGRAM_ID})
        .rpc({commitment:"confirmed"})
        
        console.log("Claim tokens transaction signature",tx3);
    })
})