import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newRecipes = [
  {
    title: 'Nasi Goreng Kampung',
    description: 'A traditional Indonesian village-style fried rice, fragrant and slightly smoky, packed with garlic, shallots, and spicy chilies.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=800&auto=format&fit=crop',
    prep_time: '10 Mins',
    cook_time: '10 Mins',
    difficulty: 'Easy',
    calories: '410 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: true,
    servings: '2 Servings',
    youtube_url: 'https://www.youtube.com/embed/8o4k3D0y55k',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '12g', fat: '18g', carbs: '52g' },
    ingredients: [
      { name: 'Day-old cooked rice', detail: '2 plates', role: 'Main carbohydrate base; cold rice prevents it from turning mushy.' },
      { name: 'Garlic', detail: '3 cloves', role: 'Ground aromatic base for savory flavor.' },
      { name: 'Shallots', detail: '4 pieces', role: 'Provides sweetness and deep aroma.' },
      { name: 'Bird\'s eye chilies', detail: '2 pieces', role: 'Gives the dish its spicy kick.' },
      { name: 'Sweet soy sauce', detail: '2 tbsp', role: 'Indonesian signature sweet glaze.' },
      { name: 'Egg', detail: '1 piece', role: 'Fried egg on top for classic presentation.' }
    ],
    instructions: [
      { title: 'Sauté spice paste', text: 'Heat oil in a wok and sauté the ground garlic, shallots, and chilies until fragrant and cooked through.' },
      { title: 'Add rice', text: 'Add the day-old rice to the wok, breaking up any clumps. Mix well to combine with the sautéed spice paste.' },
      { title: 'Season and stir-fry', text: 'Pour in the sweet soy sauce, salt, and pepper to taste. Stir-fry over high heat for 3-5 minutes until the rice is well-coated and slightly smoky. Serve hot with a fried egg.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.6,
    rating_count: 54
  },
  {
    title: 'Ayam Betutu Bali',
    description: 'An iconic Balinese spiced chicken slow-cooked with a rich paste of local aromatics, steamed in banana leaves and roasted to perfection.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop',
    prep_time: '30 Mins',
    cook_time: '2 Hours',
    difficulty: 'Hard',
    calories: '490 kcal',
    category: 'Main Course',
    region: 'Bali',
    spicy: true,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/qg9bNf5Wn14',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '34g', fat: '28g', carbs: '10g' },
    ingredients: [
      { name: 'Whole chicken', detail: '1 piece', role: 'Main protein slow-cooked to fall-off-the-bone tenderness.' },
      { name: 'Shallots', detail: '10 pieces, minced', role: 'Essential component of Balinese Base Gede.' },
      { name: 'Garlic', detail: '5 cloves, minced', role: 'Aromatic base.' },
      { name: 'Bird\'s eye chilies', detail: '5 pieces, sliced', role: 'Provides standard spicy heat.' },
      { name: 'Lemongrass', detail: '3 stalks, bruised', role: 'Aromatic citrus fragrance.' },
      { name: 'Turmeric & Ginger & Galangal', detail: '1 tbsp each, grated', role: 'Warm, earthy spice notes.' },
      { name: 'Cassava leaves', detail: '2 pieces', role: 'Stuffed inside the chicken to absorb the juices.' }
    ],
    instructions: [
      { title: 'Prepare Balinese spice paste', text: 'Mix the minced shallots, garlic, sliced chilies, lemongrass, grated turmeric, ginger, and galangal with oil.' },
      { title: 'Marinate chicken', text: 'Rub the spice paste thoroughly inside the chicken cavity and all over the skin. Stuff the cassava leaves inside the cavity.' },
      { title: 'Slow cook and roast', text: 'Wrap the chicken in banana leaves (or foil). Steam for 1.5 hours, then unwrap and roast in the oven at 180°C for 30 minutes until golden.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.8,
    rating_count: 42
  },
  {
    title: 'Soto Ayam Lamongan',
    description: 'A comforting yellow chicken soup from East Java, garnished with shredded chicken, glass noodles, cabbage, and a savory koya garlic powder.',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop',
    prep_time: '25 Mins',
    cook_time: '45 Mins',
    difficulty: 'Medium',
    calories: '310 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/E-9pZqHhK8k',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-serving-food-on-a-plate-at-a-buffet-4309-large.mp4',
    nutrition: { protein: '22g', fat: '14g', carbs: '28g' },
    ingredients: [
      { name: 'Chicken breast', detail: '500g', role: 'Main protein, shredded after boiling.' },
      { name: 'Chicken stock', detail: '1.5 Liters', role: 'Flavorful liquid base for the soup.' },
      { name: 'Turmeric powder', detail: '2 tsp', role: 'Gives the soup its characteristic yellow color.' },
      { name: 'Shallots & Garlic', detail: '5 shallots, 4 garlic', role: 'Ground spice paste aromatics.' },
      { name: 'Koya powder', detail: '50g', role: 'Savory topping made of fried garlic and shrimp crackers.' }
    ],
    instructions: [
      { title: 'Boil chicken', text: 'Boil chicken breast in stock with lemongrass and lime leaves until tender. Remove, shred, and set aside.' },
      { title: 'Sauté spice paste', text: 'Sauté ground shallots, garlic, turmeric, and coriander. Pour the paste into the simmering chicken stock.' },
      { title: 'Assemble and garnish', text: 'Place glass noodles, shredded chicken, and sliced cabbage in a bowl. Ladle hot yellow broth over. Sprinkle koya powder and serve with lime wedges.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.7,
    rating_count: 63
  },
  {
    title: 'Pempek Palembang',
    description: 'Crispy savory fish cakes originating from South Sumatra, served in a rich, sweet, and tangy Cuko chili sauce.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prep_time: '40 Mins',
    cook_time: '30 Mins',
    difficulty: 'Hard',
    calories: '380 kcal',
    category: 'Appetizer',
    region: 'Sumatra',
    spicy: true,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/kRj53_p1o9Y',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '18g', fat: '10g', carbs: '54g' },
    ingredients: [
      { name: 'Minced fish (tenggiri)', detail: '500g', role: 'High quality fish paste for texture and taste.' },
      { name: 'Tapioca flour', detail: '400g', role: 'Binds the fish mince to create chewy cakes.' },
      { name: 'Ice water', detail: '250ml', role: 'Keeps the fish meat cold and springy.' },
      { name: 'Palm sugar', detail: '200g (for Cuko)', role: 'Sweet base of the signature Cuko sauce.' },
      { name: 'Tamarind', detail: '3 tbsp (for Cuko)', role: 'Adds tangy acidity to balance palm sugar.' },
      { name: 'Garlic & Bird\'s eye chilies', detail: '5 garlic, 10 chilies', role: 'Aromatics and spice for the Cuko.' }
    ],
    instructions: [
      { title: 'Mix fish paste', text: 'Knead minced fish with ice water, salt, and sugar until sticky. Gradually fold in tapioca flour until smooth.' },
      { title: 'Shape and boil', text: 'Shape dough into logs (Pempek Lenjer) or stuff with egg (Pempek Kapal Selam). Boil in water until floating, then drain.' },
      { title: 'Fry and serve', text: 'Deep fry the boiled pempek until golden brown and crispy. Serve with sweet-sour Cuko sauce and cucumber slices.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.6,
    rating_count: 38
  },
  {
    title: 'Bakso Sapi Klasik',
    description: 'A popular comfort street food of springy beef meatballs served in a piping hot, savory bone marrow broth with noodles and greens.',
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cfac?q=80&w=800&auto=format&fit=crop',
    prep_time: '30 Mins',
    cook_time: '1 Hour',
    difficulty: 'Medium',
    calories: '420 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/k6aI1eWdZ00',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-stirring-a-stew-in-a-pot-4306-large.mp4',
    nutrition: { protein: '28g', fat: '20g', carbs: '32g' },
    ingredients: [
      { name: 'Lean ground beef', detail: '500g', role: 'Main protein base.' },
      { name: 'Tapioca starch', detail: '100g', role: 'Gives the meatballs their signature springy bite.' },
      { name: 'Egg white', detail: '1 piece', role: 'Acts as binder for beef emulsion.' },
      { name: 'Crushed ice', detail: '150g', role: 'Keeps meat cold during blending to maintain texture.' },
      { name: 'Beef bone broth', detail: '2 Liters', role: 'Rich and savory broth base.' }
    ],
    instructions: [
      { title: 'Emulsify meat paste', text: 'Blend beef, garlic, ice, egg white, salt, and tapioca starch in a food processor until it forms a smooth paste.' },
      { title: 'Shape meatballs', text: 'Squeeze paste through thumb and forefinger to form balls. Scoop with a spoon and drop into hot (not boiling) water.' },
      { title: 'Braise in bone broth', text: 'Boil the meatballs in bone broth seasoned with garlic, shallots, celery, and white pepper. Serve with noodles and pak choi.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.7,
    rating_count: 81
  },
  {
    title: 'Martabak Manis',
    description: 'An indulgent, thick Indonesian sweet pancake filled with chocolate, grated cheese, peanuts, and condensed milk.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    prep_time: '20 Mins',
    cook_time: '15 Mins',
    difficulty: 'Medium',
    calories: '490 kcal',
    category: 'Dessert',
    region: 'Jawa',
    spicy: false,
    servings: '6 Servings',
    youtube_url: 'https://www.youtube.com/embed/Pj13iHhWz9I',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
    nutrition: { protein: '8g', fat: '22g', carbs: '64g' },
    ingredients: [
      { name: 'All-purpose flour', detail: '250g', role: 'Flour base for pancake batter.' },
      { name: 'Milk or water', detail: '300ml', role: 'Liquid base for batter.' },
      { name: 'Baking soda & Yeast', detail: '1/2 tsp each', role: 'Leavening agents to create honeycomb texture.' },
      { name: 'Sugar', detail: '3 tbsp', role: 'Sweetens batter.' },
      { name: 'Chocolate & Cheese & Butter', detail: 'to taste', role: 'Indulgent toppings.' }
    ],
    instructions: [
      { title: 'Rest batter', text: 'Whisk flour, sugar, yeast, egg, and milk until smooth. Rest for 1 hour to allow yeast to activate. Whisk in baking soda right before cooking.' },
      { title: 'Bake in skillet', text: 'Pour batter into a greased heavy skillet. Cook on medium-low until honeycomb bubbles form. Sprinkle sugar on top, cover, and bake until dry.' },
      { title: 'Butter and slice', text: 'Remove from heat. Spread butter generously. Add toppings (chocolate, cheese, condensed milk). Fold in half, cut into slices, and serve.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.9,
    rating_count: 95
  },
  {
    title: 'Ayam Goreng Lengkuas',
    description: 'Golden fried chicken cooked with ground galangal, producing a mountain of crispy, aromatic spice crumbs that top the dish.',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop',
    prep_time: '20 Mins',
    cook_time: '40 Mins',
    difficulty: 'Easy',
    calories: '380 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/5aY1GZ818-w',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '28g', fat: '24g', carbs: '12g' },
    ingredients: [
      { name: 'Chicken pieces', detail: '1kg', role: 'Main protein.' },
      { name: 'Galangal', detail: '200g, grated', role: 'Key ingredient that forms the crunchy crispy toppings.' },
      { name: 'Lemongrass & Bay leaves', detail: '3 stalks, 4 leaves', role: 'Aromatics added during simmering.' },
      { name: 'Shallots & Garlic & Turmeric', detail: '8 shallots, 5 garlic, 3cm turmeric', role: 'Ground spice rub.' }
    ],
    instructions: [
      { title: 'Simmer chicken (Ungkep)', text: 'Mix chicken, grated galangal, ground spices, lemongrass, and bay leaves with a cup of water in a pot. Simmer until stock is dry.' },
      { title: 'Fry chicken', text: 'Separate chicken pieces from the galangal spice bits. Deep-fry chicken until crispy and golden brown.' },
      { title: 'Fry galangal crumbs', text: 'Deep-fry the remaining galangal spice crumbs until golden. Drain and sprinkle generously over the fried chicken.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.8,
    rating_count: 47
  },
  {
    title: 'Es Teler Klasik',
    description: 'A refreshing iced dessert containing avocado, young coconut, jackfruit slices, bathed in sweet syrup and condensed milk.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
    prep_time: '15 Mins',
    cook_time: '0 Mins',
    difficulty: 'Easy',
    calories: '260 kcal',
    category: 'Dessert',
    region: 'Jawa',
    spicy: false,
    servings: '2 Servings',
    youtube_url: 'https://www.youtube.com/embed/p1o1c-4t52M',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
    nutrition: { protein: '3g', fat: '12g', carbs: '38g' },
    ingredients: [
      { name: 'Avocado', detail: '1 piece, scooped', role: 'Rich, creamy fruit.' },
      { name: 'Young coconut', detail: '1 scrapings', role: 'Refreshing texture.' },
      { name: 'Jackfruit', detail: '100g, sliced', role: 'Sweet, tropical aroma.' },
      { name: 'Condensed milk', detail: '4 tbsp', role: 'Creamy sweetener.' },
      { name: 'Shaved ice & Simple syrup', detail: 'to taste', role: 'Base for sweet chilled dessert.' }
    ],
    instructions: [
      { title: 'Prepare ingredients', text: 'Scoop out avocado, scrape coconut flesh, and slice jackfruits.' },
      { title: 'Assemble bowl', text: 'Arrange the fruits inside a serving bowl. Mound shaved ice on top.' },
      { title: 'Drizzle sweet syrup', text: 'Pour simple syrup and condensed milk generously over the shaved ice. Serve immediately.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.6,
    rating_count: 31
  },
  {
    title: 'Sambal Goreng Kentang Ati',
    description: 'Fried potato cubes and boiled chicken liver tossed in a spicy, rich chili-coconut milk gravy, a staple celebration dish.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prep_time: '25 Mins',
    cook_time: '25 Mins',
    difficulty: 'Medium',
    calories: '290 kcal',
    category: 'Appetizer',
    region: 'Jawa',
    spicy: true,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/5k4y5j-vW00',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '16g', fat: '18g', carbs: '20g' },
    ingredients: [
      { name: 'Potatoes', detail: '500g, diced', role: 'Fried potato cubes; forms the bulk of the dish.' },
      { name: 'Chicken livers', detail: '250g, diced', role: 'Iron-rich boiled liver cubes.' },
      { name: 'Red curly chilies', detail: '10 pieces', role: 'Gives the dish its bright red color and spice paste base.' },
      { name: 'Coconut milk', detail: '100ml', role: 'Adds sweet creaminess to the chili paste.' }
    ],
    instructions: [
      { title: 'Fry components', text: 'Deep fry diced potatoes until light golden. Boil chicken liver with ginger, drain, and dice.' },
      { title: 'Cook spice paste', text: 'Sauté ground chilies, shallots, and garlic with lime leaves and galangal until fragrant. Stir in coconut milk.' },
      { title: 'Combine and reduce', text: 'Add the chicken livers and simmer in the sauce. Gently fold in the fried potato cubes until the gravy has fully reduced and coated the potatoes.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.5,
    rating_count: 22
  },
  {
    title: 'Ayam Taliwang Lombok',
    description: 'A fiery, spicy grilled chicken originating from Lombok, marinated with toasted shrimp paste and spicy bird\'s eye chilies.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop',
    prep_time: '25 Mins',
    cook_time: '40 Mins',
    difficulty: 'Medium',
    calories: '410 kcal',
    category: 'Main Course',
    region: 'Bali',
    spicy: true,
    servings: '4 Servings',
    youtube_url: 'https://www.youtube.com/embed/59J6u1uWp-w',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-putting-raw-meat-on-a-hot-grill-4304-large.mp4',
    nutrition: { protein: '32g', fat: '22g', carbs: '8g' },
    ingredients: [
      { name: 'Kampung chicken', detail: '1 whole', role: 'Traditional local baby chicken, grilled whole.' },
      { name: 'Red curly chilies', detail: '8 pieces', role: 'Base spice paste component.' },
      { name: 'Bird\'s eye chilies', detail: '5 pieces', role: 'Adds fiery heat.' },
      { name: 'Shrimp paste (Terasi)', detail: '1 tsp, toasted', role: 'Gives the dish its distinct, deep umami undertone.' },
      { name: 'Lime juice', detail: '2 tsp', role: 'Brightens and cuts through heat.' }
    ],
    instructions: [
      { title: 'Sauté spice base', text: 'Grind shallots, garlic, red chilies, bird\'s eye chilies, and toasted shrimp paste. Sauté the paste with oil until fragrant.' },
      { title: 'Braise chicken', text: 'Toss chicken with the sautéed spice paste and a cup of water. Simmer until the chicken is tender and has absorbed the spices.' },
      { title: 'Grill', text: 'Grill the chicken over charcoal or griddle, basting frequently with the leftover spice reduction until slightly charred and aromatic.' }
    ],
    author_name: 'Nusa Culinary',
    is_default: true,
    rating: 4.7,
    rating_count: 36
  }
];

async function insertRecipes() {
  console.log('Connecting to Supabase...');
  
  for (const recipe of newRecipes) {
    // Check if recipe already exists
    const { data: existing } = await supabase
      .from('recipes')
      .select('id')
      .eq('title', recipe.title)
      .maybeSingle();

    if (existing) {
      console.log(`Recipe "${recipe.title}" already exists. Skipping.`);
      continue;
    }

    console.log(`Inserting recipe: "${recipe.title}"...`);
    const { error } = await supabase
      .from('recipes')
      .insert(recipe);

    if (error) {
      console.error(`Error inserting "${recipe.title}":`, error.message);
    } else {
      console.log(`Successfully inserted "${recipe.title}"`);
    }
  }

  console.log('Seeding finished!');
}

insertRecipes();
