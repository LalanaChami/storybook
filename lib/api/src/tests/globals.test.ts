import EventEmitter from 'event-emitter';
import { SET_STORIES, UPDATE_GLOBALS, GLOBALS_UPDATED } from '@storybook/core-events';

import { ModuleArgs, API } from '../index';
import { init as initModule, SubAPI } from '../modules/globals';

function createMockStore() {
  let state = {};
  return {
    getState: jest.fn().mockImplementation(() => state),
    setState: jest.fn().mockImplementation((s) => {
      state = { ...state, ...s };
    }),
  };
}

describe('stories API', () => {
  it('sets a sensible initialState', () => {
    const store = createMockStore();
    const { state } = initModule(({ store } as unknown) as ModuleArgs);

    expect(state).toEqual({
      globals: {},
    });
  });

  it('set global args on SET_STORIES', () => {
    const api = EventEmitter();
    const store = createMockStore();
    const { state, init } = initModule(({ store, fullAPI: api } as unknown) as ModuleArgs);
    store.setState(state);
    init();

    api.emit(SET_STORIES, { globals: { a: 'b' } });
    expect(store.getState()).toEqual({ globals: { a: 'b' } });

    expect(state).toEqual({
      globals: {},
    });
  });

  it('updates the state when the preview emits GLOBALS_UPDATED', () => {
    const api = EventEmitter();
    const store = createMockStore();
    const { state, init } = initModule(({ store, fullAPI: api } as unknown) as ModuleArgs);
    store.setState(state);

    init();

    api.emit(GLOBALS_UPDATED, { a: 'b' });
    expect(store.getState()).toEqual({ globals: { a: 'b' } });

    api.emit(GLOBALS_UPDATED, { a: 'c' });
    expect(store.getState()).toEqual({ globals: { a: 'c' } });

    // SHOULD NOT merge global args
    api.emit(GLOBALS_UPDATED, { d: 'e' });
    expect(store.getState()).toEqual({ globals: { d: 'e' } });
  });

  it('emits UPDATE_GLOBALS when updateGlobals is called', () => {
    const fullAPI = ({ emit: jest.fn(), on: jest.fn() } as unknown) as API;
    const store = createMockStore();
    const { init, api } = initModule(({ store, fullAPI } as unknown) as ModuleArgs);

    init();

    (api as SubAPI).updateGlobals({ a: 'b' });
    expect(fullAPI.emit).toHaveBeenCalledWith(UPDATE_GLOBALS, { a: 'b' });
  });
});
