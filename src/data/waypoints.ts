export type WaypointIcon = 'house' | 'leaf' | 'compass' | 'circuit';

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel: string;
  color: string;
  icon: WaypointIcon;
  altitude: number;
  bio: string;
}

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'liverpool-home',
    lat: 53.4084,
    lng: -2.9916,
    label: 'Liverpool, UK',
    sublabel: 'Origin',
    color: '#8b2e1a',
    icon: 'house',
    altitude: 0.35,
    bio: 'I was born in Liverpool and grew up in a working class background. I left school early and was taught independently at home for my GCSEs. Then I attended Carmel College to study maths, Biology and Chemistry.',
  },
  {
    id: 'lancaster',
    lat: 54.0047,
    lng: -2.7877,
    label: 'Lancaster University',
    sublabel: 'Ecology & Conservation',
    color: '#3a5c3a',
    icon: 'leaf',
    altitude: 0.5,
    bio: 'I studied Ecology and Conservation at Lancaster University. Unfortunately due to Covid many fieldwork trips abroad were cancelled. However I did gain experience completing phase 1 and 2 habitat surveys. I gained understanding of the economic implications and factors influencing climate change and gained a natural historical grounding in evolution and animal behaviour.',
  },
  {
    id: 'kuala-lumpur',
    lat: 3.1390,
    lng: 101.6869,
    label: 'Kuala Lumpur, Malaysia',
    sublabel: 'TEFL',
    color: '#c8973a',
    icon: 'compass',
    altitude: 0.6,
    bio: 'At the end of my undergraduate degree I studied TEFL in Kuala Lumpur. I loved the multiculturalism, the food, and the great infrastructure. Malaysians are super welcoming!',
  },
  {
    id: 'seville',
    lat: 37.3891,
    lng: -5.9845,
    label: 'Seville, Spain',
    sublabel: 'International School',
    color: '#c8973a',
    icon: 'compass',
    altitude: 0.5,
    bio: 'I taught in an international school in Seville. It was great to learn Spanish! Spanish families are usually very affectionate with their children and take a much more relaxed approach to parenting than in England.',
  },
  {
    id: 'liverpool-uni',
    lat: 53.4064,
    lng: -2.9661,
    label: 'University of Liverpool',
    sublabel: 'MSc Data Science & AI',
    color: '#2d5986',
    icon: 'circuit',
    altitude: 0.4,
    bio: 'I then completed a Masters in Data Science and AI at the University of Liverpool. It was great to cover a different area of work and learn the complex mathematics underpinning AI. I completed many projects in applied AI, using lots of Python and SQL for database management.',
  },
];
