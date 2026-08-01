CREATE TYPE "public"."destination_type" AS ENUM('whatsapp', 'telegram', 'discord');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('pending', 'approved', 'rejected', 'published', 'failed');--> statement-breakpoint
CREATE TYPE "public"."offer_store" AS ENUM('amazon', 'shopee', 'mercadolivre', 'magalu', 'ali-express', 'other');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('telegram', 'rss', 'webhook', 'manual');--> statement-breakpoint
CREATE TYPE "public"."tenant_plan" AS ENUM('free', 'pro', 'agency');--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "destination_type" NOT NULL,
	"config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"destination_id" uuid,
	"ip_hash" varchar(64) NOT NULL,
	"user_agent" text,
	"referer" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid,
	"source_id" uuid,
	"canonical_url" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"short_code" varchar(100) NOT NULL,
	"store" "offer_store" NOT NULL,
	"title" text NOT NULL,
	"original_price" numeric(10, 2),
	"discounted_price" numeric(10, 2) NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"coupon_code" varchar(100),
	"image_url" text NOT NULL,
	"ai_copy" text NOT NULL,
	"is_out_of_stock" boolean DEFAULT false NOT NULL,
	"status" "offer_status" DEFAULT 'pending' NOT NULL,
	"external_message_ids" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "offers_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "pipeline_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"ai_tone" varchar(100),
	"min_discount_percent" integer DEFAULT 0 NOT NULL,
	"keywords_include" jsonb,
	"keywords_exclude" jsonb,
	"quiet_hours_start" varchar(10),
	"quiet_hours_end" varchar(10),
	"is_auto_approve" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "source_type" NOT NULL,
	"config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_affiliate_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"store" varchar(100) NOT NULL,
	"encrypted_api_key" text,
	"encrypted_api_secret" text,
	"extra_params" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"custom_domain" varchar(255),
	"plan" "tenant_plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_clicks" ADD CONSTRAINT "offer_clicks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_clicks" ADD CONSTRAINT "offer_clicks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_clicks" ADD CONSTRAINT "offer_clicks_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_destinations" ADD CONSTRAINT "pipeline_destinations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_destinations" ADD CONSTRAINT "pipeline_destinations_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_destinations" ADD CONSTRAINT "pipeline_destinations_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_sources" ADD CONSTRAINT "pipeline_sources_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_sources" ADD CONSTRAINT "pipeline_sources_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipelines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_sources" ADD CONSTRAINT "pipeline_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_affiliate_credentials" ADD CONSTRAINT "tenant_affiliate_credentials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "destinations_tenant_id_idx" ON "destinations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "offer_clicks_tenant_id_idx" ON "offer_clicks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "offers_tenant_id_idx" ON "offers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pipeline_destinations_tenant_id_idx" ON "pipeline_destinations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pipeline_sources_tenant_id_idx" ON "pipeline_sources" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pipelines_tenant_id_idx" ON "pipelines" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sources_tenant_id_idx" ON "sources" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_affiliate_credentials_tenant_id_idx" ON "tenant_affiliate_credentials" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenants_tenant_id_idx" ON "tenants" USING btree ("tenant_id");