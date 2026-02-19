// ============================================================
// DB-006: Database Types
// ============================================================
// Generated from the Supabase schema.
// Re-run with: pnpm db:types
// Do NOT edit manually — regenerate after schema changes.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      x_accounts: {
        Row: {
          id: string;
          user_id: string;
          x_user_id: string;
          x_username: string;
          x_display_name: string | null;
          x_profile_image_url: string | null;
          oauth_access_token_enc: string;
          oauth_refresh_token_enc: string;
          token_expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          x_user_id: string;
          x_username: string;
          x_display_name?: string | null;
          x_profile_image_url?: string | null;
          oauth_access_token_enc: string;
          oauth_refresh_token_enc: string;
          token_expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          x_user_id?: string;
          x_username?: string;
          x_display_name?: string | null;
          x_profile_image_url?: string | null;
          oauth_access_token_enc?: string;
          oauth_refresh_token_enc?: string;
          token_expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'x_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      news_sites: {
        Row: {
          id: string;
          x_account_id: string;
          name: string;
          url: string;
          source_type: 'rss' | 'html' | 'auto';
          feed_url: string | null;
          scraping_config: Json | null;
          scraping_interval_hours: number;
          is_active: boolean;
          last_scraped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          x_account_id: string;
          name: string;
          url: string;
          source_type?: 'rss' | 'html' | 'auto';
          feed_url?: string | null;
          scraping_config?: Json | null;
          scraping_interval_hours?: number;
          is_active?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          x_account_id?: string;
          name?: string;
          url?: string;
          source_type?: 'rss' | 'html' | 'auto';
          feed_url?: string | null;
          scraping_config?: Json | null;
          scraping_interval_hours?: number;
          is_active?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'news_sites_x_account_id_fkey';
            columns: ['x_account_id'];
            isOneToOne: false;
            referencedRelation: 'x_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      scraped_articles: {
        Row: {
          id: string;
          news_site_id: string;
          url: string;
          title: string;
          summary: string | null;
          published_at: string | null;
          is_processed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          news_site_id: string;
          url: string;
          title: string;
          summary?: string | null;
          published_at?: string | null;
          is_processed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          news_site_id?: string;
          url?: string;
          title?: string;
          summary?: string | null;
          published_at?: string | null;
          is_processed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scraped_articles_news_site_id_fkey';
            columns: ['news_site_id'];
            isOneToOne: false;
            referencedRelation: 'news_sites';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_suggestions: {
        Row: {
          id: string;
          article_id: string;
          x_account_id: string;
          suggestion_text: string;
          hashtags: string[];
          status: 'pending' | 'approved' | 'rejected' | 'posted';
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          x_account_id: string;
          suggestion_text: string;
          hashtags?: string[];
          status?: 'pending' | 'approved' | 'rejected' | 'posted';
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          x_account_id?: string;
          suggestion_text?: string;
          hashtags?: string[];
          status?: 'pending' | 'approved' | 'rejected' | 'posted';
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_suggestions_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'scraped_articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_suggestions_x_account_id_fkey';
            columns: ['x_account_id'];
            isOneToOne: false;
            referencedRelation: 'x_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_suggestions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          x_account_id: string;
          ai_suggestion_id: string | null;
          content: string;
          x_post_id: string | null;
          x_post_url: string | null;
          status: 'published' | 'failed';
          error_message: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          x_account_id: string;
          ai_suggestion_id?: string | null;
          content: string;
          x_post_id?: string | null;
          x_post_url?: string | null;
          status: 'published' | 'failed';
          error_message?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          x_account_id?: string;
          ai_suggestion_id?: string | null;
          content?: string;
          x_post_id?: string | null;
          x_post_url?: string | null;
          status?: 'published' | 'failed';
          error_message?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_x_account_id_fkey';
            columns: ['x_account_id'];
            isOneToOne: false;
            referencedRelation: 'x_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_ai_suggestion_id_fkey';
            columns: ['ai_suggestion_id'];
            isOneToOne: false;
            referencedRelation: 'ai_suggestions';
            referencedColumns: ['id'];
          },
        ];
      };
      scraping_runs: {
        Row: {
          id: string;
          news_site_id: string;
          status: 'running' | 'success' | 'failed';
          articles_found: number;
          started_at: string;
          finished_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          news_site_id: string;
          status?: 'running' | 'success' | 'failed';
          articles_found?: number;
          started_at?: string;
          finished_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          news_site_id?: string;
          status?: 'running' | 'success' | 'failed';
          articles_found?: number;
          started_at?: string;
          finished_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scraping_runs_news_site_id_fkey';
            columns: ['news_site_id'];
            isOneToOne: false;
            referencedRelation: 'news_sites';
            referencedColumns: ['id'];
          },
        ];
      };
      oauth_state: {
        Row: {
          id: string;
          user_id: string;
          code_verifier: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code_verifier: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code_verifier?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'oauth_state_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ============================================================
// Convenience type aliases for use throughout the backend
// ============================================================

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type UserProfile = Tables<'user_profiles'>;
export type UserRole = Tables<'user_roles'>;
export type XAccount = Tables<'x_accounts'>;
export type NewsSite = Tables<'news_sites'>;
export type ScrapedArticle = Tables<'scraped_articles'>;
export type AiSuggestion = Tables<'ai_suggestions'>;
export type Post = Tables<'posts'>;
export type ScrapingRun = Tables<'scraping_runs'>;
export type OauthState = Tables<'oauth_state'>;
