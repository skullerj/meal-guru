// Auto-generated database types from Supabase
// This file will be replaced by: npm run db:types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string;
          name: string;
          unit:
            | "g"
            | "kg"
            | "ml"
            | "l"
            | "tsp"
            | "tbsp"
            | "cup"
            | "oz"
            | "lb"
            | "unit";
          source: {
            url: string;
            price: number;
            amount: number;
          } | null;
          shelf: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit:
            | "g"
            | "kg"
            | "ml"
            | "l"
            | "tsp"
            | "tbsp"
            | "cup"
            | "oz"
            | "lb"
            | "unit";
          source?: {
            url: string;
            price: number;
            amount: number;
          } | null;
          shelf?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          unit?:
            | "g"
            | "kg"
            | "ml"
            | "l"
            | "tsp"
            | "tbsp"
            | "cup"
            | "oz"
            | "lb"
            | "unit";
          source?: {
            url: string;
            price: number;
            amount: number;
          } | null;
          shelf?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          ingredient_id: string;
          amount: number;
          order_index: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          ingredient_id: string;
          amount: number;
          order_index: number;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          ingredient_id?: string;
          amount?: number;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_instructions: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          instruction_text: string;
          ingredient_ids: string[];
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          instruction_text: string;
          ingredient_ids?: string[];
        };
        Update: {
          id?: string;
          recipe_id?: string;
          step_number?: number;
          instruction_text?: string;
          ingredient_ids?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "recipe_instructions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      unit_type:
        | "g"
        | "kg"
        | "ml"
        | "l"
        | "tsp"
        | "tbsp"
        | "cup"
        | "oz"
        | "lb"
        | "unit";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
