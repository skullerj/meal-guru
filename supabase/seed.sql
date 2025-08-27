-- Seed file for migrating legacy recipe data to Supabase
-- Generated from src/data/recipes.ts legacy data

-- Insert ingredients first (PostgreSQL will auto-generate UUIDs)
INSERT INTO ingredients (name, unit, source, shelf) VALUES
-- Fajita Chicken Rice Bowl ingredients
('chicken', 'g', '{"url": "https://www.ocado.com/products/m-s-oakham-gold-medium-whole-chicken/634262011", "price": 7.25, "amount": 1000}', false),
('peppers', 'g', '{"url": "https://www.ocado.com/products/ocado-red-peppers/65259011", "price": 1.85, "amount": 450}', false),
('red onions', 'g', '{"url": "https://www.ocado.com/products/ocado-red-onions/65453011", "price": 0.95, "amount": 300}', false),
('corn', 'g', '{"url": "https://www.ocado.com/products/ocado-baby-corn/639250011", "price": 1.45, "amount": 130}', false),
('chipotle chilli paste', 'tsp', '{"url": "https://www.ocado.com/products/santa-maria-chipotle-paste/421557011", "price": 0, "amount": 0}', true),
('lime', 'unit', '{"url": "https://www.ocado.com/products/m-s-limes/528789011", "price": 1.6, "amount": 5}', false),
('vegetable oil', 'ml', '{"url": "https://www.ocado.com/products/ktc-rapeseed-vegetable-oil/298819011", "price": 0, "amount": 0}', true),
('black beans', 'g', '{"url": "https://www.ocado.com/products/ocado-black-beans-in-water/414453011", "price": 0.49, "amount": 235}', false),
('coriander', 'g', '{"url": "https://www.ocado.com/products/ocado-coriander/82803011", "price": 0.52, "amount": 30}', false),
('brown rice', 'g', '{"url": "https://www.ocado.com/products/m-s-wholegrain-rice/518823011", "price": 1.65, "amount": 500}', true),
('salsa', 'ml', '{"url": "https://www.ocado.com/products/m-s-red-salsa/509916011", "price": 1.2, "amount": 120}', true),

-- Lentil-Eggplant Stew ingredients
('olive oil', 'ml', '{"url": "https://www.ocado.com/products/filippo-berio-extra-virgin-olive-oil/13887011", "price": 5, "amount": 500}', true),
('garlic cloves', 'unit', '{"url": "https://www.ocado.com/products/ocado-large-garlic/91370011", "price": 0.4, "amount": 6}', false),
('red onion', 'g', '{"url": "https://www.ocado.com/products/ocado-red-onions/65453011", "price": 0.95, "amount": 480}', false),
('thyme', 'g', '{"url": "https://www.ocado.com/products/cook-with-m-s-thyme/518923011", "price": 1.5, "amount": 17}', true),
('eggplants', 'unit', '{"url": "https://www.ocado.com/products/ocado-aubergine/474749011", "price": 0.95, "amount": 1}', false),
('cherry tomatoes', 'g', '{"url": "https://www.ocado.com/products/m-s-cherry-tomatoes/517743011", "price": 1.2, "amount": 350}', false),
('puy lentils', 'g', '{"url": "https://www.ocado.com/products/great-scot-green-lentils/516744011", "price": 1.75, "amount": 500}', true),
('vegetable broth cube stocks', 'unit', '{"url": "https://www.ocado.com/products/oxo-12-vegetable-stock-cubes/19366011", "price": 2.4, "amount": 12}', true),
('dry white wine', 'ml', '{"url": "https://www.ocado.com/products/m-s-pinot-grigio-provincia-di-pavia/513458011", "price": 7.5, "amount": 750}', true),
('crème fraîche', 'g', '{"url": "https://www.ocado.com/products/m-s-creme-fraiche/574047011", "price": 1.1, "amount": 300}', false),
('chilly flakes', 'g', '{"url": "https://www.ocado.com/products/cook-with-m-s-chilli-flakes/518837011", "price": 1.5, "amount": 30}', true),
('oregano leaves', 'g', '{"url": "https://www.ocado.com/products/cook-with-m-s-oregano/518834011", "price": 1.5, "amount": 12}', true),
('salt', 'g', '{"url": "https://www.ocado.com/products/saxa-fine-sea-salt/529703011", "price": 1.65, "amount": 350}', true),
('black pepper', 'g', '{"url": "https://www.ocado.com/products/cook-with-m-s-black-peppercorns/518911011", "price": 3.2, "amount": 100}', true)

ON CONFLICT (name) DO NOTHING;

-- Insert recipes (PostgreSQL will auto-generate UUIDs)
INSERT INTO recipes (name) VALUES
('Fajita Chicken Rice Bowl'),
('Lentil-Eggplant Stew')

ON CONFLICT (name) DO NOTHING;

-- Insert recipe ingredients using subqueries to reference by name
-- Fajita Chicken Rice Bowl
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 640, 1 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'chicken';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 300, 2 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'peppers';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 200, 3 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'red onions';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 130, 4 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'corn';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 3, 5 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'chipotle chilli paste';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 1, 6 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'lime';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 15, 7 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'vegetable oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 235, 8 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'black beans';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 15, 9 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'coriander';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 200, 10 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'brown rice';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 30, 11 FROM recipes r, ingredients i WHERE r.name = 'Fajita Chicken Rice Bowl' AND i.name = 'salsa';

-- Lentil-Eggplant Stew
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 50, 1 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'olive oil';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 3, 2 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'garlic cloves';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 160, 3 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'red onion';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 9, 4 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'thyme';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 2, 5 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'eggplants';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 200, 6 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'cherry tomatoes';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 180, 7 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'puy lentils';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 1, 8 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'vegetable broth cube stocks';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 80, 9 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'dry white wine';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 100, 10 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'crème fraîche';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 2, 11 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'chilly flakes';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 2, 12 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'oregano leaves';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 18, 13 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, order_index)
SELECT r.id, i.id, 8, 14 FROM recipes r, ingredients i WHERE r.name = 'Lentil-Eggplant Stew' AND i.name = 'black pepper';
