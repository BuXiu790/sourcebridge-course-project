export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "buyer" | "operator" | "admin";

export type DatabaseRfqStatus =
  | "draft"
  | "sourcing"
  | "quotes_ready"
  | "sample_review"
  | "in_production"
  | "quality_inspection"
  | "shipping"
  | "completed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      rfqs: {
        Row: {
          id: string;
          rfq_number: string;
          buyer_id: string;
          product_name: string;
          product_category: string;
          reference_url: string | null;
          product_description: string;
          reference_file_name: string | null;
          material: string;
          dimensions: string;
          color: string;
          custom_logo: string;
          custom_packaging: string;
          additional_requirements: string | null;
          target_quantity: number;
          target_unit_price: number;
          destination_country: string;
          amazon_marketplace: string;
          desired_delivery_date: string;
          sample_required: string;
          preferred_fulfillment: string;
          status: DatabaseRfqStatus;
          selected_quote_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_number?: string;
          buyer_id: string;
          product_name: string;
          product_category: string;
          reference_url?: string | null;
          product_description: string;
          reference_file_name?: string | null;
          material: string;
          dimensions: string;
          color: string;
          custom_logo?: string;
          custom_packaging?: string;
          additional_requirements?: string | null;
          target_quantity: number;
          target_unit_price: number;
          destination_country: string;
          amazon_marketplace: string;
          desired_delivery_date: string;
          sample_required?: string;
          preferred_fulfillment?: string;
          status?: DatabaseRfqStatus;
          selected_quote_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_name?: string;
          product_category?: string;
          reference_url?: string | null;
          product_description?: string;
          reference_file_name?: string | null;
          material?: string;
          dimensions?: string;
          color?: string;
          custom_logo?: string;
          custom_packaging?: string;
          additional_requirements?: string | null;
          target_quantity?: number;
          target_unit_price?: number;
          destination_country?: string;
          amazon_marketplace?: string;
          desired_delivery_date?: string;
          sample_required?: string;
          preferred_fulfillment?: string;
          status?: DatabaseRfqStatus;
          selected_quote_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          supplier_code: string;
          company_name: string;
          contact_email: string | null;
          location: string | null;
          capabilities: string | null;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_code?: string;
          company_name: string;
          contact_email?: string | null;
          location?: string | null;
          capabilities?: string | null;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          contact_email?: string | null;
          location?: string | null;
          capabilities?: string | null;
          notes?: string | null;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      supplier_quotes: {
        Row: {
          id: string;
          rfq_id: string;
          supplier_id: string;
          supplier_label: string;
          unit_price: number;
          moq: number;
          sample_cost: number;
          lead_time_days: number;
          packaging: string;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          supplier_id: string;
          supplier_label: string;
          unit_price: number;
          moq: number;
          sample_cost?: number;
          lead_time_days: number;
          packaging: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          unit_price?: number;
          moq?: number;
          sample_cost?: number;
          lead_time_days?: number;
          packaging?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          id: string;
          rfq_id: string;
          status: DatabaseRfqStatus | null;
          title: string;
          detail: string;
          event_date: string;
          sort_order: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          status?: DatabaseRfqStatus | null;
          title: string;
          detail: string;
          event_date?: string;
          sort_order?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: DatabaseRfqStatus | null;
          title?: string;
          detail?: string;
          event_date?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      attachments: {
        Row: {
          id: string;
          rfq_id: string;
          uploaded_by: string;
          file_name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          uploaded_by: string;
          file_name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          category?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_user_role: {
        Args: { target_email: string; new_role: UserRole };
        Returns: Database["public"]["Tables"]["profiles"]["Row"];
      };
    };
    Enums: {
      user_role: UserRole;
      rfq_status: DatabaseRfqStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type RfqRow = Database["public"]["Tables"]["rfqs"]["Row"];
export type SupplierRow = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierQuoteRow = Database["public"]["Tables"]["supplier_quotes"]["Row"];
export type TimelineEventRow = Database["public"]["Tables"]["timeline_events"]["Row"];
export type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];
