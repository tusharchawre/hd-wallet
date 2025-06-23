import Image from "next/image"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export const LockScreen = () => {
    return (
        <>
        <div className="flex flex-col h-full w-full items-center justify-between px-4 py-8">

        <div className="flex-col relative w-full h-full flex items-center justify-center py-8">
            <Image src={"/Wallet-logo.png"} alt="Wallet Logo" width={800} height={800} />
            <p className="text-accent/70 text-xl mb-4">Enter Your Password</p>
            <Input
                  className='h-12 rounded-xl'
                  type="password"
                  placeholder='Password'
                  />

        </div>

        <Button variant="secondary" className="w-full text-xl rounded-xl h-12"> 
            Unlock
        </Button>

                  </div>
        </>
    )
}