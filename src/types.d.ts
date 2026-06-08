declare module 'react' {
  const React: any;
  export default React;
  export const createElement: any;
  export const Fragment: any;
  export const useState: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useCallback: any;
  export const useRef: any;
  export const useContext: any;
  export const useLayoutEffect: any;
  export const useReducer: any;
  export const useDeferredValue: any;
  export const useId: any;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const jsxDEV: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
}

declare module '*';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
