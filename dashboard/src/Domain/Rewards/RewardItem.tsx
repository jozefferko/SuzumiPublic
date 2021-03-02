import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import EditIcon from "@material-ui/icons/Edit";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import React from "react";
import { Static } from "runtypes";
import styled from "styled-components";
import { FSPathMap, FSProduct } from "../../common/types/firestore";
import { DraggableComponentProps } from "../../components/logicalLib";
import { Card, CustomText, FlexBox } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { useSafeStats } from "../../hooks/useSafeStats";
import _ from "lodash/fp";

const OfferImage = styled.img`
    height: 300px;
    width: 100%;
    object-fit: cover;
    border-radius: 10px;
`;
const ImageBox = styled(Box)`
    display: flex;
    flex-grow: 1;
    justify-content: center;
`;
const EditIconBox = styled(Button)`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e9eaeb;
    border-radius: 20px;
    min-width: 0;
    padding: 0;
    margin-right: 10px;
`;
const MoveIconBox = styled(Box)`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e9eaeb;
    border-radius: 7px;
    align-self: flex-end;
`;

const HeadingBox = styled(FlexBox)`
    margin-bottom: 20px;
`;

const Container = styled(Card)`
    margin: 10px 0;
`;
const InfoPanel = styled(Box)`
    display: flex;
    height: 100%;
    flex-direction: column;
`;

type RewardItemProps = DraggableComponentProps<Static<typeof FSProduct>> & {
    onEdit: (product: Static<typeof FSProduct>) => void;
};
const RewardItem = (props: RewardItemProps) => {
    const { data, onEdit } = props;
    const { t } = useLocale();

    const safeStats = useSafeStats();

    return (
        <Container>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ImageBox>
                        <OfferImage src={data.imgUrl} />
                    </ImageBox>
                </Grid>
                <Grid item xs={12} md={6}>
                    <InfoPanel>
                        <HeadingBox flexDirection="row">
                            <FlexBox flexGrow={1}>
                                <CustomText
                                    fontWeight={400}
                                    variant={"subtitle1"}
                                >
                                    {data.price} {t("points")}
                                </CustomText>
                            </FlexBox>
                            <FlexBox>
                                <EditIconBox onClick={() => onEdit(data)}>
                                    <EditIcon fontSize="small" />
                                </EditIconBox>
                                <MoveIconBox {...props.dragHandleProps}>
                                    <OpenWithIcon fontSize="small" />
                                </MoveIconBox>
                            </FlexBox>
                        </HeadingBox>

                        <FlexBox flexDirection="column" flexGrow={1}>
                            <Box>
                                <CustomText fontWeight={500} variant={"h5"}>
                                    {t(data.displayName)}
                                </CustomText>
                            </Box>
                            <CustomText fontWeight={300} variant={"subtitle1"}>
                                {t(data.description)}
                            </CustomText>
                        </FlexBox>
                        <Grid
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                        >
                            <Grid item md={6}>
                                <FlexBox
                                    flexDirection="column"
                                    justifySelf={"flex-end"}
                                >
                                    <Box>
                                        <CustomText
                                            fontWeight={300}
                                            opacity={0.7}
                                            variant={"subtitle1"}
                                        >
                                            {t("Rewards claimed")}
                                        </CustomText>
                                    </Box>
                                    <CustomText
                                        fontWeight={400}
                                        variant={"subtitle1"}
                                    >
                                        {safeStats
                                            .chainNullable(
                                                ($) =>
                                                    $.counters[props.data.id]
                                                        ?.count
                                            )
                                            .orDefault(0)}
                                    </CustomText>
                                </FlexBox>
                            </Grid>
                            <Grid item md={6}>
                                <FlexBox
                                    flexDirection="column"
                                    justifySelf={"flex-end"}
                                >
                                    <Box>
                                        <CustomText
                                            fontWeight={300}
                                            opacity={0.7}
                                            variant={"subtitle1"}
                                        >
                                            {t("Points exchanged")}
                                        </CustomText>
                                    </Box>
                                    <CustomText
                                        fontWeight={400}
                                        variant={"subtitle1"}
                                    >
                                        {safeStats
                                            .chainNullable(
                                                ($) =>
                                                    $.counters[props.data.id]
                                                        ?.count
                                            )
                                            .map(_.multiply(props.data.price))
                                            .orDefault(0)}
                                    </CustomText>
                                </FlexBox>
                            </Grid>
                        </Grid>
                    </InfoPanel>
                </Grid>
            </Grid>
        </Container>
    );
};

export default RewardItem;
