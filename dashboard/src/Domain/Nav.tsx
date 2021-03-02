import List from "@material-ui/core/List";
import { Dashboard } from "@material-ui/icons";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import CardGiftcardIcon from "@material-ui/icons/CardGiftcard";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import GroupIcon from "@material-ui/icons/Group";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import SettingsIcon from "@material-ui/icons/Settings";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import InsertCommentIcon from "@material-ui/icons/InsertComment";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import logoImage from "../assets/suzumi_logo.png";
import { FlexGrower } from "../components/styledLib";
import { useAuth } from "../hooks/useAuth";
import { NavButton, NavItem } from "./NavItem";
import { Link } from "react-router-dom";

const Container = styled.div`
    background-color: #2c3042;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
`;

const Logo = styled.img`
    width: 75%;
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-top: 30px;
`;

const LanguageLink = styled(Link)`
    margin-left: 20px;
    margin-bottom: 10px;
    text-decoration: none;
    color: #ffffff;
`;

const Nav = () => {
    const { t, i18n } = useTranslation();
    const { signOut } = useAuth();
    return (
        <Container>
            <Logo src={logoImage} alt="Logo" />
            <List>
                <NavItem
                    to={"dashboard"}
                    icon={Dashboard}
                    label={t("Dashboard")}
                />
                <NavItem
                    to={"program"}
                    icon={LocalOfferIcon}
                    label={t("Program")}
                />
                <NavItem
                    to={"offers"}
                    icon={AnnouncementIcon}
                    label={t("Offers")}
                />
                <NavItem
                    to={"rewards"}
                    icon={CardGiftcardIcon}
                    label={t("Rewards")}
                />
                <NavItem
                    to={"achievements"}
                    icon={WhatshotIcon}
                    label={t("Achievements")}
                />
                <NavItem to={"members"} icon={GroupIcon} label={t("Members")} />
                <NavItem
                    to={"feedback"}
                    icon={InsertCommentIcon}
                    label={t("Feedback")}
                />
                <NavItem
                    to={"settings"}
                    icon={SettingsIcon}
                    label={t("Settings")}
                />
                <NavButton
                    onClick={signOut}
                    icon={ExitToAppIcon}
                    label={t("Sign out")}
                />
            </List>
            <FlexGrower />
            <LanguageLink to={`../../${i18n.language === "en" ? "dk" : "en"}`}>
                {i18n.language === "en" ? "DK" : "EN"}
            </LanguageLink>
        </Container>
    );
};

export default Nav;
