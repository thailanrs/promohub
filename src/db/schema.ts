import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// Enums
export const tenantPlanEnum = pgEnum('tenant_plan', ['free', 'pro', 'agency']);
export const sourceTypeEnum = pgEnum('source_type', ['telegram', 'rss', 'webhook', 'manual']);
export const destinationTypeEnum = pgEnum('destination_type', ['whatsapp', 'telegram', 'discord']);
export const offerStoreEnum = pgEnum('offer_store', ['amazon', 'shopee', 'mercadolivre', 'magalu', 'ali-express', 'other']);
export const offerStatusEnum = pgEnum('offer_status', ['pending', 'approved', 'rejected', 'published', 'failed']);

// 1. Tenants Table
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    customDomain: varchar('custom_domain', { length: 255 }),
    plan: tenantPlanEnum('plan').default('free').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('tenants_tenant_id_idx').on(table.tenantId),
  ]
);

// 2. Tenant Affiliate Credentials Table
export const tenantAffiliateCredentials = pgTable(
  'tenant_affiliate_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    store: varchar('store', { length: 100 }).notNull(),
    encryptedApiKey: text('encrypted_api_key'),
    encryptedApiSecret: text('encrypted_api_secret'),
    extraParams: jsonb('extra_params'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('tenant_affiliate_credentials_tenant_id_idx').on(table.tenantId),
  ]
);

// 3. Sources Table
export const sources = pgTable(
  'sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: sourceTypeEnum('type').notNull(),
    config: jsonb('config'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('sources_tenant_id_idx').on(table.tenantId),
  ]
);

// 4. Pipelines Table
export const pipelines = pgTable(
  'pipelines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    aiTone: varchar('ai_tone', { length: 100 }),
    minDiscountPercent: integer('min_discount_percent').default(0).notNull(),
    keywordsInclude: jsonb('keywords_include'),
    keywordsExclude: jsonb('keywords_exclude'),
    quietHoursStart: varchar('quiet_hours_start', { length: 10 }),
    quietHoursEnd: varchar('quiet_hours_end', { length: 10 }),
    isAutoApprove: boolean('is_auto_approve').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('pipelines_tenant_id_idx').on(table.tenantId),
  ]
);

// 5. Pipeline Sources Table (N:M Junction)
export const pipelineSources = pgTable(
  'pipeline_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
    sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('pipeline_sources_tenant_id_idx').on(table.tenantId),
  ]
);

// 6. Destinations Table
export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: destinationTypeEnum('type').notNull(),
    config: jsonb('config'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('destinations_tenant_id_idx').on(table.tenantId),
  ]
);

// 7. Pipeline Destinations Table (N:M Junction)
export const pipelineDestinations = pgTable(
  'pipeline_destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id').notNull().references(() => destinations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('pipeline_destinations_tenant_id_idx').on(table.tenantId),
  ]
);

// 8. Offers Table
export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    pipelineId: uuid('pipeline_id').references(() => pipelines.id, { onDelete: 'set null' }),
    sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'set null' }),
    canonicalUrl: text('canonical_url').notNull(),
    affiliateUrl: text('affiliate_url').notNull(),
    shortCode: varchar('short_code', { length: 100 }).notNull().unique(),
    store: offerStoreEnum('store').notNull(),
    title: text('title').notNull(),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    discountedPrice: numeric('discounted_price', { precision: 10, scale: 2 }).notNull(),
    discountPercent: integer('discount_percent').default(0).notNull(),
    couponCode: varchar('coupon_code', { length: 100 }),
    imageUrl: text('image_url').notNull(),
    aiCopy: text('ai_copy').notNull(),
    isOutOfStock: boolean('is_out_of_stock').default(false).notNull(),
    status: offerStatusEnum('status').default('pending').notNull(),
    externalMessageIds: jsonb('external_message_ids'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('offers_tenant_id_idx').on(table.tenantId),
  ]
);

// 9. Offer Clicks Table
export const offerClicks = pgTable(
  'offer_clicks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    offerId: uuid('offer_id').notNull().references(() => offers.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id').references(() => destinations.id, { onDelete: 'set null' }),
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),
    userAgent: text('user_agent'),
    referer: text('referer'),
    clickedAt: timestamp('clicked_at').defaultNow().notNull(),
  },
  (table) => [
    index('offer_clicks_tenant_id_idx').on(table.tenantId),
  ]
);
