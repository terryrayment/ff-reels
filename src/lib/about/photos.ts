export type AboutPhoto = {
  src: string;
  alt: string;
};

const ABOUT_PHOTO_URLS = [
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02012_gallery-225_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0207c_gallery-277_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02096_gallery-290_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02073_gallery-273_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f85_gallery-154_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02046_gallery-260_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01e67_gallery-010_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0204c_gallery-234_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ee3_gallery-072_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01e81_gallery-023_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0208a_gallery-284_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01fd2_gallery-193_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02000_gallery-216_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01fb8_gallery-180_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f71_gallery-144_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f81_gallery-152_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f1b_gallery-100_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ffe_gallery-215_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f5b_gallery-133_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ec7_gallery-058_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f9d_gallery-169_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0203f_gallery-252_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ed1_gallery-063_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f34_gallery-115_low-res.jpg",
] as const;

export const ABOUT_PHOTOS = ABOUT_PHOTO_URLS.map((src, index) => ({
  src,
  alt: `Friends and Family archive ${index + 1}`,
})) satisfies AboutPhoto[];
