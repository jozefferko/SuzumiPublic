import _ from "lodash/fp";

const sizes = { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 };

export const styledTheme = {
    sizes: sizes,
    breakpoints: _.mapValues(
        (size: number) => `@media (min-width: ${size}px) `
    )(sizes) as { [key in keyof typeof sizes]: string },
    drawerWidth: 240,
    spacing: (multiplier: number) => `${8 * multiplier}px`,
};
