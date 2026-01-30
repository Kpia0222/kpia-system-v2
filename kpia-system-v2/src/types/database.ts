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
export type UserProfile = Profile & {
    display_id?: string | null
}
export type MusicTrack = Database['public']['Tables']['music_metadata']['Row']

// Social Features
export interface FriendRequest {
    id: string
    from_user_id: string
    from_display_id: string
    to_user_id: string
    status: 'pending' | 'accepted' | 'rejected'
    created_at: string
}

export interface UniverseBeacon {
    id: string
    owner_user_id: string
    owner_display_id: string
    target_user_id: string
    position: { x: number; y: number; z: number }
    message: string
    created_at: string
}

export interface SocialData {
    display_id: string | null
    friends: string[] // Array of user IDs
    pending_requests: FriendRequest[]
    beacons: UniverseBeacon[]
}
