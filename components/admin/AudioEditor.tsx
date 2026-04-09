import AudioEditor from '@/components/admin/AudioEditor'

<AudioEditor
  fileUrl={track.file_url}
  fileName={track.title + '.wav'}
  onClose={() => setEditing(false)}
  onSave={(blob, name) => {
    // carica il file processato su Supabase Storage
    // e aggiorna track.file_url
  }}
/>
