import { Box } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { List } from "../../components/logicalLib";
import { Card, CustomSwitch, CustomText } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import AchievementTier from "./AchievementTier";
import {
    AchievementGroupCardProps,
    useAchievementGroupCard,
} from "./useAchievements";

const Container = styled(Box)`
    margin: 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

const Content = styled(Card)`
    display: flex;
    flex-direction: column;
    max-width: 580px;
    width: 100%;
`;

const SwitchBox = styled(Box)`
    //margin-bottom: 10px;
    display: flex;
    align-items: center;
`;
const SwitchLabel = styled(CustomText)`
    padding-left: 5px;
`;

const AchievementGroupCard = (props: AchievementGroupCardProps) => {
    const { t } = useLocale();
    const { switchProps, achievementTierListProps } = useAchievementGroupCard(
        props
    );
    return (
        <Container>
            <Content>
                <SwitchBox>
                    <CustomSwitch {...switchProps} />
                    <SwitchLabel
                        fontWeight={400}
                        opacity={0.7}
                        variant={"body2"}
                    >
                        {t("make public")}
                    </SwitchLabel>
                </SwitchBox>
                <Box
                    flexWrap={"wrap"}
                    display="flex"
                    flexGrow={1}
                    justifyContent={"space-around"}
                >
                    <List
                        component={AchievementTier}
                        {...achievementTierListProps}
                    />
                </Box>
            </Content>
        </Container>
    );
};

export default AchievementGroupCard;
