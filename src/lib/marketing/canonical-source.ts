// Canonical Friends & Family marketing inventory pulled from https://www.friendsandfamily.tv on 2026-05-28.
// Keep this fixture in source order: source director roster, source work archive, source director portfolio order.

export type CanonicalContentType = "SPOT" | "CASE_STUDY" | "SHORT_FILM";

export interface CanonicalProject {
  id: string;
  order: number;
  brand: string;
  title: string;
  year: number | null;
  agency: string | null;
  contentType: CanonicalContentType;
  thumbnailUrl: string | null;
  sourceVideoUrl: string | null;
  muxPlaybackId: string | null;
  director: { slug: string; name: string };
}

export interface CanonicalDirector {
  id: string;
  order: number;
  name: string;
  slug: string;
  sourceUrl: string;
  bio: string | null;
  imageUrl: string | null;
  portfolio: CanonicalProject[];
}

export const CANONICAL_DIRECTORS: CanonicalDirector[] = [
  {
    id: "source-director-01-bueno",
    order: 1,
    name: "Bueno",
    slug: "bueno",
    sourceUrl: "https://www.friendsandfamily.tv/directors/bueno",
    bio: "Bueno is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66029dca25e7ecd0ecbde6ed_FF_WEB_BUENO.jpg",
    portfolio: [
      {
        id: "source-bueno-01-citi-can-i-click-it",
        order: 1,
        brand: "CITI",
        title: "Can I Click It?",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66429dc0149374a1da73dacb_Screenshot%202024-05-13%20at%205.09.37%E2%80%AFPM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/945970687/rendition/720p/file.mp4?loc=external&log_user=0&signature=89e7da6b3d87a97a4e074cc414598a8e7d3b1592faeafe04314c58177dbdce4f",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
      {
        id: "source-bueno-02-kingsford-rain-or-shine",
        order: 2,
        brand: "Kingsford",
        title: "Rain or Shine",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66029f914f2d5b2031e17595_Kingsford_RainorShine.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/847457729/rendition/1080p/file.mp4?loc=external&log_user=0&signature=9f468103df3ff49ca9f08610ede447a71d7810ec50fc933ea795fa899700851c",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
      {
        id: "source-bueno-03-herdez-visit-the-fair",
        order: 3,
        brand: "Herdez",
        title: "Visit The Fair",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a005396031dbadb62b31_Herdez_VisitTheFair.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/917658130/rendition/1080p/file.mp4?loc=external&log_user=0&signature=a9d700c9b2947dec68e814f683e5efd1c473dcf922f67fdb748d4f4c73cc8bdf",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
      {
        id: "source-bueno-04-doritos-wasabi",
        order: 4,
        brand: "Doritos",
        title: "Wasabi",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a1134f1dec2f2d46ba59_Doritos_Wasabi.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/927476346/rendition/1080p/file.mp4?loc=external&log_user=0&signature=6bd4f8c1650b63881d158195b73232735f1e6720bdb043f7663b67d5055f772f",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
      {
        id: "source-bueno-05-kingsford-biggest-fans",
        order: 5,
        brand: "Kingsford",
        title: "Biggest Fans",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a269893908db90fb04c9_Kingsford_BiggestFans.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/847456735/rendition/1080p/file.mp4?loc=external&log_user=0&signature=02f3f59ff8268cc49ccaebefc50834895a9950cabecb3f4b1ecda1f05198923d",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
      {
        id: "source-bueno-06-doritos-looney-tunes",
        order: 6,
        brand: "Doritos",
        title: "Looney Tunes",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a30c045be7df085fb066_Doritos_LooneyTunes.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/927479609/rendition/1080p/file.mp4?loc=external&log_user=0&signature=a19cb91d653292f7f966aee8d1e76a16fc485dc525313cf01e085985c4f3a606",
        muxPlaybackId: null,
        director: {
          slug: "bueno",
          name: "Bueno",
        },
      },
    ],
  },
  {
    id: "source-director-02-cody-cloud",
    order: 2,
    name: "Cody Cloud",
    slug: "cody-cloud",
    sourceUrl: "https://www.friendsandfamily.tv/directors/cody-cloud",
    bio: "Cody Cloud is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d09_FF_WEB_CODYjpg.jpg",
    portfolio: [
      {
        id: "source-cody-cloud-01-patron-ranch-water",
        order: 1,
        brand: "Patron",
        title: "Ranch Water",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a0_Patron%20-%20Ranch%20Water%20-%20Thumbnail.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848118640/rendition/1080p/file.mp4?loc=external&signature=08a8ce594a807fb787bed030503b36591e33a9d513cf3bb2c39914ea40d71353",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
      {
        id: "source-cody-cloud-02-absolut-lizzo",
        order: 2,
        brand: "Absolut",
        title: "Lizzo",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0c_Absolut%20-%20Lizzo.mp4.00_00_02_09.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/808775311/rendition/1080p/file.mp4?loc=external&signature=62eb2e1f928db75bbb78187ba124e9f0722353c0d26ca869ae1038985c300f3f",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
      {
        id: "source-cody-cloud-03-short-film-coats",
        order: 3,
        brand: "Short Film",
        title: "Coats",
        year: null,
        agency: null,
        contentType: "SHORT_FILM",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0b_Coats.mp4.00_01_01_22.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/808838957/rendition/1080p/file.mp4?loc=external&signature=4dfe174405715a33fa31f419465b9984ebcd546ff68d03f5f28752448a5e9fd4",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
      {
        id: "source-cody-cloud-04-adidas-adicolors",
        order: 4,
        brand: "Adidas",
        title: "Adicolors",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0e_Adidas%20-%20Adicolors.mp4.00_00_50_08.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/808838798/rendition/1080p/file.mp4?loc=external&signature=8391ffad212717f35e32fc32af317d771a5fa2702b1de8240a6153da4fa3a873",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
      {
        id: "source-cody-cloud-05-target-all-in-motion",
        order: 5,
        brand: "Target",
        title: "All In Motion",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0f_Target%20-%20All%20In%20Motion.mp4.00_00_06_10.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/808839155/rendition/1080p/file.mp4?loc=external&signature=c7e62b03c26758a87969211a77b8341e5e4b52e80eb25f48c2d82ba345336e38",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
      {
        id: "source-cody-cloud-06-photo-montage",
        order: 6,
        brand: "Photo",
        title: "Montage",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0d_Cody%20Cloud%20Photo%20Montage.mp4.00_00_27_12.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/808836191/rendition/720p/file.mp4?loc=external&signature=49a296b1a9a87c163e50cf69691e31bc7bb58017341ee9f22a7a8859e20151fe",
        muxPlaybackId: null,
        director: {
          slug: "cody-cloud",
          name: "Cody Cloud",
        },
      },
    ],
  },
  {
    id: "source-director-03-matt-dilmore",
    order: 3,
    name: "Matt Dilmore",
    slug: "matt-dilmore",
    sourceUrl: "https://www.friendsandfamily.tv/directors/matt-dilmore",
    bio: "Matt Dilmore is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/692e759e93d54ebe70a5ebb7_FF_WEB_DILMORE_5.jpg",
    portfolio: [
      {
        id: "source-matt-dilmore-01-little-caesars-pizza-bot",
        order: 1,
        brand: "Little Caesars",
        title: "Pizza Bot",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531482fbd7cdd87949c96_Thumb_LittleCaesars.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132624759/rendition/1080p/file.mp4?loc=external&log_user=0&signature=bca1cf231b5943c9d6164751c0701df658551fd940a61ecedab0dd95a3f81196",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-02-frank-s-shake",
        order: 2,
        brand: "Frank's",
        title: "Shake",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/69053177e46e799df87ab2b9_Thumb_Franks.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132625499/rendition/1080p/file.mp4?loc=external&log_user=0&signature=73f9f6d1847feea97944d8332796f69fdd5564e77c1ddb2921f876afade4423a",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-03-friendly-s-food-pics",
        order: 3,
        brand: "Friendly's",
        title: "Food Pics",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531aeaee6fdff860aae0d_Thumb_Friendlys.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132626496/rendition/1080p/file.mp4?loc=external&log_user=0&signature=d6322654edcecb0a5fb865622237ff47e2df313db366ee1316fa4881409616b2",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-04-cheerios-yoga",
        order: 4,
        brand: "Cheerios",
        title: "Yoga",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531d88abf301e2a7e58a3_Thumb_Cheerios.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132627578/rendition/1080p/file.mp4?loc=external&log_user=0&signature=fc836627726ec160d1a35094cc9372ad10ae89ee2bbcf8a12e2dbb6361b6dfe5",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-05-kfc-bad-call",
        order: 5,
        brand: "KFC",
        title: "Bad Call",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531f3c3a02392dcc24fde_Thumb_KFC.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132644521/rendition/360p/file.mp4?loc=external&log_user=0&signature=8ce6ae096ac32532363e67fa3062e3768b1fc232cbe3aa9df57450f3ff004f89",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-06-noom-house-plant",
        order: 6,
        brand: "Noom",
        title: "House Plant",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6905328b393f6bff5ed00ac9_Thumb_Noom.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132628975/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&log_user=0&signature=80662ba9f66aad38d25da8b1dad9906e0583bfa237373e2f0e1085b6a7a1947a",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-07-interstate-batteries-super-guy",
        order: 7,
        brand: "Interstate Batteries",
        title: "Super Guy",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690532b0a85c6dab2211ea57_Thumb_Interstate.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132631390/rendition/720p/file.mp4%20%28720p%29.mp4?loc=external&log_user=0&signature=9cded55bdd78df1e527e984e2e7b56c81e5ba2ff1e90fe8d580997d6780bd789",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
      {
        id: "source-matt-dilmore-08-academy-of-motion-pictures-overlook-hotel",
        order: 8,
        brand: "Academy of Motion Pictures",
        title: "Overlook Hotel",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690532f65da8dc3bd0527358_Thumb_AcademyOfMotionPictures.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1132631769/rendition/720p/file.mp4?loc=external&log_user=0&signature=72f3f11149fc17d7c82b99d6fcad3de0a46d698d0a304f256cfa460cbd37e064",
        muxPlaybackId: null,
        director: {
          slug: "matt-dilmore",
          name: "Matt Dilmore",
        },
      },
    ],
  },
  {
    id: "source-director-04-james-frost",
    order: 4,
    name: "James Frost",
    slug: "james-frost",
    sourceUrl: "https://www.friendsandfamily.tv/directors/james-frost",
    bio: "James Frost is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a7_FF_WEB_JAMESFROST.jpg",
    portfolio: [
      {
        id: "source-james-frost-01-nike-human-printing-press",
        order: 1,
        brand: "Nike",
        title: "Human Printing Press",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a2_Nike_HumanPrintingPress_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848206268/rendition/1080p/file.mp4?loc=external&signature=3d61bb814def62995b57236ec99f73cb3acc437b43ada2a462202219d8447a99",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
      {
        id: "source-james-frost-02-husky-sumo",
        order: 2,
        brand: "Husky",
        title: "Sumo",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a1_Husky_Sumo_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848203954/rendition/1080p/file.mp4?loc=external&signature=d27f57aa3d8ad37c23178677e18321faaf1b822073692ccd49bad20e6b448007",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
      {
        id: "source-james-frost-03-amex-this",
        order: 3,
        brand: "AmEx",
        title: "This",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a3_AmEx_This_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848203805/rendition/1080p/file.mp4?loc=external&signature=54e64be056bc7f85e3ebf8f3a0712f2192fb0940f2b44d6af06f807d8b008ac7",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
      {
        id: "source-james-frost-04-ibm-data-anthem",
        order: 4,
        brand: "IBM",
        title: "Data Anthem",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a4_IBM_DataAnthem_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848206129/rendition/1080p/file.mp4?loc=external&signature=88c22155d6087d3273e2372433b137d59d12d00e6103b2438e0206b3f1465682",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
      {
        id: "source-james-frost-05-rufus-du-sol-alive",
        order: 5,
        brand: "Rüfüs Du Sol",
        title: "Alive",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a5_RufusDuSol_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848200685/rendition/1080p/file.mp4?loc=external&signature=24cc63212d130be558060433bc43f5e50ef5b5a3288aefe1e08a15a54a097d2e",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
      {
        id: "source-james-frost-06-ok-go-this-too-shall-pass",
        order: 6,
        brand: "Ok Go",
        title: "This Too Shall Pass",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a6_OKGo_ThisTooShallPass_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/848199790/rendition/1080p/file.mp4?loc=external&signature=af5c761ba22f2636f6a6f668f907ac09622351dc3d3844cf7f0a2e340f2e92ac",
        muxPlaybackId: null,
        director: {
          slug: "james-frost",
          name: "James Frost",
        },
      },
    ],
  },
  {
    id: "source-director-05-le-ged",
    order: 5,
    name: "Le Ged",
    slug: "le-ged",
    sourceUrl: "https://www.friendsandfamily.tv/directors/le-ged",
    bio: "Le Ged is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668900dfdb5154b13bda62d_FF_WEB_LeGED.jpg",
    portfolio: [
      {
        id: "source-le-ged-01-casino-charlevoix-fairmont-hotel",
        order: 1,
        brand: "Casino Charlevoix",
        title: "Fairmont Hotel",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/666892b7fcfce2e9a8120564_CasinoCharlevoix_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956641193/rendition/720p/file.mp4?loc=external&log_user=0&signature=66f36abcd2a511111b46ab67267b191b87294ea8830fab96957b4f023e9ebb9f",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
      {
        id: "source-le-ged-02-youtube-little-king-goods",
        order: 2,
        brand: "YouTube",
        title: "Little King Goods",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668937f7d7aff73c7be4ad6_YouTube_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956642325/rendition/720p/file.mp4?loc=external&log_user=0&signature=cdd2ac39a67f3823cd8adc3b14325016b5817654377160b2e9912a4d9a4e2def",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
      {
        id: "source-le-ged-03-ca-appelle-music-video",
        order: 3,
        brand: "Ca Appelle",
        title: "Music Video",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66689498c98f7ab4a228c80a_Accapelle.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956640202/rendition/720p/file.mp4?loc=external&log_user=0&signature=d084b560b109121d0a6a96deddb551be699a1e502e981e38c40fdbe79c9be104",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
      {
        id: "source-le-ged-04-hilton-casino",
        order: 4,
        brand: "Hilton",
        title: "Casino",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/666895a4e201c07003d789c2_HiltonCasino_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956641446/rendition/720p/file.mp4?loc=external&log_user=0&signature=41d984e1414c23f21d34e4fe01bf3045a5d0e2342b94d4f0fb78384e8ba9db3a",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
      {
        id: "source-le-ged-05-mcdonald-s-mcjunior",
        order: 5,
        brand: "McDonald's",
        title: "McJunior",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668974ffad94e7b61fc7acc_McDonalds_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956642136/rendition/720p/file.mp4?loc=external&log_user=0&signature=9847c386c1cdcc6a63544786bf8c896a1ce42624dfc2c4081c8b217ec6a69c90",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
      {
        id: "source-le-ged-06-jewish-general-hospital-foundation-effect-to-cause",
        order: 6,
        brand: "Jewish General Hospital Foundation",
        title: "Effect to Cause",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668985c79cb6cf2a754ffcb_JewishGeneralHospitalFoundation_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/956641835/rendition/720p/file.mp4?loc=external&log_user=0&signature=ce96963ba9970e6e59cd69cf85c1cb93856c6aa6daae2461dd3edac9c6b8f40c",
        muxPlaybackId: null,
        director: {
          slug: "le-ged",
          name: "Le Ged",
        },
      },
    ],
  },
  {
    id: "source-director-06-boma-iluma",
    order: 6,
    name: "Boma Iluma",
    slug: "boma-iluma",
    sourceUrl: "https://www.friendsandfamily.tv/directors/boma-iluma",
    bio: "Boma Iluma is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fd68ef30b936b35f41b67_FF_WEB_BOMA.jpg",
    portfolio: [
      {
        id: "source-boma-iluma-01-nissan-shoe-drop",
        order: 1,
        brand: "Nissan",
        title: "Shoe Drop",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fdaf9c102ac961d4028e5_Nissan_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1103240200/rendition/720p/file.mp4?loc=external&log_user=0&signature=b63bc027b6797885b84c5161d37d1acc0996026e1d90de8460268e6af6904287",
        muxPlaybackId: null,
        director: {
          slug: "boma-iluma",
          name: "Boma Iluma",
        },
      },
      {
        id: "source-boma-iluma-02-oakley-damian-lillard",
        order: 2,
        brand: "Oakley",
        title: "Damian Lillard",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fdaa931aa6c24354991e4_Oakley_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1103240262/rendition/720p/file.mp4?loc=external&log_user=0&signature=c856df2b0c7ecab29daf0ee6d959ddc6545cc89527e2f42f19065e9ffd2b519c",
        muxPlaybackId: null,
        director: {
          slug: "boma-iluma",
          name: "Boma Iluma",
        },
      },
      {
        id: "source-boma-iluma-03-jeep-wagoneer",
        order: 3,
        brand: "Jeep",
        title: "Wagoneer",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fda9fe787e2d8b7519943_Jeep_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1103240097/rendition/720p/file.mp4?loc=external&log_user=0&signature=5ac29fc68432035f55decc0644ecbda5d4e53ecf59dac7b46b71d56bdbe3338e",
        muxPlaybackId: null,
        director: {
          slug: "boma-iluma",
          name: "Boma Iluma",
        },
      },
      {
        id: "source-boma-iluma-04-air-jordan-heirs",
        order: 4,
        brand: "Air Jordan",
        title: "Heirs",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fda95c8f0483d27f81a49_Heirs_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1103238872/rendition/1080p/file.mp4?loc=external&log_user=0&signature=b0758d7ebcc30161acfe7f5827aea6647ce3daebf07d21743604d730f6d1dbb8",
        muxPlaybackId: null,
        director: {
          slug: "boma-iluma",
          name: "Boma Iluma",
        },
      },
    ],
  },
  {
    id: "source-director-07-tarik",
    order: 7,
    name: "Tarik Karam",
    slug: "tarik",
    sourceUrl: "https://www.friendsandfamily.tv/directors/tarik",
    bio: "Tarik Karam is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ac_FF_WEB_TARIKKARAM.jpg",
    portfolio: [
      {
        id: "source-tarik-01-wsj-hyundai",
        order: 1,
        brand: "WSJ",
        title: "Hyundai",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a9_Screenshot%202023-08-08%20at%201.27.31%20PM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/851392732/rendition/1080p/file.mp4?loc=external&signature=46172f12bfe1fe939ce0d2ae0109c4af819d98648067d5fb61cacdf2c81b04f1",
        muxPlaybackId: null,
        director: {
          slug: "tarik",
          name: "Tarik Karam",
        },
      },
      {
        id: "source-tarik-02-hhs-giving-living",
        order: 2,
        brand: "HHS",
        title: "Giving = Living",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020aa_Screenshot%202023-08-08%20at%201.25.42%20PM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/851425760/rendition/1080p/file.mp4?loc=external&signature=363fb0b567620b114fb1ea9721f4bef22b1658f3aa2de5f22f378eae3a45bd9f",
        muxPlaybackId: null,
        director: {
          slug: "tarik",
          name: "Tarik Karam",
        },
      },
      {
        id: "source-tarik-03-sandy-hook-monsters-under-the-bed",
        order: 3,
        brand: "Sandy Hook",
        title: "Monsters Under The Bed",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ad_Screenshot%202023-08-09%20at%209.37.38%20AM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/851428294/rendition/720p/file.mp4?loc=external&signature=a86b9545951c8d17f16830122f531b076158f386fb689bbe957c4b965dd75b3b",
        muxPlaybackId: null,
        director: {
          slug: "tarik",
          name: "Tarik Karam",
        },
      },
      {
        id: "source-tarik-04-wsj-sothebys",
        order: 4,
        brand: "WSJ",
        title: "Sothebys",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ab_Screenshot%202023-08-08%20at%201.36.37%20PM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/852775839/rendition/720p/file.mp4?loc=external&signature=ea9540794656595b90db8ea5976a391e3f47eccaec8661a04dec02ad9665a5d1",
        muxPlaybackId: null,
        director: {
          slug: "tarik",
          name: "Tarik Karam",
        },
      },
    ],
  },
  {
    id: "source-director-08-kelsey-larkin",
    order: 8,
    name: "Kelsey Larkin",
    slug: "kelsey-larkin",
    sourceUrl: "https://www.friendsandfamily.tv/directors/kelsey-larkin",
    bio: "Kelsey Larkin is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/69f38e86274a3ab866dcf297_FF_WEB_KELSEY_3.png",
    portfolio: [
      {
        id: "source-kelsey-larkin-01-gillette-look-good-game-good",
        order: 1,
        brand: "Gillette",
        title: "Look Good, Game Good",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067a50a92b29e7020e5385_GILLETTE%20THUMBNAIL%20copy.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/770927111/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=4780ed7212a079ad00095de9f1b0f654256dd7d0c32575d5f288a76a25294437",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-02-yokohama-made-precisely-for-you",
        order: 2,
        brand: "Yokohama",
        title: "Made Precisely For You",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067ae5fff6189311366625_YOKOHAMA%20THUMBNAIL.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/818447648/rendition/1080p/file.mp4?loc=external&signature=9d4384e34cb3dbd368c6158b6de1e90cea9f444e43afa900fe55038f4e1f0a06",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-03-moneris-open",
        order: 3,
        brand: "Moneris",
        title: "Open",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01def_1367329728-9fedc97e44ee189e330e805f572cee3b8aa1edad15b9bdbb5650b9783212fcbb-d_1280.jpeg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/666922982/rendition/1080p/file.mp4?loc=external&signature=d114173e55106b499c48fcb3f0394686a056ae23eeb9b4f32a25722b0871a8c8",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-04-toyota-proud-supporter-of-firsts",
        order: 4,
        brand: "Toyota",
        title: "Proud Supporter of Firsts",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067928ce13d820b3f707e9_TOYOTA%20THUMBNAIL%20copy.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1188183139/rendition/720p/file.mp4%20%28720p%29.mp4?loc=external&log_user=0&signature=bdc973afbfe2eb391a4d3d023826c9cbed7318f07d8a1b32df2230f5c5b816d0",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-05-trihealth-be-heard",
        order: 5,
        brand: "Trihealth",
        title: "Be Heard",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a0678c24aecaeb55db0032c_TRIHEALTH%20THUMBNAIL.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1191630983/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&log_user=0&signature=21a8cd42a9c16a7738a971a5a7c0f7a2e001219a8c2290223352794c74aff641",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-06-goodlife-live-for-it",
        order: 6,
        brand: "Goodlife",
        title: "Live For It",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067a0fc5bf13200b4c23c4_GOODLIFE%20THUMBNAIL%20copy.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/667450511/rendition/1080p/file.mp4?loc=external&signature=64ae8a5403ab5963bede9ef43e67945ce797ec0f5f3f63660c20892229d8c1d6",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
      {
        id: "source-kelsey-larkin-07-heroes-short-film",
        order: 7,
        brand: "Heroes",
        title: "Short Film",
        year: null,
        agency: null,
        contentType: "SHORT_FILM",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a0679a61309f33ac1bda49b_HEROES%20THUMBAIL.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1188180112/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&log_user=0&signature=d67dbe5ffeaca4fe36e22e33febda9dc646b5bd4cb1c8f35ac13cb42021fbb5e",
        muxPlaybackId: null,
        director: {
          slug: "kelsey-larkin",
          name: "Kelsey Larkin",
        },
      },
    ],
  },
  {
    id: "source-director-09-leigh-marling",
    order: 9,
    name: "Leigh Marling",
    slug: "leigh-marling",
    sourceUrl: "https://www.friendsandfamily.tv/directors/leigh-marling",
    bio: "Leigh Marling is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec55e9728446d85b57fae3_FF_WEB_LEIGH.jpg",
    portfolio: [
      {
        id: "source-leigh-marling-01-dayforce-do-the-work-you-re-meant-to-do",
        order: 1,
        brand: "Dayforce",
        title: "Do The Work You're Meant To Do",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46991384c4526f1f77edd_Dayforce_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1065946198/rendition/720p/file.mp4?loc=external&log_user=0&signature=a8b4f836bd47a88ca7327009118b6e155ac398d6e9cc37777e43b87aedba9020&user_id=117991130",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
      {
        id: "source-leigh-marling-02-kraft-can-t-handle-it",
        order: 2,
        brand: "Kraft",
        title: "Can't Handle It",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46c5442d50efbd1b1ebcc_Kraft_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1065951448/rendition/1080p/file.mp4?loc=external&log_user=0&signature=bb96901fa59a97f919a36ea710c21674f81a06c7d07bfa5627e77ceb4364559f&user_id=117991130",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
      {
        id: "source-leigh-marling-03-nissan-rocky",
        order: 3,
        brand: "Nissan",
        title: "Rocky",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5ce1baad2edb19a997aa_Nissan_Rocky.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1011036856/rendition/1080p/file.mp4?loc=external&log_user=0&signature=fe8583cc6e7fc5373aff5d3978f1ba41288ea6302d8e4afd013161afda0c4046",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
      {
        id: "source-leigh-marling-04-bell-the-visitor",
        order: 4,
        brand: "Bell",
        title: "The Visitor",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46f6ccd3d4512a499be11_Bell_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1065954056/rendition/720p/file.mp4?loc=external&log_user=0&signature=a8850916c2a001824ce1fcce3fb406d4e1e7d06e0878a04a623cea785e275b14&user_id=117991130",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
      {
        id: "source-leigh-marling-05-snickers-song",
        order: 5,
        brand: "Snickers",
        title: "Song",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5d0abaad2edb19a9c700_Snickers_Song.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1011037364/rendition/540p/file.mp4?loc=external&log_user=0&signature=6cd8d47661f52af083465dd73303cacb07db6af9ff863218114d5bbbe192656f",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
      {
        id: "source-leigh-marling-06-american-legacy-friends",
        order: 6,
        brand: "American Legacy",
        title: "Friends",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5e8d3e9a0bd99dfa7a20_AmericanLegacy_Friends.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1011036018/rendition/540p/file.mp4?loc=external&log_user=0&signature=6c01398c285d800779793307dc408672491402270dd860ee28a4fafad6062cb7",
        muxPlaybackId: null,
        director: {
          slug: "leigh-marling",
          name: "Leigh Marling",
        },
      },
    ],
  },
  {
    id: "source-director-10-terry-rayment",
    order: 10,
    name: "Terry Rayment",
    slug: "terry-rayment",
    sourceUrl: "https://www.friendsandfamily.tv/directors/terry-rayment",
    bio: "Terry Rayment is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d08_FF_WEB_TERRY.jpg",
    portfolio: [
      {
        id: "source-terry-rayment-01-kodak-understanding",
        order: 1,
        brand: "Kodak",
        title: "Understanding",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d6b_WEBSITE%20-%20BG%20VIDEO.00_00_16_06.Still007.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/430515807/rendition/1080p/file.mp4?loc=external&signature=fc89c59398178fdd2f7de9675b2a3cc64da5235f9b21c818e3c0bdd2490c5fe8",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
      {
        id: "source-terry-rayment-02-purina-april-and-dixie",
        order: 2,
        brand: "Purina",
        title: "April & Dixie",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d59_WEBSITE%20-%20BG%20VIDEO.00_00_16_01.Still006.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/623600795/rendition/1080p/file.mp4?loc=external&signature=9278450ad4f20dc1ac8c3a89bcc8ec3cb1386c310f6673feb409ba85abedd74e",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
      {
        id: "source-terry-rayment-03-doordash-in-peace",
        order: 3,
        brand: "Doordash",
        title: "In Peace",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d13_Doordash%20In%20Peace.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/686034439/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=6f055a1ea43fbc179f096615f279b8aed1da5a596e0863af519935034d82618d",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
      {
        id: "source-terry-rayment-04-viacom-mental-health-is-health",
        order: 4,
        brand: "Viacom",
        title: "Mental Health is Health",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d8f_WEBSITE%20-%20BG%20VIDEO.00_00_16_06.Still008.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/589973423/rendition/1080p/file.mp4?loc=external&signature=148a00efa2556a5cd651e489b7a7ef9a5a14b794b58f791ffaaed1c8f6b94338",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
      {
        id: "source-terry-rayment-05-cadillac-tree-hunting",
        order: 5,
        brand: "Cadillac",
        title: "Tree Hunting",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01da1_WEBSITE%20-%20BG%20VIDEO.00_00_16_08.Still009.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/430515722/rendition/1080p/file.mp4?loc=external&signature=b4f5af99395d4ff777dbd736ef19d9392d9d21db108281864a3526198949a2b7",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
      {
        id: "source-terry-rayment-06-jaguar-joyride",
        order: 6,
        brand: "Jaguar",
        title: "Joyride",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d47_JAG_DIR_28_30%20vsn%20a%20FINAL.mp4.00_00_21_07.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/623594510/rendition/1080p/file.mp4?loc=external&signature=fad2c5d68337c972f3400ba1c76853ef6f83bbea57fd1d8141469f5a74d95e94",
        muxPlaybackId: null,
        director: {
          slug: "terry-rayment",
          name: "Terry Rayment",
        },
      },
    ],
  },
  {
    id: "source-director-11-caleb-slain",
    order: 11,
    name: "Caleb Slain",
    slug: "caleb-slain",
    sourceUrl: "https://www.friendsandfamily.tv/directors/caleb-slain",
    bio: "Caleb Slain is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cea_FF_WEB_CALEB.jpg",
    portfolio: [
      {
        id: "source-caleb-slain-01-ford-lobo",
        order: 1,
        brand: "Ford",
        title: "Lobo",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/693339ca3fa6842d06d9324f_Ford_Lobo_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1143945393/rendition/1080p/file.mp4?loc=external&log_user=0&signature=f1f4352e66d26ad8482e8823a84b1c6390fe894beb99b59703653f7d7eef2663",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-02-ford-ranger-ready",
        order: 2,
        brand: "Ford",
        title: "Ranger Ready",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020b0_Ford_RangerReady_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/864926897/rendition/1080p/file.mp4?loc=external&log_user=0&signature=aeaf3965a0dae9536aadc5d550da6b4fd53730bdda896a7d15118471ed811d5d",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-03-lexus-next-chapter",
        order: 3,
        brand: "Lexus",
        title: "Next Chapter",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d10_Lexus%20-%20RZ%20Reveal%20-%2080.mp4.01_00_59_15.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/702992325/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=f120c4a21c6090e24b8b3d04cfcf5b6fb7e442e25345b40caf3d6d6a15204593",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-04-toyota-2025-4runner-reveal",
        order: 4,
        brand: "Toyota",
        title: "2025 4Runner Reveal",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67c64964ae4e753d43e99a44_Toyota_Thumbnail.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1062220624/rendition/1080p/file.mp4?loc=external&log_user=0&signature=028ec62ebfc057252169bf43d46fe4faaa00885699c77b0730cdb793aca564ba&user_id=117991130",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-05-clorox-from-hospital-to-home",
        order: 5,
        brand: "Clorox",
        title: "From Hospital To Home",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d14_Clorox_FinalConform_30.mp4.00_00_16_10.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/652584121/rendition/1080p/file.mp4?loc=external&signature=95762048541ad0d7d0eb584d83e8aabe4e74c82c579238923a8dadf4834d6990",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-06-uniqlo-charlotte-kemp",
        order: 6,
        brand: "Uniqlo",
        title: "Charlotte Kemp",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d11_Uniqlo%20-%20Charlotte%20Kemp.mov.01_00_11_22.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/431947846/rendition/1080p/file.mp4?loc=external&signature=f38cc93c6b7327ef2dbf95761b238932e8b211a10d05e5ca7d739abfb2ffafa8",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-07-lexus-dreamed-in-japan",
        order: 7,
        brand: "Lexus",
        title: "Dreamed In Japan",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d16_WEBSITE%20-%20BG%20VIDEO.00_00_01_11.Still005.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/431947539/rendition/1080p/file.mp4?loc=external&signature=4d7005d7f35779fb256217afa2710aa63d9f1659e27856c5116eb8acba5bfb4e",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-08-microsoft-surface",
        order: 8,
        brand: "Microsoft",
        title: "Surface",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d15_WEBSITE%20-%20BG%20VIDEO.00_00_01_10.Still004.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/812212054/rendition/1080p/file.mp4?loc=external&signature=e5754d9b673e6ddfc3c677c57ceae3ec4b703087e9fea4ea3c738a03496d039e",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
      {
        id: "source-caleb-slain-09-lahgo-the-florist",
        order: 9,
        brand: "Lahgo",
        title: "The Florist",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d2f_LAHGO_90.mp4.00_04_40_18.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/505502940/rendition/1080p/file.mp4?loc=external&signature=a877a5bec321045e55d4091688a08e55f819676a7c352edf34694747a13795c9",
        muxPlaybackId: null,
        director: {
          slug: "caleb-slain",
          name: "Caleb Slain",
        },
      },
    ],
  },
  {
    id: "source-director-12-jack-turits",
    order: 12,
    name: "Jack Turits",
    slug: "jack-turits",
    sourceUrl: "https://www.friendsandfamily.tv/directors/jack-turits",
    bio: "Jack Turits is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d05_FF_WEB_JACK.jpg",
    portfolio: [
      {
        id: "source-jack-turits-01-wealthfront-french-toast",
        order: 1,
        brand: "Wealthfront",
        title: "French Toast",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbd_Wealthfront%20-%20French%20Toast.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/662105831/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=c311fcc2e07ac5958a909efc8cb5ae1aa106efcd55ade23ac3d624c358b6e8ad",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
      {
        id: "source-jack-turits-02-aos-juju",
        order: 2,
        brand: "AOS",
        title: "JuJu",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbc_AOS%20-%20JuJu.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/678800628/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=ef069a1cc22df08a9c77c10b37c9f354fb0a68b170a7ddcebfd699a5af54f511",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
      {
        id: "source-jack-turits-03-four-loko-premium",
        order: 3,
        brand: "Four Loko",
        title: "Premium",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbf_Four%20Loko%20-%20Premium.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/447577902/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=00aeaf09d03dd6c84c30ba3ba4b7224afcdfa82e8fed712f3997e7fdcffbbebe",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
      {
        id: "source-jack-turits-04-evian-this-is-evian",
        order: 4,
        brand: "Evian",
        title: "This is Evian",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ded_Evian%20THumb%201.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/447604031/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=bd57dbf91d62c9ddaf9d790931956e61eccb766e59eda02ad44187451ede1b8c",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
      {
        id: "source-jack-turits-05-callaway-forefront",
        order: 5,
        brand: "Callaway",
        title: "Forefront",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cc0_Callaway%20-%20Forefront.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/695553756/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=1e2bc71243fea7b90b654b9b29d87180571da25121777b4686bb9394a6d112cf",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
      {
        id: "source-jack-turits-06-bonnaroo-dragon",
        order: 6,
        brand: "Bonnaroo",
        title: "Dragon",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01dee_Bonnaroo%20Dragon-HD%201080p.mov.00_00_03_17.Still001.jpg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/447578187/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=69d4711225d30d85a5bec67bbfab2c028ef15c1715788ec2d44a532d62f759d6",
        muxPlaybackId: null,
        director: {
          slug: "jack-turits",
          name: "Jack Turits",
        },
      },
    ],
  },
  {
    id: "source-director-13-brother-willis",
    order: 13,
    name: "Brother Willis",
    slug: "brother-willis",
    sourceUrl: "https://www.friendsandfamily.tv/directors/brother-willis",
    bio: "Brother Willis is a high-end commercial director represented by Friends & Family, creating award-winning campaign work for global brands and agencies.",
    imageUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01dea_FF_WEB_BROTHERWILLIS.jpg",
    portfolio: [
      {
        id: "source-brother-willis-01-topps-chrome-rush",
        order: 1,
        brand: "Topps",
        title: "Chrome Rush",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/674e0bb29bfac4c4e5eafd77_Screenshot%202024-11-25%20at%206.02.04%E2%80%AFPM.png",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/1035334964/rendition/720p/file.mp4?loc=external&log_user=0&signature=d706757e50c9357c1a4494c9ef1a0a6fd42c103f33d3e912112e34085942b82f",
        muxPlaybackId: null,
        director: {
          slug: "brother-willis",
          name: "Brother Willis",
        },
      },
      {
        id: "source-brother-willis-02-ford-drive-4-ur-school",
        order: 2,
        brand: "Ford",
        title: "Drive 4 Ur School",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df3_1430936811-e8395e0a6b91d6c73770289b7c413de4a3b91b3dd88886d7a969f5747dcc2e49-d_1280.jpeg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/709326652/rendition/1080p/file.mp4?loc=external&signature=45e51f5e2a6e9bc537a41eee06864186ca41f4c6deb3f0dbb9514ab9e6ffb3bd",
        muxPlaybackId: null,
        director: {
          slug: "brother-willis",
          name: "Brother Willis",
        },
      },
      {
        id: "source-brother-willis-03-jeremiah-weed-alligator",
        order: 3,
        brand: "Jeremiah Weed",
        title: "Alligator",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df4_1430936985-1ed4ab99037fbd29365618c2faf62a0690f3ebd6309d651832fb94a6da1fa957-d_1280.jpeg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/709326684/rendition/720p/file.mp4?loc=external&signature=4de62deeeb221c43c0882f97d439fdf24798824999df74e0a9d604a7acca633b",
        muxPlaybackId: null,
        director: {
          slug: "brother-willis",
          name: "Brother Willis",
        },
      },
      {
        id: "source-brother-willis-04-wienerschnitzel-oktoberfest",
        order: 4,
        brand: "Wienerschnitzel",
        title: "Oktoberfest",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df5_1430938913-48cec0cbb8e66ac9ebb498b7f4706a31bd83c094d7f47223bfa2cae445d03b7a-d_1280.jpeg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/709326970/rendition/1080p/file.mp4?loc=external&signature=e6b79837a33fa22b5ef1b54f578c25973ba57b3a0ba59ac81f9b80f25faa4e7e",
        muxPlaybackId: null,
        director: {
          slug: "brother-willis",
          name: "Brother Willis",
        },
      },
      {
        id: "source-brother-willis-05-see-s-quality-without-compromise",
        order: 5,
        brand: "See's",
        title: "Quality Without Compromise",
        year: null,
        agency: null,
        contentType: "SPOT",
        thumbnailUrl:
          "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df6_1430937570-9e3372ace4b0bd4f2da5873afbcbcd6f24be91a9384edcd5ccc51952155c6fb3-d_1280.jpeg",
        sourceVideoUrl:
          "https://player.vimeo.com/progressive_redirect/playback/709326879/rendition/1080p/file.mp4?loc=external&signature=9859a2c4d2cfbd37d82be12a7701f01938205f8527d533ce76326072e34edbad",
        muxPlaybackId: null,
        director: {
          slug: "brother-willis",
          name: "Brother Willis",
        },
      },
    ],
  },
];

export const CANONICAL_WORK: CanonicalProject[] = [
  {
    id: "source-work-001-caleb-slain-ford-lobo",
    order: 1,
    brand: "Ford",
    title: "Lobo",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/693339ca3fa6842d06d9324f_Ford_Lobo_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1143945393/rendition/240p/file.mp4?loc=external&log_user=0&signature=ba9a0afaf1c44ab8b8a048b91e7b9225d1f302457dbe33ee1221f43ed734e940",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-002-matt-dilmore-little-caesars-pizza-bot",
    order: 2,
    brand: "Little Caesars",
    title: "Pizza Bot",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531482fbd7cdd87949c96_Thumb_LittleCaesars.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132624759/rendition/240p/file.mp4?loc=external&log_user=0&signature=f42b5e5fc4feddc5490483ccde3197fa070f2261335e13b048e35e3947969205",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-003-bueno-citi-can-i-click-it",
    order: 3,
    brand: "CITI",
    title: "Can I Click It?",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66429dc0149374a1da73dacb_Screenshot%202024-05-13%20at%205.09.37%E2%80%AFPM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/945970687/rendition/240p/file.mp4?loc=external&log_user=0&signature=7ba0f93e14c4f1ab4c66f8f70183e5a9ca15ad07dd03735f3b1bfb2121141133",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-004-brother-willis-topps-chrome-rush",
    order: 4,
    brand: "Topps",
    title: "Chrome Rush",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/674e0bb29bfac4c4e5eafd77_Screenshot%202024-11-25%20at%206.02.04%E2%80%AFPM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1035334964/rendition/540p/file.mp4?loc=external&log_user=0&signature=5e58f90926597ba566b53fe5dcfdccb3b089ab173432302902c68758b3b368de",
    muxPlaybackId: null,
    director: {
      slug: "brother-willis",
      name: "Brother Willis",
    },
  },
  {
    id: "source-work-005-matt-dilmore-frank-s-shake",
    order: 5,
    brand: "Frank's",
    title: "Shake",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/69053177e46e799df87ab2b9_Thumb_Franks.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132625499/rendition/240p/file.mp4?loc=external&log_user=0&signature=be245ac0b2848f77038bf9b42c5eb0515b370aeab4f0d272804d32c34f4cd19f",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-006-matt-dilmore-friendly-s-food-pics",
    order: 6,
    brand: "Friendly's",
    title: "Food Pics",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531aeaee6fdff860aae0d_Thumb_Friendlys.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132626496/rendition/540p/file.mp4?loc=external&log_user=0&signature=9f4444df4de359c17dcf2d24340da2bacdaf897ebc5b133004bfffcaeae70549",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-007-le-ged-casino-charlevoix-fairmont-hotel",
    order: 7,
    brand: "Casino Charlevoix",
    title: "Fairmont Hotel",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/666892b7fcfce2e9a8120564_CasinoCharlevoix_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956641193/rendition/240p/file.mp4?loc=external&log_user=0&signature=b3978e04bcf5d85e8de60b177491b18262835fa2dbf04cf3669f7e72e946c624",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-008-bueno-kingsford-rain-or-shine",
    order: 8,
    brand: "Kingsford",
    title: "Rain or Shine",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66029f914f2d5b2031e17595_Kingsford_RainorShine.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/847457729/rendition/240p/file.mp4?loc=external&log_user=0&signature=6a792e76eb4fa4211e5bcf7d05a015a63498c3e77c3dd440a13a57419cb2a27f",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-009-caleb-slain-ford-ranger-ready",
    order: 9,
    brand: "Ford",
    title: "Ranger Ready",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020b0_Ford_RangerReady_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/864926897/rendition/240p/file.mp4?loc=external&log_user=0&signature=a067a745ca87c931952fbdff2dadd35f00cbca18937d798a9ce3c7109ed3faef",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-010-bueno-herdez-visit-the-fair",
    order: 10,
    brand: "Herdez",
    title: "Visit The Fair",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a005396031dbadb62b31_Herdez_VisitTheFair.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/917658130/rendition/240p/file.mp4?loc=external&log_user=0&signature=5e2378631b08b3f290c10b688b07c1f8410274642e8d47549e13890e0aeb2869",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-011-matt-dilmore-cheerios-yoga",
    order: 11,
    brand: "Cheerios",
    title: "Yoga",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531d88abf301e2a7e58a3_Thumb_Cheerios.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132627578/rendition/240p/file.mp4?loc=external&log_user=0&signature=30b4d045ff3676c4fe48ae5bd1f06da9171a84b10532b8447520720440024684",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-012-cody-cloud-patron-ranch-water",
    order: 12,
    brand: "Patron",
    title: "Ranch Water",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a0_Patron%20-%20Ranch%20Water%20-%20Thumbnail.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848118640/rendition/540p/file.mp4?loc=external&signature=6b25787cb89f50c956985e235fb127b8ac20c46328fa43e2cf5de64690d6b870",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-013-matt-dilmore-kfc-bad-call",
    order: 13,
    brand: "KFC",
    title: "Bad Call",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690531f3c3a02392dcc24fde_Thumb_KFC.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132644521/rendition/240p/file.mp4?loc=external&log_user=0&signature=e71d94c5179e88780069369d1b3503ccfb0df3acbcd9e17d616d9ae39d0e7429",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-014-matt-dilmore-noom-house-plant",
    order: 14,
    brand: "Noom",
    title: "House Plant",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6905328b393f6bff5ed00ac9_Thumb_Noom.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132628975/rendition/240p/file.mp4%20%28240p%29.mp4?loc=external&log_user=0&signature=4f5a8109ba73c7aa8421bad7d571c96296ac2c0b170ef18fbb9ea294f3ed00cb",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-015-boma-iluma-nissan-shoe-drop",
    order: 15,
    brand: "Nissan",
    title: "Shoe Drop",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fdaf9c102ac961d4028e5_Nissan_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1103240200/rendition/240p/file.mp4?loc=external&log_user=0&signature=22807839a5c718a4325d0bdc75d66ee1a1a7ea731dcd8a9364fe7ff1a416b0e0",
    muxPlaybackId: null,
    director: {
      slug: "boma-iluma",
      name: "Boma Iluma",
    },
  },
  {
    id: "source-work-016-leigh-marling-dayforce-do-the-work-you-re-meant-to-do",
    order: 16,
    brand: "Dayforce",
    title: "Do The Work You're Meant To Do",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46991384c4526f1f77edd_Dayforce_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1065946198/rendition/240p/file.mp4?loc=external&log_user=0&signature=9394b7b1b948f091f245f62d7a11ab64aeb424e40081f404e00bbf3269043d3b&user_id=117991130",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-017-leigh-marling-kraft-can-t-handle-it",
    order: 17,
    brand: "Kraft",
    title: "Can't Handle It",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46c5442d50efbd1b1ebcc_Kraft_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1065951448/rendition/240p/file.mp4?loc=external&log_user=0&signature=00f9bfd8e79b05825c83281832ecc03af25cfd3828894df48bf1879e517bad29&user_id=117991130",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-018-leigh-marling-nissan-rocky",
    order: 18,
    brand: "Nissan",
    title: "Rocky",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5ce1baad2edb19a997aa_Nissan_Rocky.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1011036856/rendition/240p/file.mp4?loc=external&log_user=0&signature=99400b6a88bb11086ac7db55af581167e531e1250c0c24df99d1f3cc39a54e6d",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-019-leigh-marling-bell-the-visitor",
    order: 19,
    brand: "Bell",
    title: "The Visitor",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d46f6ccd3d4512a499be11_Bell_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1065954056/rendition/240p/file.mp4?loc=external&log_user=0&signature=9dacb3a49949b8a3f13f1fab1fb85008905aa0b54d4de4416065487677ea6e26&user_id=117991130",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-020-james-frost-nike-human-printing-press",
    order: 20,
    brand: "Nike",
    title: "Human Printing Press",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a2_Nike_HumanPrintingPress_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848206268/rendition/360p/file.mp4?loc=external&signature=6c47bd7ebccf386bc75e4e9d51398f1691846220d2c69d2787c2e8cd5a44cfd7",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-021-matt-dilmore-interstate-batteries-super-guy",
    order: 21,
    brand: "Interstate Batteries",
    title: "Super Guy",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690532b0a85c6dab2211ea57_Thumb_Interstate.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132631390/rendition/240p/file.mp4?loc=external&log_user=0&signature=54bbdf7f6f1fdc0832908909eff0ba0927deeb6701d4e00f7205441558fabb06",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-022-james-frost-husky-sumo",
    order: 22,
    brand: "Husky",
    title: "Sumo",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a1_Husky_Sumo_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848203954/rendition/360p/file.mp4?loc=external&signature=fac6e41fdd08d74ba65eb1ece2848226eddb920bfa565afb774bca06ef9272ab",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-023-matt-dilmore-academy-of-motion-pictures-overlook-hotel",
    order: 23,
    brand: "Academy of Motion Pictures",
    title: "Overlook Hotel",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/690532f65da8dc3bd0527358_Thumb_AcademyOfMotionPictures.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1132631769/rendition/240p/file.mp4?loc=external&log_user=0&signature=fa631daa7ee8b14294473418fa01922b8978fc21f685838954b8e3f4e758f22b",
    muxPlaybackId: null,
    director: {
      slug: "matt-dilmore",
      name: "Matt Dilmore",
    },
  },
  {
    id: "source-work-024-bueno-doritos-wasabi",
    order: 24,
    brand: "Doritos",
    title: "Wasabi",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a1134f1dec2f2d46ba59_Doritos_Wasabi.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/927476346/rendition/240p/file.mp4?loc=external&log_user=0&signature=07c5f1f2b6c4baef75cb86d79e6318f567a477896fb44210576adc6c580aa59d",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-025-caleb-slain-lexus-next-chapter",
    order: 25,
    brand: "Lexus",
    title: "Next Chapter",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d10_Lexus%20-%20RZ%20Reveal%20-%2080.mp4.01_00_59_15.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/702992325/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=f120c4a21c6090e24b8b3d04cfcf5b6fb7e442e25345b40caf3d6d6a15204593",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-026-caleb-slain-toyota-2025-4runner-reveal",
    order: 26,
    brand: "Toyota",
    title: "2025 4Runner Reveal",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67c64964ae4e753d43e99a44_Toyota_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1062220624/rendition/240p/file.mp4?loc=external&log_user=0&signature=ba48fc0fce8ab0c3fe66433bc43dd47c723fe7feb2914b4a90488f7a835ccedf&user_id=117991130",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-027-le-ged-youtube-little-king-goods",
    order: 27,
    brand: "YouTube",
    title: "Little King Goods",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668937f7d7aff73c7be4ad6_YouTube_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956642325/rendition/240p/file.mp4?loc=external&log_user=0&signature=3b4e61d0ef38092ff3bf546690bbab971ae83452a8047f5e47653e65914c46a5",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-028-cody-cloud-absolut-lizzo",
    order: 28,
    brand: "Absolut",
    title: "Lizzo",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0c_Absolut%20-%20Lizzo.mp4.00_00_02_09.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/808775311/rendition/1080p/file.mp4?loc=external&signature=62eb2e1f928db75bbb78187ba124e9f0722353c0d26ca869ae1038985c300f3f",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-029-leigh-marling-snickers-song",
    order: 29,
    brand: "Snickers",
    title: "Song",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5d0abaad2edb19a9c700_Snickers_Song.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1011037364/rendition/240p/file.mp4?loc=external&log_user=0&signature=7e533769810f96cc150648c903cdfcd619d75df17c7edebdc5ad674bbffd6e64",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-030-le-ged-ca-appelle-music-video",
    order: 30,
    brand: "Ca Appelle",
    title: "Music Video",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66689498c98f7ab4a228c80a_Accapelle.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956640202/rendition/720p/file.mp4?loc=external&log_user=0&signature=d084b560b109121d0a6a96deddb551be699a1e502e981e38c40fdbe79c9be104",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-031-terry-rayment-kodak-understanding",
    order: 31,
    brand: "Kodak",
    title: "Understanding",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d6b_WEBSITE%20-%20BG%20VIDEO.00_00_16_06.Still007.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/430515807/rendition/1080p/file.mp4?loc=external&signature=fc89c59398178fdd2f7de9675b2a3cc64da5235f9b21c818e3c0bdd2490c5fe8",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-032-kelsey-larkin-gillette-look-good-game-good",
    order: 32,
    brand: "Gillette",
    title: "Look Good, Game Good",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067a50a92b29e7020e5385_GILLETTE%20THUMBNAIL%20copy.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/770927111/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=4780ed7212a079ad00095de9f1b0f654256dd7d0c32575d5f288a76a25294437",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-033--intact-color",
    order: 33,
    brand: "Intact",
    title: "Color",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67847f978f24c07f418e1558_FF_Intact_Thumb.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1046266146/rendition/540p/file.mp4?loc=external&log_user=0&signature=eff6de6fbd35e633e2695e9e8a9382ce98f1c16f4d29faa433a9bd70f90db665",
    muxPlaybackId: null,
    director: {
      slug: "",
      name: "",
    },
  },
  {
    id: "source-work-034-james-frost-amex-this",
    order: 34,
    brand: "AmEx",
    title: "This",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a3_AmEx_This_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848203805/rendition/360p/file.mp4?loc=external&signature=546d69802563ce2c00870ca3d9c62444daaaa8ede117930edc9e660ee740f7a2",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-035-jack-turits-wealthfront-french-toast",
    order: 35,
    brand: "Wealthfront",
    title: "French Toast",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbd_Wealthfront%20-%20French%20Toast.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/662105831/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=c311fcc2e07ac5958a909efc8cb5ae1aa106efcd55ade23ac3d624c358b6e8ad",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-036-jack-turits-aos-juju",
    order: 36,
    brand: "AOS",
    title: "JuJu",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbc_AOS%20-%20JuJu.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/678800628/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=ef069a1cc22df08a9c77c10b37c9f354fb0a68b170a7ddcebfd699a5af54f511",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-037-bueno-kingsford-biggest-fans",
    order: 37,
    brand: "Kingsford",
    title: "Biggest Fans",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a269893908db90fb04c9_Kingsford_BiggestFans.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/847456735/rendition/240p/file.mp4?loc=external&log_user=0&signature=e0e33e48a1ec18eeb8ace0d6cb16e8ee2e4d7a8d867f13a4255021870dac6660",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-038-caleb-slain-clorox-from-hospital-to-home",
    order: 38,
    brand: "Clorox",
    title: "From Hospital To Home",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d14_Clorox_FinalConform_30.mp4.00_00_16_10.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/652584121/rendition/1080p/file.mp4?loc=external&signature=95762048541ad0d7d0eb584d83e8aabe4e74c82c579238923a8dadf4834d6990",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-039-terry-rayment-purina-april-and-dixie",
    order: 39,
    brand: "Purina",
    title: "April & Dixie",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d59_WEBSITE%20-%20BG%20VIDEO.00_00_16_01.Still006.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/623600795/rendition/1080p/file.mp4?loc=external&signature=9278450ad4f20dc1ac8c3a89bcc8ec3cb1386c310f6673feb409ba85abedd74e",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-040-boma-iluma-oakley-damian-lillard",
    order: 40,
    brand: "Oakley",
    title: "Damian Lillard",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fdaa931aa6c24354991e4_Oakley_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1103240262/rendition/240p/file.mp4?loc=external&log_user=0&signature=385b4fb1e55b778bfd3cc89c4df82f091837df9edec35224af5d3249a24a721c",
    muxPlaybackId: null,
    director: {
      slug: "boma-iluma",
      name: "Boma Iluma",
    },
  },
  {
    id: "source-work-041-caleb-slain-uniqlo-charlotte-kemp",
    order: 41,
    brand: "Uniqlo",
    title: "Charlotte Kemp",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d11_Uniqlo%20-%20Charlotte%20Kemp.mov.01_00_11_22.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/431947846/rendition/1080p/file.mp4?loc=external&signature=f38cc93c6b7327ef2dbf95761b238932e8b211a10d05e5ca7d739abfb2ffafa8",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-042-terry-rayment-doordash-in-peace",
    order: 42,
    brand: "Doordash",
    title: "In Peace",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d13_Doordash%20In%20Peace.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/686034439/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=6f055a1ea43fbc179f096615f279b8aed1da5a596e0863af519935034d82618d",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-043-kelsey-larkin-yokohama-made-precisely-for-you",
    order: 43,
    brand: "Yokohama",
    title: "Made Precisely For You",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067ae5fff6189311366625_YOKOHAMA%20THUMBNAIL.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/818447648/rendition/1080p/file.mp4?loc=external&signature=9d4384e34cb3dbd368c6158b6de1e90cea9f444e43afa900fe55038f4e1f0a06",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-044-terry-rayment-viacom-mental-health-is-health",
    order: 44,
    brand: "Viacom",
    title: "Mental Health is Health",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d8f_WEBSITE%20-%20BG%20VIDEO.00_00_16_06.Still008.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/589973423/rendition/1080p/file.mp4?loc=external&signature=148a00efa2556a5cd651e489b7a7ef9a5a14b794b58f791ffaaed1c8f6b94338",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-045-kelsey-larkin-moneris-open",
    order: 45,
    brand: "Moneris",
    title: "Open",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01def_1367329728-9fedc97e44ee189e330e805f572cee3b8aa1edad15b9bdbb5650b9783212fcbb-d_1280.jpeg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/666922982/rendition/1080p/file.mp4?loc=external&signature=d114173e55106b499c48fcb3f0394686a056ae23eeb9b4f32a25722b0871a8c8",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-046-kelsey-larkin-toyota-proud-supporter-of-firsts",
    order: 46,
    brand: "Toyota",
    title: "Proud Supporter of Firsts",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067928ce13d820b3f707e9_TOYOTA%20THUMBNAIL%20copy.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1188183139/rendition/240p/file.mp4%20%28240p%29.mp4?loc=external&log_user=0&signature=93b2558651cafed0c737c7414909bc09b37c4da37011d305e5a27eb6996e965a",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-047-le-ged-hilton-casino",
    order: 47,
    brand: "Hilton",
    title: "Casino",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/666895a4e201c07003d789c2_HiltonCasino_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956641446/rendition/240p/file.mp4?loc=external&log_user=0&signature=36a28d7293e08fdb45ca424ab0122a400f4f24f4fda29905f9a1d88b7432e6e9",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-048-james-frost-ibm-data-anthem",
    order: 48,
    brand: "IBM",
    title: "Data Anthem",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a4_IBM_DataAnthem_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848206129/rendition/360p/file.mp4?loc=external&signature=0014b34a2195bc35baa416e9aa55ca133bfa0c064cc892c4fcd11dc36426e975",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-049-caleb-slain-lexus-dreamed-in-japan",
    order: 49,
    brand: "Lexus",
    title: "Dreamed In Japan",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d16_WEBSITE%20-%20BG%20VIDEO.00_00_01_11.Still005.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/431947539/rendition/1080p/file.mp4?loc=external&signature=4d7005d7f35779fb256217afa2710aa63d9f1659e27856c5116eb8acba5bfb4e",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-050-cody-cloud-short-film-coats",
    order: 50,
    brand: "Short Film",
    title: "Coats",
    year: null,
    agency: null,
    contentType: "SHORT_FILM",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0b_Coats.mp4.00_01_01_22.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/808838957/rendition/1080p/file.mp4?loc=external&signature=4dfe174405715a33fa31f419465b9984ebcd546ff68d03f5f28752448a5e9fd4",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-051-jack-turits-four-loko-premium",
    order: 51,
    brand: "Four Loko",
    title: "Premium",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cbf_Four%20Loko%20-%20Premium.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/447577902/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=00aeaf09d03dd6c84c30ba3ba4b7224afcdfa82e8fed712f3997e7fdcffbbebe",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-052-jack-turits-evian-this-is-evian",
    order: 52,
    brand: "Evian",
    title: "This is Evian",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ded_Evian%20THumb%201.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/447604031/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=bd57dbf91d62c9ddaf9d790931956e61eccb766e59eda02ad44187451ede1b8c",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-053-cody-cloud-adidas-adicolors",
    order: 53,
    brand: "Adidas",
    title: "Adicolors",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0e_Adidas%20-%20Adicolors.mp4.00_00_50_08.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/808838798/rendition/1080p/file.mp4?loc=external&signature=8391ffad212717f35e32fc32af317d771a5fa2702b1de8240a6153da4fa3a873",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-054-cody-cloud-target-all-in-motion",
    order: 54,
    brand: "Target",
    title: "All In Motion",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0f_Target%20-%20All%20In%20Motion.mp4.00_00_06_10.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/808839155/rendition/1080p/file.mp4?loc=external&signature=c7e62b03c26758a87969211a77b8341e5e4b52e80eb25f48c2d82ba345336e38",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-055-terry-rayment-cadillac-tree-hunting",
    order: 55,
    brand: "Cadillac",
    title: "Tree Hunting",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01da1_WEBSITE%20-%20BG%20VIDEO.00_00_16_08.Still009.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/430515722/rendition/1080p/file.mp4?loc=external&signature=b4f5af99395d4ff777dbd736ef19d9392d9d21db108281864a3526198949a2b7",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-056-james-frost-rufus-du-sol-alive",
    order: 56,
    brand: "Rüfüs Du Sol",
    title: "Alive",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a5_RufusDuSol_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848200685/rendition/360p/file.mp4?loc=external&signature=2d101ef2b4e1bd11e0d5bec1ba79b704e8516f94884a4780557dbe2856c747cc",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-057-caleb-slain-microsoft-surface",
    order: 57,
    brand: "Microsoft",
    title: "Surface",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d15_WEBSITE%20-%20BG%20VIDEO.00_00_01_10.Still004.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/812212054/rendition/1080p/file.mp4?loc=external&signature=e5754d9b673e6ddfc3c677c57ceae3ec4b703087e9fea4ea3c738a03496d039e",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-058-le-ged-mcdonald-s-mcjunior",
    order: 58,
    brand: "McDonald's",
    title: "McJunior",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668974ffad94e7b61fc7acc_McDonalds_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956642136/rendition/240p/file.mp4?loc=external&log_user=0&signature=6557dc18abaf2c2adafe5a4e99b60da07ea82f1a3ebfc3982f47e5307920fa6c",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-059-jack-turits-callaway-forefront",
    order: 59,
    brand: "Callaway",
    title: "Forefront",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cc0_Callaway%20-%20Forefront.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/695553756/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=1e2bc71243fea7b90b654b9b29d87180571da25121777b4686bb9394a6d112cf",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-060-james-frost-ok-go-this-too-shall-pass",
    order: 60,
    brand: "Ok Go",
    title: "This Too Shall Pass",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a6_OKGo_ThisTooShallPass_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/848199790/rendition/240p/file.mp4?loc=external&signature=92bfd01548eff6adf877273e3511d961880fe1e536f6b2fb9891bfd70efbe990",
    muxPlaybackId: null,
    director: {
      slug: "james-frost",
      name: "James Frost",
    },
  },
  {
    id: "source-work-061-terry-rayment-jaguar-joyride",
    order: 61,
    brand: "Jaguar",
    title: "Joyride",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d47_JAG_DIR_28_30%20vsn%20a%20FINAL.mp4.00_00_21_07.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/623594510/rendition/1080p/file.mp4?loc=external&signature=fad2c5d68337c972f3400ba1c76853ef6f83bbea57fd1d8141469f5a74d95e94",
    muxPlaybackId: null,
    director: {
      slug: "terry-rayment",
      name: "Terry Rayment",
    },
  },
  {
    id: "source-work-062-kelsey-larkin-trihealth-be-heard",
    order: 62,
    brand: "Trihealth",
    title: "Be Heard",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a0678c24aecaeb55db0032c_TRIHEALTH%20THUMBNAIL.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1191630983/rendition/240p/file.mp4%20%28240p%29.mp4?loc=external&log_user=0&signature=8864944b4b2a0561f096f61e3e30b884d49c7a7cdbe7d7fb7cf53a821795a4b2",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-063-cody-cloud-photo-montage",
    order: 63,
    brand: "Photo",
    title: "Montage",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d0d_Cody%20Cloud%20Photo%20Montage.mp4.00_00_27_12.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/808836191/rendition/720p/file.mp4?loc=external&signature=49a296b1a9a87c163e50cf69691e31bc7bb58017341ee9f22a7a8859e20151fe",
    muxPlaybackId: null,
    director: {
      slug: "cody-cloud",
      name: "Cody Cloud",
    },
  },
  {
    id: "source-work-064-kelsey-larkin-goodlife-live-for-it",
    order: 64,
    brand: "Goodlife",
    title: "Live For It",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a067a0fc5bf13200b4c23c4_GOODLIFE%20THUMBNAIL%20copy.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/667450511/rendition/1080p/file.mp4?loc=external&signature=64ae8a5403ab5963bede9ef43e67945ce797ec0f5f3f63660c20892229d8c1d6",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-065-kelsey-larkin-heroes-short-film",
    order: 65,
    brand: "Heroes",
    title: "Short Film",
    year: null,
    agency: null,
    contentType: "SHORT_FILM",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6a0679a61309f33ac1bda49b_HEROES%20THUMBAIL.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1188180112/rendition/240p/file.mp4%20%28240p%29.mp4?loc=external&log_user=0&signature=a9be0bdf408eb75adfe0f1e4d9a9ac7569fc09be61eb9b9d81985dd7bc785c70",
    muxPlaybackId: null,
    director: {
      slug: "kelsey-larkin",
      name: "Kelsey Larkin",
    },
  },
  {
    id: "source-work-066-brother-willis-ford-drive-4-ur-school",
    order: 66,
    brand: "Ford",
    title: "Drive 4 Ur School",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df3_1430936811-e8395e0a6b91d6c73770289b7c413de4a3b91b3dd88886d7a969f5747dcc2e49-d_1280.jpeg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/709326652/rendition/1080p/file.mp4?loc=external&signature=45e51f5e2a6e9bc537a41eee06864186ca41f4c6deb3f0dbb9514ab9e6ffb3bd",
    muxPlaybackId: null,
    director: {
      slug: "brother-willis",
      name: "Brother Willis",
    },
  },
  {
    id: "source-work-067-caleb-slain-lahgo-the-florist",
    order: 67,
    brand: "Lahgo",
    title: "The Florist",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d2f_LAHGO_90.mp4.00_04_40_18.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/505502940/rendition/1080p/file.mp4?loc=external&signature=a877a5bec321045e55d4091688a08e55f819676a7c352edf34694747a13795c9",
    muxPlaybackId: null,
    director: {
      slug: "caleb-slain",
      name: "Caleb Slain",
    },
  },
  {
    id: "source-work-068-tarik-karam-wsj-hyundai",
    order: 68,
    brand: "WSJ",
    title: "Hyundai",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a9_Screenshot%202023-08-08%20at%201.27.31%20PM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/851392732/rendition/240p/file.mp4?loc=external&signature=0ff6de66d1286d2db1bc77afbc7138de885599d8a1982c9323f158c1b2eb0201",
    muxPlaybackId: null,
    director: {
      slug: "tarik",
      name: "Tarik Karam",
    },
  },
  {
    id: "source-work-069-brother-willis-jeremiah-weed-alligator",
    order: 69,
    brand: "Jeremiah Weed",
    title: "Alligator",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df4_1430936985-1ed4ab99037fbd29365618c2faf62a0690f3ebd6309d651832fb94a6da1fa957-d_1280.jpeg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/709326684/rendition/720p/file.mp4?loc=external&signature=4de62deeeb221c43c0882f97d439fdf24798824999df74e0a9d604a7acca633b",
    muxPlaybackId: null,
    director: {
      slug: "brother-willis",
      name: "Brother Willis",
    },
  },
  {
    id: "source-work-070-brother-willis-wienerschnitzel-oktoberfest",
    order: 70,
    brand: "Wienerschnitzel",
    title: "Oktoberfest",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df5_1430938913-48cec0cbb8e66ac9ebb498b7f4706a31bd83c094d7f47223bfa2cae445d03b7a-d_1280.jpeg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/709326970/rendition/1080p/file.mp4?loc=external&signature=e6b79837a33fa22b5ef1b54f578c25973ba57b3a0ba59ac81f9b80f25faa4e7e",
    muxPlaybackId: null,
    director: {
      slug: "brother-willis",
      name: "Brother Willis",
    },
  },
  {
    id: "source-work-071-bueno-doritos-looney-tunes",
    order: 71,
    brand: "Doritos",
    title: "Looney Tunes",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6602a30c045be7df085fb066_Doritos_LooneyTunes.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/927479609/rendition/240p/file.mp4?loc=external&log_user=0&signature=d3202fbfdd53c592e14e572fced90b8c55b19bb50c0060576fe0cd3921a1112d",
    muxPlaybackId: null,
    director: {
      slug: "bueno",
      name: "Bueno",
    },
  },
  {
    id: "source-work-072-le-ged-jewish-general-hospital-foundation-effect-to-cause",
    order: 72,
    brand: "Jewish General Hospital Foundation",
    title: "Effect to Cause",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668985c79cb6cf2a754ffcb_JewishGeneralHospitalFoundation_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/956641835/rendition/240p/file.mp4?loc=external&log_user=0&signature=ec01afae649f2fa67f893cf6c03e17e23f45977674e7d9998b76df647e2453d6",
    muxPlaybackId: null,
    director: {
      slug: "le-ged",
      name: "Le Ged",
    },
  },
  {
    id: "source-work-073-tarik-karam-hhs-giving-living",
    order: 73,
    brand: "HHS",
    title: "Giving = Living",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020aa_Screenshot%202023-08-08%20at%201.25.42%20PM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/851425760/rendition/240p/file.mp4?loc=external&signature=28063cb5b0b1836039d2c585d5e6ee7d345a9b88a20bf46fdb43aa1ed43a7416",
    muxPlaybackId: null,
    director: {
      slug: "tarik",
      name: "Tarik Karam",
    },
  },
  {
    id: "source-work-074-brother-willis-see-s-quality-without-compromise",
    order: 74,
    brand: "See's",
    title: "Quality Without Compromise",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01df6_1430937570-9e3372ace4b0bd4f2da5873afbcbcd6f24be91a9384edcd5ccc51952155c6fb3-d_1280.jpeg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/709326879/rendition/1080p/file.mp4?loc=external&signature=9859a2c4d2cfbd37d82be12a7701f01938205f8527d533ce76326072e34edbad",
    muxPlaybackId: null,
    director: {
      slug: "brother-willis",
      name: "Brother Willis",
    },
  },
  {
    id: "source-work-075-tarik-karam-sandy-hook-monsters-under-the-bed",
    order: 75,
    brand: "Sandy Hook",
    title: "Monsters Under The Bed",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ad_Screenshot%202023-08-09%20at%209.37.38%20AM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/851428294/rendition/240p/file.mp4?loc=external&signature=fedbdce9ce863850278e0fa2c3566f0ffe575bf1dc5063f088f52790641dd397",
    muxPlaybackId: null,
    director: {
      slug: "tarik",
      name: "Tarik Karam",
    },
  },
  {
    id: "source-work-076-boma-iluma-jeep-wagoneer",
    order: 76,
    brand: "Jeep",
    title: "Wagoneer",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fda9fe787e2d8b7519943_Jeep_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1103240097/rendition/240p/file.mp4?loc=external&log_user=0&signature=be1bcb62d25c3db711e2b1b9d99e9aaa28bab9f1798a5a09b1adee397f55de16",
    muxPlaybackId: null,
    director: {
      slug: "boma-iluma",
      name: "Boma Iluma",
    },
  },
  {
    id: "source-work-077-tarik-karam-wsj-sothebys",
    order: 77,
    brand: "WSJ",
    title: "Sothebys",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ab_Screenshot%202023-08-08%20at%201.36.37%20PM.png",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/852775839/rendition/240p/file.mp4?loc=external&signature=893d29aed64af23a1e7c2233c8da17286e00c196ecf6f25ed43c1b4037de29cd",
    muxPlaybackId: null,
    director: {
      slug: "tarik",
      name: "Tarik Karam",
    },
  },
  {
    id: "source-work-078-leigh-marling-american-legacy-friends",
    order: 78,
    brand: "American Legacy",
    title: "Friends",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec5e8d3e9a0bd99dfa7a20_AmericanLegacy_Friends.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1011036018/rendition/240p/file.mp4?loc=external&log_user=0&signature=872e104e0736743f25950f928937da7e79d9fb34ed0f5e2ac9b6f0646d8710cf",
    muxPlaybackId: null,
    director: {
      slug: "leigh-marling",
      name: "Leigh Marling",
    },
  },
  {
    id: "source-work-079-jack-turits-bonnaroo-dragon",
    order: 79,
    brand: "Bonnaroo",
    title: "Dragon",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01dee_Bonnaroo%20Dragon-HD%201080p.mov.00_00_03_17.Still001.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/447578187/rendition/1080p/file.mp4?loc=external&oauth2_token_id=1539144906&signature=69d4711225d30d85a5bec67bbfab2c028ef15c1715788ec2d44a532d62f759d6",
    muxPlaybackId: null,
    director: {
      slug: "jack-turits",
      name: "Jack Turits",
    },
  },
  {
    id: "source-work-080-boma-iluma-air-jordan-heirs",
    order: 80,
    brand: "Air Jordan",
    title: "Heirs",
    year: null,
    agency: null,
    contentType: "SPOT",
    thumbnailUrl:
      "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fda95c8f0483d27f81a49_Heirs_Thumbnail.jpg",
    sourceVideoUrl:
      "https://player.vimeo.com/progressive_redirect/playback/1103238872/rendition/240p/file.mp4?loc=external&log_user=0&signature=70bd2241994603abb97137921a4e319efd2f14be30e7432ee10b4a549f183db5",
    muxPlaybackId: null,
    director: {
      slug: "boma-iluma",
      name: "Boma Iluma",
    },
  },
];

export function getCanonicalDirectors() {
  return CANONICAL_DIRECTORS;
}

export function getCanonicalDirector(slug: string) {
  return CANONICAL_DIRECTORS.find((director) => director.slug === slug) ?? null;
}

export function getCanonicalWork(contentType?: CanonicalContentType | null) {
  return contentType
    ? CANONICAL_WORK.filter((project) => project.contentType === contentType)
    : CANONICAL_WORK;
}
