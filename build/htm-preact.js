// Used to create custom htm-preact dependency file

import { h, Component, createContext, createRef, render, Fragment } from 'preact';
import { signal } from '@preact/signals';
import { useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue, useErrorBoundary, useId } from 'preact/hooks';
import htm from 'htm';

const html = htm.bind(h);

export { h, html, signal, render, Component, createContext, createRef, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue, useErrorBoundary, useId, Fragment };
