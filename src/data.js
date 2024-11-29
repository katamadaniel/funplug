// data.js
export const users = [
  { id: 1, name: 'Azziad Nasenya', avatar: process.env.PUBLIC_URL + '/images/azziad.png', details: 'Radio Presenter' },
  { id: 2, name: 'King Kaka', avatar: process.env.PUBLIC_URL + '/images/king-kaka.jpg', details: 'Rapper/Poet' },
  { id: 3, name: 'Nadia Mukami', avatar: process.env.PUBLIC_URL + '/images/nadia-mukami.png', details: 'Singer/ Song writer' },
  { id: 4, name: 'Khaligraph Jones', avatar: process.env.PUBLIC_URL + '/images/khaligraph.webp', details: 'Rapper' },
  { id: 5, name: 'Brenda Wairimu', avatar: process.env.PUBLIC_URL + '/images/brenda wairimu.jpg', details: 'Actor' },
];

export const events = [
  {
    title: 'Food Fest24',
    image: process.env.PUBLIC_URL + '/images/food buffet.jpg',
    description: 'Details of event 1',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Standard', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  {
    title: 'Utamaduni festival',
    image: process.env.PUBLIC_URL + '/images/Cultural.jpg',
    description: 'Details of event 2',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Standard', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  {
    title: 'Night Life',
    image: process.env.PUBLIC_URL + '/images/Night-life.jpg',
    description: 'Details of event 3',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Standard', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  {
    title: 'New Year',
    image: process.env.PUBLIC_URL + '/images/New-year.jpg',
    description: 'Details of event 4',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Standard', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  {
    title: 'Spin Cyle',
    image: process.env.PUBLIC_URL + '/images/Spin-cycle.jpg',
    description: 'Details of event 5',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Standard', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  {
    title: 'Kids funday',
    image: process.env.PUBLIC_URL + '/images/Kids-fun.jpg',
    description: 'Details of event 6',
    creatorImage: 'images/creator.jpg',
    creatorName: 'John Doe',
    venue: 'Central Park',
    date: '2024-06-15',
    time: '12:00 PM',
    tickets: [
      { type: 'Regular', price: 20 },
      { type: 'VIP', price: 50 }
    ]
  },
  // Add more events here
];
