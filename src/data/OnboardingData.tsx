import { AnimationObject } from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  description: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/animation/Homepage.json'),
    text: 'Maligayang Pagdating Igpitanons!',
    description:
      'Ang app na ito ay para sa mabilis at ligtas na pag-uulat ng insidente ng mga residente.',
    backgroundColor: '#fff',
  },
  {
    id: 2,
    animation: require('../assets/animation/Idea.json'),
    text: 'Pag-uulat ng Insidente sa Komunidad',
    description:
      'Kapag may pangyayaring dapat iulat, gamitin ang mobile app para maiparating ito sa tamang kinauukulan.',
    backgroundColor: '#0f172a',
  },
  {
    id: 3,
    animation: require('../assets/animation/Metaverse.json'),
    text: 'Gamitin ang App ng Mabuti',
    description:
      'Ang App feature ay ginawa hindi lang para sa seguridad kundi para maging mas madali, mas magaan, at mas nakakatuwang tumulong sa komunidad.',
    backgroundColor: '#fff',
  },
];

export default data;
