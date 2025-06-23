import { Copy } from 'lucide-react'
import Image from 'next/image'

const Avatar = () => {
    return (
        <div className="w-full gap-4 h-16 px-4 flex items-center border-b-[0.5px] border-background/30">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-black overflow-hidden">
                <Image src={"/User.png"} height={100} width={100} alt="User" className="w-full h-full object-cover" />
            </div>
            {/* Account */}
            <div className="">
                <p className="text-background/40 text-sm">@TusharChawre</p>
                <div className="flex group gap-2 items-center">
                    <p className="text-accent text-sm">Account 1</p>
                    <Copy className="text-accent/40 group-hover:text-accent" size={12} />
                </div>
            </div>
        </div>
    )
}

export default Avatar