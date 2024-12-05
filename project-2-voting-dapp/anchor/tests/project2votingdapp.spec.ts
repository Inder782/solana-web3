import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {PublicKey} from '@solana/web3.js'

import {Voting} from "../target/types/Voting"
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

// note: If test fails for weird reason , check the function the accounts , if still doesn't pass check the IDL and types , in this case
// -->target/id/Voting.json , else -->target/types/Voting.ts


const IDL = require("../target/idl/Voting.json");

const votingaddress= new PublicKey("8Xq3os7JmvL3TrCnKEPdyYVe9BSoVqU3ftRfaqXftiQH");

describe('Voting', () => {

  let context;
  let provider:any;
  let voting_program:any;
  
  beforeAll(async()=>{
    context = await startAnchor("",[{name:"voting",programId:votingaddress}],[]);
    provider = new BankrunProvider(context);

    voting_program = new Program<Voting>(
      IDL,
      provider
    );
    
  })

  it('Initialize Poll', async () => {
    context = await startAnchor("",[{name:"voting",programId:votingaddress}],[]);
    provider = new BankrunProvider(context);

    voting_program = new Program<Voting>(
      IDL,
      provider
    );
    
    await voting_program.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite game on pc?",
      new anchor.BN(0),
      new anchor.BN(1833118511)
    ).rpc()

    const [pollAddress] =  PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,'le',8)],votingaddress,
    )

    const poll = await voting_program.account.poll.fetch(pollAddress);
    console.log(poll)

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite game on pc?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize_candidate", async () => {
    await voting_program.methods.initializeCandidate("God of war",new anchor.BN(1)).rpc();
    await voting_program.methods.initializeCandidate("GTA5", new anchor.BN(1)).rpc();

    const [god_of_war]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,'le',8),Buffer.from("God of war")],
      votingaddress
    )
    const [gta_5]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,'le',8),Buffer.from("GTA5")],
      votingaddress
    )
    // name was different again took reference from types/Voting.ts
    const gow_address= await voting_program.account.candidateAccount.fetch(god_of_war);
    const gta_v_address= await voting_program.account.candidateAccount.fetch(gta_5);
    
    console.log(gow_address);
    console.log(gta_v_address);

    // real test with cases

    expect(gow_address.candidateVotes.toNumber()).toEqual(0);
    expect(gta_v_address.candidateVotes.toNumber()).toEqual(0);
});

  it ("vote",async()=>{
    await voting_program.methods.vote("God of war",new anchor.BN(1)).rpc();
    await voting_program.methods.vote("GTA5",new anchor.BN(1)).rpc();
    const [god_of_war]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,'le',8),Buffer.from("God of war")],
      votingaddress
    )
    const [gta_5]=PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer,'le',8),Buffer.from("GTA5")],
      votingaddress
    )

    const gow_address= await voting_program.account.candidateAccount.fetch(god_of_war);
    const gta_v_address= await voting_program.account.candidateAccount.fetch(gta_5);
    
    console.log(gow_address);
    console.log(gta_v_address);

    // real test with cases

    expect(gow_address.candidateVotes.toNumber()).toEqual(1);
    expect(gta_v_address.candidateVotes.toNumber()).toEqual(1);
    
  })
});
