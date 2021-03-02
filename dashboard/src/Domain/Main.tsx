import { Drawer, Hidden } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";
import React from "react";
import styled from "styled-components";
import { ConditionalComponentProps } from "../components/logicalLib";
import { FlexBox, FlexGrower } from "../components/styledLib";
import { styledTheme } from "../styledTheme";
import Achievements from "./Achievements";
import Dashboard from "./Dashboard";
import Members from "./Members";
import Nav from "./Nav";
import Offers from "./Offers";
import Program from "./Program";
import Rewards from "./Rewards";
import Settings from "./Settings";
import Feedback from "./Feedback";

const TopBar = styled.div`
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-content: center;
    margin-left: -10px;
    margin-bottom: 10px;
`;

const Content = styled.div`
    max-width: 100%;
    background-color: #f8f8f8;
    flex-grow: 1;
    padding: ${styledTheme.spacing(6)};
`;

const CustomDrawer = styled(Drawer)`
    & .MuiDrawer-paper {
        display: flex;
        & div {
            display: flex;
            flex-grow: 1;
        }
        flex-grow: 1;
        width: ${styledTheme.drawerWidth}px;
        background-color: #2c3042;
    }
`;
const SideBarNav = styled.nav`
    ${styledTheme.breakpoints.md} {
        width: ${styledTheme.drawerWidth}px;
        flex-shrink: 0;
    }
`;

const MenuButton = styled(MenuIcon)`
    margin-right: ${styledTheme.spacing(2)};
    font-size: 30px;
    ${styledTheme.breakpoints.md} {
        display: none;
    }
`;

const Main: React.FC<ConditionalComponentProps> = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const { path } = useRouteMatch();
    return (
        <FlexBox>
            <SideBarNav>
                <Hidden mdUp>
                    <CustomDrawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <Nav />
                        {/*<Switch>*/}
                        {/*    <Route path={`${path}/:page`} component={Nav} />*/}
                        {/*</Switch>*/}
                    </CustomDrawer>
                </Hidden>
                <Hidden smDown>
                    <CustomDrawer variant="permanent" open>
                        <Nav />
                    </CustomDrawer>
                </Hidden>
            </SideBarNav>
            <Content>
                <TopBar>
                    <MenuButton onClick={handleDrawerToggle} />
                    <FlexGrower />
                </TopBar>
                <Switch>
                    <Route path={`${path}/dashboard`} component={Dashboard} />
                    <Route path={`${path}/feedback`} component={Feedback} />
                    <Route path={`${path}/program`} component={Program} />
                    <Route path={`${path}/offers`} component={Offers} />
                    <Route path={`${path}/rewards`} component={Rewards} />
                    <Route path={`${path}/members`} component={Members} />
                    <Route path={`${path}/settings`} component={Settings} />
                    <Route
                        path={`${path}/achievements`}
                        component={Achievements}
                    />

                    <Redirect from={`${path}/`} to={`${path}/dashboard`} />
                </Switch>
            </Content>
        </FlexBox>
    );
};
export default Main;
