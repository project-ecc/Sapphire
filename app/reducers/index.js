import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import startupReducer from './startupReducer';
import initialSetupReducer from './initialSetupReducer';
import chainsReducer from './chainsReducer';
import sideBarReducer from './sideBarReducer';
import applicationReducer from './applicationReducer';

const rootReducer = combineReducers({
	startup: startupReducer,
	setup: initialSetupReducer,
	chains: chainsReducer,
	sideBar: sideBarReducer,
	application: applicationReducer,
    router
});

export default rootReducer;
