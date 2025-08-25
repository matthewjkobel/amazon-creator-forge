-- Security hardening: enable RLS and add least-privilege policies for remaining tables
-- (excluding member_user_ids which is a view)

-- 1) Ensure RLS is enabled on tables only (idempotent)
ALTER TABLE public.brand_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

-- 2) brand_lists: Owner (brand user) or admin can read/write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'brand_lists' AND policyname = 'brand_lists_owner_read'
  ) THEN
    CREATE POLICY "brand_lists_owner_read"
    ON public.brand_lists
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.brands b
        WHERE b.id = brand_lists.brand_id
          AND (b.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'brand_lists' AND policyname = 'brand_lists_owner_write'
  ) THEN
    CREATE POLICY "brand_lists_owner_write"
    ON public.brand_lists
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.brands b
        WHERE b.id = brand_lists.brand_id
          AND (b.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.brands b
        WHERE b.id = brand_lists.brand_id
          AND (b.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    );
  END IF;
END $$;

-- 3) brand_list_items: Only owner of the underlying brand list (via brand) or admin can read/write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'brand_list_items' AND policyname = 'brand_list_items_owner_rw'
  ) THEN
    CREATE POLICY "brand_list_items_owner_rw"
    ON public.brand_list_items
    FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.brand_lists bl
        JOIN public.brands b ON b.id = bl.brand_id
        WHERE bl.id = brand_list_items.list_id
          AND (b.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.brand_lists bl
        JOIN public.brands b ON b.id = bl.brand_id
        WHERE bl.id = brand_list_items.list_id
          AND (b.user_id = auth.uid() OR public.is_admin(auth.uid()))
      )
    );
  END IF;
END $$;

-- 4) niches: public read, admin-only writes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'niches' AND policyname = 'niches_public_read'
  ) THEN
    CREATE POLICY "niches_public_read"
    ON public.niches
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'niches' AND policyname = 'niches_admin_insert'
  ) THEN
    CREATE POLICY "niches_admin_insert"
    ON public.niches
    FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'niches' AND policyname = 'niches_admin_update'
  ) THEN
    CREATE POLICY "niches_admin_update"
    ON public.niches
    FOR UPDATE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'niches' AND policyname = 'niches_admin_delete'
  ) THEN
    CREATE POLICY "niches_admin_delete"
    ON public.niches
    FOR DELETE
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;