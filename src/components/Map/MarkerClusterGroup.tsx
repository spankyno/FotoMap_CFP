import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { createLayerComponent } from "@react-leaflet/core";

const MarkerClusterGroup = createLayerComponent(
  ({ children, ...props }, context) => {
    const clusterGroup = L.markerClusterGroup(props);
    return {
      instance: clusterGroup,
      context: { ...context, layerContainer: clusterGroup },
    };
  },
  ({ instance, ...props }, prevProps) => {
    // Update props if needed
  }
);

export default MarkerClusterGroup;
