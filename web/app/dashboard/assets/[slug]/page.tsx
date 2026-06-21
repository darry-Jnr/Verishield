'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Image, Film, FileText, Download, Calendar, Building2, Folder, Upload } from 'lucide-react'
import { getFolders, getFiles, type Folder as FolderRecord, type FileRecord } from '@/lib/db'
import UploadModal from '@/components/modal/upload'
import FileDetailModal from '@/components/modal/file-detail'

const typeIcon: Record<string, typeof Image> = { image: Image, video: Film, document: FileText, application: FileText }

export default function AssetDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null)
  const [folder, setFolder] = useState<FolderRecord | null>(null)
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  const folderId = Number(slug)

  const loadFiles = useCallback(async () => {
    if (isNaN(folderId)) return
    try {
      const data = await getFiles(folderId)
      setFiles(data)
    } catch (e) {
      console.error(e)
    }
  }, [folderId])

  useEffect(() => {
    if (isNaN(folderId)) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      getFolders().then((all) => all.find((f) => f.id === folderId) || null),
      getFiles(folderId),
    ])
      .then(([folderData, filesData]) => {
        setFolder(folderData)
        setFiles(filesData)
      })
      .finally(() => setLoading(false))
  }, [folderId])

  if (isNaN(folderId)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-secondary text-sm">Invalid folder ID.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-secondary text-sm">Loading...</p>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-secondary text-sm">Folder not found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-muted hover:text-primary transition-all text-xs mb-3 cursor-pointer opacity-60 hover:opacity-100">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Assets
          </button>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-primary">{folder.name}</h1>
            <button onClick={() => setShowUpload(true)} className="btn-primary self-start text-sm shrink-0">
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {folder.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {folder.brand || '—'}
            </span>
            <span className="flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5" />
              {folder.campaign || '—'}
            </span>
            <span className="text-muted/50">{files.length} file{files.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((f) => {
              const FileIcon = typeIcon[f.type as keyof typeof typeIcon] || FileText
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className="group relative aspect-square bg-elevated border border-subtle rounded-xl overflow-hidden hover:border-zinc-600 transition-colors cursor-pointer"
                >
                  {f.type === 'image' ? (
                    <img src={f.url} alt={f.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${f.thumb} flex items-center justify-center`}>
                      <FileIcon className="h-10 w-10 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 text-white/0 group-hover:text-white/90 transition-all p-1.5 hover:scale-110 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                    <p className="text-white text-xs font-medium truncate">{f.name}</p>
                    <p className="text-white/50 text-[11px] mt-0.5">{f.size}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} onUpload={loadFiles} folderId={folderId} />
      <FileDetailModal
        open={!!selectedFile}
        file={selectedFile}
        files={files}
        onClose={() => setSelectedFile(null)}
        onDeleted={loadFiles}
        onRenamed={loadFiles}
        onNavigate={setSelectedFile}
      />
    </div>
  )
}
