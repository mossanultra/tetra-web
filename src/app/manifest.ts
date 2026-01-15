import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "まちっぷ",
    short_name: "まちっぷ",
    description:
      "町活性化アプリ「まちっぷ」。イベント共有や掲示板で町を盛り上げよう！",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
