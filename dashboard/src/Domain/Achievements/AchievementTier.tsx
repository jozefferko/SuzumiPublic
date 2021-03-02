import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import React from "react";
import styled from "styled-components";
import { CustomText, FlexBox } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import EditIcon from "@material-ui/icons/Edit";
import { trigger } from "../../common/utils/fp";
import { AchievementTierProps } from "./useAchievements";
import {
    BronzeShieldSvg,
    GoldShieldSvg,
    SilverShieldSvg,
} from "./achievementSVGs";

const Container = styled(Button)`
    margin: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    background-color: #f4f4f5;
    padding: 20px;
    width: 160px;
    text-transform: none;
`;
const AchievementIcon = styled(Box)`
    height: 110px;
    width: 95px;
    object-fit: cover;
    justify-content: center;
    align-items: center;
    display: flex;
`;
const backgroundSvg: { [id: number]: React.ReactNode } = {
    2: BronzeShieldSvg,
    1: SilverShieldSvg,
    0: GoldShieldSvg,
};
const AchievementTier = (props: AchievementTierProps) => {
    const { data, onEdit } = props;
    const { t } = useLocale();
    return (
        <Container onClick={trigger(onEdit)(data)}>
            <FlexBox
                justifyContent={"flex-start"}
                alignItems={"center"}
                flexDirection="column"
                width={"100%"}
            >
                <AchievementIcon>{backgroundSvg[data.tier]}</AchievementIcon>
                <Box marginTop={1} marginBottom={1} textAlign={"center"}>
                    <CustomText
                        fontWeight={500}
                        opacity={0.7}
                        variant={"subtitle1"}
                    >
                        {t(data.displayName)}
                    </CustomText>
                </Box>
                <CustomText fontWeight={400} opacity={0.7} variant={"body2"}>
                    {data.reward + " " + t("points")}
                    <EditIcon fontSize="inherit" />
                </CustomText>
            </FlexBox>
        </Container>
    );
};

export default AchievementTier;
