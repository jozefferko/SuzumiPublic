import React, { useEffect } from "react";
import { Provider } from "react-redux";
import "./App.css";
import RestaurantRouteExtractor from "./components/RouteExtractor";
import Domain from "./Domain";
import "./i18n";
import { store } from "./redux";
import { registerLocale } from "react-datepicker";
import daDK from "date-fns/locale/da";

function App() {
    useEffect(() => {
        registerLocale("da-DK", daDK);
    }, []);
    return (
        <Provider store={store}>
            <RestaurantRouteExtractor>
                <Domain />
            </RestaurantRouteExtractor>
        </Provider>
    );
}

export default App;
