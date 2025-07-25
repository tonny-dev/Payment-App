import { registerComponent } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

registerComponent(appName, () => App);