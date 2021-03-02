import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

interface props {
    slug: string;
}

export default function RestaurantRouteExtractor({
    children,
}: {
    children: React.ReactChild;
}) {
    const Content = ({ slug }: props) => {
        const { i18n } = useLocale();

        useEffect(() => {
            console.log(slug);
            if (slug) i18n.changeLanguage(slug);
        }, [i18n, slug]);
        return <>{children}</>;
    };
    return (
        <Router>
            <Switch>
                <Route path={"/en"}>
                    <Content slug={"en"} />
                </Route>
                <Route path={"/dk"}>
                    <Content slug={"dk"} />
                </Route>
                <Redirect from="/*" to="./dk" />
            </Switch>
        </Router>
    );
}
