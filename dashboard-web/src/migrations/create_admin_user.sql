-- Crear el usuario admin si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@dysaeats.com'
  ) THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      password,
      rut,
      phone,
      address,
      image_approved,
      created_at,
      updated_at
    )
    VALUES (
      '99aaa4a2-f99e-4a26-8cdc-385e32ebe7b2',
      'admin@dysaeats.com',
      'Admin',
      'Principal',
      'admin',
      NULL,
      '12.345.678-9',
      '+56987654321',
      'Av. Providencia 1234, Santiago',
      true,
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- Asegurar metadatos correctos en Auth
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb('admin'::text)
  ),
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb('admin'::text)
  )
WHERE email = 'admin@dysaeats.com';
