export const siteConfig = {
  name: 'Crunch’s',
  tagline: 'Fried, roasted and baked from scratch since 2014.',
  description:
    'Crunch’s is a neighbourhood kitchen serving crisp, golden comfort food made from scratch.',
  founded: 2014,
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Dashboard', href: '/dashboard' },
];

export interface Slide {
  src: string;
  alt: string;
}

export const heroSlides: Slide[] = [
  { src: '/images/hero-1.jpg', alt: 'Warm restaurant lights glowing in the evening' },
  { src: '/images/hero-2.jpg', alt: 'Candlelit dining room with a wooden table' },
  { src: '/images/hero-3.jpg', alt: 'Soft daylight streaming into the dining room' },
];

export const contactInfo = {
  address: '214 Maple Street, Chicago, IL 60601',
  phone: '(312) 555-0148',
  phoneHref: 'tel:+13125550148',
  email: 'hello@crunchs.com',
  // any coordinates work, swap in your own
  mapSrc: 'https://www.google.com/maps?q=41.8827,-87.6233&z=15&output=embed',
};

export const aboutStory = [
  'Crunch’s started in 2014 as a six-table room in a former bakery, with two siblings, one fryer and a very stubborn opinion about batter. Mara had spent years in hotel kitchens; her brother Daniel had spent the same years wishing someone would just make a proper fried chicken sandwich. They pooled their savings, kept the old bakery ovens and opened the doors.',
  'Ten years on, the menu has grown but the rule hasn’t changed: everything is made in the building. Bread is baked at five each morning, sauces are simmered in the afternoon, and nothing goes in the fryer until an order is on the ticket. We buy vegetables from two farms an hour outside the city and change the specials with whatever they bring us.',
  'The dining room still has the original tile floor and a wall of bakery trays that we never had the heart to take down. Come hungry, sit wherever you like, and expect to hear the kitchen before you see it.',
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export const team: TeamMember[] = [
  {
    name: 'Mara Okafor',
    role: 'Head Chef & Co-founder',
    bio: 'Trained in hotel kitchens, now guards the recipe for our buttermilk batter.',
  },
  {
    name: 'Daniel Okafor',
    role: 'General Manager & Co-founder',
    bio: 'Runs the floor, knows every regular by name and their usual order.',
  },
  {
    name: 'Priya Nair',
    role: 'Pastry Chef',
    bio: 'Bakes the bread at dawn and builds every dessert on the menu.',
  },
];
