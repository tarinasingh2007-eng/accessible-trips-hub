-- Add CHECK constraints to bookings table for server-side validation
ALTER TABLE public.bookings 
  ADD CONSTRAINT check_positive_travelers CHECK (number_of_travelers > 0),
  ADD CONSTRAINT check_valid_dates CHECK (travel_end_date > travel_start_date),
  ADD CONSTRAINT check_special_requirements_length CHECK (special_requirements IS NULL OR length(special_requirements) <= 1000),
  ADD CONSTRAINT check_positive_price CHECK (total_price >= 0);

-- Update has_role function to restrict checking other users' roles
-- Only allows checking own roles or if the caller is already an admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow checking own roles, or if caller is already an admin
  SELECT CASE 
    WHEN auth.uid() = _user_id THEN
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
      )
    WHEN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
      )
    ELSE false
  END
$$;