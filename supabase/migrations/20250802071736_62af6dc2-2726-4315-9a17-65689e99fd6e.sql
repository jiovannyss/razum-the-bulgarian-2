-- Създаване на таблица за tracking на sync прогреса
CREATE TABLE IF NOT EXISTS public.sync_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  current_batch INTEGER NOT NULL DEFAULT 0,
  batch_size INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, paused
  competition_id INTEGER NULL,
  metadata JSONB NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS
ALTER TABLE public.sync_progress ENABLE ROW LEVEL SECURITY;

-- Create policies (accessible only by service role)
CREATE POLICY "sync_progress_service_access" 
ON public.sync_progress 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sync_progress_updated_at
BEFORE UPDATE ON public.sync_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();