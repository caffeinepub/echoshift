const ADJECTIVES = [
  'Blue', 'Red', 'Green', 'Golden', 'Silver', 'Cosmic', 'Swift', 'Brave',
  'Clever', 'Mighty', 'Silent', 'Wild', 'Fierce', 'Noble', 'Mystic', 'Bright',
  'Dark', 'Storm', 'Fire', 'Ice', 'Thunder', 'Shadow', 'Crystal', 'Royal'
];

const ANIMALS = [
  'Tiger', 'Eagle', 'Wolf', 'Dragon', 'Phoenix', 'Lion', 'Bear', 'Hawk',
  'Panther', 'Falcon', 'Raven', 'Fox', 'Shark', 'Cobra', 'Lynx', 'Jaguar',
  'Owl', 'Viper', 'Leopard', 'Puma', 'Orca', 'Rhino', 'Bison', 'Stallion'
];

export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${animal}${number}`;
}

export function validateUsername(username: string): boolean {
  // Pattern: AdjectiveAnimalNumber (e.g., BlueTiger42)
  const pattern = /^[A-Z][a-z]+[A-Z][a-z]+\d{1,2}$/;
  return pattern.test(username);
}
