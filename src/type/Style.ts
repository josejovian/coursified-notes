export type StyleClassType<T extends string> = { [key in T]: string };
export type StylePropsType<T extends string, P> = { [key in T]: Partial<P> };
