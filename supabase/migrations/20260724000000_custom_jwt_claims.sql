-- Create a hook to inject custom claims into the JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claims jsonb;
  user_email text;
  emp record;
  prof record;
  org record;
BEGIN
  claims := event->'claims';
  user_email := event->'claims'->>'email';

  -- Check if user is an internal employee
  SELECT role, status INTO emp FROM public.employees WHERE email = user_email;
  
  IF FOUND THEN
    claims := jsonb_set(claims, '{app_metadata, is_employee}', 'true');
    claims := jsonb_set(claims, '{app_metadata, employee_role}', to_jsonb(emp.role));
    claims := jsonb_set(claims, '{app_metadata, employee_status}', to_jsonb(emp.status));
  ELSE
    claims := jsonb_set(claims, '{app_metadata, is_employee}', 'false');
    
    -- Check if user belongs to a customer organization
    SELECT organization_id, role INTO prof FROM public.profiles WHERE id = (event->'claims'->>'sub')::uuid;
    IF FOUND THEN
      claims := jsonb_set(claims, '{app_metadata, organization_id}', to_jsonb(prof.organization_id));
      claims := jsonb_set(claims, '{app_metadata, organization_role}', to_jsonb(prof.role));
      
      SELECT status, approval_status INTO org FROM public.organizations WHERE id = prof.organization_id;
      IF FOUND THEN
        claims := jsonb_set(claims, '{app_metadata, organization_status}', to_jsonb(COALESCE(org.status, org.approval_status, 'approved')));
      END IF;
    END IF;
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Grant permissions for Supabase Auth to execute this function
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
