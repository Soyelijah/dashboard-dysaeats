import {AppRegistry} from "react-native";
import App from "./src/SimpleApp";
import {name as appName} from "./app.json";

AppRegistry.registerComponent(appName, () => App);
