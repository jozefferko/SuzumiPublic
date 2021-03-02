import { Box } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import { DraggableList } from "../../components/logicalLib";
import { ConfirmButton, CustomText, FlexBox } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import RewardEditor from "./RewardEditor";
import RewardItem from "./RewardItem";
import { useRewards } from "./useRewards";

const CornerButtonBox = styled(FlexBox)`
    height: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 5px;
`;

const Rewards = () => {
    const { t } = useLocale();
    const { items, reorderHandler, openPopUp, popUpProps } = useRewards();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Box fontWeight="fontWeightLight">
                    <CustomText fontWeight={500} variant={"h4"}>
                        {t("Rewards")}
                    </CustomText>
                </Box>

                <CustomText
                    fontWeight={400}
                    opacity={0.7}
                    variant={"subtitle1"}
                >
                    {t("Edit rewards or add new ones")}
                </CustomText>
            </Grid>
            <Grid item xs={12} md={4}>
                <CornerButtonBox>
                    <ConfirmButton onClick={() => openPopUp()}>
                        {t("Add reward")}
                    </ConfirmButton>
                </CornerButtonBox>
            </Grid>
            <Grid item xs={12} md={12} lg={8}>
                <DraggableList
                    childProps={{ onEdit: openPopUp }}
                    data={items}
                    component={RewardItem}
                    onDragEnd={reorderHandler}
                />
            </Grid>
            <RewardEditor {...popUpProps} />
        </Grid>
    );
};

export default Rewards;
