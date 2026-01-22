# Step 3: Database Design

> Complete database schema and Row-Level Security policies

## Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    users      │       │  portfolios   │       │   holdings    │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id (PK)       │──────<│ id (PK)       │──────<│ id (PK)       │
│ email         │       │ user_id (FK)  │       │ portfolio_id  │
│ name          │       │ cash_balance  │       │ symbol        │
│ created_at    │       │ updated_at    │       │ quantity      │
└───────────────┘       └───────────────┘       │ avg_cost      │
        │                                       │ created_at    │
        │                                       └───────────────┘
        │
        │       ┌───────────────┐
        │       │    orders     │
        └──────<├───────────────┤
                │ id (PK)       │
                │ user_id (FK)  │
                │ symbol        │
                │ side          │
                │ type          │
                │ quantity      │
                │ limit_price   │
                │ status        │
                │ filled_qty    │
                │ avg_fill_price│
                │ created_at    │
                │ filled_at     │
                └───────────────┘

┌───────────────┐       ┌───────────────┐
│   watchlists  │       │watchlist_items│
├───────────────┤       ├───────────────┤
│ id (PK)       │──────<│ id (PK)       │
│ user_id (FK)  │       │ watchlist_id  │
│ name          │       │ symbol        │
│ created_at    │       │ added_at      │
└───────────────┘       └───────────────┘

┌───────────────┐       ┌───────────────┐
│    stocks     │       │    quotes     │
├───────────────┤       ├───────────────┤
│ symbol (PK)   │──────<│ symbol (PK)   │
│ name          │       │ price         │
│ sector        │       │ open          │
│ description   │       │ high          │
│ logo_url      │       │ low           │
└───────────────┘       │ close         │
                        │ change        │
                        │ change_pct    │
                        │ volume        │
                        │ updated_at    │
                        └───────────────┘
