-- OPTIONAL: adds the 6 sample bracelets from the design so the shop isn't empty
-- while you test. Run AFTER schema.sql. Add photos to them from /admin,
-- or delete them there once your real products are in.

insert into public.products (name, slug, description, category_id, price, sale_price, tag, is_featured, sort_order)
values
  ('Blush Pearl', 'blush-pearl', 'Pearl-look beads with tiny rose-gold spacers.',
     (select id from public.categories where slug = 'beaded'), 2450, null, 'Bestseller', false, 1),
  ('Rose Quartz Glow', 'rose-quartz-glow', 'Soft pink quartz-style beads with pearl accents.',
     (select id from public.categories where slug = 'beaded'), 1950, 1750, null, false, 2),
  ('Golden Heart', 'golden-heart', 'A dainty gold-tone chain with a little heart charm.',
     (select id from public.categories where slug = 'chains'), 2800, null, 'New', false, 3),
  ('Your Initial', 'your-initial', 'Gold-tone beads with a letter charm of your choice.',
     (select id from public.categories where slug = 'charms'), 2200, null, null, false, 4),
  ('Lilac Dream', 'lilac-dream', 'Lilac glass beads on a comfy stretch cord.',
     (select id from public.categories where slug = 'beaded'), 1650, null, null, false, 5),
  ('Petal Stack, set of 3', 'petal-stack', 'Three stackable bracelets in a keepsake box.',
     (select id from public.categories where slug = 'gift-sets'), 3200, null, 'Gift set', true, 6)
on conflict (slug) do nothing;
