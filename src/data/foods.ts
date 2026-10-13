/** Nutrition per 100 g of food. Fibre is part of carbs, as on a nutrition label. */
export type Nutrients = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type FoodCategory =
  | 'Protein'
  | 'Dairy'
  | 'Grains'
  | 'Legumes'
  | 'Fruit'
  | 'Vegetables'
  | 'Nuts & fats'
  | 'Snacks & drinks'
  | 'Indian'
  | 'My foods';

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  /** Per 100 g (or 100 ml for drinks). */
  per100g: Nutrients;
  /** The portion one tap of "1 serving" means. */
  serving: { label: string; grams: number };
  custom?: boolean;
};

export const FOOD_CATEGORIES: readonly FoodCategory[] = [
  'Protein',
  'Dairy',
  'Grains',
  'Legumes',
  'Fruit',
  'Vegetables',
  'Nuts & fats',
  'Snacks & drinks',
  'Indian',
];

type Row = [
  name: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  servingLabel: string,
  servingGrams: number,
];

function category(name: FoodCategory, rows: Row[]): Food[] {
  return rows.map(([foodName, kcal, protein, carbs, fat, fiber, label, grams]) => ({
    id: `${name}-${foodName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: foodName,
    category: name,
    per100g: { kcal, protein, carbs, fat, fiber },
    serving: { label, grams },
  }));
}

/*
 * Typical values for common foods, rounded from public nutrition databases.
 * Cooked foods are listed cooked. Brands and recipes vary — these are estimates
 * meant for everyday tracking, and custom foods cover anything more exact.
 */
export const FOODS: readonly Food[] = [
  ...category('Protein', [
    ['Chicken breast, cooked', 165, 31, 0, 3.6, 0, '1 breast', 120],
    ['Chicken thigh, cooked', 209, 26, 0, 10.9, 0, '1 thigh', 100],
    ['Turkey breast, roasted', 135, 30, 0, 0.7, 0, '1 serving', 100],
    ['Beef mince 90% lean, cooked', 217, 26, 0, 12, 0, '1 serving', 100],
    ['Beef steak, grilled', 206, 30, 0, 9, 0, '1 steak', 170],
    ['Pork loin, cooked', 143, 26, 0, 3.5, 0, '1 serving', 100],
    ['Bacon, cooked', 541, 37, 1.4, 42, 0, '1 slice', 8],
    ['Salmon, cooked', 206, 22, 0, 12, 0, '1 fillet', 150],
    ['Tuna, canned in water', 116, 26, 0, 1, 0, '1 can', 120],
    ['Cod, cooked', 105, 23, 0, 0.9, 0, '1 fillet', 150],
    ['Shrimp, cooked', 99, 24, 0.2, 0.3, 0, '1 serving', 85],
    ['Egg, whole', 143, 12.6, 0.7, 9.5, 0, '1 large egg', 50],
    ['Egg white', 52, 11, 0.7, 0.2, 0, '1 egg white', 33],
    ['Tofu, firm', 144, 17, 3, 9, 2.3, '1 serving', 100],
    ['Tempeh', 192, 20, 8, 11, 0, '1 serving', 100],
    ['Whey protein powder', 400, 80, 8, 6, 0, '1 scoop', 30],
  ]),
  ...category('Dairy', [
    ['Milk, whole', 61, 3.2, 4.8, 3.3, 0, '1 cup', 244],
    ['Milk, skim', 34, 3.4, 5, 0.1, 0, '1 cup', 245],
    ['Greek yogurt, plain nonfat', 59, 10, 3.6, 0.4, 0, '1 tub', 170],
    ['Yogurt, plain whole milk', 61, 3.5, 4.7, 3.3, 0, '1 cup', 245],
    ['Cottage cheese, low fat', 72, 12, 2.7, 1, 0, '1/2 cup', 113],
    ['Cheddar cheese', 403, 25, 1.3, 33, 0, '1 slice', 28],
    ['Mozzarella', 280, 28, 3, 17, 0, '1 serving', 28],
    ['Butter', 717, 0.9, 0.1, 81, 0, '1 tbsp', 14],
  ]),
  ...category('Grains', [
    ['White rice, cooked', 130, 2.7, 28, 0.3, 0.4, '1 cup', 158],
    ['Brown rice, cooked', 123, 2.7, 25.6, 1, 1.8, '1 cup', 195],
    ['Oats, dry', 389, 16.9, 66, 6.9, 10.6, '1/2 cup', 40],
    ['Pasta, cooked', 158, 5.8, 31, 0.9, 1.8, '1 cup', 140],
    ['Bread, white', 265, 9, 49, 3.2, 2.7, '1 slice', 30],
    ['Bread, whole wheat', 252, 12.5, 43, 3.5, 6, '1 slice', 32],
    ['Flour tortilla', 304, 8, 50, 8, 3, '1 tortilla', 45],
    ['Quinoa, cooked', 120, 4.4, 21, 1.9, 2.8, '1 cup', 185],
    ['Cornflakes', 357, 7, 84, 0.4, 3.3, '1 bowl', 30],
    ['Granola', 471, 10, 64, 20, 5.3, '1/2 cup', 50],
    ['Potato, boiled', 87, 1.9, 20, 0.1, 1.8, '1 medium', 170],
    ['Sweet potato, baked', 90, 2, 21, 0.2, 3.3, '1 medium', 130],
  ]),
  ...category('Legumes', [
    ['Lentils, cooked', 116, 9, 20, 0.4, 7.9, '1 cup', 198],
    ['Chickpeas, cooked', 164, 8.9, 27, 2.6, 7.6, '1 cup', 164],
    ['Kidney beans, cooked', 127, 8.7, 23, 0.5, 6.4, '1 cup', 177],
    ['Black beans, cooked', 132, 8.9, 24, 0.5, 8.7, '1 cup', 172],
  ]),
  ...category('Fruit', [
    ['Banana', 89, 1.1, 23, 0.3, 2.6, '1 medium', 118],
    ['Apple', 52, 0.3, 14, 0.2, 2.4, '1 medium', 182],
    ['Orange', 47, 0.9, 12, 0.1, 2.4, '1 medium', 131],
    ['Grapes', 69, 0.7, 18, 0.2, 0.9, '1 cup', 151],
    ['Strawberries', 32, 0.7, 7.7, 0.3, 2, '1 cup', 152],
    ['Blueberries', 57, 0.7, 14, 0.3, 2.4, '1 cup', 148],
    ['Mango', 60, 0.8, 15, 0.4, 1.6, '1 cup', 165],
    ['Watermelon', 30, 0.6, 7.6, 0.2, 0.4, '1 wedge', 280],
    ['Avocado', 160, 2, 8.5, 14.7, 6.7, '1/2 avocado', 100],
  ]),
  ...category('Vegetables', [
    ['Broccoli', 34, 2.8, 7, 0.4, 2.6, '1 cup', 91],
    ['Spinach', 23, 2.9, 3.6, 0.4, 2.2, '1 cup', 30],
    ['Carrot', 41, 0.9, 10, 0.2, 2.8, '1 medium', 61],
    ['Tomato', 18, 0.9, 3.9, 0.2, 1.2, '1 medium', 123],
    ['Cucumber', 15, 0.7, 3.6, 0.1, 0.5, '1 cup', 104],
    ['Onion', 40, 1.1, 9.3, 0.1, 1.7, '1 medium', 110],
    ['Bell pepper', 31, 1, 6, 0.3, 2.1, '1 medium', 119],
    ['Mushrooms', 22, 3.1, 3.3, 0.3, 1, '1 cup', 70],
    ['Cauliflower', 25, 1.9, 5, 0.3, 2, '1 cup', 107],
    ['Green peas', 81, 5.4, 14, 0.4, 5.7, '1/2 cup', 80],
    ['Sweet corn', 96, 3.4, 21, 1.5, 2.4, '1 ear', 90],
  ]),
  ...category('Nuts & fats', [
    ['Almonds', 579, 21, 22, 50, 12.5, '1 handful', 28],
    ['Peanuts', 567, 26, 16, 49, 8.5, '1 handful', 28],
    ['Walnuts', 654, 15, 14, 65, 6.7, '1 handful', 28],
    ['Cashews', 553, 18, 30, 44, 3.3, '1 handful', 28],
    ['Peanut butter', 588, 25, 20, 50, 6, '2 tbsp', 32],
    ['Chia seeds', 486, 17, 42, 31, 34, '1 tbsp', 12],
    ['Olive oil', 884, 0, 0, 100, 0, '1 tbsp', 14],
    ['Ghee', 876, 0.3, 0, 99.5, 0, '1 tbsp', 14],
  ]),
  ...category('Snacks & drinks', [
    ['Dark chocolate', 546, 4.9, 61, 31, 7, '2 squares', 20],
    ['Milk chocolate', 535, 7.7, 59, 30, 3.4, '2 squares', 20],
    ['Potato chips', 536, 7, 53, 35, 4.4, '1 small bag', 28],
    ['Pizza, cheese', 266, 11, 33, 10, 2.3, '1 slice', 107],
    ['Hamburger', 295, 17, 24, 14, 1.3, '1 burger', 160],
    ['French fries', 312, 3.4, 41, 15, 3.8, '1 medium', 117],
    ['Ice cream, vanilla', 207, 3.5, 24, 11, 0.7, '1/2 cup', 66],
    ['Honey', 304, 0.3, 82, 0, 0.2, '1 tbsp', 21],
    ['Sugar', 387, 0, 100, 0, 0, '1 tsp', 4],
    ['Cola', 42, 0, 10.6, 0, 0, '1 can (330 ml)', 330],
    ['Orange juice', 45, 0.7, 10.4, 0.2, 0.2, '1 glass', 250],
    ['Coffee, black', 1, 0.1, 0, 0, 0, '1 cup', 240],
  ]),
  ...category('Indian', [
    ['Roti / chapati', 297, 9.8, 46, 7.5, 7, '1 roti', 40],
    ['Paratha, plain', 326, 7, 45, 13, 3.5, '1 paratha', 80],
    ['Dal, cooked', 105, 6, 14, 3, 4, '1 katori', 150],
    ['Paneer', 296, 18, 3.6, 22, 0, '1 serving', 100],
    ['Curd / dahi', 61, 3.5, 4.7, 3.3, 0, '1 katori', 150],
    ['Idli', 130, 4, 27, 0.4, 1, '1 idli', 40],
    ['Dosa, plain', 168, 4, 29, 3.7, 1.5, '1 dosa', 90],
    ['Poha', 130, 2.6, 25, 2, 1.5, '1 plate', 150],
    ['Upma', 120, 3, 18, 4, 1.5, '1 plate', 200],
    ['Rajma curry', 120, 6, 17, 3, 5, '1 katori', 150],
    ['Chole (chickpea curry)', 150, 7, 20, 5, 6, '1 katori', 150],
    ['Chicken curry', 140, 12, 4, 8, 1, '1 katori', 150],
    ['Chicken biryani', 160, 8, 20, 5, 1, '1 plate', 300],
    ['Veg pulao', 140, 3, 24, 3.5, 1.5, '1 plate', 250],
    ['Samosa', 262, 3.5, 24, 17, 2, '1 samosa', 60],
  ]),
];

const BY_ID = new Map(FOODS.map((food) => [food.id, food]));

export function getBuiltInFood(id: string | undefined): Food | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** Nutrition for an amount of food. */
export function scaleNutrients(per100g: Nutrients, grams: number): Nutrients {
  const factor = grams / 100;
  return {
    kcal: per100g.kcal * factor,
    protein: per100g.protein * factor,
    carbs: per100g.carbs * factor,
    fat: per100g.fat * factor,
    fiber: per100g.fiber * factor,
  };
}

export function matchesQuery(food: Food, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return true;
  }
  const haystack = `${food.name} ${food.category}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
