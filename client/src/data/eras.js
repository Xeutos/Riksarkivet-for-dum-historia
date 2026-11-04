import antiquityImg from '@/assets/images/antiquity.png'
import medievalImg from '@/assets/images/medieval.png'
import modernImg from '@/assets/images/modern-history.png'

export const eras = [
  {
    id: 1,
    name: 'Antiquity',
    period: 'about 3000 bc. – 500 ad.',
    description: 'An age of gods, philosophers and powerful empires. From the intellectual achievements of ancient Greece to the grandeur of Rome, this era gave rise to democracy, philosophy, monumental architecture and enduring cultural traditions.',
    image: antiquityImg
  },
  {
    id: 2,
    name: 'Medieval',
    period: 'about 500 – 1700',
    description: 'A time of knights, castles, and powerful kingdoms. From the Crusades to the growth of bustling medieval towns, this era saw the rise of Gothic cathedrals and societies defined by hierarchy, faith and chivalry.',
    image: medievalImg
  },
  {
    id: 3,
    name: 'Modern history',
    period: 'about 1700 – today',
    description: 'Our modern society is marked by revolution, innovation and profound change. From the French Revolution to two world wars, this period transformed societies and shaped the world we know today.',
    image: modernImg
  }
]
