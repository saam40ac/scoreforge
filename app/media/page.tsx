import { createClient } from '@/lib/supabase/server'
import MediaLibraryClient from '@/components/admin/MediaLibraryClient'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: files } = await supabase
    .from('media_files')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  const totalSize = files?.reduce((a, f) => a + (f.file_size ?? 0), 0) ?? 0
  const fmtSize   = (b: number) => b > 1024*1024*1024 ? `${(b/(1024*1024*1024)).toFixed(1)} GB` : `${(b/(1024*1024)).toFixed(0)} MB`

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light">Media Library</h1>
          <p className="text-sm text-[#5a5548] mt-1">
            {files?.length ?? 0} file · {fmtSize(totalSize)} utilizzati
          </p>
        </div>
      </div>
      <MediaLibraryClient files={files ?? []} userId={user!.id} />
    </div>
  )
}
