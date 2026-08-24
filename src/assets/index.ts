// Main assets module - consolidates common assets
import aboutMeJournalPng from './journal.PNG';
import aboutMeJournalWebp800 from './aboutme_journal-800w.webp';
import aboutMeJournalWebp400 from './aboutme_journal-400w.webp';
import profile1 from './Profile1-800w.webp';
import profile1Webp400 from './Profile1-400w.webp';
import profile1Webp800 from './Profile1-800w.webp';
import profile2 from './Profile3-800w.webp';
import profile2Webp400 from './Profile3-400w.webp';
import profile2Webp800 from './Profile3-800w.webp';
import profile3 from './Profile4-800w.webp';
import profile3Webp400 from './Profile4-400w.webp';
import profile3Webp800 from './Profile4-800w.webp';
import profilePlane from './ProfilePlane-800w.webp';
import profilePlaneWebp400 from './ProfilePlane-400w.webp';
import profilePlaneWebp800 from './ProfilePlane-800w.webp';
import comingSoon from './coming_soon-96w.webp';
import dividerPng from './divider.PNG';
import dividerWebp from './divider-original.webp';
import divider from './divider-original.webp';
import whiteLily from './White_Lily-160w.webp';
import darkRedLily from './DarkRedLily-160w.webp';
import liRedLily from './LiRedlily-160w.webp';
import greenRocks from './GreenRocks-160w.webp';
import lakeMountain from './lakeMountain-320w.webp';
import lakeMountainWebp320 from './lakeMountain-320w.webp';
import lakeMountainWebp640 from './lakeMountain-640w.webp';
import tropics from './Tropics-160w.webp';

// For backward compatibility
const aboutMeJournal = aboutMeJournalPng;

// Re-export all asset modules
export * from './stars';
export * from './stickers';
export * from './project_icons';

// Export main assets
export const mainAssets = {
  aboutMeJournal,
  aboutMeJournalPng,
  aboutMeJournalWebp800,
  aboutMeJournalWebp400,
  profile1,
  profile1Webp400,
  profile1Webp800,
  profile2,
  profile2Webp400,
  profile2Webp800,
  profile3,
  profile3Webp400,
  profile3Webp800,
  profilePlane,
  profilePlaneWebp400,
  profilePlaneWebp800,
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
  profile1Webp400,
  profile1Webp800,
  profile2,
  profile2Webp400,
  profile2Webp800,
  profile3,
  profile3Webp400,
  profile3Webp800,
  profilePlane,
  profilePlaneWebp400,
  profilePlaneWebp800,
  comingSoon,
  divider,
  dividerPng,
  dividerWebp,
  whiteLily,
  darkRedLily,
  liRedLily,
  greenRocks,
  lakeMountain,
  lakeMountainWebp320,
  lakeMountainWebp640,
  tropics,
};

export default {
  mainAssets,
};
