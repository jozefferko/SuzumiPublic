import React from "react";
import useRestaurant from "../hooks/global/useRestaurant";
import useUserListener from "../hooks/global/useUserListener";

//this component is used for global hooks...
//... get your mind out of the gutter

export default () => {
    useUserListener();
    useRestaurant();
    return <></>;
};
