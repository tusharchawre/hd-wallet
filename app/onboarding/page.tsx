"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import React, { useMemo, useState } from 'react'

const page = () => {
  const [currentState, setCurrentState] = useState(2)

  const content = useMemo(() => {
    switch (currentState) {
      case 0:
        return (
          <div className='px-4'>
            <div className='rounded-xl overflow-hidden '>
              <Image className='object-fit h-full w-full scale-90' src={"/Wallet-logo.png"} width={600} height={600} alt='Logo' />
            </div>

            <div className='text-background items-center flex flex-col w-full gap-3'>
              <p className='opacity-80'>Lets Create a Wallet for you!</p>
              <Button onClick={() => setCurrentState(1)} variant="secondary" className='w-full h-12 rounded-xl text-lg font-semibold '>
                Create A Wallet
              </Button>
            </div>
          </div>
        )

      case 1:
        return (
          <>
            <div className='border-b h-10 w-full border-accent/50 flex items-center justify-center gap-2 -translate-y-4'>
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-background/50' />

            </div>

            <div className='text-center'>
              <div className='text-background items-center flex flex-col justify-around w-full py-16 gap-4'>
                <h1 className='text-background text-xl font-semibold mt-4'>Create a Password</h1>
                <p className='text-background opacity-80 -translate-y-4'>You need a password to access the wallet</p>
                <Input className='h-12' type="password" placeholder='Enter the Password' />
                <Input type="password" className='h-12' placeholder='Confirm the Password' />
              </div>
              <Button variant="secondary" className='w-full h-12 rounded-xl text-lg font-semibold'>
                Set Password
              </Button>

            </div>
          </>
        )



      case 2:
        return (
          <>
            <div className='border-b h-10 w-full border-accent/50 flex items-center justify-center gap-2 -translate-y-4'>
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
            </div>
            <div className='flex flex-col items-center w-full px-4 py-2'>
              <h1 className='text-background text-2xl font-semibold mt-4 mb-2 text-center'>Recovery Phrase</h1>
              <p className='text-yellow-400 text-center text-sm font-medium mb-6'>
                This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!
              </p>
              <div className='grid grid-cols-3 gap-3 w-full mb-6'>
                {["define", "wheel", "flash", "quarter", "buffalo", "pigeon", "soft", "example", "apple", "love", "game", "excess"].map((word, idx) => (
                  <div
                    key={idx}
                    className='bg-background/30 border border-accent/40 rounded-lg px-3 py-2 flex items-center text-background text-sm font-medium shadow-sm'
                  >
                    <span className='mr-2 opacity-60'>{idx + 1}.</span> {word}
                  </div>
                ))}
              </div>
              <div className='flex items-center w-full mb-4'>
                <Input type='checkbox' id='savedPhrase' className='accent-accent/70 w-4 h-4 rounded mr-2' />
                <label htmlFor='savedPhrase' className='text-background text-sm opacity-60 select-none'>I saved my Recovery Phrase</label>
              </div>
              <Button className='w-full h-12 rounded-xl text-lg font-semibold opacity-40 cursor-not-allowed'>
                Continue
              </Button>
            </div>
          </>
        )

    }

  }, [currentState])


  return (
    <div className='flex items-center justify-center bg-background h-screen w-full'>
      <div className='w-96 h-fit bg-accent-foreground rounded-3xl flex flex-col justify-between items-center py-4'>
        {content}
      </div>
    </div>
  )
}

export default page