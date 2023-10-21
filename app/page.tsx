'use client'
import {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
} from "@nfteyez/sol-rayz";
import { MetadataKey } from "@nfteyez/sol-rayz/dist/config/metaplex";
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, clusterApiUrl } from "@solana/web3.js";
import dynamic from "next/dynamic"
import Image from "next/image";
import { useState } from "react";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
const WalletDisconnectButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
  { ssr: false }
);

type NFT = {
  atributes: [{}],
  description: string,
  image: string,
  name: string,
  properties: {},
  symbol: string,

}[];


export default function Home() {

  const { publicKey } = useWallet()
  const wallet = publicKey?.toString();

  const [nftsOwned, setNFTsOwned] = useState<any[]>([]);

  const getNFT = async () => {
    if (!publicKey) return
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const publicAddress = await resolveToWalletAddress({
      text: wallet ?? "",
      connection,
    });

    const NFTs = await getParsedNftAccountsByOwner({
      publicAddress,
      connection,
    });

    if (NFTs) {
      try {
        const nftDataArray: NFT[] = [];

        for (let i = 0; i < NFTs.length; i++) {
          fetch(NFTs[i].data.uri)
            .then((res) => res.json())
            .then((data) => {
              nftDataArray.push(data);

              if (nftDataArray.length === NFTs.length) {
                return setNFTsOwned(nftDataArray);
              }
            })
        }
        console.log(nftsOwned)
      } catch (e) {
        console.log("error with the data", e)
      }
    }

  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">

        <div className="flex flex-col items-center justify-center">
          <WalletMultiButtonDynamic />
          <WalletDisconnectButtonDynamic />
        </div>
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
            {nftsOwned && wallet ? (
              <div className="grid grid-cols-3 gap-4">
                {nftsOwned.map((nft, index) => (
                  <div key={index} className="flex flex-col items-center justify-center border rounded-md p-2">
                    <div>
                      <Image className="rounded-xl" src={nft.image} width={150} height={150} alt="" priority />
                    </div>
                    <div>
                      {nft.name}
                    </div>
                  </div>
                ))}
              </div>
            )
              : (
                "Not Connected"
              )}
          </div>
        </div>
      </main>
    </>
  )
}
