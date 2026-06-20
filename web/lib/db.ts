import { supabase } from './supabase'

export interface Folder {
  id: number
  name: string
  date: string
  description: string | null
  brand: string
  campaign: string
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

export async function createFolder(name: string, date: string, description: string) {
  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { count } = await supabase
    .from('folders')
    .select('*', { count: 'exact', head: true })

  const thumb = folderThumbs[(count || 0) % folderThumbs.length]

  const { data, error } = await supabase
    .from('folders')
    .insert({ name, date, description, thumb, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as Folder
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
