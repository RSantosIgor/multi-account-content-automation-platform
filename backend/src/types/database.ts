export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          article_id: string;
          article_summary: Json | null;
          created_at: string;
          hashtags: string[];
          id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          suggestion_text: string;
          updated_at: string;
          x_account_id: string;
        };
        Insert: {
          article_id: string;
          article_summary?: Json | null;
          created_at?: string;
          hashtags?: string[];
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          suggestion_text: string;
          updated_at?: string;
          x_account_id: string;
        };
        Update: {
          article_id?: string;
          article_summary?: Json | null;
          created_at?: string;
          hashtags?: string[];
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          suggestion_text?: string;
          updated_at?: string;
          x_account_id?: string;
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
        ];
      };
      news_sites: {
        Row: {
          created_at: string;
          feed_url: string | null;
          id: string;
          is_active: boolean;
          last_scraped_at: string | null;
          name: string;
          scraping_config: Json | null;
          scraping_interval_hours: number;
          source_type: string;
          updated_at: string;
          url: string;
          x_account_id: string;
        };
        Insert: {
          created_at?: string;
          feed_url?: string | null;
          id?: string;
          is_active?: boolean;
          last_scraped_at?: string | null;
          name: string;
          scraping_config?: Json | null;
          scraping_interval_hours?: number;
          source_type?: string;
          updated_at?: string;
          url: string;
          x_account_id: string;
        };
        Update: {
          created_at?: string;
          feed_url?: string | null;
          id?: string;
          is_active?: boolean;
          last_scraped_at?: string | null;
          name?: string;
          scraping_config?: Json | null;
          scraping_interval_hours?: number;
          source_type?: string;
          updated_at?: string;
          url?: string;
          x_account_id?: string;
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
      oauth_state: {
        Row: {
          code_verifier: string;
          expires_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          code_verifier: string;
          expires_at: string;
          id?: string;
          user_id: string;
        };
        Update: {
          code_verifier?: string;
          expires_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          ai_suggestion_id: string | null;
          content: string;
          created_at: string;
          error_message: string | null;
          id: string;
          published_at: string | null;
          status: string;
          updated_at: string;
          x_account_id: string;
          x_post_id: string | null;
          x_post_url: string | null;
        };
        Insert: {
          ai_suggestion_id?: string | null;
          content: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          published_at?: string | null;
          status: string;
          updated_at?: string;
          x_account_id: string;
          x_post_id?: string | null;
          x_post_url?: string | null;
        };
        Update: {
          ai_suggestion_id?: string | null;
          content?: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          published_at?: string | null;
          status?: string;
          updated_at?: string;
          x_account_id?: string;
          x_post_id?: string | null;
          x_post_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_ai_suggestion_id_fkey';
            columns: ['ai_suggestion_id'];
            isOneToOne: false;
            referencedRelation: 'ai_suggestions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_x_account_id_fkey';
            columns: ['x_account_id'];
            isOneToOne: false;
            referencedRelation: 'x_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      prompt_rules: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          priority: number;
          prompt_text: string;
          rule_name: string;
          rule_type: string;
          updated_at: string;
          x_account_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          priority?: number;
          prompt_text: string;
          rule_name: string;
          rule_type: string;
          updated_at?: string;
          x_account_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          priority?: number;
          prompt_text?: string;
          rule_name?: string;
          rule_type?: string;
          updated_at?: string;
          x_account_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prompt_rules_x_account_id_fkey';
            columns: ['x_account_id'];
            isOneToOne: false;
            referencedRelation: 'x_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      scraped_articles: {
        Row: {
          created_at: string;
          full_article_content: string | null;
          id: string;
          is_processed: boolean;
          news_site_id: string;
          published_at: string | null;
          summary: string | null;
          title: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          full_article_content?: string | null;
          id?: string;
          is_processed?: boolean;
          news_site_id: string;
          published_at?: string | null;
          summary?: string | null;
          title: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          full_article_content?: string | null;
          id?: string;
          is_processed?: boolean;
          news_site_id?: string;
          published_at?: string | null;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          url?: string;
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
      scraping_runs: {
        Row: {
          articles_found: number;
          created_at: string;
          error_message: string | null;
          finished_at: string | null;
          id: string;
          news_site_id: string;
          started_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          articles_found?: number;
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          news_site_id: string;
          started_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          articles_found?: number;
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          news_site_id?: string;
          started_at?: string;
          status?: string;
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
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      x_accounts: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          oauth_access_token_enc: string;
          oauth_refresh_token_enc: string;
          token_expires_at: string | null;
          updated_at: string;
          user_id: string;
          x_display_name: string | null;
          x_profile_image_url: string | null;
          x_user_id: string;
          x_username: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          oauth_access_token_enc: string;
          oauth_refresh_token_enc: string;
          token_expires_at?: string | null;
          updated_at?: string;
          user_id: string;
          x_display_name?: string | null;
          x_profile_image_url?: string | null;
          x_user_id: string;
          x_username: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          oauth_access_token_enc?: string;
          oauth_refresh_token_enc?: string;
          token_expires_at?: string | null;
          updated_at?: string;
          user_id?: string;
          x_display_name?: string | null;
          x_profile_image_url?: string | null;
          x_user_id?: string;
          x_username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
