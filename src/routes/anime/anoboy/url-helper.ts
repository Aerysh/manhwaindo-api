const AnoboyUrlHelper = {
  base: `https://anoboy.ch/`,
  info: (endpoint: string) => `${AnoboyUrlHelper.base}anime/${endpoint}`,
  search: (query: string, page: number = 1) =>
    `${AnoboyUrlHelper.base}page/${page}/?s=${query}`,
  watch: (endpoint: string) => `${AnoboyUrlHelper.base}${endpoint}`,
};

export default AnoboyUrlHelper;
