"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, CheckCircle, AlertTriangle, ExternalLink, Copy, Zap } from "lucide-react"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [error, setError] = useState("")
  const [balance, setBalance] = useState("0")
  const [networkId, setNetworkId] = useState("")

  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask browser extension",
      available: typeof window !== "undefined" && window.ethereum?.isMetaMask,
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect using WalletConnect protocol",
      available: true,
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Connect using Coinbase Wallet",
      available: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
    },
  ]

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
          setBalance("2.5847") // Mock balance
          setNetworkId("1") // Ethereum Mainnet
          onConnect?.(accounts[0])
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connectMetaMask = async () => {
    if (!window.ethereum?.isMetaMask) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsConnected(true)
        setBalance("2.5847")
        setNetworkId("1")
        setShowWalletModal(false)
        onConnect?.(accounts[0])
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the connection to continue.")
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWalletConnect = async () => {
    setIsConnecting(true)
    setError("")

    try {
      // Simulate WalletConnect connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockAddress = "0x742d35Cc6634C0532925a3b8D0C9e3e4d5f6A7B8"
      setWalletAddress(mockAddress)
      setIsConnected(true)
      setBalance("1.2345")
      setNetworkId("1")
      setShowWalletModal(false)
      onConnect?.(mockAddress)
    } catch (err) {
      setError("Failed to connect via WalletConnect. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setBalance("0")
    setNetworkId("")
    setError("")
    onDisconnect?.()
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected) {
    return (
      <Card className="bg-[#1B1D23]/50 border-[#4B0082]/30">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#F3F4F6]/70">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-[#4B0082]/20 px-2 py-1 rounded text-[#00FFC6]">
                  {formatAddress(walletAddress)}
                </code>
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Badge className="bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#F3F4F6]/70">Balance</p>
              <p className="text-lg font-bold text-[#F3F4F6]">{balance} ETH</p>
            </div>
            <div>
              <p className="text-sm text-[#F3F4F6]/70">Network</p>
              <p className="text-sm text-[#F3F4F6]">Ethereum Mainnet</p>
            </div>
          </div>

          <Button
            onClick={disconnectWallet}
            variant="outline"
            className="w-full border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Button onClick={() => setShowWalletModal(true)} className="bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="bg-[#1B1D23] border-[#4B0082]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F3F4F6] flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-[#F3F4F6]/70">
              Choose your preferred wallet to connect to OASYS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => {
                  if (wallet.name === "MetaMask") {
                    connectMetaMask()
                  } else if (wallet.name === "WalletConnect") {
                    connectWalletConnect()
                  }
                }}
                disabled={!wallet.available || isConnecting}
                variant="outline"
                className="w-full justify-start h-auto p-4 border-[#4B0082]/50 text-[#F3F4F6] hover:bg-[#4B0082]/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-[#F3F4F6]/60">{wallet.description}</div>
                  </div>
                </div>
                {!wallet.available && (
                  <Badge variant="secondary" className="ml-auto">
                    Not Available
                  </Badge>
                )}
                {isConnecting && <Zap className="w-4 h-4 ml-auto animate-spin" />}
              </Button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Connection Error</p>
                  <p className="text-xs text-red-400/80 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-[#4B0082]/30">
            <p className="text-xs text-[#F3F4F6]/60">
              New to Ethereum?{" "}
              <a
                href="https://ethereum.org/en/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FFC6] hover:underline inline-flex items-center gap-1"
              >
                Learn about wallets <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