```

## SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default portfolio for new user
  INSERT INTO public.portfolios (user_id, cash_balance)
  VALUES (NEW.id, 10000.00);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PORTFOLIOS TABLE
-- ============================================
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cash_balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);

-- ============================================
-- HOLDINGS TABLE
-- ============================================
CREATE TABLE public.holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity DECIMAL(15,6) NOT NULL CHECK (quantity >= 0),
  average_cost DECIMAL(15,4) NOT NULL CHECK (average_cost >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(portfolio_id, symbol)
);

CREATE INDEX idx_holdings_portfolio_id ON public.holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON public.holdings(symbol);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TYPE order_side AS ENUM ('buy', 'sell');
CREATE TYPE order_type AS ENUM ('market', 'limit');
CREATE TYPE order_status AS ENUM ('pending', 'filled', 'partial', 'cancelled', 'rejected');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side order_side NOT NULL,
  type order_type NOT NULL,
  quantity DECIMAL(15,6) NOT NULL CHECK (quantity > 0),
  limit_price DECIMAL(15,4),
  status order_status DEFAULT 'pending' NOT NULL,
  filled_quantity DECIMAL(15,6) DEFAULT 0,
  average_fill_price DECIMAL(15,4),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  filled_at TIMESTAMPTZ,
  
  -- Limit orders must have a limit price
  CONSTRAINT limit_order_has_price 
    CHECK (type != 'limit' OR limit_price IS NOT NULL)
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_symbol ON public.orders(symbol);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================
-- TRANSACTIONS TABLE (for deposits/withdrawals)
-- ============================================
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  status transaction_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- ============================================
-- WATCHLISTS TABLE
-- ============================================
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Watchlist',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);

-- ============================================
-- WATCHLIST ITEMS TABLE
-- ============================================
CREATE TABLE public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(watchlist_id, symbol)
);

CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);

-- ============================================
-- STOCKS TABLE (reference data)
-- ============================================
CREATE TABLE public.stocks (
  symbol TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_stocks_sector ON public.stocks(sector);
CREATE INDEX idx_stocks_name ON public.stocks(name);

-- Full-text search index
CREATE INDEX idx_stocks_search ON public.stocks 
  USING GIN (to_tsvector('english', name || ' ' || symbol));

-- ============================================
-- QUOTES TABLE (market data)
-- ============================================
CREATE TABLE public.quotes (
  symbol TEXT PRIMARY KEY REFERENCES public.stocks(symbol),
  price DECIMAL(15,4) NOT NULL,
  open_price DECIMAL(15,4),
  high_price DECIMAL(15,4),
  low_price DECIMAL(15,4),
  previous_close DECIMAL(15,4),
  change DECIMAL(15,4),
  change_percent DECIMAL(8,4),
  volume BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate portfolio value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(p_user_id UUID)
RETURNS TABLE (
  cash_balance DECIMAL,
  holdings_value DECIMAL,
  total_value DECIMAL,
  day_change DECIMAL,
  day_change_percent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH portfolio_data AS (
    SELECT p.cash_balance as cash
    FROM portfolios p
    WHERE p.user_id = p_user_id
  ),
  holdings_data AS (
    SELECT 
      COALESCE(SUM(h.quantity * q.price), 0) as current_value,
      COALESCE(SUM(h.quantity * h.average_cost), 0) as cost_basis,
      COALESCE(SUM(h.quantity * q.previous_close), 0) as previous_value
    FROM holdings h
    JOIN portfolios p ON h.portfolio_id = p.id
    LEFT JOIN quotes q ON h.symbol = q.symbol
    WHERE p.user_id = p_user_id
  )
  SELECT 
    pd.cash,
    hd.current_value,
    pd.cash + hd.current_value as total,
    hd.current_value - hd.previous_value as day_chg,
    CASE 
      WHEN hd.previous_value > 0 
      THEN ((hd.current_value - hd.previous_value) / hd.previous_value * 100)
      ELSE 0
    END as day_chg_pct
  FROM portfolio_data pd, holdings_data hd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute a trade
CREATE OR REPLACE FUNCTION execute_trade(
  p_order_id UUID,
  p_fill_price DECIMAL
) RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_portfolio_id UUID;
  v_total_cost DECIMAL;
  v_existing_holding RECORD;
  v_new_quantity DECIMAL;
  v_new_avg_cost DECIMAL;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF v_order.status != 'pending' THEN
    RAISE EXCEPTION 'Order is not pending';
  END IF;
  
  -- Get portfolio
  SELECT id INTO v_portfolio_id 
  FROM portfolios 
  WHERE user_id = v_order.user_id;
  
  v_total_cost := v_order.quantity * p_fill_price;
  
  IF v_order.side = 'buy' THEN
    -- Check buying power
    IF (SELECT cash_balance FROM portfolios WHERE id = v_portfolio_id) < v_total_cost THEN
      UPDATE orders SET status = 'rejected', rejection_reason = 'Insufficient funds'
      WHERE id = p_order_id;
      RETURN;
    END IF;
    
    -- Deduct cash
    UPDATE portfolios 
    SET cash_balance = cash_balance - v_total_cost,
        updated_at = NOW()
    WHERE id = v_portfolio_id;
    
    -- Update or create holding
    SELECT * INTO v_existing_holding 
    FROM holdings 
    WHERE portfolio_id = v_portfolio_id AND symbol = v_order.symbol;
    
    IF v_existing_holding IS NOT NULL THEN
      v_new_quantity := v_existing_holding.quantity + v_order.quantity;
      v_new_avg_cost := (
        (v_existing_holding.quantity * v_existing_holding.average_cost) + v_total_cost
      ) / v_new_quantity;
      
      UPDATE holdings 
      SET quantity = v_new_quantity, 
          average_cost = v_new_avg_cost,
          updated_at = NOW()
      WHERE id = v_existing_holding.id;
    ELSE
      INSERT INTO holdings (portfolio_id, symbol, quantity, average_cost)
      VALUES (v_portfolio_id, v_order.symbol, v_order.quantity, p_fill_price);
    END IF;
    
  ELSE -- SELL
    -- Check holdings
    SELECT * INTO v_existing_holding 
    FROM holdings 
    WHERE portfolio_id = v_portfolio_id AND symbol = v_order.symbol;
    
    IF v_existing_holding IS NULL OR v_existing_holding.quantity < v_order.quantity THEN
      UPDATE orders SET status = 'rejected', rejection_reason = 'Insufficient shares'
      WHERE id = p_order_id;
      RETURN;
    END IF;
    
    -- Add cash
    UPDATE portfolios 
    SET cash_balance = cash_balance + v_total_cost,
        updated_at = NOW()
    WHERE id = v_portfolio_id;
    
    -- Update holding
    v_new_quantity := v_existing_holding.quantity - v_order.quantity;
    
    IF v_new_quantity = 0 THEN
      DELETE FROM holdings WHERE id = v_existing_holding.id;
    ELSE
      UPDATE holdings 
      SET quantity = v_new_quantity,
          updated_at = NOW()
      WHERE id = v_existing_holding.id;
    END IF;
  END IF;
  
  -- Mark order as filled
  UPDATE orders 
  SET status = 'filled',
      filled_quantity = quantity,
      average_fill_price = p_fill_price,
      filled_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row-Level Security Policies

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- PORTFOLIOS POLICIES
-- ============================================
CREATE POLICY "Users can view own portfolio"
  ON public.portfolios FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- HOLDINGS POLICIES
-- ============================================
CREATE POLICY "Users can view own holdings"
  ON public.holdings FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own pending orders"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- WATCHLISTS POLICIES
-- ============================================
CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own watchlists"
  ON public.watchlists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watchlists"
  ON public.watchlists FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own watchlists"
  ON public.watchlists FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- WATCHLIST ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view own watchlist items"
  ON public.watchlist_items FOR SELECT
  USING (
    watchlist_id IN (
      SELECT id FROM public.watchlists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own watchlist items"
  ON public.watchlist_items FOR ALL
  USING (
    watchlist_id IN (
      SELECT id FROM public.watchlists WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- STOCKS POLICIES (public read)
-- ============================================
CREATE POLICY "Stocks are publicly readable"
  ON public.stocks FOR SELECT
  USING (true);

-- ============================================
-- QUOTES POLICIES (public read)
-- ============================================
CREATE POLICY "Quotes are publicly readable"
  ON public.quotes FOR SELECT
  USING (true);
```

## Seed Data

See `supabase/seed.sql` for initial stock and quote data.

## Next Steps

Proceed to Step 4: API Design to define the REST endpoints that interact with this schema.


