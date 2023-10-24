'use client'

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic"
import Image from "next/image";
import { useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import axios from "axios";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
const WalletDisconnectButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false }
);

export default function Home() {

  const { publicKey } = useWallet()
  const wallet = publicKey?.toString();

  const [nftsOwned, setNFTsOwned] = useState<any[]>([]);

  const getNFT = async () => {
    if (!publicKey) return
    try {
      const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/b69H9CI6BSVWWxcv4WuG8x3CenOM7-gr");

      // const publicAddress = await resolveToWalletAddress({
      //   text: wallet ?? "",
      //   connection,
      // });

      // const NFTs = await getParsedNftAccountsByOwner({
      //   publicAddress,
      //   connection,
      // });

      const owner = wallet ? new PublicKey(wallet) : undefined;

      const metaplex = new Metaplex(connection);

      const nftData = await metaplex.nfts().findAllByOwner({ owner: owner! });

      console.log(nftData)

      if (nftData) {
        try {
          const nftDataArray: any[] = [];

          await Promise.all(nftData.map(async (nft) => {
            try {
              const { data } = await axios.get(nft.uri);
              nftDataArray.push(data);
            } catch (error) {
              // Handle individual fetch error here
              console.error("Error fetching NFT data:", error);
            }
          }));
    
          // Set nftsOwned after all requests are completed
          setNFTsOwned(nftDataArray);
    
          console.log(nftsOwned);
        } catch (e) {
          console.log("error with the data", e)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (!publicKey) return setNFTsOwned([]);
  }, [publicKey])

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">

        <div className="flex flex-col items-center justify-center">
          <WalletMultiButtonDynamic />
          <WalletDisconnectButtonDynamic />
        </div>
        {nftsOwned && wallet ? (
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-bold">Your NFTs</h1>
            <div>
              {wallet}
            </div>
            <div>
              <button
                className="border p-2 rounded-md hover:bg-slate-700 transition duration-200"
                onClick={getNFT}>
                Get NFTs
              </button>
            </div>
            <div>

              <div className="grid grid-cols-3 gap-4">
                {nftsOwned.map((nft, index) => (
                  <div key={index} className="flex flex-col items-center justify-center border rounded-md p-2">
                    <div>
                      <Image 
                      className="rounded-xl" 
                      src={nft.image} 
                      width={150} 
                      height={150} 
                      alt="" 
                      priority 
                      />
                    </div>
                    <div>
                      {nft.name}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )
          : (
            <>
              <div className="mt-6">
                <p>
                  Wallet not Connected
                </p>
              </div>
            </>
          )}
      </main>
    </>
  )
}
