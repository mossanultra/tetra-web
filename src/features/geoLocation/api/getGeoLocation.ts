export type Location = {
  city: string;
  town: string;
  prefecture: string;
};

export const getGeoLocation = async (
  lat: number,
  lng: number,
): Promise<Location | null> => {
  if (!lat || !lng) return null;

  const response = await fetch(
    `https://geoapi.heartrails.com/api/xml?method=searchByGeoLocation&x=${lng}&y=${lat}`,
    {
      method: "GET",
    },
  );

  if (response.ok) {
    const body = await response.text();

    // XML文字列をDOMにパース
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(body, "application/xml");

    // 必要なデータを取得
    const city = xmlDoc.querySelector("city")?.textContent || "不明";
    const town = xmlDoc.querySelector("town")?.textContent || "不明";
    const prefecture =
      xmlDoc.querySelector("prefecture")?.textContent || "不明";

    return { city, town, prefecture };
  } else {
    throw new Error("送信に失敗しました。");
  }
};
