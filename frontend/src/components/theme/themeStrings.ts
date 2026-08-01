// Static i18n for the Theme feature. Passed to useString({ str }).
// DB-managed strings (translationsStore) still take precedence.
const themeStrings: Record<string, Record<string, string>> = {
    chooseTheme: { ukr: "вибрати тему", eng: "choose theme" },
    familyGraphite: { ukr: "Графітова", eng: "Graphite" },
    familyNeutral: { ukr: "Нейтральна", eng: "Neutral" },
    familyBlue: { ukr: "Блакитна", eng: "Blue" },
    familySand: { ukr: "Пісочна", eng: "Sand" },
    familyForest: { ukr: "Лісова", eng: "Forest" },
    familyRose: { ukr: "Рожева", eng: "Rose" },
    familyCyan: { ukr: "Бірюзова", eng: "Cyan" },
    light: { ukr: "світла", eng: "light" },
    dark: { ukr: "темна", eng: "dark" },
    themeGraphiteLight: { ukr: "світло-графітова", eng: "graphite light" },
    themeGraphite: { ukr: "графітова", eng: "graphite" },
    themeBlueLight: { ukr: "світло-блакитна", eng: "blue light" },
    themeBlueDark: { ukr: "темно-блакитна", eng: "blue dark" },
    themeSand: { ukr: "пісочна", eng: "sand" },
    themeSandDark: { ukr: "темно-пісочна", eng: "sand dark" },
    themeForest: { ukr: "лісова", eng: "forest" },
    themeForestDark: { ukr: "темно-лісова", eng: "forest dark" },
    themeRose: { ukr: "рожева", eng: "rose" },
    themeRoseDark: { ukr: "темно-рожева", eng: "rose dark" },
    themeCyan: { ukr: "бірюзова темна", eng: "cyan dark" },
    themeCyanLight: { ukr: "бірюзова світла", eng: "cyan light" },
};
export default themeStrings;
