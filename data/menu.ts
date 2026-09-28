export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'dessert' | 'drink';
  image?: string;
  available?: boolean; // false hides the dish from the public menu (managed in the dashboard)
  featured?: boolean; // true shows the dish in the home page "Featured Dishes"
}

export type MenuTab = 'all' | MenuItem['category'];

export const menuTabs: { label: string; value: MenuTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Starters', value: 'starter' },
  { label: 'Mains', value: 'main' },
  { label: 'Desserts', value: 'dessert' },
  { label: 'Drinks', value: 'drink' },
];

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Burrata & Heirloom Tomatoes',
    description: 'Creamy burrata, sliced tomatoes, basil oil, flaky salt, grilled sourdough',
    price: 12.5,
    category: 'starter',
    image: '/images/burrata.jpg',
  },
  {
    id: 2,
    name: 'Golden Calamari',
    description: 'Buttermilk-soaked rings fried until crisp, lemon, smoked paprika aioli',
    price: 11.0,
    category: 'starter',
    image: '/images/calamari.jpg',
  },
  {
    id: 3,
    name: 'Roasted Tomato Soup',
    description: 'Slow-roasted tomatoes, cream, torn basil, buttered croutons',
    price: 8.5,
    category: 'starter',
    image: '/images/tomato-soup.jpg',
  },
  {
    id: 4,
    name: 'Grilled Salmon',
    description: 'Atlantic salmon, lemon butter, seasonal vegetables',
    price: 24.99,
    category: 'main',
    image: '/images/salmon.jpg',
  },
  {
    id: 5,
    name: 'Herb-Roasted Chicken',
    description: 'Half chicken with a crackling skin, thyme jus, crushed potatoes',
    price: 18.99,
    category: 'main',
    image: '/images/chicken.jpg',
  },
  {
    id: 6,
    name: 'Braised Short Rib',
    description: 'Eight-hour red wine braise, buttermilk mash, glazed carrots',
    price: 27.5,
    category: 'main',
    image: '/images/short-rib.jpg',
  },
  {
    id: 7,
    name: 'Warm Chocolate Cake',
    description: 'Dark chocolate sponge, molten centre, raspberries, whipped cream',
    price: 9.0,
    category: 'dessert',
    image: '/images/chocolate-cake.jpg',
  },
  {
    id: 8,
    name: 'Crème Brûlée',
    description: 'Vanilla bean custard under a thin layer of burnt sugar',
    price: 8.5,
    category: 'dessert',
    image: '/images/creme-brulee.jpg',
  },
  {
    id: 9,
    name: 'Honey Cheesecake',
    description: 'Baked cheesecake, wildflower honey, blackberries, oat crumb',
    price: 9.5,
    category: 'dessert',
    image: '/images/cheesecake.jpg',
  },
  {
    id: 10,
    name: 'Iced Hibiscus Tea',
    description: 'Steeped hibiscus, orange peel, a little brown sugar',
    price: 5.5,
    category: 'drink',
    image: '/images/hibiscus-tea.jpg',
  },
  {
    id: 11,
    name: 'Mint Lemonade',
    description: 'Pressed lemons, crushed mint, sparkling water',
    price: 6.0,
    category: 'drink',
    image: '/images/lemonade.jpg',
  },
  {
    id: 12,
    name: 'Cold Brew Coffee',
    description: 'Steeped for 18 hours, served over ice with a splash of cream',
    price: 5.0,
    category: 'drink',
    image: '/images/cold-brew.jpg',
  },
];

// ids shown in the "Featured Dishes" section on the home page
const featuredIds = [4, 5, 1];

export const featuredItems: MenuItem[] = featuredIds
  .map((id) => menuItems.find((item) => item.id === id))
  .filter((item): item is MenuItem => item !== undefined);

export const formatPrice = (price: number) => `$${price.toFixed(2)}`;
