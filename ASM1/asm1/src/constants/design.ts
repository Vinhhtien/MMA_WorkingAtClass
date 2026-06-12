export const palette = {
  ink: '#171717',
  paper: '#F4F0E8',
  card: '#FFFDF8',
  lime: '#C8FF3D',
  coral: '#FF6B4A',
  violet: '#7C5CFC',
  sky: '#62D4FF',
  muted: '#746F66',
  line: '#171717',
  softLine: '#D8D1C5',
  success: '#2D9D62',
  danger: '#D94736',
  white: '#FFFFFF',
};

export const shadow = {
  shadowColor: palette.ink,
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
};

export const categoryLabels = {
  work: 'Công việc',
  personal: 'Cá nhân',
  shopping: 'Mua sắm',
  health: 'Sức khỏe',
  other: 'Khác',
} as const;
