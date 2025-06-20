"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {generateMnemonic} from "bip39"

const page = () => {
  const [currentState, setCurrentState] = useState(0)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savedPhrase, setSavedPhrase] = useState(false)
  const [direction, setDirection] = useState(1)
  const [mnemonics , setMnemonics] = useState<Array<string>>([])

  useEffect(()=> {
    const string = generateMnemonic()
    const stringArray = string.split(" ")
    setMnemonics(stringArray)
  })

  const passwordValidation = useMemo(() => {
    const isEmpty = password.trim() === "" || confirmPassword.trim() === ""
    const doNotMatch = password !== confirmPassword
    const tooShort = password.length < 6

    return {
      isValid: !isEmpty && !doNotMatch && !tooShort,
      errors: {
        isEmpty,
        doNotMatch,
        tooShort
      }
    }
  }, [password, confirmPassword])

  const pageVariants = {
    enter: (direction: any) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: "0%",
      opacity: 1,
    },
    exit: (direction: any) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

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
              <Button onClick={() => {
                setDirection(1)
                setCurrentState(1)
              }} variant="secondary" className='w-full h-12 rounded-xl text-lg font-semibold '>
                Create A Wallet
              </Button>
            </div>
          </div>
        )

      case 1:
        return (
          <>
            <div className='border-b h-10 w-full relative border-accent/50 flex items-center justify-center gap-2 -translate-y-4'>
              <ArrowLeft onClick={() => {
                setDirection(-1)
                setCurrentState((e) => e - 1)
              }} className='text-accent/80 cursor-pointer absolute left-4 my-auto h-full' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-background/50' />
            </div>

            <div className='text-center'>
              <div className='text-background items-center flex flex-col justify-around w-full py-16 gap-4'>
                <h1 className='text-background text-xl font-semibold mt-4'>Create a Password</h1>
                <p className='text-background opacity-80 -translate-y-4'>You need a password to access the wallet</p>
                <Input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='h-12'
                  type="password"
                  placeholder='Enter the Password (min 6 characters)'
                />
                <Input
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='h-12'
                  type="password"
                  placeholder='Confirm the Password'
                />

              </div>

              <Button
                onClick={() => {
                  setDirection(1)
                  setCurrentState(2)
                }}
                disabled={!passwordValidation.isValid}
                variant="secondary"
                className={`w-full h-12 rounded-xl text-lg font-semibold transition-opacity ${!passwordValidation.isValid ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                  }`}
              >
                Set Password
              </Button>
            </div>
          </>
        )

      case 2:
        return (
          <>
            <div className='border-b h-10 w-full relative border-accent/50  flex items-center justify-center gap-2 -translate-y-4'>
              <ArrowLeft onClick={() => {
                setDirection(-1)
                setCurrentState((e) => e - 1)
              }} className='text-accent/80 cursor-pointer absolute left-4 my-auto h-full' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
              <div className='w-3 h-3 rounded-full bg-accent/70' />
            </div>
            <div className='flex flex-col items-center w-full px-4 py-2'>
              <h1 className='text-background text-2xl font-semibold mt-4 mb-2 text-center'>Recovery Phrase</h1>
              <p className='text-accent text-center text-sm font-medium mb-6'>
                This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!
              </p>
              <div className='grid grid-cols-3 gap-3 w-full mb-6'>
                {mnemonics.map((word, idx) => (
                  <div
                    key={idx}
                    className='bg-background/30 border border-accent/40 rounded-lg px-3 py-2 flex items-center text-background text-sm font-medium shadow-sm'
                  >
                    <span className='mr-2 opacity-60'>{idx + 1}.</span> {word}
                  </div>
                ))}
              </div>
              <div className='flex items-center w-full mb-4'>
                <input
                  type='checkbox'
                  id='savedPhrase'
                  checked={savedPhrase}
                  onChange={(e) => setSavedPhrase(e.target.checked)}
                  className='w-4 h-4 rounded mr-2'
                />
                <label htmlFor='savedPhrase' className='text-background text-sm opacity-60 select-none cursor-pointer'>
                  I saved my Recovery Phrase
                </label>
              </div>
              <Button
                disabled={!savedPhrase}
                variant="secondary"
                onClick={() => {
                  console.log('Wallet created successfully!')
                }}
                className={`w-full h-12 rounded-xl text-lg font-semibold transition-opacity ${savedPhrase ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
              >
                Continue
              </Button>
            </div>
          </>
        )

      default:
        return null
    }
  }, [currentState, passwordValidation.isValid, passwordValidation.errors, password, confirmPassword, savedPhrase])

  return (
    <div className='flex items-center justify-center bg-background h-screen w-full'>
      <motion.div
        className='w-96 h-fit bg-accent-foreground rounded-3xl overflow-hidden relative'
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            className='w-full h-full flex flex-col justify-between items-center py-4'
            key={currentState}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default page