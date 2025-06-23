"use client"
import React, { useEffect, useState } from 'react'

import { useWalletStorage } from '@/hooks/useWallet'
import { LockScreen } from '@/components/lockScreen'
import { Wallet } from '@/components/wallet'

const page = () => {
  // const [seed, setSeed] = useState("")
  // const { getSeedPhrase, unlockWallet, isLocked, isInitialized } = useWalletStorage()

  // useEffect(()=> {
  //   (async () => await unlockWallet("tushar"))()
  // })
  
  // useEffect(() => {
  //   const fetchSeed = async () => {
  //     try {
  //       if (!isLocked && isInitialized) {
          
  //         const seedPhrase = await getSeedPhrase()
  //         if (seedPhrase) {
  //           setSeed(seedPhrase)
  //           console.log("Seed phrase:", seedPhrase)
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error getting seed phrase:", error)
  //     }
  //   }
    
  //   fetchSeed()
  // }, [isLocked, isInitialized, getSeedPhrase])
  
  return (
    <div className='w-96 h-screen bg-accent-foreground mx-auto inset-0'>
      <Wallet />
    </div>
  )
}

export default page