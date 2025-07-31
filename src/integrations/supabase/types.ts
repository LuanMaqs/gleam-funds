export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          cor: string
          created_at: string
          icone: string | null
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["category_type"]
          usuario_id: string
        }
        Insert: {
          cor: string
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["category_type"]
          usuario_id: string
        }
        Update: {
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["category_type"]
          usuario_id?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          created_at: string
          id: string
          nome: string
          saldo_inicial: number | null
          tipo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          saldo_inicial?: number | null
          tipo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          saldo_inicial?: number | null
          tipo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      metas_financeiras: {
        Row: {
          categoria_id: string
          created_at: string
          id: string
          mes_ano: string
          usuario_id: string
          valor_limite: number
        }
        Insert: {
          categoria_id: string
          created_at?: string
          id?: string
          mes_ano: string
          usuario_id: string
          valor_limite: number
        }
        Update: {
          categoria_id?: string
          created_at?: string
          id?: string
          mes_ano?: string
          usuario_id?: string
          valor_limite?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_financeiras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          data_de_criacao: string
          email: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          data_de_criacao?: string
          email: string
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          data_de_criacao?: string
          email?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria_id: string
          conta_id: string
          created_at: string
          data: string
          frequencia: string | null
          id: string
          observacao: string | null
          recorrente: boolean | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          usuario_id: string
          valor: number
        }
        Insert: {
          categoria_id: string
          conta_id: string
          created_at?: string
          data: string
          frequencia?: string | null
          id?: string
          observacao?: string | null
          recorrente?: boolean | null
          tipo: Database["public"]["Enums"]["transaction_type"]
          usuario_id: string
          valor: number
        }
        Update: {
          categoria_id?: string
          conta_id?: string
          created_at?: string
          data?: string
          frequencia?: string | null
          id?: string
          observacao?: string | null
          recorrente?: boolean | null
          tipo?: Database["public"]["Enums"]["transaction_type"]
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_type: "Receita" | "Despesa"
      transaction_type: "Receita" | "Despesa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      category_type: ["Receita", "Despesa"],
      transaction_type: ["Receita", "Despesa"],
    },
  },
} as const
