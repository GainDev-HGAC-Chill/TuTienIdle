module.exports = {
  MIN: 0,
  MAX: 10000,
  DEFAULT: 100,

  COLORS: [
    { min: 0, max: 99, color: 'gray', title: 'Vận Suy' },
    { min: 100, max: 499, color: 'white', title: 'Phàm Vận' },
    { min: 500, max: 999, color: 'green', title: 'Tiểu Cát' },
    { min: 1000, max: 2999, color: 'blue', title: 'Đại Cát' },
    { min: 3000, max: 5999, color: 'purple', title: 'Thiên Duyên' },
    { min: 6000, max: 10000, color: 'orange', title: 'Khí Vận Chi Tử' }
  ],

  EFFECTS: {
    fortuneChancePerLuck: 0.00001,
    rareFortuneChancePerLuck: 0.000005,
    secretRealmChancePerLuck: 0.000003,
    supremePillChancePerLuck: 0.000005
  }
};
