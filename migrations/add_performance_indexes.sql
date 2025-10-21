-- Performance Optimization: Add indexes for frequently queried columns
-- These indexes will significantly speed up queries on quotes and related tables

-- Index on quotes.clientid for faster client-related queries
-- Used in: Client detail pages, dashboard queries
CREATE INDEX IF NOT EXISTS idx_quotes_clientid ON quotes(clientid);

-- Index on quotes.createdat for faster date-range queries
-- Used in: Dashboard time-period filters, revenue over time
CREATE INDEX IF NOT EXISTS idx_quotes_createdat ON quotes(createdat);

-- Index on quotes.status for faster status filtering
-- Used in: Dashboard metrics (accepted quotes), quotations list
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Composite index on quotes(status, createdat) for dashboard queries
-- Optimizes queries that filter by both status and date
CREATE INDEX IF NOT EXISTS idx_quotes_status_createdat ON quotes(status, createdat);

-- Index on quote_items.quoteid for faster quote detail queries
-- Used in: Quote detail pages, PDF generation
CREATE INDEX IF NOT EXISTS idx_quote_items_quoteid ON quote_items(quoteid);

-- Index on quote_items.productid for product-related queries
-- Used in: Product usage tracking, product detail pages
CREATE INDEX IF NOT EXISTS idx_quote_items_productid ON quote_items(productid);

-- Index on clients.source for lead source analysis
-- Used in: Dashboard lead source breakdown
CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);

-- Note: The index on clients.id already exists as a primary key
-- Note: Foreign key indexes may already exist depending on database setup
