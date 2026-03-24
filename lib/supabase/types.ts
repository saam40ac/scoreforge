export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          professional_title: string | null
          city: string | null
          public_email: string | null
          website: string | null
          short_bio: string | null
          long_bio: string | null
          avatar_url: string | null
          skills: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      portfolios: {
        Row: {
          id: string
          owner_id: string
          title: string
          slug: string
          status: 'draft' | 'published' | 'private'
          theme: 'dark' | 'ivory' | 'neon'
          accent_color: string
          target: string | null
          description: string | null
          bio: string | null
          video_url: string | null
          downloads_disabled: boolean
          noindex: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['portfolios']['Row'], 'id' | 'view_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['portfolios']['Insert']>
      }
      projects: {
        Row: {
          id: string
          portfolio_id: string
          title: string
          project_type: string | null
          emoji: string
          description: string | null
          cover_url: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      tracks: {
        Row: {
          id: string
          portfolio_id: string
          title: string
          genre: string | null
          duration_label: string | null
          file_url: string | null
          waveform_data: number[] | null
          sort_order: number
          play_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tracks']['Row'], 'id' | 'play_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>
      }
      media_files: {
        Row: {
          id: string
          owner_id: string
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          media_type: 'audio' | 'image' | 'document'
          storage_path: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['media_files']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['media_files']['Insert']>
      }
    }
  }
}

// Tipi derivati utili
export type Profile   = Database['public']['Tables']['profiles']['Row']
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type Project   = Database['public']['Tables']['projects']['Row']
export type Track     = Database['public']['Tables']['tracks']['Row']
export type MediaFile = Database['public']['Tables']['media_files']['Row']

export type PortfolioWithContent = Portfolio & {
  projects: Project[]
  tracks: Track[]
}
