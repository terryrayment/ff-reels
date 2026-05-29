import {
  createEditorialPitchClasses,
  createEditorialPitchComponents,
  cx,
  revealStagger,
} from "../../_shared/editorial-pitch-system";

const VERSANT_CLASSES = createEditorialPitchClasses("versant");

export const SECTION = VERSANT_CLASSES.section;
export const SURFACE_GRAIN = VERSANT_CLASSES.surfaceGrain;
export const CONTAINER = VERSANT_CLASSES.container;
export const HEADER = VERSANT_CLASSES.header;
export const KICKER = VERSANT_CLASSES.kicker;
export const TITLE = VERSANT_CLASSES.title;
export const INTRO = VERSANT_CLASSES.intro;
export const REVEAL = VERSANT_CLASSES.reveal;
export const CARD = VERSANT_CLASSES.card;
export const PANEL = VERSANT_CLASSES.panel;
export const MEDIA = VERSANT_CLASSES.media;
export const META_LABEL = VERSANT_CLASSES.metaLabel;
export const META_TEXT = VERSANT_CLASSES.metaText;
export const LINK = VERSANT_CLASSES.link;

const components = createEditorialPitchComponents(VERSANT_CLASSES);

export const SectionHeader = components.SectionHeader;
export const TagList = components.TagList;
export { cx, revealStagger };
