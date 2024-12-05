import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {Voting} from "/home/inder782/programs/learn-solana/project-2-voting-dapp/anchor/target/types/Voting"
import {BN, Program } from "@coral-xyz/anchor";

const IDL= require('/home/inder782/programs/learn-solana/project-2-voting-dapp/anchor/target/idl/Voting.json')
export const OPTIONS = GET;

export async function GET(request: Request) {
  
    const actionMetadata: ActionGetResponse ={
        icon:"https://wallpapers.com/images/hd/god-of-war-temple-of-lahkesis-k8xzjak6ab3jlyc3.webp",
        title:"Vote for your fav game",
        description:"Vote between God of war vs GTA5",
        label:"Vote",
        links:{
            actions: [
                {
                    label:"Vote for God of war",
                    href : "api/vote?candidate=God of war",
                    type: "external-link"
                },
                {
                    label:"Vote for GTA5",
                    href : "api/vote?candidate=GTA5",
                    type: "external-link"
                }
            ]
        }
    }
    return Response.json(actionMetadata,{headers: ACTIONS_CORS_HEADERS});
}

export async function POST (request: Request){
   
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate");

    if (candidate !="God of war"  && candidate != "GTA5")
    {
        return new Response("Invalid candidate,",{status:400, headers:ACTIONS_CORS_HEADERS});
    }

    const connection = new Connection("https://127.0.0.1:8899","confirmed");

    const program:Program<Voting>= new Program(IDL,{connection});

    const body:ActionPostRequest= await request.json();
    let voter =new PublicKey(body.account);

    try{
        voter= new PublicKey(body.account)
    }
    catch(error){
        return new Response("Invalid Account",{status:400,headers:ACTIONS_CORS_HEADERS});
    }
    const instruction = await program.methods
        .vote(candidate, new BN(1))
        .accounts({signer:voter})
        .instruction()
    
    const blockhash= await connection.getLatestBlockhash();

    const transaction = new Transaction({feePayer:voter,
        blockhash:blockhash.blockhash,
        lastValidBlockHeight:blockhash.lastValidBlockHeight})
        .add(instruction)

    const response = await createPostResponse({
        fields: {
            transaction: transaction
        }
    })
    return Response.json(response,{headers:ACTIONS_CORS_HEADERS});
}