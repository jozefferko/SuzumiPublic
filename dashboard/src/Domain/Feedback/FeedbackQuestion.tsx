import React from "react";
import { FSFeedbackStat, FSLocaleString } from "../../common/types/firestore";
import Grid from "@material-ui/core/Grid";
import { CustomText, FlexBox, LikeBar } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { LinearProgress } from "@material-ui/core";

export type FeedbackQuestionProps = {
    data: { question: FSLocaleString; stats: FSFeedbackStat };
};

const FeedbackQuestion = (props: FeedbackQuestionProps) => {
    const { t } = useLocale();
    return (
        <>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t(props.data.question)}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                {/*<CustomText opacity={0.7} fontWeight={500} variant={"h6"}>*/}
                {/*    {t("{{answers}} answers.", {*/}
                {/*        // percentage:*/}
                {/*        //     props.data.stats.answers > 0*/}
                {/*        //         ? Math.round(*/}
                {/*        //               (props.data.stats.positive /*/}
                {/*        //                   props.data.stats.answers) **/}
                {/*        //                   10000*/}
                {/*        //           ) / 100*/}
                {/*        //         : 0,*/}
                {/*        answers: props.data.stats.answers,*/}
                {/*    })}*/}
                {/*</CustomText>*/}
                <LikeBar
                    variant="determinate"
                    value={
                        props.data.stats.answers > 0
                            ? (props.data.stats.positive /
                                  props.data.stats.answers) *
                              100
                            : 0
                    }
                />
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
        </>
    );
};

export default FeedbackQuestion;
