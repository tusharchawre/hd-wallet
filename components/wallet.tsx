"use client"
import { Copy } from "lucide-react"
import Image from "next/image"
import Avatar from "./home/Avatar"
import BottomNav from "./home/bottomNav"

export const Wallet = () => {
    return(
        <div className='relative w-full h-full'>
        <Avatar />
        <BottomNav />
        </div>
    )
}