const ManhwaindoUrlHelper = {
  base: 'https://manhwaindo.net/',
  info: (endpoint: string) => `${ManhwaindoUrlHelper.base}series/${endpoint}`,
  read: (endpoint: string) => `${ManhwaindoUrlHelper.base}${endpoint}`,
  search: (query: string, page = 1) =>
    `${ManhwaindoUrlHelper.base}/?s=${query}&page=${page}`,
};

export default ManhwaindoUrlHelper;
