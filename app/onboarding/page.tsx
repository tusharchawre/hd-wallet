"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { generateMnemonic } from "bip39"
import useMeasure from 'react-use-measure'
import { useWalletStorage } from '@/hooks/useWallet'

const OnboardingPage = () => {
  const [currentState, setCurrentState] = useState(0)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savedPhrase, setSavedPhrase] = useState(false)
  const [direction, setDirection] = useState(1)
  const [mnemonics, setMnemonics] = useState<Array<string>>([])
  const [ref, bounds] = useMeasure()
  const [isCreating, setIsCreating] = useState(false)
  const [creationSuccess, setCreationSuccess] = useState(false)

  // Use the wallet storage hook
  const {
    isLoading: walletLoading,
    error: walletError,
    initializeWallet,
    isInitialized
  } = useWalletStorage()

  // Track if we've completed initial load check
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Generate mnemonic on component mount
  useEffect(() => {
    const string = generateMnemonic()
    const stringArray = string.split(" ")
    setMnemonics(stringArray)

    const copyToClip = async () => {
      try {
        await navigator.clipboard.writeText(string)
        console.log('Mnemonic copied to clipboard')
      } catch (err) {
        console.log('Failed to copy to clipboard:', err)
      }
    }

    copyToClip()
  }, [])

  // Handle initial load and redirect logic
  useEffect(() => {
    // Once wallet loading is complete, mark initial load as done
    if (!walletLoading && !initialLoadComplete) {
      setInitialLoadComplete(true)
      
      // If wallet is already initialized, redirect
      if (isInitialized) {
        console.log('Wallet already initialized, redirecting...')
        // You can use router.push('/wallet') or window.location.href = '/wallet'
      }
    }
  }, [walletLoading, isInitialized, initialLoadComplete])

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

  // Handle wallet creation
  const handleCreateWallet = async () => {
    if (!savedPhrase || !passwordValidation.isValid) return

    setIsCreating(true)
    try {
      const mnemonicString = mnemonics.join(' ')
      const success = await initializeWallet(password, mnemonicString)
      
      if (success) {
        setCreationSuccess(true)
        // Clear sensitive data from memory
        setPassword("")
        setConfirmPassword("")
        
        // Redirect after brief success message
        setTimeout(() => {
          console.log('Wallet created successfully! Redirecting...')
          // Redirect to main wallet interface
          // router.push('/wallet') or window.location.href = '/wallet'
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setIsCreating(false)
    }
  }

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
    // Show success screen
    if (creationSuccess) {
      return (
        <div className='px-4 flex flex-col items-center justify-center py-16'>
          <CheckCircle className='text-green-500 w-16 h-16 mb-4' />
          <h1 className='text-background text-xl font-semibold mb-2'>Wallet Created!</h1>
          <p className='text-background opacity-80 text-center'>
            Your wallet has been successfully created and secured.
          </p>
        </div>
      )
    }

    switch (currentState) {
      case 0:
        return (
          <div className='px-4'>
            <motion.div className='rounded-xl overflow-hidden '>
              <Image draggable="false" className='object-fit h-full w-full scale-90' src={"/Wallet-logo.png"} width={800} height={800} alt='Logo' />
            </motion.div>

            <div className='text-background items-center flex flex-col w-full gap-3'>
              <p className='opacity-80'>Lets Create a Wallet for you!</p>
              <Button 
                onClick={() => {
                  setDirection(1)
                  setCurrentState(1)
                }} 
                variant="secondary" 
                className='w-full h-12 rounded-xl text-lg font-semibold'
                disabled={walletLoading}
              >
                {walletLoading ? 'Loading...' : 'Create A Wallet'}
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
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentState >= idx
                    ? 'bg-accent/70'
                    : 'bg-background/50'
                    }`}
                />
              ))}
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

                {/* Password validation feedback */}
                {password && (
                  <div className='text-sm text-left w-full'>
                    {passwordValidation.errors.tooShort && (
                      <p className='text-red-400 flex items-center gap-1'>
                        <AlertCircle className='w-3 h-3' />
                        Password must be at least 6 characters
                      </p>
                    )}
                    {passwordValidation.errors.doNotMatch && confirmPassword && (
                      <p className='text-red-400 flex items-center gap-1'>
                        <AlertCircle className='w-3 h-3' />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
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
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentState >= idx
                    ? 'bg-accent/70'
                    : 'bg-background/50'
                    }`}
                />
              ))}
            </div>
            
            <div className='flex flex-col items-center w-full px-4 py-2'>
              <h1 className='text-background text-2xl font-semibold mt-4 mb-2 text-center'>Recovery Phrase</h1>
              <p className='text-accent text-center text-sm font-medium mb-6'>
                This phrase is the ONLY way to recover your wallet. Do NOT share it with anyone!
              </p>

              <div className='grid grid-cols-3 gap-3 w-full relative mb-6 blur-md hover:blur-none transition-all'>
                {mnemonics.map((word, idx) => (
                  <div
                    key={idx}
                    className={`bg-background/30 border border-accent/40 rounded-lg px-3 py-2 flex items-center text-background text-sm font-medium shadow-sm transition-all duration-200 select-none`}
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

              {/* Error display */}
              {walletError && (
                <div className='text-red-400 text-sm mb-4 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {walletError}
                </div>
              )}

              <Button
                disabled={!savedPhrase || isCreating || walletLoading}
                variant="secondary"
                onClick={handleCreateWallet}
                className={`w-full h-12 rounded-xl text-lg font-semibold transition-opacity ${
                  savedPhrase && !isCreating && !walletLoading 
                    ? 'opacity-100 cursor-pointer' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
              </Button>
            </div>
          </>
        )

      default:
        return null
    }
  }, [
    currentState, 
    passwordValidation, 
    password, 
    confirmPassword, 
    savedPhrase, 
    mnemonics, 
    walletError, 
    isCreating, 
    walletLoading,
    creationSuccess
  ])

  // Show loading screen only on initial load, not after user interactions
  if (!initialLoadComplete && walletLoading) {
    return (
      <div className='flex items-center justify-center bg-background h-screen w-full'>
        <div className='w-96 h-96 bg-accent-foreground rounded-3xl flex items-center justify-center'>
          <div className='text-background text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4'></div>
            <p>Checking wallet status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center bg-background h-screen w-full'>
      <motion.div
        initial={{height: "70vh"}} 
        animate={{ height: bounds.height }}
        className='w-96 h-fit bg-accent-foreground rounded-3xl overflow-hidden relative transition-all'>
        <motion.div ref={ref} className="overflow-hidden w-full relative">
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
      </motion.div>
    </div>
  )
}

export default OnboardingPage