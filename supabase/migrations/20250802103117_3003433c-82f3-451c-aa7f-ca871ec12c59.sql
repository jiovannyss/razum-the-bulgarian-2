-- Create coin offers table
CREATE TABLE public.coin_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coin_amount INTEGER NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  offer_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER GENERATED ALWAYS AS (ROUND(((original_price - offer_price) / original_price * 100)::numeric)) STORED,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for coin offers
CREATE POLICY "Everyone can view active offers" 
ON public.coin_offers 
FOR SELECT 
USING (is_active = true AND end_date > now());

CREATE POLICY "Admins can manage all offers" 
ON public.coin_offers 
FOR ALL 
USING (is_admin_or_above(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_coin_offers_updated_at
BEFORE UPDATE ON public.coin_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();