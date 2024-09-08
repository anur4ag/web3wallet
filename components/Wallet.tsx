"use client";

import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import {derivePath} from "ed25519-hd-key"
import nacl from "tweetnacl"
import { Keypair } from "@solana/web3.js";
import {HDNodeWallet} from "ethers"
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

enum WalletType {
  SOLANA = "SOLANA",
  ETHEREUM = "ETHEREUM",
}

interface wallet {
  walletType: WalletType
  publicKey: string;
  secretKey: string;
  walletNumber: number;
}


const Wallet = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [solanaWalletNumber, setSolanaWalletNumber] = useState<number>(0);
  const [ethereumWalletNumber, setEthereumWalletNumber] = useState<number>(0);
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setWallets([]);
    setSolanaWalletNumber(0);
    setEthereumWalletNumber(0);
  }, [mnemonic]);

  const generateNewWallet = async (walletType: WalletType) => {
    if(!mnemonic) return;
    setIsGenerating(true);
    switch (walletType) {
      case WalletType.SOLANA:
        const solanaWallet = createSolanaWallet(mnemonic, solanaWalletNumber);
        setSolanaWalletNumber(solanaWalletNumber + 1);
        setWallets([...wallets, solanaWallet]);
        break;
      case WalletType.ETHEREUM:
        const ethereumWallet = createEthereumWallet(mnemonic, ethereumWalletNumber);
        setEthereumWalletNumber(ethereumWalletNumber + 1);
        setWallets([...wallets, ethereumWallet]);
        break;
      default:
        break;
    }
    setIsGenerating(false);
  }

  const generateNewMnemonic = () => {
    setMnemonic(generateMnemonic());
  };
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Mnemonic</h2>
        <div className="flex gap-2 items-center">
          <div className="bg-white p-2 rounded flex-grow">{mnemonic || 'No mnemonic generated'}</div>
          <Button 
            onClick={() => generateNewMnemonic()} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Generate Mnemonic
          </Button>
        </div>
      </div>
      {mnemonic && (
        <div className="mb-6 gap-8 flex">
          <Button 
            onClick={() => generateNewWallet(WalletType.SOLANA)} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Solana Wallet'}
          </Button>
          <Button 
            onClick={() => generateNewWallet(WalletType.ETHEREUM)} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Ethereum Wallet'}
          </Button>
        </div>
      )}
      {wallets.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Generated Wallets</h2>
          <div className="space-y-4">
            {wallets.map((w) => (
              <div key={w.publicKey} className="bg-gray-100 p-4 rounded-lg">
                <div className="font-semibold">Wallet Type:</div>
                <div className="break-all">{w.walletType}</div>
                <div className="font-semibold">Wallet Number:</div>
                <div className="break-all">{w.walletNumber+1}</div>
                <div className="font-semibold">Public Key:</div>
                <div className="break-all">{w.publicKey}</div>
                <div className="font-semibold mt-2">Secret Key:</div>
                <div className="break-all">{w.secretKey}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );};

const createSolanaWallet = (mnemonic: string, walletNumber: number) =>{
  const seed = mnemonicToSeedSync(mnemonic);
  const derivationPath = `m/44'/501'/${walletNumber}'/0'`;
  const derievedSeed = derivePath(derivationPath, seed.toString("hex")).key
  const secretKey = nacl.sign.keyPair.fromSeed(derievedSeed).secretKey
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey.toBase58()
  const base58SecretKey = Buffer.from(secretKey).toString("base64")
  return {
    secretKey: base58SecretKey,
    publicKey,
    walletType: WalletType.SOLANA,
    walletNumber: walletNumber
  }
}

const createEthereumWallet = (mnemonic: string, walletNumber: number) =>{
  const seed = mnemonicToSeedSync(mnemonic);
  const derivationPath = `m/44'/60'/${walletNumber}'/0'`;
  const hdNode = HDNodeWallet.fromSeed(seed)
  const child = hdNode.derivePath(derivationPath)
  return {
    secretKey: child.privateKey,
    publicKey: child.address,
    walletType: WalletType.ETHEREUM,
    walletNumber: walletNumber
  }
}

export default Wallet;
