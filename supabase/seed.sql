-- ============================================================
-- Nusa Culinary — Seed Data (10 Default Recipes)
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- SETELAH menjalankan migration.sql
-- ============================================================

INSERT INTO recipes (title, description, image, prep_time, cook_time, difficulty, calories, category, region, spicy, servings, youtube_url, video_url, nutrition, variations, ingredients, instructions, rating, rating_count, author_name, is_default)
VALUES
(
  'Authentic Beef Rendang',
  'Experience the rich, complex flavors of slow-cooked beef in a thick, spicy coconut gravy.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKIMjszDw-ztDBJBeXUyGy7exPoXmKk2rEoI5aC4GlQkmUvl7uRzZ0m3Rz345Qi-Ax2BXNuUSxVX1-092Bu8p9zsB5Be6CyRQkQkZgzocam-8A7u4zXurOD6D6jIKFa_08BRdR3cvQ7hqx8f7-q-NO_Qde0xjXiFjtmUi0fslSShrSrgO4DPieYtbeMdEr-XVB8-SKE3lsX061AjkFD8dl49OwDQgOOhEq_pELvJ5_mgVie7ZC7vC8CYP4ZU_AB0g6Iwe36TQlSFcG',
  '30 Mins', '4 Hours', 'Hard', '450 kcal', 'Main Course', 'Sumatra', true, '4 Servings',
  'https://www.youtube.com/embed/Xq4-yG7vO88',
  'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
  '{"protein": "28g", "fat": "32g", "carbs": "12g"}',
  '[{"title": "Spicier Kick", "description": "Add 5-10 extra bird''s eye chilies to the spice paste for an authentic Padang heat level."}, {"title": "Chicken Rendang", "description": "Swap beef for chicken thighs. Reduce slow-cooking time to 1.5 hours to keep the meat tender."}, {"title": "Serving Suggestion", "description": "Best served with warm jasmine rice and a side of ''Sayur Nangka'' (young jackfruit curry)."}]',
  '[{"name": "1kg Beef (Chuck or Shank)", "detail": "Cut into cubes", "role": "The main protein that absorbs all the rich spices during the long slow-cook process."}, {"name": "Coconut Milk", "detail": "1.5 Liters", "role": "Provides the creamy base and rich fats needed for the characteristic thick Rendang gravy."}, {"name": "Lemongrass", "detail": "3 Stalks, bruised", "role": "Essential for releasing a citrusy, herbal aroma that cuts through the richness of the beef."}, {"name": "Turmeric Leaves", "detail": "2 Pieces", "role": "A key aromatic in Indonesian cuisine that gives Rendang its unique earthy scent."}]',
  '[{"title": "Prepare the Spice Paste", "text": "Blend shallots, garlic, ginger, galangal, and red chilies into a fine paste. Use a splash of coconut milk to help the blender if needed."}, {"title": "Sauté Spices", "text": "In a large wok, sauté the spice paste until fragrant and the oil starts to separate. Add the lemongrass, turmeric leaves, and kaffir lime leaves."}, {"title": "Slow Simmer", "text": "Add the beef cubes and stir until browned. Pour in the coconut milk. Reduce heat to low and simmer, stirring occasionally, until the liquid has completely evaporated and the beef is dark brown."}]',
  4.8, 124, 'Nusa Culinary', true
),
(
  'Fresh Gado-Gado',
  'A vibrant Indonesian salad with peanut sauce, fresh vegetables, tofu, and traditional crackers.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCO7jjZXVvDesp48TzdZdR70oW15qKm8W1mE8fQkvVtCkkqasEL1avw5p4i6MfK3kg444jQ010RTxxry5bP0iVYQPP_oN1zGosfiGL0eOsQKJMYwvEzdxD8nUtqK3U1LxvQw-1EPMKr87i4dlz0xcr4GLQt6R0py66zO1ejseE144yfNl_3xyJSk-SEJIhUmAtQmxvAa0U3xa3FqFhbM5F-F0m_y6dOe9DJmNj45tS2jsy9v-NOAx5T0ySwJMl8d1zHPDNci4Og2-s',
  '20 Mins', '10 Mins', 'Easy', '320 kcal', 'Appetizer', 'Jawa', false, '2 Servings',
  'https://www.youtube.com/embed/MpsJByJ59o8',
  'https://assets.mixkit.co/videos/preview/mixkit-serving-food-on-a-plate-at-a-buffet-4309-large.mp4',
  '{"protein": "14g", "fat": "18g", "carbs": "26g"}',
  '[{"title": "Vegan Friendly", "description": "Ensure the shrimp paste in the peanut sauce is replaced with fermented soybean paste (tauco)."}, {"title": "Extra Hint", "description": "Add a touch of brown sugar to the peanut sauce to balance the acidity of the kaffir lime."}, {"title": "Extra Crunch", "description": "Add shredded cabbage and bean sprouts just before serving to maintain maximum texture."}, {"title": "Protein Boost", "description": "Add a hard-boiled egg or extra fried tempeh slices for a more filling meal."}]',
  '[{"name": "Mixed Vegetables", "detail": "Cabbage, spinach, long beans", "role": "The fiber-rich base of the salad."}, {"name": "Tofu & Tempeh", "detail": "Fried and cubed", "role": "Traditional plant-based proteins that soak up the sauce."}, {"name": "Peanut Sauce", "detail": "Spicy & Sweet", "role": "The soul of the dish, binding all ingredients together with nutty richness."}]',
  '[{"title": "Blanch Vegetables", "text": "Boil each vegetable separately until just tender-crisp. Plunge immediately into ice water to stop the cooking and maintain vibrant colors."}, {"title": "Prepare Peanut Sauce", "text": "Grind roasted peanuts with garlic, chilies, brown sugar, and a bit of warm water until smooth and creamy."}, {"title": "Assemble", "text": "Arrange the vegetables, tofu, and tempeh on a plate. Generously pour the peanut sauce over the top and serve with crackers."}]',
  4.6, 89, 'Nusa Culinary', true
),
(
  'Sate Ayam Madura',
  'Grilled chicken skewers served with a rich, nutty peanut sauce and sweet soy glaze.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDM0Q520PwmLtwyIPz5kWG8nuVunxgEAeMYWTbp_1HvitPAbgE1qVwZRA2IaTA22Va5Vr4cqVEvtNwlbVmzp45M6EsdQ6IozUftTjNvyaer7JbWVD7v9MTexdKov1KDuM1srFM_TvIdX_zuobWWYorFJY7qsZ1nU2aGHPSmxfQI9y2ymTn9ITUftUUDLoHBGyWDIIACl8DoyJo2EN0NOnXJ_Hn01jUrAOZFCBUpJkvGwXiVl7cOCFhHDjYiRLSQRZMwpBFGWpbD46iw',
  '45 Mins', '15 Mins', 'Medium', '380 kcal', 'Main Course', 'Jawa', true, '4 Servings',
  'https://www.youtube.com/embed/U7hA6N6X00k',
  'https://assets.mixkit.co/videos/preview/mixkit-putting-raw-meat-on-a-hot-grill-4304-large.mp4',
  '{"protein": "22g", "fat": "15g", "carbs": "18g"}',
  '[{"title": "Lamb Sate", "description": "Use lamb shoulder instead of chicken. Marinate with extra sweet soy sauce and coriander seeds."}, {"title": "Sweet & Spicy", "description": "Mix a tablespoon of sambal oelek into the peanut sauce for a spicy contrast."}, {"title": "Traditional Pairing", "description": "Serve with ''Lontong'' (compressed rice cakes) and fresh shallots for a classic Madura experience."}]',
  '[{"name": "Chicken Thighs", "detail": "Skinless, cubed", "role": "Juicy morsels that char beautifully on the grill."}, {"name": "Kecap Manis", "detail": "Indonesian Sweet Soy", "role": "Provides the characteristic lacquered finish and deep sweetness."}, {"name": "Peanuts", "detail": "Roasted and ground", "role": "The foundation of the savory dipping sauce."}]',
  '[{"title": "Marinate Chicken", "text": "Toss chicken cubes with sweet soy sauce, coriander, and a touch of oil. Let it sit for at least 30 minutes for flavors to penetrate."}, {"title": "Prepare Sauce", "text": "Combine ground peanuts with sautéed garlic/shallot paste, kecap manis, and water. Simmer until slightly thickened."}, {"title": "Grill", "text": "Thread chicken onto skewers. Grill over medium-high heat, basting with sauce, until charred and cooked through."}]',
  4.7, 156, 'Nusa Culinary', true
),
(
  'Sate Lilit Bali',
  'Traditional Balinese skewers made from minced fish and aromatic spices wrapped around lemongrass stalks.',
  'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
  '30 Mins', '20 Mins', 'Medium', '290 kcal', 'Appetizer', 'Bali', true, '4 Servings',
  'https://www.youtube.com/embed/5K9I_R6x7O0',
  'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-on-a-wooden-board-4301-large.mp4',
  '{"protein": "24g", "fat": "12g", "carbs": "8g"}',
  NULL,
  '[{"name": "White Fish Fillet", "detail": "500g, minced", "role": "Light and flaky base that carries the complex Balinese spice paste."}, {"name": "Grated Coconut", "detail": "100g", "role": "Adds texture and natural sweetness to the mince."}, {"name": "Lemongrass Stalks", "detail": "12 stalks", "role": "Used as skewers to infuse the meat with a refreshing citrus aroma."}]',
  '[{"title": "Make Base Gede", "text": "Process shallots, garlic, chilies, turmeric, ginger, and galangal into a paste. Sauté until fragrant."}, {"title": "Mix Mince", "text": "Combine minced fish, grated coconut, and the spice paste. Knead until well combined and sticky."}, {"title": "Wrap and Grill", "text": "Take a portion of mince and wrap it around the upper part of a lemongrass stalk. Grill until golden brown and aromatic."}]',
  4.5, 67, 'Nusa Culinary', true
),
(
  'Papeda & Ikan Kuah Kuning',
  'Authentic eastern Indonesian sago congee served with a vibrant yellow fish soup flavored with turmeric and lime.',
  'https://images.unsplash.com/photo-1596791550796-03612803fe9e?q=80&w=800&auto=format&fit=crop',
  '15 Mins', '25 Mins', 'Medium', '320 kcal', 'Main Course', 'Papua', true, '2 Servings',
  'https://www.youtube.com/embed/fA-m_4zP0B0',
  'https://assets.mixkit.co/videos/preview/mixkit-stirring-a-stew-in-a-pot-4306-large.mp4',
  '{"protein": "18g", "fat": "6g", "carbs": "45g"}',
  NULL,
  '[{"name": "Sago Flour", "detail": "250g", "role": "The staple carbohydrate that creates the iconic translucent, glue-like texture."}, {"name": "Red Snapper", "detail": "500g, cleaned", "role": "Fresh fish that pair perfectly with the light, tangy broth."}, {"name": "Turmeric", "detail": "3cm, bruised", "role": "Gives the fish broth its signature vibrant yellow color and earthy undertone."}]',
  '[{"title": "Prepare Papeda", "text": "Mix sago flour with a bit of cold water. Pour in boiling water while stirring vigorously until it turns translucent and thick."}, {"title": "Cook Fish Soup", "text": "Boil water with spices, turmeric, and lemongrass. Add fish and cook until tender. Finish with lime juice and fresh basil."}, {"title": "Serve", "text": "Twirl Papeda using wooden sticks (ata-ata) and serve immediately with the hot yellow fish soup."}]',
  4.4, 45, 'Nusa Culinary', true
),
(
  'Sop Konro Makassar',
  'Robust and dark beef rib soup from South Sulawesi, featuring the unique flavor of ''kluwak'' nuts.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
  '40 Mins', '3 Hours', 'Hard', '550 kcal', 'Main Course', 'Sulawesi', true, '4 Servings',
  'https://www.youtube.com/embed/fP9_L_OqH8Q',
  'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
  '{"protein": "35g", "fat": "38g", "carbs": "15g"}',
  NULL,
  '[{"name": "Beef Ribs", "detail": "1kg", "role": "Meaty ribs that become incredibly tender after hours of slow simmering."}, {"name": "Kluwak", "detail": "5 pieces", "role": "Black nuts that provide the deep, dark color and unique nutty-savory flavor profile."}, {"name": "Coriander & Cumin", "detail": "Roasted", "role": "Classic spice pairing that builds the foundation of the soup''s complexity."}]',
  '[{"title": "Prepare Kluwak", "text": "Soak kluwak flesh in warm water until soft, then mash into a paste. Ensure you only use the flesh, not the shell."}, {"title": "Simmer Ribs", "text": "Boil beef ribs until half cooked. Discard the first water, then boil again in fresh water with the spice paste."}, {"title": "Season and Serve", "text": "Add salt, pepper, and fried shallots. Simmer until the ribs are fall-off-the-bone tender. Serve with Burasa or Lontong."}]',
  4.6, 78, 'Nusa Culinary', true
),
(
  'Soto Banjar',
  'Traditional chicken soup from South Kalimantan, distinct for its use of cinnamon, cloves, and evaporated milk.',
  'https://images.unsplash.com/photo-1548946526-f69e2424cfac?q=80&w=800&auto=format&fit=crop',
  '30 Mins', '1 Hour', 'Medium', '340 kcal', 'Main Course', 'Kalimantan', false, '4 Servings',
  'https://www.youtube.com/embed/z4uX-Bnt-X0',
  'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-on-a-wooden-board-4301-large.mp4',
  '{"protein": "22g", "fat": "14g", "carbs": "30g"}',
  NULL,
  '[{"name": "Free-range Chicken", "detail": "1 whole, shredded", "role": "Produces a rich, savory broth that is the highlight of the dish."}, {"name": "Cinnamon & Cloves", "detail": "Whole spices", "role": "Provides a unique aromatic sweetness that distinguishes it from other Indonesian sotos."}, {"name": "Evaporated Milk", "detail": "100ml", "role": "Added at the end to give the broth a slightly creamy and ''white'' appearance."}]',
  '[{"title": "Boil Chicken", "text": "Simmer chicken with ginger and cinnamon until tender. Remove chicken and shred the meat into small pieces."}, {"title": "Make Spice Base", "text": "Sauté garlic, shallots, and white pepper. Add to the chicken broth along with cloves and cardamom."}, {"title": "Assemble", "text": "Place vermicelli, shredded chicken, and sliced hard-boiled eggs in a bowl. Pour hot broth over and finish with lime juice."}]',
  4.5, 92, 'Nusa Culinary', true
),
(
  'Mie Aceh Special',
  'Thick yellow noodles with beef or seafood in a rich, curry-like spicy soup, a pride of Aceh province.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCO7jjZXVvDesp48TzdZdR70oW15qKm8W1mE8fQkvVtCkkqasEL1avw5p4i6MfK3kg444jQ010RTxxry5bP0iVYQPP_oN1zGosfiGL0eOsQKJMYwvEzdxD8nUtqK3U1LxvQw-1EPMKr87i4dlz0xcr4GLQt6R0py66zO1ejseE144yfNl_3xyJSk-SEJIhUmAtQmxvAa0U3xa3FqFhbM5F-F0m_y6dOe9DJmNj45tS2jsy9v-NOAx5T0ySwJMl8d1zHPDNci4Og2-s',
  '25 Mins', '15 Mins', 'Medium', '480 kcal', 'Main Course', 'Sumatra', true, '2 Servings',
  'https://www.youtube.com/embed/U3B9_H6xKxw',
  'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
  '{"protein": "26g", "fat": "22g", "carbs": "48g"}',
  NULL,
  '[{"name": "Thick Yellow Noodles", "detail": "400g", "role": "Substantial noodles that hold up well against the heavy, spiced gravy."}, {"name": "Curry Spices", "detail": "Cumin, star anise, cardamom", "role": "Gives Mie Aceh its distinctive Middle Eastern and Indian influenced flavor profile."}, {"name": "Beef or Prawns", "detail": "200g, sliced", "role": "Choice of protein that adds richness to the spicy noodle base."}]',
  '[{"title": "Sauté Aromatics", "text": "Fry sliced shallots and garlic. Add the blended spice paste (chilies, spices) and sauté until oil separates."}, {"title": "Cook Protein", "text": "Add beef or prawns and stir until cooked. Pour in chicken stock and bring to a boil."}, {"title": "Finish Noodles", "text": "Add noodles, bean sprouts, and celery. Cook until the sauce thickens and coats the noodles perfectly. Serve with emping crackers."}]',
  4.3, 103, 'Nusa Culinary', true
),
(
  'Es Cendol',
  'Iced sweet dessert containing jelly-like green rice flour droplets, coconut milk, and palm sugar syrup.',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
  '15 Mins', '10 Mins', 'Easy', '210 kcal', 'Dessert', 'West Java', false, '2 Servings',
  NULL,
  'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
  '{"protein": "2g", "fat": "12g", "carbs": "35g"}',
  NULL,
  '[{"name": "Rice Flour", "detail": "100g", "role": "Base for the green jelly droplets."}, {"name": "Palm Sugar", "detail": "150g, melted", "role": "Provides deep, caramel-like sweetness."}, {"name": "Coconut Milk", "detail": "400ml", "role": "Adds creamy richness to the drink."}]',
  '[{"title": "Make Cendol", "text": "Mix rice flour and pandan extract. Cook into a thick paste, then press through a strainer into ice water to form droplets."}, {"title": "Prepare Syrup", "text": "Melt palm sugar with a bit of water until thick."}, {"title": "Assemble", "text": "Layer palm sugar, cendol, and coconut milk in a glass. Add ice and serve chilled."}]',
  4.7, 134, 'Nusa Culinary', true
),
(
  'Es Teh Tarik',
  'Classic ''pulled'' tea with condensed milk, frothy and smooth.',
  'https://images.unsplash.com/photo-1544787210-221272718afc?q=80&w=800&auto=format&fit=crop',
  '5 Mins', '5 Mins', 'Easy', '150 kcal', 'Drink', 'National', false, '1 Serving',
  NULL,
  'https://assets.mixkit.co/videos/preview/mixkit-pouring-tea-into-a-cup-4316-large.mp4',
  '{"protein": "3g", "fat": "5g", "carbs": "22g"}',
  NULL,
  '[{"name": "Black Tea", "detail": "2 bags", "role": "Strong tea base."}, {"name": "Condensed Milk", "detail": "3 tbsp", "role": "Sweetens and whitens the tea."}]',
  '[{"title": "Brew Tea", "text": "Steep tea in boiling water until very strong."}, {"title": "Mix", "text": "Add condensed milk and stir well."}, {"title": "Pull", "text": "Pour the tea between two containers from a height several times to create froth."}]',
  4.4, 201, 'Nusa Culinary', true
);
