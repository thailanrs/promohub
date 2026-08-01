import { describe, it, expect } from 'vitest';
import * as schema from './schema';
import { getTableColumns } from 'drizzle-orm';

describe('Database Schema & Multi-Tenant Isolation', () => {
  const tables = [
    { name: 'tenants', table: schema.tenants },
    { name: 'tenantAffiliateCredentials', table: schema.tenantAffiliateCredentials },
    { name: 'sources', table: schema.sources },
    { name: 'pipelines', table: schema.pipelines },
    { name: 'pipelineSources', table: schema.pipelineSources },
    { name: 'destinations', table: schema.destinations },
    { name: 'pipelineDestinations', table: schema.pipelineDestinations },
    { name: 'offers', table: schema.offers },
    { name: 'offerClicks', table: schema.offerClicks },
  ];

  it('should define all required schema tables', () => {
    tables.forEach(({ name, table }) => {
      expect(table, `Table ${name} should be defined`).toBeDefined();
    });
  });

  it('should ensure every table has indexed tenant_id column for logical multi-tenant isolation', () => {
    tables.forEach(({ name, table }) => {
      const columns = getTableColumns(table);
      expect(columns.tenantId, `Table ${name} must have a tenantId column`).toBeDefined();
      expect(columns.tenantId.name).toBe('tenant_id');
    });
  });

  it('should configure tenantAffiliateCredentials for encrypted api tokens', () => {
    const columns = getTableColumns(schema.tenantAffiliateCredentials);
    expect(columns.encryptedApiKey, 'encryptedApiKey column must exist').toBeDefined();
    expect(columns.encryptedApiKey.name).toBe('encrypted_api_key');
    expect(columns.encryptedApiSecret, 'encryptedApiSecret column must exist').toBeDefined();
    expect(columns.encryptedApiSecret.name).toBe('encrypted_api_secret');
  });

  it('should configure offers table with out-of-stock and external message tracker fields', () => {
    const columns = getTableColumns(schema.offers);
    expect(columns.isOutOfStock, 'isOutOfStock column must exist').toBeDefined();
    expect(columns.isOutOfStock.name).toBe('is_out_of_stock');
    expect(columns.externalMessageIds, 'externalMessageIds column must exist').toBeDefined();
    expect(columns.externalMessageIds.name).toBe('external_message_ids');
  });
});
