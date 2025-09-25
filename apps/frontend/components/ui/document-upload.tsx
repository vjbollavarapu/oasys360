"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, FileSpreadsheet, File, X, Shield, Hash, Paperclip } from "lucide-react"

interface DocumentUploadProps {
  linkedTo?: string
  linkedType?: string
  onUpload?: (document: any) => void
  className?: string
}

export function DocumentUpload({ linkedTo, linkedType, onUpload, className }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [documentType, setDocumentType] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.includes("image")) return <ImageIcon className="w-4 h-4" />
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="w-4 h-4" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const handleUpload = async () => {
    setIsUploading(true)

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const uploadedDocuments = files.map((file) => ({
      id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: documentType,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      linkedTo: linkedTo,
      linkedType: linkedType,
      tags: tags,
      status: "Verified",
      blockchainHash: `0x${Math.random().toString(16).substr(2, 40)}`,
      ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
      verificationStatus: "Verified",
    }))

    uploadedDocuments.forEach((doc) => onUpload?.(doc))

    // Reset form
    setFiles([])
    setDocumentType("")
    setTags([])
    setIsUploading(false)
  }

  return (
    <Card className={`bg-[#1B1D23]/50 border-[#4B0082]/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Attach Documents
        </CardTitle>
        <CardDescription className="text-[#F3F4F6]/70">
          Upload and link documents with blockchain verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-[#4B0082]/30 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-[#4B0082] mx-auto mb-2" />
          <p className="text-[#F3F4F6] text-sm mb-2">Drag files here or click to browse</p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="border-[#4B0082]/50 text-[#F3F4F6]" asChild>
              <span>Choose Files</span>
            </Button>
          </label>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Selected Files</Label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#4B0082]/10 rounded border border-[#4B0082]/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-[#00FFC6]">{getFileIcon(file)}</div>
                    <div>
                      <div className="text-sm font-medium text-[#F3F4F6]">{file.name}</div>
                      <div className="text-xs text-[#F3F4F6]/60">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Type */}
        <div className="space-y-2">
          <Label className="text-[#F3F4F6]">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1B1D23] border-[#4B0082]/30">
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="purchase-order">Purchase Order</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="bank-statement">Bank Statement</SelectItem>
              <SelectItem value="journal-entry">Journal Entry</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-[#F3F4F6]">Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="bg-[#1B1D23] border-[#4B0082]/30 text-[#F3F4F6]"
            />
            <Button onClick={addTag} variant="outline" className="border-[#4B0082]/50 text-[#F3F4F6]">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                  <Button variant="ghost" size="sm" onClick={() => removeTag(tag)} className="ml-1 h-auto p-0 text-xs">
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Blockchain Verification Info */}
        <div className="p-3 bg-[#00FFC6]/10 rounded-lg border border-[#00FFC6]/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00FFC6]" />
            <div className="text-sm text-[#F3F4F6]">Documents will be automatically verified on blockchain</div>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || !documentType || isUploading}
          className="w-full bg-[#00FFC6] text-[#1B1D23] hover:bg-[#00FFC6]/90"
        >
          {isUploading ? (
            <>
              <Hash className="w-4 h-4 mr-2 animate-spin" />
              Uploading & Verifying...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
