export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    game_state: Json | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    game_state?: Json | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    game_state?: Json | null
                }
            }
            music_metadata: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    title: string
                    description: string | null
                    status: 'draft' | 'published' | 'archived' | 'fragment'
                    external_url: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    title: string
                    description?: string | null
                    status?: 'draft' | 'published' | 'archived' | 'fragment'
                    external_url?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    status?: 'draft' | 'published' | 'archived' | 'fragment'
                    external_url?: string | null
                    metadata?: Json | null
                }
            }
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserProfile = Profile
export type MusicTrack = Database['public']['Tables']['music_metadata']['Row']
