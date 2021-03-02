import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import { DraggableList } from "../../components/logicalLib";
import { ConfirmButton, CustomText, FlexBox } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import OfferEditor from "./OfferEditor";
import OfferItem from "./OfferItem";
import { useOffersEditor } from "./useOffersEditor";

const CornerButtonBox = styled(FlexBox)`
    height: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 5px;
`;

const Offers = () => {
    const { t } = useLocale();
    const { offers, reorderHandler, openPopUp, popUpProps } = useOffersEditor();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Offers")}
                </CustomText>
                <CustomText
                    fontWeight={400}
                    opacity={0.7}
                    variant={"subtitle1"}
                >
                    {t("Edit offers or add new ones")}
                </CustomText>
            </Grid>
            <Grid item xs={12} md={4}>
                <CornerButtonBox>
                    <ConfirmButton onClick={() => openPopUp()}>
                        {t("Add offer")}
                    </ConfirmButton>
                </CornerButtonBox>
            </Grid>
            <Grid item xs={12} md={9}>
                <DraggableList
                    onDragEnd={reorderHandler}
                    component={OfferItem}
                    data={offers}
                    childProps={{ onEdit: openPopUp }}
                />
            </Grid>
            <OfferEditor {...popUpProps} />
        </Grid>
    );
};

export default Offers;
