import Box from "@material-ui/core/Box";
import React from "react";
import ReactJson from "react-json-view";
import styled from "styled-components";

const LeftBox = styled(Box)`
    text-align: left;
`;

type props = {
    data: any;
};
const PrettyJSON = (props: props) => {
    return (
        <LeftBox>
            <ReactJson collapsed={1} src={props.data} />
        </LeftBox>
    );
};

export default PrettyJSON;
