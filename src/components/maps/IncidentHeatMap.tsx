import React from "react";
import { View } from "react-native";
import { PointAnnotation } from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../../store/useAppStore";
import { getIncidentLocations } from "../../../util/getIncidentLocations";

const IncidentLocations = () => {
    const { base_url, token } = useAppStore();

    const { data } = useQuery({
      queryKey: ['incident_locations'],
      queryFn: () => getIncidentLocations({ base_url, token})
    })

  if (!Array.isArray(data)) return null;

  return (
  <>
    {Array.isArray(data) &&
      data.length > 0 &&
      data.map((item: any, index: number) => (
        <PointAnnotation
          key={`marker-${index}`}
          id={`marker-${index}`}
          coordinate={[item?.location?.longitude, item?.location?.latitude]}
        >
          <View
            style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              backgroundColor: "red",
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        </PointAnnotation>
      ))}
  </>
);
};

export default IncidentLocations;
