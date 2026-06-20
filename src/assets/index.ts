// Main assets module - consolidates common assets
import aboutMeJournalPng from './journal.PNG';
import aboutMeJournalWebp800 from './journal.PNG';
import aboutMeJournalWebp400 from './journal.PNG';
import profile1 from './Profile1.png';
import profile2 from './Profile3.JPG';
import profile3 from './Profile4.JPG';
import profilePlane from './ProfilePlane.JPG';
import comingSoon from './coming_soon.png';
import dividerPng from './divider.PNG';
import dividerWebp from './divider-original.webp';
import divider from './divider-original.webp';
import whiteLily from './White_Lily.png';
import darkRedLily from './DarkRedLily.jpg';
import liRedLily from './LiRedlily.jpg';
import greenRocks from './GreenRocks.png';
import lakeMountain from './breathtaking-shot-lake-mountainous-forest-autumn-with-sky-background.jpg';
import tropics from './Tropics.png';

// For backward compatibility
const aboutMeJournal = aboutMeJournalPng;

// Re-export all asset modules
export * from './stars';
export * from './stickers';
export * from './project_icons';
export * from './techstack';

// Export main assets
export const mainAssets = {
  aboutMeJournal,
  aboutMeJournalPng,
  aboutMeJournalWebp800,
  aboutMeJournalWebp400,
  profile1,
  profile2,
  profile3,
  profilePlane,
  comingSoon,
  divider,
  dividerPng,
  dividerWebp,
};

export {
  aboutMeJournal,
  aboutMeJournalPng,
  aboutMeJournalWebp800,
  aboutMeJournalWebp400,
  profile1,
  profile2,
  profile3,
  profilePlane,
  comingSoon,
  divider,
  dividerPng,
  dividerWebp,
  whiteLily,
  darkRedLily,
  liRedLily,
  greenRocks,
  lakeMountain,
  tropics,
};

export default {
  mainAssets,
};
