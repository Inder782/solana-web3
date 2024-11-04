// this file generates the keyapair , then logs the public key and the secret key.
import { Keypair } from "@solana/web3.js";
 
const keypair = Keypair.generate();
 
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`✅ Finished!`);

// NOTE : create a file similar to .env_template and paste the public key and secret key there for next task.