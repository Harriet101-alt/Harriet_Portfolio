import { socialLinks } from '@/config/socialLinks';

export type ProjectBadge = 'SPATIAL' | 'ML' | 'HACKATHON WIN' | 'RESEARCH';

export interface PortfolioProject {
  title: string;
  context: string;
  badge: ProjectBadge;
  technologies: string[];
  technicalDescription: string;
  experienceSummary: string;
  experienceBullets: string[];
  detailsUrl: string;
  githubUrl?: string;
  isStoryMap?: boolean;
  hideCode?: boolean;
}

const fallbackLink = (url?: string) => url || socialLinks.github || '#';

export const portfolioProjects: PortfolioProject[] = [
  {
    title: 'Land Acquisition Application for Residential Development',
    context: 'Esri UK Project · April 2026',
    badge: 'SPATIAL',
    technologies: ['ArcGIS', 'Open Data', 'Planning'],
    technicalDescription:
      'Developed a multi-criteria site scoring application in ArcGIS integrating government open data including Housing Delivery Test scores, Land Registry house prices, Environment Agency ecological constraints, and OS amenity layers to rank candidate sites by planning permission viability.',
    experienceSummary:
      'A planning-support tool that helps compare potential housing sites using environmental, amenity, and market data.',
    experienceBullets: [
      'Combined public planning, housing, ecology, flood-risk, and amenity datasets into one site-scoring workflow.',
      'Made site constraints easier to review before planning submission by surfacing risks in a spatial interface.',
    ],
    detailsUrl: 'https://storymaps.arcgis.com/stories/f59512cff20a4ebeb8b14570cfbae7fa',
    githubUrl: 'https://github.com/Harriet101-alt/Land_Appraisal',
    isStoryMap: true,
  },
  {
    title: 'Regulatory Compliance Checker',
    context: 'Pfizer Pharma Hackathon · March 2026',
    badge: 'HACKATHON WIN',
    technologies: ['Next.js', 'TypeScript', 'Regulatory Review'],
    technicalDescription:
      'Architected a Next.js pipeline that cross-references promotional drug content against regulatory guidelines at build time, surfacing non-compliant copy as flagged warnings and eliminating a class of pre-launch manual review for regulated digital assets.',
    experienceSummary:
      'A review tool that checks pharmaceutical promotional content before launch and highlights compliance issues earlier.',
    experienceBullets: [
      'Reduced the need for repeated manual checks by flagging risky language during the build process.',
      'Helped regulated teams catch content issues before assets reached final approval.',
    ],
    detailsUrl: 'https://github.com/binarybelt/cxiai-group12',
    githubUrl: 'https://github.com/binarybelt/cxiai-group12',
  },
  {
    title: 'Parts of Speech Tagging (POS)',
    context: 'MSc NLP Project · 2025',
    badge: 'RESEARCH',
    technologies: ['PyTorch', 'Transformer', 'BiLSTM', 'Optuna'],
    technicalDescription:
      'Engineered an end-to-end clinical NLP pipeline using BiLSTM and Transformer models in PyTorch with torchtext tokenisation and Optuna Bayesian hyperparameter optimisation.',
    experienceSummary:
      'A language-processing project that compared model types for understanding clinical text structure.',
    experienceBullets: [
      'Compared sequential and attention-based models to understand which handled long-range text patterns better.',
      'Used automated tuning to improve model settings instead of relying on manual trial and error.',
    ],
    detailsUrl: 'https://github.com/atanilson/Applied_AI_Assignments/blob/main/COMP634_assignment3_Test.ipynb',
    githubUrl: 'https://github.com/atanilson/Applied_AI_Assignments/blob/main/COMP634_assignment3_Test.ipynb',
  },
  {
    title: 'Geospatial Socioeconomic Analysis',
    context: 'MSc Project · Austin, TX · 2025',
    badge: 'SPATIAL',
    technologies: ['QGIS', 'DBSCAN', 'GeoPandas', 'Census API'],
    technicalDescription:
      'Applied LISA spatial autocorrelation and DBSCAN clustering to Census API geodata to identify income-inequality hotspots across Austin, TX.',
    experienceSummary:
      'A mapping analysis that identifies where income inequality clusters geographically across a city.',
    experienceBullets: [
      'Turned census data into spatial patterns that are easier to interpret than raw tables.',
      'Used open-source geospatial tooling to show neighbourhood-level inequality hotspots.',
    ],
    detailsUrl: 'https://github.com/Harriet101-alt/Texas_Maps',
    githubUrl: 'https://github.com/Harriet101-alt/Texas_Maps',
  },
  {
    title: 'Obesity Classifier for Health Risk Prediction',
    context: 'MSc Project · 2025',
    badge: 'ML',
    technologies: ['Python', 'Random Forest', 'Sci-kit Learn'],
    technicalDescription:
      'Trained a Random Forest classifier on 2,111 clinical records achieving 0.96 F1 / 0.999 AUC; stratified K-Fold CV and correlation-matrix pre-processing addressed class imbalance and multicollinearity.',
    experienceSummary:
      'A health-risk model that predicts obesity categories from clinical and lifestyle records.',
    experienceBullets: [
      'Built a high-performing classifier while checking for data imbalance and overlapping predictors.',
      'Used validation methods that make the reported performance more reliable than a single train/test split.',
    ],
    detailsUrl: 'https://github.com/atanilson/Applied_AI_Assignments/tree/main/assignment1',
    githubUrl: 'https://github.com/atanilson/Applied_AI_Assignments/tree/main/assignment1',
  },
  {
    title: 'Mapped Population Change Across Africa',
    context: 'MSc Project · 2025',
    badge: 'SPATIAL',
    technologies: ['Raster', 'QGIS', 'Visualization'],
    technicalDescription:
      'Reprojected raster data to equal-area CRS, applied accessible diverging colour schemes, and implemented tooltip interactivity for spatial exploration of population density change throughout Africa from 2015 to 2025.',
    experienceSummary:
      'An interactive map showing where population density changed across Africa over a decade.',
    experienceBullets: [
      'Used geographically appropriate projections so area-based comparisons were fairer.',
      'Applied accessible colour choices and tooltips to make the map easier to explore.',
    ],
    detailsUrl: 'https://github.com/Harriet101-alt/Africa-Population-Change15-25',
    githubUrl: 'https://github.com/Harriet101-alt/Africa-Population-Change15-25',
  },
  {
    title: 'Distributed Task-Scheduling Architecture',
    context: 'Ultamation / Sciontech Hackathon · Feb 2026',
    badge: 'SPATIAL',
    technologies: ['Python', 'CSP', 'DAG'],
    technicalDescription:
      'Formalised a 500-task, 5-server automation problem as a Constraint Satisfaction Problem and architected a DAG traversal engine with dependency-aware batching heuristics to address race conditions and uneven load distribution.',
    experienceSummary:
      'A scheduling solution that helped many dependent automation tasks run in the right order without clashing.',
    experienceBullets: [
      'Modelled task dependencies so work could be batched safely across multiple servers.',
      'Improved reliability by preventing race conditions where tasks finished in the wrong order.',
    ],
    detailsUrl: fallbackLink(socialLinks.repositories.projectThree),
    githubUrl: fallbackLink(socialLinks.repositories.projectThree),
    hideCode: true,
  },
  {
    title: 'Carbon Biomass Estimation',
    context: 'MSc Thesis · University of Liverpool · 2025–2026',
    badge: 'ML',
    technologies: ['Python', 'XGBoost', 'Random Forest', 'SVR', 'Streamlit', 'SoilGrids', 'GLDAS'],
    technicalDescription:
      'Stacked ensemble model predicting above-ground carbon biomass across Rimba Raya, Indonesia, with an interactive Streamlit dashboard for non-technical stakeholders.',
    experienceSummary:
      'A carbon-mapping model that estimates above-ground biomass and explains predictions through an interactive dashboard.',
    experienceBullets: [
      'Combined environmental datasets such as soil, peatland, elevation, moisture, and precipitation to estimate biomass.',
      'Built a dashboard that helps non-technical users understand model confidence and feature importance.',
      'Used nested cross-validation to reduce overfitting and make the modelling pipeline more reproducible.',
    ],
    detailsUrl: 'https://stackedensembleagc-ducxnnekw8q6pf7bm3spof.streamlit.app',
    githubUrl: 'https://github.com/Harriet101-alt/Carbon-BiomassML',
  },
];
