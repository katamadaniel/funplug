import React from "react";
import { useParams } from "react-router-dom";

import CategoryOption from "./CategoryOption";
import CategoryDetails from "./CategoryDetails";
import LocationDetails from "./LocationDetails";
import ArtDetails from "./ArtDetails";
import ServiceDetails from "./ServiceDetails";

export default function CategoryRouter() {
  const { slug, category } = useParams();

  // EVENTS
  if (slug === "events" && !category) {
    return <CategoryOption />;
  }

  if (slug === "events" && category) {
    return <CategoryDetails />;
  }

  // OTHER ROOT CATEGORIES
  if (slug === "venues") return <LocationDetails />;
  if (slug === "entertainment") return <ArtDetails />;
  if (slug === "services") return <ServiceDetails />;

  return <p>Unknown category</p>;
}
