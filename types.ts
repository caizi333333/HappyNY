
export enum Tone {
  TRADITIONAL = '传统庄重',
  HUMOROUS = '幽默风趣',
  POETIC = '古风诗意',
  MODERN = '现代简约',
  SINCERE = '真挚感人',
  WARM = '温馨治愈',
  ELEGANT = '优雅大气',
  ENTHUSIASTIC = '热情奔放'
}

export enum Festival {
  SPRING_FESTIVAL = '春节',
  NEW_YEAR = '元旦',
  LANTERN_FESTIVAL = '元宵节',
  VALENTINE = '情人节'
}

export enum Relationship {
  PARENT = '长辈/父母',
  RELATIVE = '亲戚/家人',
  TEACHER = '老师/恩师',
  LOVER = '恋人/爱人',
  PEER = '平辈/朋友',
  JUNIOR = '晚辈',
  LEADER = '领导',
  CLIENT = '客户'
}

export interface GreetingConfig {
  recipientName: string;
  senderName: string;
  relationship: Relationship;
  tone: Tone;
  festival: Festival;
  keywords: string;
  year: string;
}

export interface GeneratedGreeting {
  title: string;
  content: string;
  shortBlessing: string;
  imageUrl?: string;
}
