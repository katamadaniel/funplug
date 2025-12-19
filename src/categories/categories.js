// categories.js
export const categories = [
    { name: "Events", 
      slug: "events",
      image: process.env.PUBLIC_URL + '/images/events-image.png', 
      target: "CategoryDetails"
    },
    { name: "Venues", 
      slug: "venues", 
      image: process.env.PUBLIC_URL + '/images/venue-image.png', 
      target: "LocationDetails" 
    },
    { name: "Entertainment", 
      slug: "entertainment", 
      image: process.env.PUBLIC_URL + '/images/performance-image.png', 
      target: "PerformanceDetails" 
    },
    { name: "Services", 
      slug: "services", 
      image: process.env.PUBLIC_URL + '/images/service-image.png', 
      target: "ServiceDetails" 
    },
  ];
  