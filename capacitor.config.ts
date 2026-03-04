import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "tv.friendsandfamily.reels",
  appName: "FF Reels",
  webDir: "cap-www",

  // Load the live server — instant updates without App Store review
  server: {
    url: "https://reels.friendsandfamily.tv",
    cleartext: true, // allow http for local dev
  },

  ios: {
    scheme: "FF Reels",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#F7F6F3",
  },

  android: {
    backgroundColor: "#F7F6F3",
    allowMixedContent: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#F7F6F3",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F7F6F3",
    },
  },
};

export default config;
