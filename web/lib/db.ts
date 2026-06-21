import { supabase } from './supabase'

export interface Folder {
  id: number
  name: string
  date: string
  description: string | null
  brand: string
  campaign: string
  category: string | null
  price: number | null
  status: string
  thumb: string
  created_at: string
}

export interface FileRecord {
  id: number
  folder_id: number
  name: string
  type: string
  size: string
  thumb: string
  url: string
  storage_path: string
  status: string
  tracking_id: string | null
  created_at: string
}

const folderThumbs = [
  'from-rose-500/20 to-orange-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-violet-500/20 to-purple-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-amber-500/20 to-yellow-500/20',
  'from-pink-500/20 to-red-500/20',
]

const fileThumbs: Record<string, string> = {
  image: 'from-rose-500/30 to-orange-500/30',
  video: 'from-blue-500/30 to-cyan-500/30',
  application: 'from-violet-500/30 to-purple-500/30',
}

export async function getFolders() {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Folder[]
}

export async function createFolder(name: string, date: string, category?: string, price?: number) {
  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { count } = await supabase
    .from('folders')
    .select('*', { count: 'exact', head: true })

  const thumb = folderThumbs[(count || 0) % folderThumbs.length]

  const { data, error } = await supabase
    .from('folders')
    .insert({ name, date, category: category || null, price: price || null, thumb, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as Folder
}

export async function getFileStats() {
  const { data, error } = await supabase
    .from('files')
    .select('status')

  if (error) throw error
  const all = data as { status: string }[]
  return {
    total: all.length,
    processing: all.filter((f) => f.status === 'processing').length,
    secured: all.filter((f) => f.status === 'secured').length,
    failed: all.filter((f) => f.status === 'failed').length,
    threatCount: all.filter((f) => f.status === 'failed').length,
  }
}

export async function getRecentFiles(limit = 5) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as FileRecord[]
}

export async function getFiles(folderId: number) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as FileRecord[]
}

export async function uploadFiles(
  folderId: number,
  files: { file: File; name: string; type: string; size: string }[],
) {
  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id
  if (!userId) throw new Error('Not authenticated')

  const records: {
    folder_id: number
    name: string
    type: string
    size: string
    thumb: string
    url: string
    storage_path: string
    user_id: string
    status: string
  }[] = []

  for (const f of files) {
    const storage_path = `${folderId}/${Date.now()}-${f.file.name}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storage_path, f.file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(storage_path)

    records.push({
      folder_id: folderId,
      name: f.name,
      type: f.type.split('/')[0],
      size: f.size,
      thumb: fileThumbs[f.type.split('/')[0]] || 'from-zinc-500/30 to-zinc-600/30',
      url: urlData.publicUrl,
      storage_path,
      user_id: userId,
      status: 'processing',
    })
  }

  if (records.length > 0) {
    const { error } = await supabase.from('files').insert(records)
    if (error) throw error
  }
}

export async function renameFile(fileId: number, newName: string) {
  const { error } = await supabase
    .from('files')
    .update({ name: newName })
    .eq('id', fileId)

  if (error) throw error
}

export interface ScanResult {
  id: number
  tracking_id: string
  file_id: number
  user_id: string
  matched_url: string
  matched_image_url: string
  page_title: string | null
  site_email: string | null
  impact_summary: string | null
  detected_at: string
}

export async function getScanResults() {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .order('detected_at', { ascending: false })

  if (error) throw error
  return data as ScanResult[]
}

export async function deleteFile(file: FileRecord) {
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove([file.storage_path])

  if (storageError) throw storageError

  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', file.id)

  if (dbError) throw dbError
}
