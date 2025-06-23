import { ArrowDownUp, Home } from 'lucide-react'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const tabs = [
    { key: 'home', icon: Home, label: 'Home' },
    { key: 'swap', icon: ArrowDownUp, label: 'Swap' },
]

const BottomNav = () => {
    const [activeTab, setActiveTab] = useState("home")

    return (
        <div className='w-full h-16 absolute bottom-0 border-t border-t-background/50'>
            <div className='flex h-full items-center justify-around'>
                {tabs.map(({ key, icon: Icon, label }) => (
                    <div
                        key={key}
                        className='relative h-full w-full items-center flex justify-center cursor-pointer select-none'
                        onClick={() => setActiveTab(key)}
                    >
                        <AnimatePresence mode="popLayout">
                            {activeTab === key && (
                                <motion.div
                                    layoutId='highlight'
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    className='absolute z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 h-10 rounded-2xl bg-accent/30 border-[0.5] border-accent/40'
                                />
                            )}
                        </AnimatePresence>
                        <div className='relative flex items-center justify-center z-20 gap-2'>
                            <Icon className='text-accent text-center' size={24} />
                            <AnimatePresence>
                                {activeTab === key && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        className='text-accent font-semibold text-sm whitespace-nowrap overflow-hidden'
                                    >
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BottomNav