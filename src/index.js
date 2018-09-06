import {attach, dispatch} from "./store";
import App from "./App";
import "./game";

attach(App, document.querySelector("#root"));
window.dispatch = dispatch;
