import Grid from "@material-ui/core/Grid";
import React from "react";
import { CustomText } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import AchievementEditor from "./AchievementEditor";
import AchievementGroupCard from "./AchievementGroupCard";
import { useAchievements } from "./useAchievements";
import { List } from "../../components/logicalLib";
import { Box } from "@material-ui/core";

const Achievements = () => {
    const { t } = useLocale();
    const { achievementListProps, popUpProps } = useAchievements();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Achievements")}
                </CustomText>
                <CustomText
                    fontWeight={400}
                    opacity={0.7}
                    variant={"subtitle1"}
                >
                    {t("Configure Achievements")}
                </CustomText>
            </Grid>
            <Grid item xs={12}>
                <Box>
                    <List
                        component={AchievementGroupCard}
                        {...achievementListProps}
                    />
                </Box>
            </Grid>
            <AchievementEditor {...popUpProps} />
        </Grid>
    );
};

export default Achievements;
