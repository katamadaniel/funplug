import React from "react";
import { useParams } from "react-router-dom";

import CategoryOption from "./CategoryOption";
import EventDetails from "./EventDetails";
import VenueDetails from "./VenueDetails";
import PerformanceDetails from "./PerformanceDetails";
import ServiceDetails from "./ServiceDetails";

export default function CategoryRouter() {
  const { slug, category } = useParams();

  // EVENTS
  if (slug === "events" && !category) {
    return <CategoryOption />;
  }

  if (slug === "events" && category) {
    return <EventDetails />;
  }

  // OTHER ROOT CATEGORIES
  if (slug === "venues") return <VenueDetails />;
  if (slug === "entertainment") return <PerformanceDetails />;
  if (slug === "services") return <ServiceDetails />;

  return <p>Unknown category</p>;
}
