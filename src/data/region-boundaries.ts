// GeoJSON polygon boundaries for Nigerian geopolitical zones
// Coordinates are approximate outlines suitable for Mapbox GL JS visualization

export const regionBoundaries: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // ─── REG-001: South-West Region ──────────────────────────────────────
    // States: Lagos, Ogun, Oyo, Ondo, Osun, Ekiti
    // Bounded roughly by 2.5-5.8°E, 6.0-8.8°N
    {
      type: 'Feature',
      properties: {
        id: 'REG-001',
        name: 'South-West Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2.69, 6.36],   // Lagos coast - western tip near Badagry
            [2.72, 6.44],   // Lagos lagoon area
            [3.42, 6.39],   // Lagos - Lekki area
            [4.35, 6.22],   // Ondo coast - Ilaje area
            [4.85, 6.00],   // Ondo coast eastern edge
            [5.72, 5.95],   // Near Ondo/Edo border at coast
            [5.78, 6.60],   // Ekiti/Ondo eastern border
            [5.75, 7.30],   // Ekiti - northern extent
            [5.48, 7.65],   // Ekiti/Kogi border
            [5.00, 7.98],   // Northern Osun near Kwara border
            [4.55, 8.15],   // Oyo - northern extent near Kwara border
            [4.10, 8.50],   // Oyo - Igbeti area, NW corner
            [3.60, 8.65],   // Oyo - Saki area
            [3.10, 8.50],   // Oyo - border with Benin Republic at north
            [2.72, 7.85],   // Ogun western border with Benin Republic
            [2.68, 7.10],   // Ogun - Abeokuta area
            [2.69, 6.36],   // Close polygon back to Lagos coast
          ],
        ],
      },
    },

    // ─── REG-002: South-East Region ──────────────────────────────────────
    // States: Enugu, Anambra, Imo, Abia, Ebonyi
    // Bounded roughly by 6.7-8.5°E, 5.0-7.5°N
    {
      type: 'Feature',
      properties: {
        id: 'REG-002',
        name: 'South-East Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [6.73, 5.10],   // Imo - southern tip near Rivers border
            [7.00, 5.00],   // Abia - southern extent
            [7.45, 4.95],   // Abia - near Akwa Ibom border
            [7.80, 5.20],   // Abia - eastern edge near Cross River
            [8.10, 5.75],   // Ebonyi - southeastern corner
            [8.30, 6.30],   // Ebonyi - eastern border near Cross River
            [8.10, 6.70],   // Ebonyi - northern edge near Benue border
            [7.70, 7.05],   // Enugu - northern extent near Kogi/Benue
            [7.40, 7.15],   // Enugu - Nsukka area
            [7.00, 7.20],   // Enugu - northwestern corner near Kogi
            [6.70, 6.95],   // Anambra - Awka northern area
            [6.60, 6.50],   // Anambra - western edge near Delta
            [6.68, 6.00],   // Anambra/Imo border near Onitsha-Owerri corridor
            [6.73, 5.10],   // Close polygon
          ],
        ],
      },
    },

    // ─── REG-003: South-South Region ─────────────────────────────────────
    // States: Rivers, Delta, Edo, Bayelsa, Cross River, Akwa Ibom
    // Bounded roughly by 5.0-9.4°E, 4.2-7.5°N
    // This region wraps around the South-East from the south and east
    {
      type: 'Feature',
      properties: {
        id: 'REG-003',
        name: 'South-South Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [5.05, 5.75],   // Edo - western border near Ondo
            [5.72, 5.95],   // Edo/Ondo border near coast
            [5.68, 6.10],   // Delta - northern coast
            [5.48, 5.50],   // Delta - Warri area
            [5.10, 5.00],   // Delta - coastal creeks area
            [5.40, 4.40],   // Bayelsa/Delta coast - Forcados
            [5.95, 4.32],   // Bayelsa - Brass area coast
            [6.45, 4.40],   // Rivers - Bonny area coast
            [7.00, 4.45],   // Rivers - eastern coast
            [7.50, 4.55],   // Akwa Ibom - coast near Eket
            [8.00, 4.55],   // Akwa Ibom - southeastern coast
            [8.35, 4.65],   // Cross River - Calabar coast
            [8.70, 4.95],   // Cross River - coast near Cameroon
            [9.35, 5.85],   // Cross River - eastern border with Cameroon
            [9.25, 6.40],   // Cross River - Cameroon border heading north
            [9.00, 6.70],   // Cross River - Obudu area
            [8.70, 6.80],   // Cross River - northern edge near Benue
            [8.30, 6.30],   // Ebonyi/Cross River border
            [8.10, 5.75],   // Near SE/SS boundary
            [7.80, 5.20],   // Abia/Cross River border area
            [7.45, 4.95],   // Abia/Akwa Ibom border
            [7.00, 5.00],   // Rivers/Abia border
            [6.73, 5.10],   // Rivers/Imo border
            [6.60, 5.40],   // Rivers - near Imo border
            [6.50, 5.80],   // Delta - near Anambra border
            [6.20, 6.10],   // Delta - near Edo border
            [5.75, 6.55],   // Edo - near Ekiti/Ondo border
            [5.30, 6.80],   // Edo - northern area near Kogi
            [5.15, 7.20],   // Edo - northern extent near Kogi
            [5.00, 7.15],   // Edo - Auchi area
            [5.05, 6.60],   // Edo - western edge
            [5.05, 5.75],   // Close polygon
          ],
        ],
      },
    },

    // ─── REG-004: North-Central Region ───────────────────────────────────
    // States: Abuja FCT, Plateau, Kwara, Kogi, Nasarawa, Niger, Benue
    // Bounded roughly by 3.0-10.0°E, 6.8-10.8°N (wide middle belt)
    {
      type: 'Feature',
      properties: {
        id: 'REG-004',
        name: 'North-Central Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.00, 8.50],   // Kwara - western border with Benin Republic
            [3.10, 8.50],   // Kwara/Oyo border
            [4.10, 8.50],   // Kwara - near Oyo border
            [4.55, 8.15],   // Kwara/Oyo border
            [5.00, 7.98],   // Kwara/Osun border
            [5.48, 7.65],   // Kogi/Ekiti border
            [5.75, 7.30],   // Kogi - near Ekiti/Edo
            [5.15, 7.20],   // Kogi - near Edo border
            [5.30, 6.80],   // Kogi/Edo border
            [6.70, 6.95],   // Kogi - eastern portion near Anambra
            [7.00, 7.20],   // Kogi/Enugu border
            [7.40, 7.15],   // Enugu/Kogi/Benue junction
            [7.70, 7.05],   // Benue - western edge
            [8.10, 6.70],   // Benue - south near Ebonyi/Cross River
            [8.70, 6.80],   // Benue - near Cross River border
            [9.00, 6.70],   // Benue - southeastern corner near Cross River
            [9.60, 7.10],   // Benue - eastern border near Taraba/Cameroon
            [9.80, 7.65],   // Benue - near Taraba border
            [9.90, 8.20],   // Benue/Nasarawa/Taraba junction
            [9.95, 8.80],   // Plateau - eastern edge
            [9.80, 9.50],   // Plateau - northeastern edge near Bauchi
            [9.40, 9.80],   // Plateau - northern edge
            [8.80, 10.05],  // Plateau/Bauchi border
            [8.50, 9.85],   // Plateau/Kaduna/Bauchi junction
            [8.00, 9.85],   // Nasarawa/Kaduna border
            [7.40, 9.60],   // Near Abuja / Kaduna border
            [7.00, 9.80],   // Niger - near Kaduna border
            [6.50, 10.10],  // Niger - central area
            [5.60, 10.60],  // Niger - northern extent
            [4.50, 10.80],  // Niger - northwestern area
            [3.80, 10.40],  // Niger - border with Benin Republic
            [3.40, 10.00],  // Niger/Kwara border
            [3.10, 9.50],   // Kwara - northern portion
            [3.00, 8.80],   // Kwara - western border
            [3.00, 8.50],   // Close polygon
          ],
        ],
      },
    },

    // ─── REG-005: North-West Region ──────────────────────────────────────
    // States: Kano, Kaduna, Sokoto, Zamfara, Kebbi, Katsina, Jigawa
    // Bounded roughly by 3.0-10.5°E, 9.0-14.0°N
    {
      type: 'Feature',
      properties: {
        id: 'REG-005',
        name: 'North-West Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.40, 10.00],  // Kebbi - southwestern border
            [3.80, 10.40],  // Kebbi/Niger border
            [4.50, 10.80],  // Niger/Kebbi border area
            [3.60, 11.40],  // Kebbi - western edge
            [3.40, 11.80],  // Kebbi - border with Benin/Niger Republic
            [3.50, 12.20],  // Kebbi - near Sokoto
            [3.80, 12.80],  // Sokoto - western border with Niger Republic
            [4.20, 13.30],  // Sokoto - northwestern corner
            [4.80, 13.70],  // Sokoto - northern border
            [5.40, 13.80],  // Sokoto/Zamfara border at north
            [5.90, 13.50],  // Zamfara - northern edge
            [6.50, 13.50],  // Katsina - northern border with Niger Republic
            [7.20, 13.70],  // Katsina - northern extent
            [7.80, 13.90],  // Katsina - northeastern border
            [8.50, 13.50],  // Katsina/Kano - border area
            [9.00, 13.40],  // Jigawa - northern border
            [9.60, 13.20],  // Jigawa - northeastern border
            [10.20, 12.80], // Jigawa - eastern border near Bauchi/Yobe
            [10.30, 12.20], // Jigawa/Bauchi border
            [10.00, 11.60], // Jigawa/Bauchi southern junction
            [9.70, 11.00],  // Kano/Bauchi border
            [9.30, 10.50],  // Kaduna/Bauchi border
            [8.80, 10.05],  // Kaduna/Plateau border
            [8.50, 9.85],   // Kaduna - south near Plateau junction
            [8.00, 9.85],   // Kaduna - southern edge
            [7.40, 9.60],   // Kaduna/Abuja border
            [7.00, 9.80],   // Kaduna/Niger border
            [6.50, 10.10],  // Niger/Kaduna junction
            [5.60, 10.60],  // Niger border area
            [4.50, 10.80],  // Niger border
            [3.40, 10.00],  // Close polygon
          ],
        ],
      },
    },

    // ─── REG-006: North-East Region ──────────────────────────────────────
    // States: Borno, Adamawa, Bauchi, Gombe, Yobe, Taraba
    // Bounded roughly by 8.5-14.7°E, 6.5-14.0°N
    {
      type: 'Feature',
      properties: {
        id: 'REG-006',
        name: 'North-East Region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [9.90, 8.20],   // Taraba - western edge near Benue/Nasarawa
            [9.80, 7.65],   // Taraba - southwestern corner near Benue
            [9.60, 7.10],   // Taraba - southern tip near Benue/Cameroon
            [10.20, 7.00],  // Taraba - Cameroon border southern start
            [11.00, 6.60],  // Adamawa/Taraba - Cameroon border
            [11.50, 6.75],  // Adamawa - Cameroon border
            [12.00, 7.70],  // Adamawa - Cameroon border heading NE
            [12.50, 8.50],  // Adamawa - eastern border with Cameroon
            [12.80, 9.20],  // Adamawa/Borno - Cameroon border
            [13.10, 10.00], // Borno - Cameroon border
            [13.60, 10.80], // Borno - near Lake Chad area
            [14.20, 11.50], // Borno - northeastern edge near Chad
            [14.60, 12.20], // Borno - Lake Chad area
            [14.50, 13.00], // Borno - northern border near Chad/Niger
            [14.00, 13.50], // Borno - border with Niger Republic
            [13.30, 13.60], // Borno/Yobe - northern border with Niger
            [12.40, 13.50], // Yobe - northern border with Niger
            [11.50, 13.40], // Yobe - northern edge
            [10.80, 13.20], // Yobe - western border
            [10.20, 12.80], // Yobe/Jigawa border
            [10.30, 12.20], // Bauchi/Jigawa border
            [10.00, 11.60], // Bauchi - western edge
            [9.70, 11.00],  // Bauchi - southwestern edge
            [9.30, 10.50],  // Bauchi - near Kaduna border
            [8.80, 10.05],  // Bauchi/Plateau junction
            [9.40, 9.80],   // Plateau/Bauchi border
            [9.80, 9.50],   // Plateau/Bauchi eastern area
            [9.95, 8.80],   // Nasarawa/Plateau junction
            [9.90, 8.20],   // Close polygon
          ],
        ],
      },
    },
  ],
};

/**
 * Look up a single region boundary by its region ID (e.g. "REG-001").
 * Returns the GeoJSON Feature for that region, or null if not found.
 */
export function getRegionBoundary(regionId: string): GeoJSON.Feature | null {
  return (
    regionBoundaries.features.find(
      (feature) => feature.properties?.id === regionId
    ) ?? null
  );
}
